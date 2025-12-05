import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { mockPatients, mockDoctors } from '@/data/mockData';
import { Consultation } from '@/types/hospital';
import { Plus, Search, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const mockConsultations: Consultation[] = [
  {
    id: '1',
    appointmentId: '1',
    patientId: '1',
    doctorId: '1',
    diagnosis: 'Mild hypertension',
    prescription: 'Amlodipine 5mg once daily',
    notes: 'Patient advised to reduce salt intake and exercise regularly',
    date: '2024-11-15',
    followUpDate: '2024-12-15',
  },
  {
    id: '2',
    appointmentId: '2',
    patientId: '2',
    doctorId: '2',
    diagnosis: 'Tension headache',
    prescription: 'Paracetamol 500mg as needed',
    notes: 'Stress management recommended',
    date: '2024-11-16',
  },
];

export default function Consultations() {
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newConsultation, setNewConsultation] = useState({
    patientId: '',
    doctorId: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    followUpDate: '',
  });

  const getPatientName = (patientId: string) => {
    return mockPatients.find((p) => p.id === patientId)?.name || 'Unknown';
  };

  const getDoctorName = (doctorId: string) => {
    return mockDoctors.find((d) => d.id === doctorId)?.name || 'Unknown';
  };

  const handleAddConsultation = () => {
    if (!newConsultation.patientId || !newConsultation.doctorId || !newConsultation.diagnosis) {
      toast.error('Please fill in required fields');
      return;
    }

    const consultation: Consultation = {
      id: (consultations.length + 1).toString(),
      appointmentId: '',
      patientId: newConsultation.patientId,
      doctorId: newConsultation.doctorId,
      diagnosis: newConsultation.diagnosis,
      prescription: newConsultation.prescription,
      notes: newConsultation.notes,
      date: new Date().toISOString().split('T')[0],
      followUpDate: newConsultation.followUpDate || undefined,
    };

    setConsultations([...consultations, consultation]);
    setNewConsultation({
      patientId: '',
      doctorId: '',
      diagnosis: '',
      prescription: '',
      notes: '',
      followUpDate: '',
    });
    setIsAddOpen(false);
    toast.success('Consultation record created');
  };

  return (
    <MainLayout title="Consultations">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search consultations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Consultation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Consultation Record</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Patient *</Label>
                    <Select
                      value={newConsultation.patientId}
                      onValueChange={(value) =>
                        setNewConsultation({ ...newConsultation, patientId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Doctor *</Label>
                    <Select
                      value={newConsultation.doctorId}
                      onValueChange={(value) =>
                        setNewConsultation({ ...newConsultation, doctorId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDoctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Diagnosis *</Label>
                  <Input
                    value={newConsultation.diagnosis}
                    onChange={(e) =>
                      setNewConsultation({ ...newConsultation, diagnosis: e.target.value })
                    }
                    placeholder="Enter diagnosis"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Prescription</Label>
                  <Textarea
                    value={newConsultation.prescription}
                    onChange={(e) =>
                      setNewConsultation({ ...newConsultation, prescription: e.target.value })
                    }
                    placeholder="Enter prescription details"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newConsultation.notes}
                    onChange={(e) =>
                      setNewConsultation({ ...newConsultation, notes: e.target.value })
                    }
                    placeholder="Additional notes"
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Follow-up Date</Label>
                  <Input
                    type="date"
                    value={newConsultation.followUpDate}
                    onChange={(e) =>
                      setNewConsultation({ ...newConsultation, followUpDate: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleAddConsultation} className="mt-2">
                  Create Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Consultations Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {consultations.map((consultation) => (
            <Card key={consultation.id} className="animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {getPatientName(consultation.patientId)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {getDoctorName(consultation.doctorId)}
                    </p>
                  </div>
                  <Badge variant="outline">{consultation.date}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Diagnosis</p>
                  <p className="text-sm">{consultation.diagnosis}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Prescription</p>
                  <p className="text-sm">{consultation.prescription || 'N/A'}</p>
                </div>
                {consultation.notes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Notes</p>
                    <p className="text-sm text-muted-foreground">{consultation.notes}</p>
                  </div>
                )}
                {consultation.followUpDate && (
                  <div className="flex items-center gap-2 rounded-md bg-muted p-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-xs">Follow-up: {consultation.followUpDate}</span>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  View Full Record
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
