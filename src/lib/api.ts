import { supabase } from '@/integrations/supabase/client';
import { Patient, Doctor, Appointment, Bill, LabTest, Medicine } from '@/types/hospital';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mongodb`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function callMongoDB<T>(
  action: string,
  collection: string,
  options: {
    filter?: Record<string, unknown>;
    data?: Record<string, unknown>;
    update?: Record<string, unknown>;
    pipeline?: Record<string, unknown>[];
  } = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        collection,
        ...options,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'API call failed');
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Patients API
export const patientsApi = {
  getAll: () => callMongoDB<Patient[]>('find', 'patients'),
  getById: (id: string) => callMongoDB<Patient>('findOne', 'patients', { filter: { id } }),
  create: (patient: Omit<Patient, 'id'>) => 
    callMongoDB('insertOne', 'patients', { data: { ...patient, id: crypto.randomUUID() } }),
  update: (id: string, data: Partial<Patient>) => 
    callMongoDB('updateOne', 'patients', { filter: { id }, update: { $set: data } }),
  delete: (id: string) => callMongoDB('deleteOne', 'patients', { filter: { id } }),
};

// Doctors API
export const doctorsApi = {
  getAll: () => callMongoDB<Doctor[]>('find', 'doctors'),
  getById: (id: string) => callMongoDB<Doctor>('findOne', 'doctors', { filter: { id } }),
  create: (doctor: Omit<Doctor, 'id'>) => 
    callMongoDB('insertOne', 'doctors', { data: { ...doctor, id: crypto.randomUUID() } }),
  update: (id: string, data: Partial<Doctor>) => 
    callMongoDB('updateOne', 'doctors', { filter: { id }, update: { $set: data } }),
  delete: (id: string) => callMongoDB('deleteOne', 'doctors', { filter: { id } }),
};

// Appointments API
export const appointmentsApi = {
  getAll: () => callMongoDB<Appointment[]>('find', 'appointments'),
  getById: (id: string) => callMongoDB<Appointment>('findOne', 'appointments', { filter: { id } }),
  create: (appointment: Omit<Appointment, 'id'>) => 
    callMongoDB('insertOne', 'appointments', { data: { ...appointment, id: crypto.randomUUID() } }),
  update: (id: string, data: Partial<Appointment>) => 
    callMongoDB('updateOne', 'appointments', { filter: { id }, update: { $set: data } }),
  delete: (id: string) => callMongoDB('deleteOne', 'appointments', { filter: { id } }),
};

// Bills API
export const billsApi = {
  getAll: () => callMongoDB<Bill[]>('find', 'bills'),
  getById: (id: string) => callMongoDB<Bill>('findOne', 'bills', { filter: { id } }),
  create: (bill: Omit<Bill, 'id'>) => 
    callMongoDB('insertOne', 'bills', { data: { ...bill, id: `INV-${Date.now()}` } }),
  update: (id: string, data: Partial<Bill>) => 
    callMongoDB('updateOne', 'bills', { filter: { id }, update: { $set: data } }),
  delete: (id: string) => callMongoDB('deleteOne', 'bills', { filter: { id } }),
};

// Lab Tests API
export const labTestsApi = {
  getAll: () => callMongoDB<LabTest[]>('find', 'labTests'),
  getById: (id: string) => callMongoDB<LabTest>('findOne', 'labTests', { filter: { id } }),
  create: (test: Omit<LabTest, 'id'>) => 
    callMongoDB('insertOne', 'labTests', { data: { ...test, id: crypto.randomUUID() } }),
  update: (id: string, data: Partial<LabTest>) => 
    callMongoDB('updateOne', 'labTests', { filter: { id }, update: { $set: data } }),
  delete: (id: string) => callMongoDB('deleteOne', 'labTests', { filter: { id } }),
};

// Medicines API
export const medicinesApi = {
  getAll: () => callMongoDB<Medicine[]>('find', 'medicines'),
  getById: (id: string) => callMongoDB<Medicine>('findOne', 'medicines', { filter: { id } }),
  create: (medicine: Omit<Medicine, 'id'>) => 
    callMongoDB('insertOne', 'medicines', { data: { ...medicine, id: crypto.randomUUID() } }),
  update: (id: string, data: Partial<Medicine>) => 
    callMongoDB('updateOne', 'medicines', { filter: { id }, update: { $set: data } }),
  delete: (id: string) => callMongoDB('deleteOne', 'medicines', { filter: { id } }),
};

// Dashboard Stats API
export const dashboardApi = {
  getStats: async () => {
    const [patients, appointments, bills, doctors, labTests, medicines] = await Promise.all([
      callMongoDB('find', 'patients'),
      callMongoDB('find', 'appointments'),
      callMongoDB('find', 'bills'),
      callMongoDB('find', 'doctors'),
      callMongoDB('find', 'labTests'),
      callMongoDB('find', 'medicines'),
    ]);

    return {
      totalPatients: 0,
      todayAppointments: 0,
      pendingBills: 0,
      availableDoctors: 0,
      pendingLabTests: 0,
      lowStockMedicines: 0,
    };
  },
};
