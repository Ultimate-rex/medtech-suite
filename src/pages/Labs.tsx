import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { mockLabTests, mockPatients, mockDoctors } from '@/data/mockData';
import { LabTest } from '@/types/hospital';
import { Plus, Search, FileText, FlaskConical, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const testTypes = [
  'Hematology',
  'Biochemistry',
  'Microbiology',
  'Radiology',
  'Pathology',
];

export default function Labs() {
  const [labTests, setLabTests] = useState<LabTest[]>(mockLabTests);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    patientId: '',
    testName: '',
    testType: '',
    requestedBy: '',
  });

  const filteredTests = labTests.filter(
    (test) =>
      test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = labTests.filter((t) => t.status === 'Pending').length;
  const inProgressCount = labTests.filter((t) => t.status === 'In-Progress').length;
  const completedCount = labTests.filter((t) => t.status === 'Completed').length;

  const handleAddTest = () => {
    if (!newTest.patientId || !newTest.testName || !newTest.testType) {
      toast.error('Please fill in required fields');
      return;
    }

    const patient = mockPatients.find((p) => p.id === newTest.patientId);
    if (!patient) return;

    const test: LabTest = {
      id: (labTests.length + 1).toString(),
      patientId: newTest.patientId,
      patientName: patient.name,
      testName: newTest.testName,
      testType: newTest.testType,
      requestedBy: newTest.requestedBy || 'Dr. Admin',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    };

    setLabTests([...labTests, test]);
    setNewTest({ patientId: '', testName: '', testType: '', requestedBy: '' });
    setIsAddOpen(false);
    toast.success('Lab test requested');
  };

  const updateTestStatus = (id: string, status: LabTest['status']) => {
    setLabTests(
      labTests.map((test) =>
        test.id === id
          ? {
              ...test,
              status,
              reportDate: status === 'Completed' ? new Date().toISOString().split('T')[0] : undefined,
              result: status === 'Completed' ? 'Normal' : undefined,
            }
          : test
      )
    );
    toast.success(`Test status updated to ${status}`);
  };

  const getStatusVariant = (status: LabTest['status']) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In-Progress':
        return 'secondary';
      case 'Pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <MainLayout title="Labs">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="animate-fade-in">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/20">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/20">
                <FlaskConical className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/20">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search lab tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Request Test
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Request Lab Test</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Patient *</Label>
                  <Select
                    value={newTest.patientId}
                    onValueChange={(value) => setNewTest({ ...newTest, patientId: value })}
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
                  <Label>Test Name *</Label>
                  <Input
                    value={newTest.testName}
                    onChange={(e) => setNewTest({ ...newTest, testName: e.target.value })}
                    placeholder="e.g., Complete Blood Count"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Test Type *</Label>
                  <Select
                    value={newTest.testType}
                    onValueChange={(value) => setNewTest({ ...newTest, testType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Requested By</Label>
                  <Select
                    value={newTest.requestedBy}
                    onValueChange={(value) => setNewTest({ ...newTest, requestedBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.name}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddTest} className="mt-2">
                  Request Test
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tests Table */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Lab Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.patientName}</TableCell>
                    <TableCell>{test.testName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{test.testType}</Badge>
                    </TableCell>
                    <TableCell>{test.requestedBy}</TableCell>
                    <TableCell>{test.date}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(test.status)}>{test.status}</Badge>
                    </TableCell>
                    <TableCell>{test.result || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {test.status === 'Pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTestStatus(test.id, 'In-Progress')}
                          >
                            Start
                          </Button>
                        )}
                        {test.status === 'In-Progress' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTestStatus(test.id, 'Completed')}
                          >
                            Complete
                          </Button>
                        )}
                        {test.status === 'Completed' && (
                          <Button variant="ghost" size="icon">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
