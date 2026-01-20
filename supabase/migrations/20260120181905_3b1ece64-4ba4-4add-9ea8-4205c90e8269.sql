-- Insert default email template settings
INSERT INTO system_configurations (key, value, category, description)
VALUES ('email_template_settings', '{
  "from_name": "Meta Skills Academy",
  "from_email": "noreply@edu.metasageacademy.com",
  "company_name": "Meta Skills Academy",
  "logo_url": "",
  "header_color_start": "#6366f1",
  "header_color_end": "#8b5cf6",
  "button_color_start": "#6366f1",
  "button_color_end": "#8b5cf6",
  "footer_text": "This is an automated message, please do not reply."
}'::jsonb, 'email', 'Email template customization settings including colors, branding, and sender information')
ON CONFLICT (key) DO NOTHING;