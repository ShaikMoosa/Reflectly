-- Create subscription_cancellations table to store cancellation feedback
CREATE TABLE public.subscription_cancellations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT fk_user_subscription 
    FOREIGN KEY (user_id) 
    REFERENCES public.user_subscriptions (user_id) 
    ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.subscription_cancellations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own cancellation feedback"
  ON public.subscription_cancellations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cancellation feedback"
  ON public.subscription_cancellations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to record subscription cancellation
CREATE OR REPLACE FUNCTION public.record_subscription_cancellation(
  user_id UUID,
  subscription_id TEXT,
  cancel_reason TEXT,
  cancel_feedback TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert cancellation record
  INSERT INTO public.subscription_cancellations (
    user_id,
    subscription_id,
    reason,
    feedback
  ) VALUES (
    user_id,
    subscription_id,
    cancel_reason,
    cancel_feedback
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$; 