-- Create admin roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES admin_roles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI assistant configurations table
CREATE TABLE IF NOT EXISTS ai_assistant_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  model_provider VARCHAR(50) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  system_prompt TEXT,
  max_tokens INTEGER DEFAULT 1000,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client activity logs table
CREATE TABLE IF NOT EXISTS client_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin role
INSERT INTO admin_roles (name, permissions) VALUES 
('super_admin', '{"users": ["read", "write", "delete"], "ai_configs": ["read", "write", "delete"], "analytics": ["read"], "settings": ["read", "write"]}'),
('admin', '{"users": ["read", "write"], "ai_configs": ["read", "write"], "analytics": ["read"]}'),
('viewer', '{"users": ["read"], "ai_configs": ["read"], "analytics": ["read"]}')
ON CONFLICT (name) DO NOTHING;

-- Insert default AI assistant configurations
INSERT INTO ai_assistant_configs (name, description, model_provider, model_name, system_prompt) VALUES 
('Trading Expert', 'Advanced AI assistant specialized in trading analysis and market insights', 'groq', 'llama-3.1-70b-versatile', 'You are an expert trading assistant with deep knowledge of financial markets, technical analysis, and risk management. Provide accurate, actionable trading advice while emphasizing risk management.'),
('Market Analyst', 'AI assistant focused on market research and trend analysis', 'groq', 'llama-3.1-70b-versatile', 'You are a professional market analyst specializing in comprehensive market research, trend identification, and economic analysis. Provide detailed market insights and forecasts.'),
('Risk Manager', 'Conservative AI assistant focused on risk assessment and portfolio protection', 'groq', 'llama-3.1-70b-versatile', 'You are a risk management specialist focused on portfolio protection, risk assessment, and conservative trading strategies. Always prioritize capital preservation.')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin tables
CREATE POLICY "Admin users can view all admin roles" ON admin_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can manage their data" ON admin_users
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admin users can view AI configs" ON ai_assistant_configs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can manage AI configs" ON ai_assistant_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN admin_roles ar ON au.role_id = ar.id
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
      AND ar.permissions->>'ai_configs' ? 'write'
    )
  );
