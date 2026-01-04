import { supabase } from '@/integrations/supabase/client';
import { Patient, Doctor, Appointment, Bill, LabTest, Medicine } from '@/types/hospital';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to transform database rows to match our types
function transformPatient(row: any): Patient {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    gender: row.gender,
    phone: row.phone,
    email: row.email,
    address: row.address,
    bloodGroup: row.blood_group,
    registrationDate: row.registration_date,
    status: row.status,
  };
}

function transformDoctor(row: any): Doctor {
  return {
    id: row.id,
    name: row.name,
    specialization: row.specialization,
    phone: row.phone,
    email: row.email,
    availability: row.availability || [],
    status: row.status,
  };
}

function transformAppointment(row: any): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    date: row.date,
    time: row.time,
    duration: row.duration,
    status: row.status,
    type: row.type,
    notes: row.notes,
  };
}

function transformBill(row: any): Bill {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    items: row.items || [],
    totalAmount: Number(row.total_amount),
    paidAmount: Number(row.paid_amount),
    status: row.status,
    date: row.date,
    dueDate: row.due_date,
  };
}

function transformLabTest(row: any): LabTest {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    testName: row.test_name,
    testType: row.test_type,
    requestedBy: row.requested_by,
    status: row.status,
    result: row.result,
    date: row.date,
    reportDate: row.report_date,
  };
}

function transformMedicine(row: any): Medicine {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    expiryDate: row.expiry_date,
    manufacturer: row.manufacturer,
    status: row.status,
  };
}

// Patients API
export const patientsApi = {
  getAll: async (): Promise<ApiResponse<Patient[]>> => {
    try {
      const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data: data?.map(transformPatient) || [] };
    } catch (error) {
      console.error('Patients API Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  getById: async (id: string): Promise<ApiResponse<Patient>> => {
    try {
      const { data, error } = await supabase.from('patients').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return { success: true, data: data ? transformPatient(data) : undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  create: async (patient: Omit<Patient, 'id'>): Promise<ApiResponse<Patient>> => {
    try {
      const { data, error } = await supabase.from('patients').insert({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        blood_group: patient.bloodGroup,
        registration_date: patient.registrationDate,
        status: patient.status,
      }).select().single();
      if (error) throw error;
      return { success: true, data: transformPatient(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  update: async (id: string, patient: Partial<Patient>): Promise<ApiResponse<Patient>> => {
    try {
      const updateData: any = {};
      if (patient.name !== undefined) updateData.name = patient.name;
      if (patient.age !== undefined) updateData.age = patient.age;
      if (patient.gender !== undefined) updateData.gender = patient.gender;
      if (patient.phone !== undefined) updateData.phone = patient.phone;
      if (patient.email !== undefined) updateData.email = patient.email;
      if (patient.address !== undefined) updateData.address = patient.address;
      if (patient.bloodGroup !== undefined) updateData.blood_group = patient.bloodGroup;
      if (patient.registrationDate !== undefined) updateData.registration_date = patient.registrationDate;
      if (patient.status !== undefined) updateData.status = patient.status;

      const { data, error } = await supabase.from('patients').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return { success: true, data: transformPatient(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};

// Doctors API
export const doctorsApi = {
  getAll: async (): Promise<ApiResponse<Doctor[]>> => {
    try {
      const { data, error } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data: data?.map(transformDoctor) || [] };
    } catch (error) {
      console.error('Doctors API Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  getById: async (id: string): Promise<ApiResponse<Doctor>> => {
    try {
      const { data, error } = await supabase.from('doctors').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return { success: true, data: data ? transformDoctor(data) : undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  create: async (doctor: Omit<Doctor, 'id'>): Promise<ApiResponse<Doctor>> => {
    try {
      const { data, error } = await supabase.from('doctors').insert({
        name: doctor.name,
        specialization: doctor.specialization,
        phone: doctor.phone,
        email: doctor.email,
        availability: doctor.availability,
        status: doctor.status,
      }).select().single();
      if (error) throw error;
      return { success: true, data: transformDoctor(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  update: async (id: string, doctor: Partial<Doctor>): Promise<ApiResponse<Doctor>> => {
    try {
      const updateData: any = {};
      if (doctor.name !== undefined) updateData.name = doctor.name;
      if (doctor.specialization !== undefined) updateData.specialization = doctor.specialization;
      if (doctor.phone !== undefined) updateData.phone = doctor.phone;
      if (doctor.email !== undefined) updateData.email = doctor.email;
      if (doctor.availability !== undefined) updateData.availability = doctor.availability;
      if (doctor.status !== undefined) updateData.status = doctor.status;

      const { data, error } = await supabase.from('doctors').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return { success: true, data: transformDoctor(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase.from('doctors').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};

// Appointments API
export const appointmentsApi = {
  getAll: async (): Promise<ApiResponse<Appointment[]>> => {
    try {
      const { data, error } = await supabase.from('appointments').select('*').order('date', { ascending: false });
      if (error) throw error;
      return { success: true, data: data?.map(transformAppointment) || [] };
    } catch (error) {
      console.error('Appointments API Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  getById: async (id: string): Promise<ApiResponse<Appointment>> => {
    try {
      const { data, error } = await supabase.from('appointments').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return { success: true, data: data ? transformAppointment(data) : undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  create: async (appointment: Omit<Appointment, 'id'>): Promise<ApiResponse<Appointment>> => {
    try {
      const { data, error } = await supabase.from('appointments').insert({
        patient_id: appointment.patientId,
        patient_name: appointment.patientName,
        doctor_id: appointment.doctorId,
        doctor_name: appointment.doctorName,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        status: appointment.status,
        type: appointment.type,
        notes: appointment.notes,
      }).select().single();
      if (error) throw error;
      
      // Create notification for new appointment
      await supabase.from('notifications').insert({
        type: 'appointment',
        message: `New appointment booked: ${appointment.patientName} with Dr. ${appointment.doctorName} on ${appointment.date} at ${appointment.time}`,
        related_id: data.id
      });
      
      return { success: true, data: transformAppointment(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  update: async (id: string, appointment: Partial<Appointment>): Promise<ApiResponse<Appointment>> => {
    try {
      const updateData: any = {};
      if (appointment.patientName !== undefined) updateData.patient_name = appointment.patientName;
      if (appointment.doctorName !== undefined) updateData.doctor_name = appointment.doctorName;
      if (appointment.date !== undefined) updateData.date = appointment.date;
      if (appointment.time !== undefined) updateData.time = appointment.time;
      if (appointment.duration !== undefined) updateData.duration = appointment.duration;
      if (appointment.status !== undefined) updateData.status = appointment.status;
      if (appointment.type !== undefined) updateData.type = appointment.type;
      if (appointment.notes !== undefined) updateData.notes = appointment.notes;

      const { data, error } = await supabase.from('appointments').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return { success: true, data: transformAppointment(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};

// Bills API
export const billsApi = {
  getAll: async (): Promise<ApiResponse<Bill[]>> => {
    try {
      const { data, error } = await supabase.from('bills').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data: data?.map(transformBill) || [] };
    } catch (error) {
      console.error('Bills API Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  getById: async (id: string): Promise<ApiResponse<Bill>> => {
    try {
      const { data, error } = await supabase.from('bills').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return { success: true, data: data ? transformBill(data) : undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  create: async (bill: Omit<Bill, 'id'>): Promise<ApiResponse<Bill>> => {
    try {
      const insertData = {
        patient_name: bill.patientName,
        items: JSON.stringify(bill.items),
        total_amount: bill.totalAmount,
        paid_amount: bill.paidAmount,
        status: bill.status,
        date: bill.date,
        due_date: bill.dueDate,
      };
      const { data, error } = await supabase.from('bills').insert(insertData as any).select().single();
      if (error) throw error;
      return { success: true, data: transformBill(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  update: async (id: string, bill: Partial<Bill>): Promise<ApiResponse<Bill>> => {
    try {
      const updateData: any = {};
      if (bill.patientName !== undefined) updateData.patient_name = bill.patientName;
      if (bill.items !== undefined) updateData.items = bill.items;
      if (bill.totalAmount !== undefined) updateData.total_amount = bill.totalAmount;
      if (bill.paidAmount !== undefined) updateData.paid_amount = bill.paidAmount;
      if (bill.status !== undefined) updateData.status = bill.status;
      if (bill.date !== undefined) updateData.date = bill.date;
      if (bill.dueDate !== undefined) updateData.due_date = bill.dueDate;

      const { data, error } = await supabase.from('bills').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return { success: true, data: transformBill(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase.from('bills').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};

// Lab Tests API
export const labTestsApi = {
  getAll: async (): Promise<ApiResponse<LabTest[]>> => {
    try {
      const { data, error } = await supabase.from('lab_tests').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data: data?.map(transformLabTest) || [] };
    } catch (error) {
      console.error('Lab Tests API Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  getById: async (id: string): Promise<ApiResponse<LabTest>> => {
    try {
      const { data, error } = await supabase.from('lab_tests').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return { success: true, data: data ? transformLabTest(data) : undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  create: async (test: Omit<LabTest, 'id'>): Promise<ApiResponse<LabTest>> => {
    try {
      const { data, error } = await supabase.from('lab_tests').insert({
        patient_name: test.patientName,
        test_name: test.testName,
        test_type: test.testType,
        requested_by: test.requestedBy,
        status: test.status,
        result: test.result,
        date: test.date,
        report_date: test.reportDate,
      }).select().single();
      if (error) throw error;
      return { success: true, data: transformLabTest(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  update: async (id: string, test: Partial<LabTest>): Promise<ApiResponse<LabTest>> => {
    try {
      const updateData: any = {};
      if (test.patientName !== undefined) updateData.patient_name = test.patientName;
      if (test.testName !== undefined) updateData.test_name = test.testName;
      if (test.testType !== undefined) updateData.test_type = test.testType;
      if (test.requestedBy !== undefined) updateData.requested_by = test.requestedBy;
      if (test.status !== undefined) updateData.status = test.status;
      if (test.result !== undefined) updateData.result = test.result;
      if (test.date !== undefined) updateData.date = test.date;
      if (test.reportDate !== undefined) updateData.report_date = test.reportDate;

      const { data, error } = await supabase.from('lab_tests').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return { success: true, data: transformLabTest(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase.from('lab_tests').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};

// Medicines API
export const medicinesApi = {
  getAll: async (): Promise<ApiResponse<Medicine[]>> => {
    try {
      const { data, error } = await supabase.from('medicines').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data: data?.map(transformMedicine) || [] };
    } catch (error) {
      console.error('Medicines API Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  getById: async (id: string): Promise<ApiResponse<Medicine>> => {
    try {
      const { data, error } = await supabase.from('medicines').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return { success: true, data: data ? transformMedicine(data) : undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  create: async (medicine: Omit<Medicine, 'id'>): Promise<ApiResponse<Medicine>> => {
    try {
      const { data, error } = await supabase.from('medicines').insert({
        name: medicine.name,
        category: medicine.category,
        quantity: medicine.quantity,
        unit_price: medicine.unitPrice,
        expiry_date: medicine.expiryDate,
        manufacturer: medicine.manufacturer,
        status: medicine.status,
      }).select().single();
      if (error) throw error;
      return { success: true, data: transformMedicine(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  update: async (id: string, medicine: Partial<Medicine>): Promise<ApiResponse<Medicine>> => {
    try {
      const updateData: any = {};
      if (medicine.name !== undefined) updateData.name = medicine.name;
      if (medicine.category !== undefined) updateData.category = medicine.category;
      if (medicine.quantity !== undefined) updateData.quantity = medicine.quantity;
      if (medicine.unitPrice !== undefined) updateData.unit_price = medicine.unitPrice;
      if (medicine.expiryDate !== undefined) updateData.expiry_date = medicine.expiryDate;
      if (medicine.manufacturer !== undefined) updateData.manufacturer = medicine.manufacturer;
      if (medicine.status !== undefined) updateData.status = medicine.status;

      const { data, error } = await supabase.from('medicines').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return { success: true, data: transformMedicine(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase.from('medicines').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};

// Dashboard Stats API
export const dashboardApi = {
  getStats: async () => {
    try {
      const [patientsRes, appointmentsRes, billsRes, doctorsRes, labTestsRes, medicinesRes] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*').eq('date', new Date().toISOString().split('T')[0]),
        supabase.from('bills').select('*').eq('status', 'Pending'),
        supabase.from('doctors').select('*').eq('status', 'Available'),
        supabase.from('lab_tests').select('*').eq('status', 'Pending'),
        supabase.from('medicines').select('*').eq('status', 'Low-Stock'),
      ]);

      return {
        totalPatients: patientsRes.count || 0,
        todayAppointments: appointmentsRes.data?.length || 0,
        pendingBills: billsRes.data?.length || 0,
        availableDoctors: doctorsRes.data?.length || 0,
        pendingLabTests: labTestsRes.data?.length || 0,
        lowStockMedicines: medicinesRes.data?.length || 0,
      };
    } catch (error) {
      console.error('Dashboard Stats Error:', error);
      return {
        totalPatients: 0,
        todayAppointments: 0,
        pendingBills: 0,
        availableDoctors: 0,
        pendingLabTests: 0,
        lowStockMedicines: 0,
      };
    }
  },
};
