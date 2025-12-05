import { useState } from 'react';
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
import { mockDoctors } from '@/data/mockData';
import { Doctor } from '@/types/hospital';
import {
  Plus,
  Users,
  UserCog,
  Settings,
  Shield,
  Building,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    phone: '',
    email: '',
  });

  const handleAddDoctor = () => {
    if (!newDoctor.name || !newDoctor.specialization) {
      toast.error('Please fill in required fields');
      return;
    }

    const doctor: Doctor = {
      id: (doctors.length + 1).toString(),
      name: newDoctor.name,
      specialization: newDoctor.specialization,
      phone: newDoctor.phone,
      email: newDoctor.email,
      availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      status: 'Available',
    };

    setDoctors([...doctors, doctor]);
    setNewDoctor({ name: '', specialization: '', phone: '', email: '' });
    setIsAddDoctorOpen(false);
    toast.success('Doctor added successfully');
  };

  const handleDeleteDoctor = (id: string) => {
    setDoctors(doctors.filter((d) => d.id !== id));
    toast.success('Doctor removed');
  };

  const toggleDoctorStatus = (id: string) => {
    setDoctors(
      doctors.map((d) =>
        d.id === id
          ? { ...d, status: d.status === 'Available' ? 'Off-duty' : 'Available' }
          : d
      )
    );
  };

  return (
    <MainLayout title="Admin Panel">
      <Tabs defaultValue="doctors" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="doctors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Doctors</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Staff</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-6">
          <div className="flex justify-between">
            <div>
              <h2 className="text-lg font-semibold">Manage Doctors</h2>
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
                      placeholder="Dr. John Smith"
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
                    <Label>Phone</Label>
                    <Input
                      value={newDoctor.phone}
                      onChange={(e) =>
                        setNewDoctor({ ...newDoctor, phone: e.target.value })
                      }
                      placeholder="+1-234-567-8001"
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
                      placeholder="dr.smith@hospital.com"
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>
                Manage hospital staff members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserCog className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Staff Module</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Manage nurses, technicians, and administrative staff
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Hospital Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Hospital Name</Label>
                  <Input defaultValue="Hospital XYZ" />
                </div>
                <div className="grid gap-2">
                  <Label>Address</Label>
                  <Input defaultValue="123 Medical Center Drive" />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+1-800-HOSPITAL" />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input defaultValue="info@hospitalxyz.com" />
                </div>
                <Button className="w-full">Save Changes</Button>
              </CardContent>
            </Card>

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
                    <p className="font-medium">SMS notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Send SMS reminders for appointments
                    </p>
                  </div>
                  <Switch />
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
