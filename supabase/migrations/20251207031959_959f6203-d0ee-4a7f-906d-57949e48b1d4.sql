-- Create admin_users table for authentication
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create hospital_settings table
CREATE TABLE public.hospital_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_name TEXT NOT NULL DEFAULT 'Hospital Management System',
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospital_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read for hospital settings (for displaying logo/name)
CREATE POLICY "Hospital settings are publicly readable"
ON public.hospital_settings
FOR SELECT
USING (true);

-- Create storage bucket for hospital logos
INSERT INTO storage.buckets (id, name, public) VALUES ('hospital-logos', 'hospital-logos', true);

-- Allow public read access to logos
CREATE POLICY "Public can view logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hospital-logos');

-- Allow authenticated uploads (we'll handle auth in edge function)
CREATE POLICY "Allow logo uploads"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'hospital-logos');

CREATE POLICY "Allow logo updates"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'hospital-logos');

CREATE POLICY "Allow logo deletes"
ON storage.objects
FOR DELETE
USING (bucket_id = 'hospital-logos');

-- Insert default admin user (password: akash - we'll hash it in edge function on first login)
INSERT INTO public.admin_users (username, password_hash) VALUES ('akash', 'akash');

-- Insert default hospital settings
INSERT INTO public.hospital_settings (hospital_name) VALUES ('Hospital Management System');