-- Create the admin setup function that can be called from the frontend
CREATE OR REPLACE FUNCTION add_admin_user(user_email TEXT)
RETURNS VOID AS $$
BEGIN
    -- First ensure admin tables exist
    CREATE TABLE IF NOT EXISTS admin_roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        permissions JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES admin_roles(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE,
        UNIQUE(user_id)
    );

    -- Insert default admin roles if they don't exist
    INSERT INTO admin_roles (name, permissions) VALUES 
    ('super_admin', '{"users": ["read", "write", "delete"], "ai_configs": ["read", "write", "delete"], "analytics": ["read"], "settings": ["read", "write"]}'),
    ('admin', '{"users": ["read", "write"], "ai_configs": ["read", "write"], "analytics": ["read"], "settings": ["read"]}'),
    ('viewer', '{"users": ["read"], "ai_configs": ["read"], "analytics": ["read"], "settings": ["read"]}')
    ON CONFLICT (name) DO NOTHING;

    -- Enable RLS
    ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

    -- Create policies if they don't exist
    DROP POLICY IF EXISTS "Admin users can read admin_roles" ON admin_roles;
    DROP POLICY IF EXISTS "Admin users can read admin_users" ON admin_users;
    DROP POLICY IF EXISTS "Admin users can update admin_users" ON admin_users;

    CREATE POLICY "Admin users can read admin_roles" ON admin_roles
        FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM admin_users 
                WHERE user_id = auth.uid() AND is_active = true
            )
        );

    CREATE POLICY "Admin users can read admin_users" ON admin_users
        FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM admin_users 
                WHERE user_id = auth.uid() AND is_active = true
            )
        );

    CREATE POLICY "Admin users can update admin_users" ON admin_users
        FOR UPDATE TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM admin_users 
                WHERE user_id = auth.uid() AND is_active = true
            )
        );

    -- Add admin privileges to the user
    INSERT INTO admin_users (user_id, role_id, is_active)
    SELECT 
        auth.users.id,
        admin_roles.id,
        true
    FROM auth.users, admin_roles
    WHERE auth.users.email = user_email
    AND admin_roles.name = 'super_admin'
    ON CONFLICT (user_id) DO UPDATE SET
        role_id = EXCLUDED.role_id,
        is_active = EXCLUDED.is_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
