-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  availability TEXT[] DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  status TEXT NOT NULL DEFAULT 'Available',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  blood_group TEXT,
  registration_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  type TEXT NOT NULL DEFAULT 'Consultation',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bills table
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_tests table
CREATE TABLE public.lab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  requested_by TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  result TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  report_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medicines table
CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  expiry_date DATE,
  manufacturer TEXT,
  status TEXT NOT NULL DEFAULT 'In-Stock',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- Create policies for reading data (public read for now since admin auth is separate)
CREATE POLICY "Allow public read on doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Allow public read on patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Allow public read on appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Allow public read on bills" ON public.bills FOR SELECT USING (true);
CREATE POLICY "Allow public read on lab_tests" ON public.lab_tests FOR SELECT USING (true);
CREATE POLICY "Allow public read on medicines" ON public.medicines FOR SELECT USING (true);

-- Create policies for insert/update/delete (through edge functions with admin token)
CREATE POLICY "Allow anon insert on doctors" ON public.doctors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on doctors" ON public.doctors FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on doctors" ON public.doctors FOR DELETE USING (true);

CREATE POLICY "Allow anon insert on patients" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on patients" ON public.patients FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on patients" ON public.patients FOR DELETE USING (true);

CREATE POLICY "Allow anon insert on appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on appointments" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on appointments" ON public.appointments FOR DELETE USING (true);

CREATE POLICY "Allow anon insert on bills" ON public.bills FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on bills" ON public.bills FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on bills" ON public.bills FOR DELETE USING (true);

CREATE POLICY "Allow anon insert on lab_tests" ON public.lab_tests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on lab_tests" ON public.lab_tests FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on lab_tests" ON public.lab_tests FOR DELETE USING (true);

CREATE POLICY "Allow anon insert on medicines" ON public.medicines FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on medicines" ON public.medicines FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on medicines" ON public.medicines FOR DELETE USING (true);

-- Add update_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lab_tests_updated_at BEFORE UPDATE ON public.lab_tests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON public.medicines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();