-- Add custom_ai_name column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN custom_ai_name VARCHAR(50);

-- Update existing users with Active AI to have a default custom name
UPDATE user_profiles 
SET custom_ai_name = 'My AI Assistant' 
WHERE selected_ai_assistant = 'Active AI' AND custom_ai_name IS NULL;
