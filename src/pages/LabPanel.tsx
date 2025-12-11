import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Label } from '@/components/ui/label';
import { 
  FlaskConical, 
  Clock, 
  CheckCircle,
  LogOut,
  FileText,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useHospitalSettings } from '@/hooks/useHospitalSettings';
import { format } from 'date-fns';

interface LabTest {
  id: string;
  patient_name: string;
  test_name: string;
  test_type: string;
  requested_by: string | null;
  status: string;
  result: string | null;
  date: string;
  report_date: string | null;
}

export default function LabPanel() {
  const navigate = useNavigate();
  const { settings } = useHospitalSettings();
  const [staffUser, setStaffUser] = useState<{ name: string } | null>(null);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [resultInput, setResultInput] = useState('');
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('staff_user');
    const storedRole = localStorage.getItem('staff_role');
    
    if (!storedUser || storedRole !== 'lab_staff') {
      navigate('/login');
      return;
    }

    setStaffUser(JSON.parse(storedUser));
    fetchLabTests();
  }, [navigate]);

  const fetchLabTests = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_tests')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setLabTests(data || []);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      toast.error('Failed to load lab tests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateResult = async () => {
    if (!selectedTest || !resultInput.trim()) {
      toast.error('Please enter a result');
      return;
    }

    try {
      const { error } = await supabase
        .from('lab_tests')
        .update({ 
          result: resultInput,
          status: 'Completed',
          report_date: format(new Date(), 'yyyy-MM-dd')
        })
        .eq('id', selectedTest.id);

      if (error) throw error;

      setLabTests(prev => 
        prev.map(t => t.id === selectedTest.id 
          ? { ...t, result: resultInput, status: 'Completed', report_date: format(new Date(), 'yyyy-MM-dd') } 
          : t
        )
      );

      // Create notification
      await supabase.from('notifications').insert({
        type: 'lab_test',
        message: `Lab test "${selectedTest.test_name}" completed for ${selectedTest.patient_name}`,
        related_id: selectedTest.id
      });

      toast.success('Result updated successfully');
      setIsResultDialogOpen(false);
      setResultInput('');
      setSelectedTest(null);
    } catch (error) {
      console.error('Error updating result:', error);
      toast.error('Failed to update result');
    }
  };

  const handleMarkInProgress = async (testId: string) => {
    try {
      const { error } = await supabase
        .from('lab_tests')
        .update({ status: 'In-Progress' })
        .eq('id', testId);

      if (error) throw error;

      setLabTests(prev => 
        prev.map(t => t.id === testId ? { ...t, status: 'In-Progress' } : t)
      );

      toast.success('Test marked as In-Progress');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const openResultDialog = (test: LabTest) => {
    setSelectedTest(test);
    setResultInput(test.result || '');
    setIsResultDialogOpen(true);
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

  const pendingTests = labTests.filter(t => t.status === 'Pending').length;
  const inProgressTests = labTests.filter(t => t.status === 'In-Progress').length;
  const completedTests = labTests.filter(t => t.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 w-8 rounded object-contain" />
            ) : (
              <FlaskConical className="h-6 w-6 text-primary" />
            )}
            <div>
              <span className="font-bold">{settings?.hospital_name || 'Hospital'}</span>
              <span className="text-muted-foreground ml-2">- Lab Panel</span>
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
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTests}</div>
              <p className="text-xs text-muted-foreground">tests waiting</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <FlaskConical className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTests}</div>
              <p className="text-xs text-muted-foreground">being processed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTests}</div>
              <p className="text-xs text-muted-foreground">tests done</p>
            </CardContent>
          </Card>
        </div>

        {/* Lab Tests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lab Tests
            </CardTitle>
            <CardDescription>
              Manage and update lab test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {labTests.length === 0 ? (
              <div className="text-center py-12">
                <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No lab tests found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell>{test.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {test.patient_name}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{test.test_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{test.test_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            test.status === 'Completed' ? 'default' :
                            test.status === 'In-Progress' ? 'secondary' : 'outline'
                          }
                        >
                          {test.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {test.status === 'Pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkInProgress(test.id)}
                            >
                              Start
                            </Button>
                          )}
                          {test.status !== 'Completed' && (
                            <Button
                              size="sm"
                              onClick={() => openResultDialog(test)}
                            >
                              Add Result
                            </Button>
                          )}
                          {test.status === 'Completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openResultDialog(test)}
                            >
                              View Result
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Result Dialog */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTest?.status === 'Completed' ? 'View Result' : 'Add Result'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Test Name</Label>
              <Input value={selectedTest?.test_name || ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Patient</Label>
              <Input value={selectedTest?.patient_name || ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Result</Label>
              <Textarea
                value={resultInput}
                onChange={(e) => setResultInput(e.target.value)}
                placeholder="Enter test results..."
                rows={4}
                disabled={selectedTest?.status === 'Completed'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResultDialogOpen(false)}>
              Close
            </Button>
            {selectedTest?.status !== 'Completed' && (
              <Button onClick={handleUpdateResult}>
                Save Result
              </Button>
            )}
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
