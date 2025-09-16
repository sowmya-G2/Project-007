-- Add a user to the admin_users table
-- First, ensure the admin schema exists by running the previous script if needed

-- Get the super_admin role ID
DO $$
DECLARE
    super_admin_role_id UUID;
    user_email TEXT := 'soumyagodavarthi@gmail.com'; -- Replace with your actual email
BEGIN
    -- Get the super_admin role ID
    SELECT id INTO super_admin_role_id 
    FROM admin_roles 
    WHERE name = 'super_admin';
    
    -- Check if super_admin role exists, if not create it
    IF super_admin_role_id IS NULL THEN
        INSERT INTO admin_roles (name, permissions) VALUES 
        ('super_admin', '{"users": ["read", "write", "delete"], "ai_configs": ["read", "write", "delete"], "analytics": ["read"], "settings": ["read", "write"]}')
        RETURNING id INTO super_admin_role_id;
    END IF;
    
    -- Add admin user (replace the email with your actual Supabase user email)
    -- This assumes you already have a user account in auth.users
    INSERT INTO admin_users (user_id, role_id, is_active)
    SELECT 
        au.id as user_id,
        super_admin_role_id as role_id,
        true as is_active
    FROM auth.users au
    WHERE au.email = user_email
    ON CONFLICT (user_id) DO UPDATE SET
        role_id = super_admin_role_id,
        is_active = true,
        updated_at = NOW();
        
    -- If no user found with that email, show a message
    IF NOT FOUND THEN
        RAISE NOTICE 'No user found with email: %. Please make sure you have created a Supabase account with this email first.', user_email;
    ELSE
        RAISE NOTICE 'Successfully added/updated admin user with email: %', user_email;
    END IF;
END $$;

-- Alternative: Add admin user by user ID if you know the UUID
-- Uncomment and replace the UUID below if you prefer this method
/*
INSERT INTO admin_users (user_id, role_id, is_active)
SELECT 
    'YOUR_USER_UUID_HERE'::UUID as user_id,
    ar.id as role_id,
    true as is_active
FROM admin_roles ar
WHERE ar.name = 'super_admin'
ON CONFLICT (user_id) DO UPDATE SET
    role_id = EXCLUDED.role_id,
    is_active = true,
    updated_at = NOW();
*/
