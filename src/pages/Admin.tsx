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
import { Doctor, Patient, Medicine } from '@/types/hospital';
import { doctorsApi, patientsApi, medicinesApi } from '@/lib/api';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';
import { useHospitalSettings } from '@/hooks/useHospitalSettings';

const specializations = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Psychiatry',
  'General Medicine',
];

export default function Admin() {
  const { settings, updateSettings, uploadLogo, isLoading: settingsLoading } = useHospitalSettings();
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
  });

  // Patients state
  const [patients, setPatients] = useState<Patient[]>([]);

  // Medicines state
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
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
      // Delete all data from database
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
    };

    const result = await doctorsApi.create(doctorData);
    
    if (result.success && result.data) {
      setDoctors([result.data, ...doctors]);
      setNewDoctor({ name: '', specialization: '', phone: '', email: '' });
      setIsAddDoctorOpen(false);
      toast.success('Doctor added successfully');
    } else {
      toast.error(result.error || 'Failed to add doctor');
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
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
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
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
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
                {/* Logo Preview */}
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

            {/* System Settings */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-confirm appointments</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically confirm new appointments
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Send email reminders to patients
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low stock alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Alert when medicine stock is low
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
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

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage access control and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-factor authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all admin accounts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session timeout</p>
                  <p className="text-sm text-muted-foreground">
                    Auto-logout after 30 minutes of inactivity
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audit logging</p>
                  <p className="text-sm text-muted-foreground">
                    Log all user actions for compliance
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">IP whitelisting</p>
                  <p className="text-sm text-muted-foreground">
                    Restrict access to specific IP addresses
                  </p>
                </div>
                <Switch />
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Access Logs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
