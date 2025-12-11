import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar, 
  Clock, 
  User, 
  IndianRupee,
  CheckCircle,
  XCircle,
  LogOut,
  Stethoscope,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/currency';
import { useHospitalSettings } from '@/hooks/useHospitalSettings';
import { format } from 'date-fns';

interface StaffUser {
  id: string;
  name: string;
  role: string;
  doctor_id: string | null;
}

interface Appointment {
  id: string;
  patient_name: string;
  date: string;
  time: string;
  status: string;
  type: string;
  notes: string | null;
}

interface Doctor {
  id: string;
  name: string;
  consultation_fee: number;
}

export default function DoctorPanel() {
  const navigate = useNavigate();
  const { settings } = useHospitalSettings();
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('staff_user');
    const storedRole = localStorage.getItem('staff_role');
    
    if (!storedUser || storedRole !== 'doctor') {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser) as StaffUser;
    setStaffUser(user);
    fetchDoctorData(user.doctor_id);
  }, [navigate]);

  const fetchDoctorData = async (doctorId: string | null) => {
    if (!doctorId) {
      toast.error('No doctor profile linked to this account');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch doctor details
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single();

      if (doctorError) throw doctorError;
      setDoctor({
        id: doctorData.id,
        name: doctorData.name,
        consultation_fee: doctorData.consultation_fee || 500
      });

      // Fetch today's appointments
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('date', today)
        .order('time', { ascending: true });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);

      // Calculate today's earnings (completed appointments)
      const completedCount = (appointmentsData || []).filter(a => a.status === 'Completed').length;
      setTodayEarnings(completedCount * (doctorData.consultation_fee || 500));

    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentAction = async (appointmentId: string, status: 'Completed' | 'Cancelled') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(a => a.id === appointmentId ? { ...a, status } : a)
      );

      // Recalculate earnings
      if (status === 'Completed' && doctor) {
        setTodayEarnings(prev => prev + doctor.consultation_fee);
      }

      // Create notification
      await supabase.from('notifications').insert({
        type: 'appointment',
        message: `Appointment ${status.toLowerCase()} by Dr. ${doctor?.name}`,
        related_id: appointmentId
      });

      toast.success(`Appointment marked as ${status}`);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
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

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  const pendingAppointments = appointments.filter(a => a.status === 'Scheduled').length;
  const completedAppointments = appointments.filter(a => a.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 w-8 rounded object-contain" />
            ) : (
              <Stethoscope className="h-6 w-6 text-primary" />
            )}
            <div>
              <span className="font-bold">{settings?.hospital_name || 'Hospital'}</span>
              <span className="text-muted-foreground ml-2">- Doctor Panel</span>
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
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{today}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAppointments}</div>
              <p className="text-xs text-muted-foreground">appointments today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAppointments}</div>
              <p className="text-xs text-muted-foreground">patients seen</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(todayEarnings)}</div>
              <p className="text-xs text-muted-foreground">consultation fees</p>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Info */}
        {doctor && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                {doctor.name}
              </CardTitle>
              <CardDescription>
                Consultation Fee: {formatCurrency(doctor.consultation_fee)}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Today's Appointments
            </CardTitle>
            <CardDescription>
              {appointments.length} appointments scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No appointments scheduled for today</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.time}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {appointment.patient_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{appointment.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {appointment.notes || '-'}
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
                              variant="default"
                              onClick={() => handleAppointmentAction(appointment.id, 'Completed')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAppointmentAction(appointment.id, 'Cancelled')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
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

      {/* Footer */}
      <footer className="border-t py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {settings?.hospital_name || 'Hospital Management System'}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
