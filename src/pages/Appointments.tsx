import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { mockAppointments, mockDoctors, mockPatients } from '@/data/mockData';
import { Appointment } from '@/types/hospital';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
];

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [view, setView] = useState<'day' | 'week'>('week');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '09:00',
    type: 'Consultation' as Appointment['type'],
  });

  // Get the week dates
  const getWeekDates = () => {
    const dates = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Start from Monday
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getAppointmentForSlot = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.find(
      (apt) => apt.date === dateStr && apt.time === time
    );
  };

  const getAppointmentColor = (doctorId: string) => {
    const colors = [
      'bg-appointment-green text-success-foreground',
      'bg-appointment-purple text-primary-foreground',
      'bg-appointment-blue text-primary-foreground',
      'bg-appointment-orange text-warning-foreground',
    ];
    const index = parseInt(doctorId) % colors.length;
    return colors[index];
  };

  const handleAddAppointment = () => {
    if (!newAppointment.patientId || !newAppointment.doctorId || !newAppointment.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const patient = mockPatients.find((p) => p.id === newAppointment.patientId);
    const doctor = mockDoctors.find((d) => d.id === newAppointment.doctorId);

    if (!patient || !doctor) return;

    const appointment: Appointment = {
      id: (appointments.length + 1).toString(),
      patientId: newAppointment.patientId,
      patientName: patient.name,
      doctorId: newAppointment.doctorId,
      doctorName: doctor.name,
      date: newAppointment.date,
      time: newAppointment.time,
      duration: 30,
      status: 'Scheduled',
      type: newAppointment.type,
    };

    setAppointments([...appointments, appointment]);
    setNewAppointment({
      patientId: '',
      doctorId: '',
      date: '',
      time: '09:00',
      type: 'Consultation',
    });
    setIsAddOpen(false);
    toast.success('Appointment booked successfully');
  };

  const formatMonthYear = () => {
    return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  return (
    <MainLayout title="Appointments">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
            >
              Day
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
            >
              Week
            </Button>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Search Patient</Label>
                  <Input
                    placeholder="Search patient..."
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Select Patient *</Label>
                  <Select
                    value={newAppointment.patientId}
                    onValueChange={(value) =>
                      setNewAppointment({ ...newAppointment, patientId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients
                        .filter((p) =>
                          p.name.toLowerCase().includes(searchPatient.toLowerCase())
                        )
                        .map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Select Doctor *</Label>
                  <Select
                    value={newAppointment.doctorId}
                    onValueChange={(value) =>
                      setNewAppointment({ ...newAppointment, doctorId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDoctors.map((doctor) => (
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
                      onChange={(e) =>
                        setNewAppointment({ ...newAppointment, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Time</Label>
                    <Select
                      value={newAppointment.time}
                      onValueChange={(value) =>
                        setNewAppointment({ ...newAppointment, time: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Appointment Type</Label>
                  <Select
                    value={newAppointment.type}
                    onValueChange={(value: Appointment['type']) =>
                      setNewAppointment({ ...newAppointment, type: value })
                    }
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
                <Button onClick={handleAddAppointment} className="mt-2">
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Calendar */}
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg">{formatMonthYear()}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-16 border-b p-2 text-left text-sm font-medium text-muted-foreground"></th>
                    {weekDates.map((date, index) => (
                      <th
                        key={index}
                        className="min-w-[100px] border-b p-2 text-center text-sm font-medium text-muted-foreground"
                      >
                        <div>{weekDays[index]}</div>
                        <div className="text-xs">{date.getDate()}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time}>
                      <td className="border-b border-r p-2 text-sm text-muted-foreground">
                        {time}
                      </td>
                      {weekDates.map((date, index) => {
                        const apt = getAppointmentForSlot(date, time);
                        return (
                          <td
                            key={index}
                            className="border-b border-r p-1 align-top"
                          >
                            {apt && (
                              <div
                                className={cn(
                                  'rounded p-1.5 text-xs cursor-pointer transition-opacity hover:opacity-80',
                                  getAppointmentColor(apt.doctorId)
                                )}
                              >
                                <div className="font-medium">{apt.doctorName.split(' ')[0]}</div>
                                <div className="truncate">{apt.patientName.split(' ')[0]}</div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.slice(0, 6).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn('h-3 w-3 rounded-full', getAppointmentColor(apt.doctorId))} />
                    <div>
                      <p className="font-medium">{apt.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.doctorName} • {apt.date} at {apt.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{apt.type}</Badge>
                    <Badge
                      variant={
                        apt.status === 'Scheduled'
                          ? 'default'
                          : apt.status === 'Completed'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
