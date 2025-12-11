import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Doctor, Patient, Medicine } from '@/types/hospital';
import { doctorsApi, patientsApi, medicinesApi } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  Users,
  Settings,
  Shield,
  Building,
  Edit,
  Trash2,
  Stethoscope,
  Pill,
  Upload,
  Image,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Bell,
  UserCog,
  Lock,
  FlaskConical,
  CreditCard,
  CalendarCheck,
  IndianRupee,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';
import { useHospitalSettings } from '@/hooks/useHospitalSettings';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const specializations = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Psychiatry',
  'General Medicine',
];

const staffRoles = [
  { value: 'doctor', label: 'Doctor', icon: Stethoscope },
  { value: 'lab_staff', label: 'Lab Staff', icon: FlaskConical },
  { value: 'billing_staff', label: 'Billing Staff', icon: CreditCard },
  { value: 'appointment_staff', label: 'Appointment Staff', icon: CalendarCheck },
];

interface StaffUser {
  id: string;
  name: string;
  role: string;
  username: string;
  is_active: boolean;
  doctor_id: string | null;
  created_at: string;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function Admin() {
  const { settings, updateSettings, uploadLogo, isLoading: settingsLoading } = useHospitalSettings();
  const { username } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Hospital name state
  const [hospitalName, setHospitalName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  
  // Reset data dialog
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  // Doctors state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    phone: '',
    email: '',
    consultationFee: '500',
  });

  // Patients state
  const [patients, setPatients] = useState<Patient[]>([]);

  // Medicines state
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // Staff users state
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    username: '',
    password: '',
    doctor_id: '',
  });

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
    fetchStaffUsers();
    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          toast.info(newNotification.message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [doctorsRes, patientsRes, medicinesRes] = await Promise.all([
        doctorsApi.getAll(),
        patientsApi.getAll(),
        medicinesApi.getAll(),
      ]);

      if (doctorsRes.success && doctorsRes.data) {
        setDoctors(doctorsRes.data);
      }
      if (patientsRes.success && patientsRes.data) {
        setPatients(patientsRes.data);
      }
      if (medicinesRes.success && medicinesRes.data) {
        setMedicines(medicinesRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaffUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaffUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch staff users:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Logo upload handler
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    toast.loading('Uploading logo...');
    const result = await uploadLogo(file);
    toast.dismiss();

    if (result.success) {
      toast.success('Logo uploaded successfully!');
    } else {
      toast.error(result.error || 'Upload failed');
    }
  };

  // Hospital name update handler
  const handleUpdateHospitalName = async () => {
    if (!hospitalName.trim()) {
      toast.error('Please enter a hospital name');
      return;
    }

    setIsUpdatingName(true);
    const result = await updateSettings({ hospitalName: hospitalName.trim() });
    setIsUpdatingName(false);

    if (result.success) {
      toast.success('Hospital name updated!');
      setHospitalName('');
    } else {
      toast.error(result.error || 'Update failed');
    }
  };

  // Reset all data handler
  const handleResetData = async () => {
    if (resetConfirmText !== 'RESET') {
      toast.error('Please type RESET to confirm');
      return;
    }

    toast.loading('Resetting all data...');
    
    try {
      for (const doctor of doctors) {
        await doctorsApi.delete(doctor.id);
      }
      for (const patient of patients) {
        await patientsApi.delete(patient.id);
      }
      for (const medicine of medicines) {
        await medicinesApi.delete(medicine.id);
      }
      
      setDoctors([]);
      setPatients([]);
      setMedicines([]);
      
      toast.dismiss();
      toast.success('All data has been reset');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to reset data');
    }
    
    setIsResetDialogOpen(false);
    setResetConfirmText('');
  };

  // Doctor handlers
  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.specialization) {
      toast.error('Please fill in required fields');
      return;
    }

    let formattedPhone = newDoctor.phone;
    if (formattedPhone && !formattedPhone.startsWith('+91')) {
      formattedPhone = `+91-${formattedPhone.replace(/^\+?/, '')}`;
    }

    const doctorData = {
      name: newDoctor.name,
      specialization: newDoctor.specialization,
      phone: formattedPhone,
      email: newDoctor.email,
      availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      status: 'Available' as const,
      consultation_fee: parseFloat(newDoctor.consultationFee) || 500,
    };

    // Use Supabase directly to include consultation_fee
    const { data, error } = await supabase
      .from('doctors')
      .insert({
        name: doctorData.name,
        specialization: doctorData.specialization,
        phone: doctorData.phone,
        email: doctorData.email,
        availability: doctorData.availability,
        status: doctorData.status,
        consultation_fee: doctorData.consultation_fee,
      })
      .select()
      .single();
    
    if (!error && data) {
      const newDoc: Doctor = {
        id: data.id,
        name: data.name,
        specialization: data.specialization,
        phone: data.phone || '',
        email: data.email || '',
        availability: data.availability || [],
        status: data.status as Doctor['status'],
      };
      setDoctors([newDoc, ...doctors]);
      setNewDoctor({ name: '', specialization: '', phone: '', email: '', consultationFee: '500' });
      setIsAddDoctorOpen(false);
      toast.success('Doctor added successfully');
    } else {
      toast.error(error?.message || 'Failed to add doctor');
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    const result = await doctorsApi.delete(id);
    if (result.success) {
      setDoctors(doctors.filter((d) => d.id !== id));
      toast.success('Doctor removed');
    } else {
      toast.error(result.error || 'Failed to delete doctor');
    }
  };

  const toggleDoctorStatus = async (id: string) => {
    const doctor = doctors.find(d => d.id === id);
    if (!doctor) return;

    const newStatus = doctor.status === 'Available' ? 'Off-duty' : 'Available';
    const result = await doctorsApi.update(id, { status: newStatus });
    
    if (result.success) {
      setDoctors(doctors.map((d) =>
        d.id === id ? { ...d, status: newStatus } : d
      ));
    } else {
      toast.error('Failed to update status');
    }
  };

  // Patient handlers
  const handleDeletePatient = async (id: string) => {
    const result = await patientsApi.delete(id);
    if (result.success) {
      setPatients(patients.filter((p) => p.id !== id));
      toast.success('Patient removed');
    } else {
      toast.error(result.error || 'Failed to delete patient');
    }
  };

  const togglePatientStatus = async (id: string) => {
    const patient = patients.find(p => p.id === id);
    if (!patient) return;

    const newStatus = patient.status === 'Active' ? 'Inactive' : 'Active';
    const result = await patientsApi.update(id, { status: newStatus });
    
    if (result.success) {
      setPatients(patients.map((p) =>
        p.id === id ? { ...p, status: newStatus } : p
      ));
    } else {
      toast.error('Failed to update status');
    }
  };

  // Medicine handlers
  const handleDeleteMedicine = async (id: string) => {
    const result = await medicinesApi.delete(id);
    if (result.success) {
      setMedicines(medicines.filter((m) => m.id !== id));
      toast.success('Medicine removed');
    } else {
      toast.error(result.error || 'Failed to delete medicine');
    }
  };

  const updateMedicineStock = async (id: string, quantity: number) => {
    let status: Medicine['status'] = 'In-Stock';
    if (quantity === 0) status = 'Out-of-Stock';
    else if (quantity < 100) status = 'Low-Stock';

    const result = await medicinesApi.update(id, { quantity, status });
    
    if (result.success) {
      setMedicines(medicines.map((m) =>
        m.id === id ? { ...m, quantity, status } : m
      ));
      toast.success('Stock updated');
    } else {
      toast.error('Failed to update stock');
    }
  };

  // Staff handlers
  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.role || !newStaff.username || !newStaff.password) {
      toast.error('Please fill all required fields');
      return;
    }

    if (newStaff.role === 'doctor' && !newStaff.doctor_id) {
      toast.error('Please select a doctor to link');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('staff_users')
        .insert({
          name: newStaff.name,
          role: newStaff.role as 'admin' | 'doctor' | 'lab_staff' | 'billing_staff' | 'appointment_staff',
          username: newStaff.username,
          password_hash: newStaff.password,
          doctor_id: newStaff.role === 'doctor' ? newStaff.doctor_id : null,
        })
        .select()
        .single();

      if (error) throw error;

      setStaffUsers([data, ...staffUsers]);
      setNewStaff({ name: '', role: '', username: '', password: '', doctor_id: '' });
      setIsAddStaffOpen(false);
      toast.success('Staff account created');
    } catch (error: any) {
      console.error('Error creating staff:', error);
      if (error.code === '23505') {
        toast.error('Username already exists');
      } else {
        toast.error('Failed to create staff account');
      }
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      const { error } = await supabase
        .from('staff_users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStaffUsers(staffUsers.filter(s => s.id !== id));
      toast.success('Staff account deleted');
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to delete staff account');
    }
  };

  const toggleStaffStatus = async (id: string) => {
    const staff = staffUsers.find(s => s.id === id);
    if (!staff) return;

    try {
      const { error } = await supabase
        .from('staff_users')
        .update({ is_active: !staff.is_active })
        .eq('id', id);

      if (error) throw error;

      setStaffUsers(staffUsers.map(s =>
        s.id === id ? { ...s, is_active: !s.is_active } : s
      ));
    } catch (error) {
      console.error('Error updating staff status:', error);
      toast.error('Failed to update status');
    }
  };

  // Mark notifications as read
  const markNotificationsAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;

      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Password change handler
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    setIsChangingPassword(true);
    
    try {
      // Verify current password and update
      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (fetchError || !adminUser) {
        toast.error('Admin user not found');
        setIsChangingPassword(false);
        return;
      }

      if (adminUser.password_hash !== passwordData.currentPassword) {
        toast.error('Current password is incorrect');
        setIsChangingPassword(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ password_hash: passwordData.newPassword })
        .eq('username', username);

      if (updateError) throw updateError;

      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
    
    setIsChangingPassword(false);
  };

  if (isLoading) {
    return (
      <MainLayout title="Admin Panel">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Admin Panel">
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-7">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="doctors" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">Doctors</span>
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Patients</span>
          </TabsTrigger>
          <TabsTrigger value="pharmacy" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            <span className="hidden sm:inline">Pharmacy</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Staff</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Hospital Branding */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Hospital Branding
                </CardTitle>
                <CardDescription>
                  Upload your hospital logo and update branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
                  {settings?.logo_url ? (
                    <img 
                      src={settings.logo_url} 
                      alt="Hospital Logo" 
                      className="w-32 h-32 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                      <Building className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Hospital Information */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Hospital Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Current Name</Label>
                  <p className="text-lg font-medium">{settings?.hospital_name || 'Loading...'}</p>
                </div>
                <div className="grid gap-2">
                  <Label>New Hospital Name</Label>
                  <Input 
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="Enter new hospital name"
                  />
                </div>
                <Button 
                  onClick={handleUpdateHospitalName} 
                  disabled={isUpdatingName}
                  className="w-full"
                >
                  {isUpdatingName ? 'Updating...' : 'Update Name'}
                </Button>
              </CardContent>
            </Card>

            {/* Reset Data */}
            <Card className="animate-fade-in border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Reset all doctors, patients, and medicine data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset All Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-destructive">Reset All Data?</DialogTitle>
                      <DialogDescription>
                        This will permanently delete all doctors, patients, and medicine data. 
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid gap-2">
                        <Label>Type <span className="font-bold">RESET</span> to confirm</Label>
                        <Input
                          value={resetConfirmText}
                          onChange={(e) => setResetConfirmText(e.target.value)}
                          placeholder="RESET"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleResetData}
                        disabled={resetConfirmText !== 'RESET'}
                      >
                        Reset Everything
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-6">
          <div className="flex justify-between">
            <div>
              <h2 className="text-lg font-semibold">Manage Doctors ({doctors.length})</h2>
              <p className="text-sm text-muted-foreground">
                Add, edit, or remove doctors from the system
              </p>
            </div>
            <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Doctor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Doctor</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={newDoctor.name}
                      onChange={(e) =>
                        setNewDoctor({ ...newDoctor, name: e.target.value })
                      }
                      placeholder="Dr. Arun Joshi"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Specialization *</Label>
                    <Select
                      value={newDoctor.specialization}
                      onValueChange={(value) =>
                        setNewDoctor({ ...newDoctor, specialization: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Consultation Fee (₹) *</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={newDoctor.consultationFee}
                        onChange={(e) =>
                          setNewDoctor({ ...newDoctor, consultationFee: e.target.value })
                        }
                        placeholder="500"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone (+91)</Label>
                    <Input
                      value={newDoctor.phone}
                      onChange={(e) =>
                        setNewDoctor({ ...newDoctor, phone: e.target.value })
                      }
                      placeholder="9800000001"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newDoctor.email}
                      onChange={(e) =>
                        setNewDoctor({ ...newDoctor, email: e.target.value })
                      }
                      placeholder="dr.arun@hospital.com"
                    />
                  </div>
                  <Button onClick={handleAddDoctor} className="mt-2">
                    Add Doctor
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="animate-fade-in">
            <CardContent className="pt-6">
              {doctors.length === 0 ? (
                <div className="text-center py-12">
                  <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No doctors added yet</p>
                  <Button className="mt-4" onClick={() => setIsAddDoctorOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Doctor
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell className="font-medium">{doctor.name}</TableCell>
                        <TableCell>{doctor.specialization}</TableCell>
                        <TableCell>{doctor.phone}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={doctor.status === 'Available'}
                              onCheckedChange={() => toggleDoctorStatus(doctor.id)}
                            />
                            <Badge
                              variant={
                                doctor.status === 'Available' ? 'default' : 'secondary'
                              }
                            >
                              {doctor.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDoctor(doctor.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="flex justify-between">
            <div>
              <h2 className="text-lg font-semibold">Manage Patients ({patients.length})</h2>
              <p className="text-sm text-muted-foreground">
                View and manage all patient records
              </p>
            </div>
          </div>

          <Card className="animate-fade-in">
            <CardContent className="pt-6">
              {patients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No patients registered yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.bloodGroup}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={patient.status === 'Active'}
                              onCheckedChange={() => togglePatientStatus(patient.id)}
                            />
                            <Badge
                              variant={patient.status === 'Active' ? 'default' : 'secondary'}
                            >
                              {patient.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePatient(patient.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pharmacy Tab */}
        <TabsContent value="pharmacy" className="space-y-6">
          <div className="flex justify-between">
            <div>
              <h2 className="text-lg font-semibold">Manage Pharmacy ({medicines.length})</h2>
              <p className="text-sm text-muted-foreground">
                View and manage medicine inventory
              </p>
            </div>
          </div>

          <Card className="animate-fade-in">
            <CardContent className="pt-6">
              {medicines.length === 0 ? (
                <div className="text-center py-12">
                  <Pill className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No medicines in inventory</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines.map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell className="font-medium">{medicine.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{medicine.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={medicine.quantity}
                            onChange={(e) =>
                              updateMedicineStock(medicine.id, parseInt(e.target.value) || 0)
                            }
                            className="w-20 text-right"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(medicine.unitPrice)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              medicine.status === 'In-Stock'
                                ? 'default'
                                : medicine.status === 'Low-Stock'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {medicine.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMedicine(medicine.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6">
          <div className="flex justify-between">
            <div>
              <h2 className="text-lg font-semibold">Staff Management ({staffUsers.length})</h2>
              <p className="text-sm text-muted-foreground">
                Create and manage staff accounts for doctors, lab, billing, and appointments
              </p>
            </div>
            <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Staff Account</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      placeholder="Staff name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Role *</Label>
                    <Select
                      value={newStaff.role}
                      onValueChange={(value) => setNewStaff({ ...newStaff, role: value, doctor_id: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <role.icon className="h-4 w-4" />
                              {role.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {newStaff.role === 'doctor' && (
                    <div className="grid gap-2">
                      <Label>Link to Doctor *</Label>
                      <Select
                        value={newStaff.doctor_id}
                        onValueChange={(value) => setNewStaff({ ...newStaff, doctor_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.name} - {doctor.specialization}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label>Username *</Label>
                    <Input
                      value={newStaff.username}
                      onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                      placeholder="Login username"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      placeholder="Login password"
                    />
                  </div>
                  <Button onClick={handleAddStaff} className="mt-2">
                    Create Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="animate-fade-in">
            <CardContent className="pt-6">
              {staffUsers.length === 0 ? (
                <div className="text-center py-12">
                  <UserCog className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No staff accounts created yet</p>
                  <Button className="mt-4" onClick={() => setIsAddStaffOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Staff
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffUsers.map((staff) => {
                      const roleConfig = staffRoles.find(r => r.value === staff.role);
                      const RoleIcon = roleConfig?.icon || UserCog;
                      return (
                        <TableRow key={staff.id}>
                          <TableCell className="font-medium">{staff.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <RoleIcon className="h-4 w-4 text-muted-foreground" />
                              <Badge variant="outline">{roleConfig?.label || staff.role}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>{staff.username}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={staff.is_active}
                                onCheckedChange={() => toggleStaffStatus(staff.id)}
                              />
                              <Badge variant={staff.is_active ? 'default' : 'secondary'}>
                                {staff.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(staff.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteStaff(staff.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Real-time updates from all departments
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markNotificationsAsRead}>
                Mark All as Read
              </Button>
            )}
          </div>

          <Card className="animate-fade-in">
            <CardContent className="pt-6">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.read ? 'bg-background' : 'bg-primary/5 border-primary/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              notification.type === 'appointment' ? 'bg-blue-100 text-blue-600' :
                              notification.type === 'payment' ? 'bg-green-100 text-green-600' :
                              notification.type === 'lab_test' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {notification.type === 'appointment' ? <CalendarCheck className="h-4 w-4" /> :
                               notification.type === 'payment' ? <CreditCard className="h-4 w-4" /> :
                               notification.type === 'lab_test' ? <FlaskConical className="h-4 w-4" /> :
                               <Bell className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'font-medium'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Admin Account
                </CardTitle>
                <CardDescription>
                  Logged in as: <span className="font-medium">{username}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    You are the primary admin. Only one admin account (akash/akash) can access this panel.
                    Staff accounts can be created from the Staff tab.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your admin password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={isChangingPassword}
                  className="w-full"
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
