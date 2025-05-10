-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id TEXT NOT NULL,
    plan_type TEXT NOT NULL,
    status TEXT NOT NULL,
    variant_id TEXT,
    renews_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Create user_usage table
CREATE TABLE public.user_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transcription_count INTEGER DEFAULT 0 NOT NULL,
    ai_chat_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_user_usage UNIQUE (user_id)
);

-- Create RPC functions for incrementing usage
CREATE OR REPLACE FUNCTION public.increment_transcription_count(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update user usage record
  INSERT INTO public.user_usage (user_id, transcription_count, ai_chat_count)
  VALUES (user_id, 1, 0)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    transcription_count = public.user_usage.transcription_count + 1,
    updated_at = now();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_ai_chat_count(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update user usage record
  INSERT INTO public.user_usage (user_id, transcription_count, ai_chat_count)
  VALUES (user_id, 0, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    ai_chat_count = public.user_usage.ai_chat_count + 1,
    updated_at = now();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Create function to check if user is under usage limits
CREATE OR REPLACE FUNCTION public.check_usage_limits(user_id UUID, usage_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_premium BOOLEAN;
  current_usage INTEGER;
  usage_limit INTEGER;
BEGIN
  -- Check if user has premium subscription
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_subscriptions 
    WHERE user_id = $1 
    AND plan_type = 'premium' 
    AND status = 'active'
  ) INTO is_premium;
  
  -- Set limits based on subscription
  IF usage_type = 'transcription' THEN
    -- Get current transcription count
    SELECT COALESCE(transcription_count, 0)
    FROM public.user_usage
    WHERE user_id = $1
    INTO current_usage;
    
    -- Set limit based on plan
    usage_limit := CASE WHEN is_premium THEN 50 ELSE 5 END;
  ELSIF usage_type = 'ai_chat' THEN
    -- Get current AI chat count
    SELECT COALESCE(ai_chat_count, 0)
    FROM public.user_usage
    WHERE user_id = $1
    INTO current_usage;
    
    -- Set limit based on plan
    usage_limit := CASE WHEN is_premium THEN 1000 ELSE 5 END;
  ELSE
    RETURN FALSE;
  END IF;
  
  -- Return true if under limit, false if over
  RETURN current_usage < usage_limit;
END;
$$;

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage"
  ON public.user_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Set up updated_at trigger
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_usage_updated_at
BEFORE UPDATE ON public.user_usage
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 