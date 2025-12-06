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
import { mockBills, mockPatients } from '@/data/mockData';
import { Bill, BillItem } from '@/types/hospital';
import { Plus, Search, IndianRupee, FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';

export default function Billing() {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBill, setNewBill] = useState({
    patientId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }] as BillItem[],
  });

  const filteredBills = bills.filter(
    (bill) =>
      bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.id.includes(searchTerm)
  );

  const totalPending = bills
    .filter((b) => b.status !== 'Paid')
    .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

  const totalCollected = bills.reduce((sum, b) => sum + b.paidAmount, 0);

  const addBillItem = () => {
    setNewBill({
      ...newBill,
      items: [...newBill.items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }],
    });
  };

  const updateBillItem = (index: number, field: keyof BillItem, value: string | number) => {
    const items = [...newBill.items];
    items[index] = { ...items[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      items[index].amount = items[index].quantity * items[index].unitPrice;
    }
    setNewBill({ ...newBill, items });
  };

  const handleCreateBill = () => {
    if (!newBill.patientId || newBill.items.every((i) => !i.description)) {
      toast.error('Please fill in required fields');
      return;
    }

    const patient = mockPatients.find((p) => p.id === newBill.patientId);
    if (!patient) return;

    const totalAmount = newBill.items.reduce((sum, item) => sum + item.amount, 0);

    const bill: Bill = {
      id: `INV-${(bills.length + 1).toString().padStart(4, '0')}`,
      patientId: newBill.patientId,
      patientName: patient.name,
      items: newBill.items.filter((i) => i.description),
      totalAmount,
      paidAmount: 0,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    setBills([...bills, bill]);
    setNewBill({
      patientId: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
    });
    setIsAddOpen(false);
    toast.success('Bill created successfully');
  };

  const getStatusVariant = (status: Bill['status']) => {
    switch (status) {
      case 'Paid':
        return 'default';
      case 'Partial':
        return 'secondary';
      case 'Pending':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <MainLayout title="Billing">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="animate-fade-in">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/20">
                <IndianRupee className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCollected)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/20">
                <IndianRupee className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bills</p>
                <p className="text-2xl font-bold">{bills.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Bill</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Patient *</Label>
                  <Select
                    value={newBill.patientId}
                    onValueChange={(value) => setNewBill({ ...newBill, patientId: value })}
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

                <div className="space-y-3">
                  <Label>Bill Items</Label>
                  {newBill.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateBillItem(index, 'description', e.target.value)}
                        className="col-span-2"
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateBillItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                      <Input
                        type="number"
                        placeholder="Price (₹)"
                        value={item.unitPrice}
                        onChange={(e) => updateBillItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addBillItem}>
                    <Plus className="mr-2 h-3 w-3" />
                    Add Item
                  </Button>
                </div>

                <div className="flex justify-between border-t pt-4">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">
                    {formatCurrency(newBill.items.reduce((sum, i) => sum + i.amount, 0))}
                  </span>
                </div>

                <Button onClick={handleCreateBill} className="mt-2">
                  Create Bill
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bills Table */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>All Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.id}</TableCell>
                    <TableCell>{bill.patientName}</TableCell>
                    <TableCell>{bill.date}</TableCell>
                    <TableCell>{bill.dueDate}</TableCell>
                    <TableCell className="text-right">{formatCurrency(bill.totalAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(bill.paidAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(bill.status)}>{bill.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Printer className="h-4 w-4" />
                        </Button>
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
