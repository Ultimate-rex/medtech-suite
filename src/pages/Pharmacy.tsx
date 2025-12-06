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
import { mockMedicines } from '@/data/mockData';
import { Medicine } from '@/types/hospital';
import { Plus, Search, Package, AlertTriangle, Pill, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';

const categories = [
  'Analgesic',
  'Antibiotic',
  'Antacid',
  'Antidiabetic',
  'Antihistamine',
  'Antihypertensive',
  'Vitamin',
];

export default function Pharmacy() {
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    category: '',
    quantity: '',
    unitPrice: '',
    expiryDate: '',
    manufacturer: '',
  });

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inStockCount = medicines.filter((m) => m.status === 'In-Stock').length;
  const lowStockCount = medicines.filter((m) => m.status === 'Low-Stock').length;
  const outOfStockCount = medicines.filter((m) => m.status === 'Out-of-Stock').length;

  const handleAddMedicine = () => {
    if (!newMedicine.name || !newMedicine.category || !newMedicine.quantity) {
      toast.error('Please fill in required fields');
      return;
    }

    const quantity = parseInt(newMedicine.quantity);
    let status: Medicine['status'] = 'In-Stock';
    if (quantity === 0) status = 'Out-of-Stock';
    else if (quantity < 100) status = 'Low-Stock';

    const medicine: Medicine = {
      id: (medicines.length + 1).toString(),
      name: newMedicine.name,
      category: newMedicine.category,
      quantity,
      unitPrice: parseFloat(newMedicine.unitPrice) || 0,
      expiryDate: newMedicine.expiryDate,
      manufacturer: newMedicine.manufacturer,
      status,
    };

    setMedicines([...medicines, medicine]);
    setNewMedicine({
      name: '',
      category: '',
      quantity: '',
      unitPrice: '',
      expiryDate: '',
      manufacturer: '',
    });
    setIsAddOpen(false);
    toast.success('Medicine added to inventory');
  };

  const getStatusVariant = (status: Medicine['status']) => {
    switch (status) {
      case 'In-Stock':
        return 'default';
      case 'Low-Stock':
        return 'secondary';
      case 'Out-of-Stock':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <MainLayout title="Pharmacy">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="animate-fade-in">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/20">
                <Package className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold">{inStockCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/20">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/20">
                <Pill className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Medicine to Inventory</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Medicine Name *</Label>
                  <Input
                    value={newMedicine.name}
                    onChange={(e) =>
                      setNewMedicine({ ...newMedicine, name: e.target.value })
                    }
                    placeholder="e.g., Paracetamol 500mg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Category *</Label>
                    <Select
                      value={newMedicine.category}
                      onValueChange={(value) =>
                        setNewMedicine({ ...newMedicine, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={newMedicine.quantity}
                      onChange={(e) =>
                        setNewMedicine({ ...newMedicine, quantity: e.target.value })
                      }
                      placeholder="100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Unit Price (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newMedicine.unitPrice}
                      onChange={(e) =>
                        setNewMedicine({ ...newMedicine, unitPrice: e.target.value })
                      }
                      placeholder="10.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={newMedicine.expiryDate}
                      onChange={(e) =>
                        setNewMedicine({ ...newMedicine, expiryDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Manufacturer</Label>
                  <Input
                    value={newMedicine.manufacturer}
                    onChange={(e) =>
                      setNewMedicine({ ...newMedicine, manufacturer: e.target.value })
                    }
                    placeholder="Cipla, Sun Pharma, etc."
                  />
                </div>
                <Button onClick={handleAddMedicine} className="mt-2">
                  Add to Inventory
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Medicines Table */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Medicine Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium">{medicine.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{medicine.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{medicine.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(medicine.unitPrice)}</TableCell>
                    <TableCell>{medicine.expiryDate}</TableCell>
                    <TableCell>{medicine.manufacturer}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(medicine.status)}>
                        {medicine.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
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
