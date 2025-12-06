import { Patient, Doctor, Appointment, Bill, LabTest, Medicine, DashboardStats } from '@/types/hospital';

export const mockPatients: Patient[] = [
  { id: '1', name: 'Rahul Sharma', age: 45, gender: 'Male', phone: '+91-9876543210', email: 'rahul@email.com', address: '123 MG Road, Mumbai', bloodGroup: 'A+', registrationDate: '2024-01-15', status: 'Active' },
  { id: '2', name: 'Priya Patel', age: 32, gender: 'Female', phone: '+91-9876543211', email: 'priya@email.com', address: '456 Brigade Road, Bangalore', bloodGroup: 'B+', registrationDate: '2024-02-20', status: 'Active' },
  { id: '3', name: 'Amit Kumar', age: 58, gender: 'Male', phone: '+91-9876543212', email: 'amit@email.com', address: '789 Park Street, Kolkata', bloodGroup: 'O-', registrationDate: '2024-03-10', status: 'Active' },
  { id: '4', name: 'Sneha Reddy', age: 28, gender: 'Female', phone: '+91-9876543213', email: 'sneha@email.com', address: '321 Anna Nagar, Chennai', bloodGroup: 'AB+', registrationDate: '2024-04-05', status: 'Inactive' },
  { id: '5', name: 'Vikram Singh', age: 67, gender: 'Male', phone: '+91-9876543214', email: 'vikram@email.com', address: '654 Connaught Place, Delhi', bloodGroup: 'A-', registrationDate: '2024-05-12', status: 'Active' },
];

export const mockDoctors: Doctor[] = [
  { id: '1', name: 'Dr. Arun Joshi', specialization: 'Cardiology', phone: '+91-9800000001', email: 'dr.arun@hospital.com', availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], status: 'Available' },
  { id: '2', name: 'Dr. Sunita Verma', specialization: 'Neurology', phone: '+91-9800000002', email: 'dr.sunita@hospital.com', availability: ['Mon', 'Wed', 'Fri'], status: 'Available' },
  { id: '3', name: 'Dr. Rajesh Gupta', specialization: 'Orthopedics', phone: '+91-9800000003', email: 'dr.rajesh@hospital.com', availability: ['Tue', 'Thu', 'Sat'], status: 'Busy' },
  { id: '4', name: 'Dr. Meera Nair', specialization: 'Pediatrics', phone: '+91-9800000004', email: 'dr.meera@hospital.com', availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], status: 'Available' },
];

export const mockAppointments: Appointment[] = [
  { id: '1', patientId: '1', patientName: 'Rahul Sharma', doctorId: '1', doctorName: 'Dr. Arun Joshi', date: '2025-12-06', time: '09:00', duration: 30, status: 'Scheduled', type: 'Consultation' },
  { id: '2', patientId: '2', patientName: 'Priya Patel', doctorId: '2', doctorName: 'Dr. Sunita Verma', date: '2025-12-06', time: '10:30', duration: 45, status: 'Scheduled', type: 'Follow-up' },
  { id: '3', patientId: '3', patientName: 'Amit Kumar', doctorId: '1', doctorName: 'Dr. Arun Joshi', date: '2025-12-07', time: '11:00', duration: 30, status: 'Scheduled', type: 'Routine' },
  { id: '4', patientId: '4', patientName: 'Sneha Reddy', doctorId: '3', doctorName: 'Dr. Rajesh Gupta', date: '2025-12-08', time: '14:00', duration: 60, status: 'Scheduled', type: 'Consultation' },
];

export const mockBills: Bill[] = [
  { id: '1', patientId: '1', patientName: 'Rahul Sharma', items: [{ description: 'Consultation Fee', quantity: 1, unitPrice: 500, amount: 500 }, { description: 'Blood Test', quantity: 1, unitPrice: 300, amount: 300 }], totalAmount: 800, paidAmount: 800, status: 'Paid', date: '2024-11-15', dueDate: '2024-11-30' },
  { id: '2', patientId: '2', patientName: 'Priya Patel', items: [{ description: 'Consultation Fee', quantity: 1, unitPrice: 500, amount: 500 }], totalAmount: 500, paidAmount: 300, status: 'Partial', date: '2024-11-16', dueDate: '2024-12-01' },
  { id: '3', patientId: '3', patientName: 'Amit Kumar', items: [{ description: 'X-Ray', quantity: 1, unitPrice: 800, amount: 800 }, { description: 'Consultation Fee', quantity: 1, unitPrice: 500, amount: 500 }], totalAmount: 1300, paidAmount: 0, status: 'Pending', date: '2024-11-17', dueDate: '2024-12-02' },
];

export const mockLabTests: LabTest[] = [
  { id: '1', patientId: '1', patientName: 'Rahul Sharma', testName: 'Complete Blood Count', testType: 'Hematology', requestedBy: 'Dr. Arun Joshi', status: 'Completed', result: 'Normal', date: '2024-11-15', reportDate: '2024-11-16' },
  { id: '2', patientId: '2', patientName: 'Priya Patel', testName: 'Lipid Panel', testType: 'Biochemistry', requestedBy: 'Dr. Sunita Verma', status: 'In-Progress', date: '2024-11-17' },
  { id: '3', patientId: '3', patientName: 'Amit Kumar', testName: 'MRI Scan', testType: 'Radiology', requestedBy: 'Dr. Rajesh Gupta', status: 'Pending', date: '2024-11-18' },
];

export const mockMedicines: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', category: 'Analgesic', quantity: 500, unitPrice: 5, expiryDate: '2026-06-15', manufacturer: 'Cipla', status: 'In-Stock' },
  { id: '2', name: 'Amoxicillin 250mg', category: 'Antibiotic', quantity: 200, unitPrice: 12, expiryDate: '2025-12-20', manufacturer: 'Sun Pharma', status: 'In-Stock' },
  { id: '3', name: 'Omeprazole 20mg', category: 'Antacid', quantity: 50, unitPrice: 8, expiryDate: '2025-09-10', manufacturer: 'Dr. Reddy', status: 'Low-Stock' },
  { id: '4', name: 'Metformin 500mg', category: 'Antidiabetic', quantity: 0, unitPrice: 6, expiryDate: '2026-03-25', manufacturer: 'Lupin', status: 'Out-of-Stock' },
];

export const mockDashboardStats: DashboardStats = {
  totalPatients: 0,
  todayAppointments: 0,
  pendingBills: 0,
  availableDoctors: 0,
  pendingLabTests: 0,
  lowStockMedicines: 0,
};
