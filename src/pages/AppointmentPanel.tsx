import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  CalendarCheck, 
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  FileText,
  User,
  Plus,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useHospitalSettings } from '@/hooks/useHospitalSettings';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  doctor_id: string | null;
  date: string;
  time: string;
  status: string;
  type: string;
  notes: string | null;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  status: string;
}

export default function AppointmentPanel() {
  const navigate = useNavigate();
  const { settings } = useHospitalSettings();
  const [staffUser, setStaffUser] = useState<{ name: string } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    patient_name: '',
    doctor_id: '',
    date: '',
    time: '',
    type: 'Consultation',
    notes: ''
  });
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('staff_user');
    const storedRole = localStorage.getItem('staff_role');
    
    if (!storedUser || storedRole !== 'appointment_staff') {
      navigate('/login');
      return;
    }

    setStaffUser(JSON.parse(storedUser));
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [appointmentsRes, doctorsRes] = await Promise.all([
        supabase.from('appointments').select('*').order('date', { ascending: true }),
        supabase.from('doctors').select('*').eq('status', 'Available')
      ]);

      if (appointmentsRes.error) throw appointmentsRes.error;
      if (doctorsRes.error) throw doctorsRes.error;

      setAppointments(appointmentsRes.data || []);
      setDoctors(doctorsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAppointment = async () => {
    if (!newAppointment.patient_name || !newAppointment.doctor_id || !newAppointment.date || !newAppointment.time) {
      toast.error('Please fill all required fields');
      return;
    }

    const doctor = doctors.find(d => d.id === newAppointment.doctor_id);
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_name: newAppointment.patient_name,
          doctor_id: newAppointment.doctor_id,
          doctor_name: doctor?.name || '',
          date: newAppointment.date,
          time: newAppointment.time,
          type: newAppointment.type,
          notes: newAppointment.notes || null,
          status: 'Scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      setAppointments(prev => [...prev, data]);

      // Create notification
      await supabase.from('notifications').insert({
        type: 'appointment',
        message: `New appointment scheduled for ${newAppointment.patient_name} with Dr. ${doctor?.name}`,
        related_id: data.id
      });

      toast.success('Appointment scheduled successfully');
      setIsAddDialogOpen(false);
      setNewAppointment({
        patient_name: '',
        doctor_id: '',
        date: '',
        time: '',
        type: 'Consultation',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to schedule appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'Cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(a => a.id === appointmentId ? { ...a, status: 'Cancelled' } : a)
      );

      toast.success('Appointment cancelled');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !rescheduleData.date || !rescheduleData.time) {
      toast.error('Please select new date and time');
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          date: rescheduleData.date,
          time: rescheduleData.time 
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(a => a.id === selectedAppointment.id 
          ? { ...a, date: rescheduleData.date, time: rescheduleData.time } 
          : a
        )
      );

      toast.success('Appointment rescheduled');
      setIsRescheduleDialogOpen(false);
      setSelectedAppointment(null);
      setRescheduleData({ date: '', time: '' });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error('Failed to reschedule appointment');
    }
  };

  const openRescheduleDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleData({ date: appointment.date, time: appointment.time });
    setIsRescheduleDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('staff_user');
    localStorage.removeItem('staff_role');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter(a => a.date === today && a.status === 'Scheduled').length;
  const scheduledAppointments = appointments.filter(a => a.status === 'Scheduled').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 w-8 rounded object-contain" />
            ) : (
              <CalendarCheck className="h-6 w-6 text-primary" />
            )}
            <div>
              <span className="font-bold">{settings?.hospital_name || 'Hospital'}</span>
              <span className="text-muted-foreground ml-2">- Appointment Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {staffUser?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments}</div>
              <p className="text-xs text-muted-foreground">scheduled for today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">All Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledAppointments}</div>
              <p className="text-xs text-muted-foreground">upcoming appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Doctors</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctors.length}</div>
              <p className="text-xs text-muted-foreground">doctors available</p>
            </CardContent>
          </Card>
        </div>

        {/* Appointments Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Appointments
              </CardTitle>
              <CardDescription>
                Schedule and manage appointments
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No appointments found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.date}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {appointment.patient_name}
                        </div>
                      </TableCell>
                      <TableCell>{appointment.doctor_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{appointment.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appointment.status === 'Completed' ? 'default' :
                            appointment.status === 'Cancelled' ? 'destructive' : 'secondary'
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {appointment.status === 'Scheduled' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openRescheduleDialog(appointment)}
                            >
                              Reschedule
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Appointment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Patient Name *</Label>
              <Input
                value={newAppointment.patient_name}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, patient_name: e.target.value }))}
                placeholder="Enter patient name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Doctor *</Label>
              <Select
                value={newAppointment.doctor_id}
                onValueChange={(value) => setNewAppointment(prev => ({ ...prev, doctor_id: value }))}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={newAppointment.type}
                onValueChange={(value) => setNewAppointment(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAppointment}>
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Patient</Label>
              <Input value={selectedAppointment?.patient_name || ''} disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>New Date *</Label>
                <Input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>New Time *</Label>
                <Input
                  type="time"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule}>
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {settings?.hospital_name || 'Hospital Management System'}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
