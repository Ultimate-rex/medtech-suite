-- Add consultation_fee to doctors
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS consultation_fee numeric DEFAULT 500;

-- Create app_role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'lab_staff', 'billing_staff', 'appointment_staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create staff_users table for role-based login
CREATE TABLE IF NOT EXISTS public.staff_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role app_role NOT NULL,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  related_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for staff_users (admin only)
CREATE POLICY "Staff users readable by authenticated" ON public.staff_users
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff users manageable by admin" ON public.staff_users
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "User roles readable by authenticated" ON public.user_roles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "User roles manageable by admin" ON public.user_roles
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for notifications (all authenticated can read)
CREATE POLICY "Notifications readable by authenticated" ON public.notifications
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Notifications insertable" ON public.notifications
FOR INSERT WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Clear existing data (reset everything)
DELETE FROM appointments;
DELETE FROM bills;
DELETE FROM lab_tests;
DELETE FROM medicines;
DELETE FROM patients;

-- Update trigger for staff_users
CREATE TRIGGER update_staff_users_updated_at
BEFORE UPDATE ON public.staff_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();