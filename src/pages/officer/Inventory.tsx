import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Plus, Edit, Trash2, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';

const mockEquipment = [
  {
    id: '1',
    name: '3D Printer',
    category: 'Manufacturing',
    quantity: 5,
    available: 3,
    location: 'Innovation Lab A',
    status: 'available' as const,
    last_maintenance: '2024-11-15',
    next_maintenance: '2025-02-15',
  },
  {
    id: '2',
    name: 'Arduino Starter Kit',
    category: 'Electronics',
    quantity: 20,
    available: 15,
    location: 'Electronics Lab',
    status: 'available' as const,
    last_maintenance: '2024-10-01',
    next_maintenance: '2025-01-01',
  },
  {
    id: '3',
    name: 'VR Headset',
    category: 'Virtual Reality',
    quantity: 8,
    available: 0,
    location: 'Innovation Lab B',
    status: 'in_use' as const,
    last_maintenance: '2024-11-01',
    next_maintenance: '2025-02-01',
  },
  {
    id: '4',
    name: 'Laser Cutter',
    category: 'Manufacturing',
    quantity: 2,
    available: 0,
    location: 'Fabrication Lab',
    status: 'maintenance' as const,
    last_maintenance: '2024-12-01',
    next_maintenance: '2024-12-20',
  },
];

export default function Inventory() {
  const [equipment, setEquipment] = useState(mockEquipment);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const handleAddEquipment = () => {
    toast.success('Equipment added successfully!');
    setIsDialogOpen(false);
  };

  const handleDeleteEquipment = (id: string) => {
    setEquipment(equipment.filter((e) => e.id !== id));
    toast.success('Equipment deleted successfully!');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      available: { className: 'bg-green-500/10 text-green-500', label: 'Available' },
      in_use: { className: 'bg-blue-500/10 text-blue-500', label: 'In Use' },
      maintenance: { className: 'bg-yellow-500/10 text-yellow-500', label: 'Maintenance' },
      damaged: { className: 'bg-red-500/10 text-red-500', label: 'Damaged' },
    };
    return variants[status] || variants.available;
  };

  const categories = ['all', ...new Set(equipment.map((e) => e.category))];
  const filteredEquipment = filterCategory === 'all' 
    ? equipment 
    : equipment.filter(e => e.category === filterCategory);

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lab Inventory</h1>
          <p className="text-muted-foreground">Manage lab equipment and resources</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
                <DialogDescription>Add or update lab equipment details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Equipment Name</Label>
                  <Input id="name" placeholder="e.g., 3D Printer" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="vr">Virtual Reality</SelectItem>
                        <SelectItem value="robotics">Robotics</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" type="number" placeholder="10" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g., Innovation Lab A" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="last_maintenance">Last Maintenance</Label>
                    <Input id="last_maintenance" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="next_maintenance">Next Maintenance</Label>
                    <Input id="next_maintenance" type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in_use">In Use</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEquipment}>
                  {editingItem ? 'Update' : 'Add'} Equipment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipment.reduce((sum, e) => sum + e.quantity, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {equipment.reduce((sum, e) => sum + e.available, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {equipment.reduce((sum, e) => sum + (e.quantity - e.available), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {equipment.filter(e => e.status === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredEquipment.map((item) => {
          const statusInfo = getStatusBadge(item.status);
          const needsMaintenance = new Date(item.next_maintenance) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          
          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingItem(item);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteEquipment(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Quantity</p>
                    <p className="font-medium">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Available</p>
                    <p className="font-medium text-green-500">{item.available}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Next maintenance: {new Date(item.next_maintenance).toLocaleDateString()}</span>
                  {needsMaintenance && (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      </div>
    </Layout>
  );
}
