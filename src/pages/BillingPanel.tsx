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
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  IndianRupee,
  CheckCircle,
  LogOut,
  FileText,
  User,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/currency';
import { useHospitalSettings } from '@/hooks/useHospitalSettings';

interface Bill {
  id: string;
  patient_name: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  date: string;
  due_date: string | null;
}

export default function BillingPanel() {
  const navigate = useNavigate();
  const { settings } = useHospitalSettings();
  const [staffUser, setStaffUser] = useState<{ name: string } | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('staff_user');
    const storedRole = localStorage.getItem('staff_role');
    
    if (!storedUser || storedRole !== 'billing_staff') {
      navigate('/login');
      return;
    }

    setStaffUser(JSON.parse(storedUser));
    fetchBills();
  }, [navigate]);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedBill || !paymentAmount) {
      toast.error('Please enter payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const newPaidAmount = selectedBill.paid_amount + amount;
    const remaining = selectedBill.total_amount - newPaidAmount;
    
    let newStatus = 'Partial';
    if (remaining <= 0) {
      newStatus = 'Paid';
    }

    try {
      const { error } = await supabase
        .from('bills')
        .update({ 
          paid_amount: newPaidAmount,
          status: newStatus
        })
        .eq('id', selectedBill.id);

      if (error) throw error;

      setBills(prev => 
        prev.map(b => b.id === selectedBill.id 
          ? { ...b, paid_amount: newPaidAmount, status: newStatus } 
          : b
        )
      );

      // Create notification
      await supabase.from('notifications').insert({
        type: 'payment',
        message: `Payment of ${formatCurrency(amount)} received for ${selectedBill.patient_name}`,
        related_id: selectedBill.id
      });

      toast.success('Payment recorded successfully');
      setIsPaymentDialogOpen(false);
      setPaymentAmount('');
      setSelectedBill(null);
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  const openPaymentDialog = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentAmount('');
    setIsPaymentDialogOpen(true);
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

  const pendingBills = bills.filter(b => b.status === 'Pending');
  const totalPending = pendingBills.reduce((sum, b) => sum + (b.total_amount - b.paid_amount), 0);
  const todayCollections = bills
    .filter(b => b.date === new Date().toISOString().split('T')[0])
    .reduce((sum, b) => sum + b.paid_amount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 w-8 rounded object-contain" />
            ) : (
              <CreditCard className="h-6 w-6 text-primary" />
            )}
            <div>
              <span className="font-bold">{settings?.hospital_name || 'Hospital'}</span>
              <span className="text-muted-foreground ml-2">- Billing Panel</span>
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
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
              <IndianRupee className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
              <p className="text-xs text-muted-foreground">{pendingBills.length} bills pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Collection</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(todayCollections)}</div>
              <p className="text-xs text-muted-foreground">collected today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bills.length}</div>
              <p className="text-xs text-muted-foreground">all time</p>
            </CardContent>
          </Card>
        </div>

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bills
            </CardTitle>
            <CardDescription>
              Process payments and manage bills
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bills.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bills found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {bill.patient_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(bill.total_amount)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(bill.paid_amount)}
                      </TableCell>
                      <TableCell className="text-right text-amber-600">
                        {formatCurrency(bill.total_amount - bill.paid_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            bill.status === 'Paid' ? 'default' :
                            bill.status === 'Partial' ? 'secondary' : 'outline'
                          }
                        >
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {bill.status !== 'Paid' && (
                          <Button
                            size="sm"
                            onClick={() => openPaymentDialog(bill)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Payment
                          </Button>
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

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Patient</Label>
              <Input value={selectedBill?.patient_name || ''} disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Total Amount</Label>
                <Input value={formatCurrency(selectedBill?.total_amount || 0)} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Remaining</Label>
                <Input 
                  value={formatCurrency((selectedBill?.total_amount || 0) - (selectedBill?.paid_amount || 0))} 
                  disabled 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Payment Amount (₹)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment}>
              Record Payment
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
