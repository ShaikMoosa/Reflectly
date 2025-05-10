-- Create a view for subscription analytics
CREATE OR REPLACE VIEW subscription_analytics AS
SELECT
  DATE_TRUNC('day', us.created_at) AS date,
  COUNT(CASE WHEN us.status = 'active' AND us.plan_type = 'premium' THEN 1 END) AS active_premium_count,
  COUNT(CASE WHEN us.status = 'cancelled' THEN 1 END) AS cancelled_count,
  COUNT(CASE WHEN us.status = 'expired' THEN 1 END) AS expired_count,
  COUNT(CASE WHEN us.status = 'paused' THEN 1 END) AS paused_count,
  COUNT(*) AS total_subscriptions
FROM
  public.user_subscriptions us
GROUP BY
  DATE_TRUNC('day', us.created_at)
ORDER BY
  date DESC;

-- Create a view for subscription cancellation reasons
CREATE OR REPLACE VIEW cancellation_reasons_analytics AS
SELECT
  sc.reason,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM subscription_cancellations), 0), 2) AS percentage
FROM
  public.subscription_cancellations sc
GROUP BY
  sc.reason
ORDER BY
  count DESC;

-- Create a function to reset usage counters at the start of each month
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset all non-premium users' counters
  UPDATE public.user_usage
  SET 
    transcription_count = 0,
    ai_chat_count = 0,
    updated_at = now()
  WHERE user_id NOT IN (
    SELECT user_id 
    FROM public.user_subscriptions 
    WHERE plan_type = 'premium' AND status = 'active'
  );
END;
$$;

-- Create a function to get subscription metrics
CREATE OR REPLACE FUNCTION get_subscription_metrics()
RETURNS TABLE (
  metric_name TEXT,
  metric_value BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 'total_subscribers'::TEXT, COUNT(*)::BIGINT FROM public.user_subscriptions
  UNION ALL
  SELECT 'active_premium'::TEXT, COUNT(*)::BIGINT FROM public.user_subscriptions 
    WHERE plan_type = 'premium' AND status = 'active'
  UNION ALL
  SELECT 'free_users'::TEXT, COUNT(*)::BIGINT FROM public.user_subscriptions 
    WHERE plan_type = 'free' OR status != 'active'
  UNION ALL
  SELECT 'cancellations_last_30d'::TEXT, COUNT(*)::BIGINT FROM public.subscription_cancellations 
    WHERE created_at > (CURRENT_DATE - INTERVAL '30 days');
END;
$$;

-- Create a function to export subscription data
CREATE OR REPLACE FUNCTION export_subscription_data(days INTEGER DEFAULT 30)
RETURNS TABLE (
  user_id UUID,
  subscription_id TEXT,
  plan_type TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  renewed_at TIMESTAMPTZ,
  transcription_count INTEGER,
  ai_chat_count INTEGER,
  cancellation_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.user_id,
    s.subscription_id,
    s.plan_type,
    s.status,
    s.created_at,
    s.renews_at,
    u.transcription_count,
    u.ai_chat_count,
    c.reason
  FROM 
    public.user_subscriptions s
  LEFT JOIN 
    public.user_usage u ON s.user_id = u.user_id
  LEFT JOIN 
    public.subscription_cancellations c ON s.user_id = c.user_id
  WHERE 
    s.created_at > (CURRENT_DATE - (days || ' days')::INTERVAL)
  ORDER BY 
    s.created_at DESC;
END;
$$;

-- Create RLS policies for the views
ALTER VIEW subscription_analytics OWNER TO service_role;
ALTER VIEW cancellation_reasons_analytics OWNER TO service_role;

-- Grant permissions for the new functions to service role only
REVOKE ALL ON FUNCTION reset_monthly_usage FROM PUBLIC;
REVOKE ALL ON FUNCTION get_subscription_metrics FROM PUBLIC;
REVOKE ALL ON FUNCTION export_subscription_data FROM PUBLIC;

GRANT EXECUTE ON FUNCTION reset_monthly_usage TO service_role;
GRANT EXECUTE ON FUNCTION get_subscription_metrics TO service_role;
GRANT EXECUTE ON FUNCTION export_subscription_data TO service_role; 