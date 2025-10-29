import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useInstitutionData } from '@/contexts/InstitutionDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Download, Plus, Package, TrendingUp, AlertTriangle, CheckCircle, MoreVertical, Search } from 'lucide-react';
import { mockInventoryItems, mockStockLocations, mockAuditRecords } from '@/data/mockInventoryData';
import { InventoryItem } from '@/types/inventory';
import { AddItemDialog } from '@/components/inventory/AddItemDialog';
import { toast } from 'sonner';

export default function InstitutionInventoryDetail() {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();
  const { institutions } = useInstitutionData();
  
  const institution = institutions.find(inst => inst.id === institutionId);
  const inventoryItems = institutionId ? (mockInventoryItems[institutionId] || []) : [];
  const stockLocations = institutionId ? (mockStockLocations[institutionId] || []) : [];
  const auditRecords = institutionId ? (mockAuditRecords[institutionId] || []) : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  if (!institution) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Institution Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested institution could not be found.</p>
          <Button onClick={() => navigate('/system-admin/inventory-management')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory Management
          </Button>
        </div>
      </Layout>
    );
  }

  // Check if this is a new institution with no inventory
  const hasNoInventory = !inventoryItems || inventoryItems.length === 0;

  // Calculate stats
  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = inventoryItems.reduce((sum, item) => sum + item.total_value, 0);
  const missingItems = inventoryItems.filter(item => item.condition === 'missing').length;
  const damagedItems = inventoryItems.filter(item => item.condition === 'damaged').length;
  const lowStockItems = inventoryItems.filter(item => item.quantity < 5);
  const lastAudit = auditRecords.length > 0 ? auditRecords[0].audit_date : 'N/A';

  // Filters
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesCondition = conditionFilter === 'all' || item.condition === conditionFilter;
    const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
    
    return matchesSearch && matchesCategory && matchesCondition && matchesLocation;
  });

  const getConditionBadge = (condition: InventoryItem['condition']) => {
    const config = {
      new: { variant: 'default' as const, label: 'New' },
      good: { variant: 'default' as const, label: 'Good' },
      fair: { variant: 'secondary' as const, label: 'Fair' },
      damaged: { variant: 'destructive' as const, label: 'Damaged' },
      missing: { variant: 'destructive' as const, label: 'Missing' },
    };
    const { variant, label } = config[condition];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getStatusBadge = (status: InventoryItem['status']) => {
    const config = {
      active: { variant: 'default' as const, label: 'Active', icon: <CheckCircle className="h-3 w-3" /> },
      under_maintenance: { variant: 'secondary' as const, label: 'Under Maintenance', icon: <AlertTriangle className="h-3 w-3" /> },
      retired: { variant: 'outline' as const, label: 'Retired', icon: null },
      disposed: { variant: 'destructive' as const, label: 'Disposed', icon: null },
    };
    const { variant, label, icon } = config[status];
    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        {label}
      </Badge>
    );
  };

  const getItemsByLocation = (locationId: string) => {
    return inventoryItems.filter(item => {
      const location = stockLocations.find(loc => loc.location_name === item.location);
      return location?.location_id === locationId;
    });
  };

  const handleExportReport = () => {
    toast.loading('Generating report...', { id: 'export' });
    
    // CSV header
    const headers = ['Item Code', 'Name', 'Category', 'Quantity', 'Unit', 'Location', 'Condition', 'Unit Price', 'Total Value', 'Purchase Date', 'Last Audited', 'Status'];
    
    // Convert filtered items to CSV rows
    const rows = filteredItems.map(item => [
      item.item_code,
      item.name,
      item.category,
      item.quantity,
      item.unit,
      item.location,
      item.condition,
      item.unit_price,
      item.total_value,
      item.purchase_date,
      item.last_audited,
      item.status,
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${institution.name.replace(/\s+/g, '_')}_inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Report exported successfully', { id: 'export' });
  };

  const handleAddItemSuccess = () => {
    setIsAddItemOpen(false);
    toast.success('Item added successfully');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{institution.name}</h1>
              <p className="text-muted-foreground">Complete Inventory Details</p>
            </div>
          </div>
          
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={() => setIsAddItemOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">{inventoryItems.length} unique items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(totalValue / 100000).toFixed(1)}L</div>
              <p className="text-xs text-muted-foreground">Asset valuation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Missing Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{missingItems}</div>
              <p className="text-xs text-muted-foreground">Need tracking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Damaged Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{damagedItems}</div>
              <p className="text-xs text-muted-foreground">Need repair</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">Below 5 units</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Audit</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lastAudit !== 'N/A' ? new Date(lastAudit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {lastAudit !== 'N/A' && Math.floor((new Date().getTime() - new Date(lastAudit).getTime()) / (1000 * 60 * 60 * 24))} days ago
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList>
            <TabsTrigger value="inventory">Lab Inventory</TabsTrigger>
            <TabsTrigger value="stock">Stock Management</TabsTrigger>
            <TabsTrigger value="audits">Audit History</TabsTrigger>
          </TabsList>

          {/* Lab Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            {hasNoInventory ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Inventory Items Yet</h3>
                  <p className="text-muted-foreground mb-4 text-center max-w-md">
                    This is a new institution with no inventory items added yet. Click the "Add Item" button above to start tracking inventory.
                  </p>
                  <Button onClick={() => setIsAddItemOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
              <CardHeader>
                <CardTitle>Lab Inventory</CardTitle>
                <CardDescription>Complete list of items in the lab</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search & Filters */}
                <div className="flex gap-4 mb-4 flex-wrap">
                  <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search items by name, code, or serial number..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8" 
                    />
                  </div>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="consumables">Consumables</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={conditionFilter} onValueChange={setConditionFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conditions</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="missing">Missing</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {stockLocations.map(loc => (
                        <SelectItem key={loc.location_id} value={loc.location_name}>
                          {loc.location_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Inventory Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead>Last Audited</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No items found matching your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-sm">{item.item_code}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                {item.manufacturer && (
                                  <div className="text-xs text-muted-foreground">{item.manufacturer}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {item.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={item.quantity < 5 ? "text-orange-500 font-semibold" : ""}>
                                {item.quantity} {item.unit}
                              </span>
                            </TableCell>
                            <TableCell>{item.location}</TableCell>
                            <TableCell>{getConditionBadge(item.condition)}</TableCell>
                            <TableCell className="text-right font-medium">
                              ₹{item.total_value.toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(item.last_audited).toLocaleDateString('en-IN')}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Item</DropdownMenuItem>
                                  <DropdownMenuItem>Update Stock</DropdownMenuItem>
                                  <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Mark as Missing
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            )}
          </TabsContent>

          {/* Stock Management Tab */}
          <TabsContent value="stock" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {stockLocations.map((location) => (
                <Card key={location.location_id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{location.location_name}</span>
                      <Badge variant="outline">
                        {location.current_items} / {location.capacity} items
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Managed by {location.responsible_person}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Stock level progress bar */}
                    <div className="mb-4">
                      <Label className="text-sm mb-2">Capacity Utilization</Label>
                      <Progress 
                        value={(location.current_items / location.capacity) * 100} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round((location.current_items / location.capacity) * 100)}% utilized
                      </p>
                    </div>
                    
                    {/* Items in this location */}
                    <div className="space-y-2">
                      <Label className="text-sm">Items in Location</Label>
                      {getItemsByLocation(location.location_id).slice(0, 5).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                          <span className="truncate">{item.name}</span>
                          <span className="font-medium ml-2">{item.quantity} {item.unit}</span>
                        </div>
                      ))}
                      {getItemsByLocation(location.location_id).length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          +{getItemsByLocation(location.location_id).length - 5} more items
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Low Stock Alerts */}
            {lowStockItems.length > 0 && (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="h-5 w-5" />
                    Low Stock Alerts
                  </CardTitle>
                  <CardDescription>Items below minimum stock level (5 units)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Only {item.quantity} {item.unit} remaining in {item.location}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Create Purchase Request
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Audit History Tab */}
          <TabsContent value="audits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit History</CardTitle>
                <CardDescription>Historical audit records and findings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditRecords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No audit records available
                    </div>
                  ) : (
                    auditRecords.map((audit) => (
                      <Card key={audit.audit_id}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">
                                Audit - {new Date(audit.audit_date).toLocaleDateString('en-IN', { 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </CardTitle>
                              <CardDescription>Conducted by {audit.audited_by}</CardDescription>
                            </div>
                            <Badge variant={audit.discrepancies === 0 ? "default" : "destructive"}>
                              {audit.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Items Checked</Label>
                              <p className="text-2xl font-bold">{audit.items_checked}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Discrepancies</Label>
                              <p className="text-2xl font-bold text-orange-600">
                                {audit.discrepancies}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Missing Items</Label>
                              <p className="text-2xl font-bold text-red-600">
                                {audit.missing_items.length}
                              </p>
                            </div>
                          </div>
                          
                          {audit.discrepancies > 0 && (
                            <div className="space-y-2 mb-3">
                              <Label className="text-sm font-medium">Issues Found:</Label>
                              {audit.missing_items.length > 0 && (
                                <div className="text-sm">
                                  <span className="font-medium text-red-600">Missing: </span>
                                  {audit.missing_items.join(', ')}
                                </div>
                              )}
                              {audit.damaged_items.length > 0 && (
                                <div className="text-sm">
                                  <span className="font-medium text-orange-600">Damaged: </span>
                                  {audit.damaged_items.join(', ')}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {audit.notes && (
                            <div className="mt-3 pt-3 border-t">
                              <Label className="text-xs text-muted-foreground">Notes</Label>
                              <p className="text-sm mt-1">{audit.notes}</p>
                            </div>
                          )}
                          
                          <Button variant="outline" size="sm" className="mt-3">
                            View Full Report
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddItemDialog
        isOpen={isAddItemOpen}
        onOpenChange={setIsAddItemOpen}
        onItemAdded={handleAddItemSuccess}
      />
    </Layout>
  );
}
