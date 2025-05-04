-- Create user_usage table to track feature usage
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcription_count INTEGER NOT NULL DEFAULT 0,
  ai_chat_count INTEGER NOT NULL DEFAULT 0,
  last_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add a trigger to update the updated_at column
CREATE TRIGGER update_user_usage_updated_at
BEFORE UPDATE ON user_usage
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage
CREATE POLICY "Users can read their own usage"
ON user_usage FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update their own usage"
ON user_usage FOR UPDATE
USING (auth.uid() = user_id);

-- Only service role can insert usage
CREATE POLICY "Service role can insert usage"
ON user_usage FOR INSERT
TO service_role
USING (true);

-- Create a function to initialize usage for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_usage (user_id, transcription_count, ai_chat_count)
  VALUES (NEW.id, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created_usage
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_usage();

-- Create functions to check and increment usage counters
CREATE OR REPLACE FUNCTION check_transcription_limit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  usage_record RECORD;
  subscription_record RECORD;
  limit_reached BOOLEAN;
BEGIN
  -- Get the user's current usage
  SELECT * INTO usage_record FROM user_usage WHERE user_id = $1;
  
  -- Get the user's subscription plan
  SELECT * INTO subscription_record FROM user_subscriptions WHERE user_id = $1;
  
  IF subscription_record.plan_type = 'free' THEN
    -- Free plan: 5 transcriptions
    limit_reached := usage_record.transcription_count >= 5;
  ELSIF subscription_record.plan_type = 'premium' AND subscription_record.status = 'active' THEN
    -- Premium plan: 50 transcriptions
    limit_reached := usage_record.transcription_count >= 50;
  ELSE
    -- Default to limit reached
    limit_reached := TRUE;
  END IF;
  
  RETURN NOT limit_reached;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_ai_chat_limit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  usage_record RECORD;
  subscription_record RECORD;
  limit_reached BOOLEAN;
BEGIN
  -- Get the user's current usage
  SELECT * INTO usage_record FROM user_usage WHERE user_id = $1;
  
  -- Get the user's subscription plan
  SELECT * INTO subscription_record FROM user_subscriptions WHERE user_id = $1;
  
  IF subscription_record.plan_type = 'free' THEN
    -- Free plan: 5 AI chat queries
    limit_reached := usage_record.ai_chat_count >= 5;
  ELSIF subscription_record.plan_type = 'premium' AND subscription_record.status = 'active' THEN
    -- Premium plan: 1000 AI chat queries
    limit_reached := usage_record.ai_chat_count >= 1000;
  ELSE
    -- Default to limit reached
    limit_reached := TRUE;
  END IF;
  
  RETURN NOT limit_reached;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_transcription_count(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  can_use BOOLEAN;
BEGIN
  -- Check if the user can use the feature
  SELECT check_transcription_limit($1) INTO can_use;
  
  IF can_use THEN
    -- Increment the count
    UPDATE user_usage
    SET transcription_count = transcription_count + 1
    WHERE user_id = $1;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_ai_chat_count(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  can_use BOOLEAN;
BEGIN
  -- Check if the user can use the feature
  SELECT check_ai_chat_limit($1) INTO can_use;
  
  IF can_use THEN
    -- Increment the count
    UPDATE user_usage
    SET ai_chat_count = ai_chat_count + 1
    WHERE user_id = $1;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 