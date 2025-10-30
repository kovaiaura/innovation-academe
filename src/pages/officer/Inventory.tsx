import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Edit, Trash2, MapPin, Calendar, AlertCircle, ShoppingCart, Cpu, Lightbulb, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { CreatePurchaseRequestDialog } from '@/components/inventory/CreatePurchaseRequestDialog';
import { PurchaseRequestDetailDialog } from '@/components/inventory/PurchaseRequestDetailDialog';
import { PurchaseRequestStatusBadge } from '@/components/inventory/PurchaseRequestStatusBadge';
import { mockPurchaseRequests, updateMockPurchaseRequest, getPurchaseRequestsByOfficer, mockInventoryItems, mockProjectComponents, getComponentsByOfficer, addMockComponent, updateMockComponent, deleteMockComponent } from '@/data/mockInventoryData';
import { PurchaseRequest, InventoryItem, ProjectComponent } from '@/types/inventory';
import { format } from 'date-fns';
import { mockProjects, getProjectsByOfficer } from '@/data/mockProjectData';
import { AddComponentDialog } from '@/components/inventory/AddComponentDialog';
import { ComponentStatusBadge } from '@/components/inventory/ComponentStatusBadge';

export default function Inventory() {
  // Use shared inventory data from mockInventoryData
  const [equipment, setEquipment] = useState<InventoryItem[]>(mockInventoryItems['springfield'] || []);
  const [filterCategory, setFilterCategory] = useState('all');
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(getPurchaseRequestsByOfficer('off-001'));
  const [requestFilter, setRequestFilter] = useState('all');
  
  // Components state
  const [components, setComponents] = useState<ProjectComponent[]>(getComponentsByOfficer('off-001'));
  const [componentFilter, setComponentFilter] = useState<'all' | ProjectComponent['status']>('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [isAddComponentOpen, setIsAddComponentOpen] = useState(false);
  const projects = getProjectsByOfficer('off-001');

  const handleDeleteEquipment = (id: string) => {
    const updatedEquipment = equipment.filter((e) => e.id !== id);
    setEquipment(updatedEquipment);
    // Update shared data source
    mockInventoryItems['springfield'] = updatedEquipment;
    toast.success('Equipment deleted successfully!');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      active: { className: 'bg-green-500/10 text-green-500', label: 'Active' },
      under_maintenance: { className: 'bg-yellow-500/10 text-yellow-500', label: 'Maintenance' },
      damaged: { className: 'bg-red-500/10 text-red-500', label: 'Damaged' },
      retired: { className: 'bg-gray-500/10 text-gray-500', label: 'Retired' },
    };
    return variants[status] || variants.active;
  };

  const handleCreatePurchaseRequest = (data: any) => {
    const newRequest: PurchaseRequest = {
      id: `pr-${Date.now()}`,
      request_code: `PR-${String(mockPurchaseRequests.length + 1).padStart(3, '0')}`,
      officer_id: 'off-001',
      officer_name: 'Dr. Rajesh Kumar',
      institution_id: 'springfield',
      institution_name: 'Springfield University',
      items: data.items,
      total_estimated_cost: data.items.reduce((sum: number, item: any) => sum + item.estimated_total, 0),
      justification: data.justification,
      priority: data.priority,
      status: 'pending_institution_approval',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockPurchaseRequests.push(newRequest);
    setPurchaseRequests(getPurchaseRequestsByOfficer('off-001'));
    toast.success(`Purchase request ${newRequest.request_code} created successfully!`);
  };

  // Component handlers
  const handleAddComponent = (data: Partial<ProjectComponent>) => {
    const newComponent: ProjectComponent = {
      id: `comp-${Date.now()}`,
      component_code: `COMP-SF-${String(components.length + 1).padStart(3, '0')}`,
      ...data as ProjectComponent,
      added_by_officer_id: 'off-001',
      added_by_officer_name: 'Dr. Rajesh Kumar',
      status: 'needed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    addMockComponent(newComponent);
    setComponents(getComponentsByOfficer('off-001'));
    toast.success(`Component "${newComponent.name}" added successfully!`);
  };

  const handleEditComponent = (component: ProjectComponent) => {
    toast.info('Edit component functionality - coming soon!');
  };

  const handleDeleteComponent = (id: string) => {
    deleteMockComponent(id);
    setComponents(getComponentsByOfficer('off-001'));
    toast.success('Component deleted successfully!');
  };

  const handleCreatePurchaseRequestFromComponent = (component: ProjectComponent) => {
    const requestData = {
      items: [{
        item_name: component.name,
        category: 'technology' as const,
        quantity: component.required_quantity,
        unit: component.unit,
        estimated_unit_price: component.estimated_unit_price,
        estimated_total: component.estimated_total,
        justification: component.justification || `Required for project: ${component.project_name || 'General'}`
      }],
      justification: component.justification || `Components needed for ${component.project_name || 'lab activities'}`,
      priority: component.priority === 'urgent' ? 'urgent' as const : 'normal' as const
    };
    
    handleCreatePurchaseRequest(requestData);
    
    // Update component status
    const newRequestCode = `PR-${String(mockPurchaseRequests.length).padStart(3, '0')}`;
    updateMockComponent(component.id, { 
      status: 'requested',
      purchase_request_code: newRequestCode
    });
    setComponents(getComponentsByOfficer('off-001'));
    
    toast.success(`Purchase request created from component "${component.name}"!`);
  };

  const categories = ['all', ...new Set(equipment.map((e) => e.category))];
  const filteredEquipment = filterCategory === 'all' 
    ? equipment 
    : equipment.filter(e => e.category === filterCategory);

  const totalQuantity = equipment.reduce((sum, e) => sum + e.quantity, 0);
  const activeItems = equipment.filter(e => e.status === 'active').length;
  const maintenanceItems = equipment.filter(e => e.status === 'under_maintenance').length;

  const filteredRequests = requestFilter === 'all'
    ? purchaseRequests
    : purchaseRequests.filter(req => req.status === requestFilter);

  const pendingCount = purchaseRequests.filter(r => r.status === 'pending_institution_approval').length;
  const approvedCount = purchaseRequests.filter(r => r.status === 'approved_by_institution' || r.status === 'in_progress').length;

  // Component filtering
  const filteredComponents = components.filter(c => {
    const statusMatch = componentFilter === 'all' || c.status === componentFilter;
    const projectMatch = projectFilter === 'all' || c.project_id === projectFilter;
    return statusMatch && projectMatch;
  });

  const componentsNeeded = components.filter(c => c.status === 'needed').length;
  const componentsRequested = components.filter(c => c.status === 'requested').length;
  const componentsTotalCost = components.reduce((sum, c) => sum + c.estimated_total, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Lab Inventory & Purchases</h1>
          <p className="text-muted-foreground">Manage lab equipment and request new supplies</p>
        </div>

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList>
            <TabsTrigger value="inventory">My Lab Inventory</TabsTrigger>
            <TabsTrigger value="components">
              Components
              {componentsNeeded > 0 && (
                <Badge className="ml-2" variant="secondary">{componentsNeeded}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests">
              Purchase Requests
              {(pendingCount + approvedCount > 0) && (
                <Badge className="ml-2" variant="secondary">{pendingCount + approvedCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Lab Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex justify-between items-center">
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
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{equipment.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalQuantity}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{activeItems}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">{maintenanceItems}</div>
                </CardContent>
              </Card>
            </div>

            {/* Equipment Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredEquipment.map((item) => {
                const statusInfo = getStatusBadge(item.status);
                
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
                            onClick={() => toast.info('Edit functionality')}
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
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-medium">{item.quantity} {item.unit}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Condition</p>
                          <p className="font-medium capitalize">{item.condition}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{item.location}</span>
                      </div>
                      {item.last_audited && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Last audited: {new Date(item.last_audited).toLocaleDateString()}</span>
                        </div>
                      )}
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            {/* Header with filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Status Filter */}
                <Select value={componentFilter} onValueChange={(val: any) => setComponentFilter(val)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Components</SelectItem>
                    <SelectItem value="needed">Needed</SelectItem>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="purchased">Purchased</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Project Filter */}
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={() => setIsAddComponentOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Component
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{components.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600">{componentsNeeded}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Requested</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{componentsRequested}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Estimated Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    ₹{componentsTotalCost.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Components Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredComponents.map((component) => (
                <Card key={component.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-lg">{component.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{component.category}</Badge>
                          <ComponentStatusBadge status={component.status} />
                          {component.priority === 'urgent' && (
                            <Badge variant="destructive" className="text-xs">URGENT</Badge>
                          )}
                          {component.priority === 'high' && (
                            <Badge className="text-xs bg-orange-500">HIGH</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditComponent(component)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteComponent(component.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {component.project_name && (
                      <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
                        <Lightbulb className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-blue-700">
                          {component.project_name}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-medium">{component.required_quantity} {component.unit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Unit Price</p>
                        <p className="font-medium">₹{component.estimated_unit_price}</p>
                      </div>
                    </div>
                    
                    <div className="bg-primary/5 p-3 rounded">
                      <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
                      <p className="text-xl font-bold text-primary">
                        ₹{component.estimated_total.toLocaleString()}
                      </p>
                    </div>
                    
                    {component.specifications && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Specifications</p>
                        <p className="font-mono text-xs bg-muted p-2 rounded">{component.specifications}</p>
                      </div>
                    )}
                    
                    {component.manufacturer && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Manufacturer</p>
                        <p className="font-medium">{component.manufacturer} {component.part_number && `(${component.part_number})`}</p>
                      </div>
                    )}
                    
                    {component.purchase_request_code && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                        <CheckCircle className="h-4 w-4" />
                        <span>Included in {component.purchase_request_code}</span>
                      </div>
                    )}
                    
                    {component.status === 'needed' && (
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleCreatePurchaseRequestFromComponent(component)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Create Purchase Request
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredComponents.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Cpu className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No components found</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {componentFilter !== 'all' || projectFilter !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'Start adding components for your innovation projects'}
                  </p>
                  <Button onClick={() => setIsAddComponentOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Component
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Purchase Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select value={requestFilter} onValueChange={setRequestFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending_institution_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved_by_institution">Approved</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="rejected_by_institution">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setIsCreateRequestOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Purchase Request
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">{approvedCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {purchaseRequests.filter(r => r.status === 'fulfilled').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Requests List */}
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setSelectedRequest(request)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{request.request_code}</h3>
                          <PurchaseRequestStatusBadge status={request.status} size="sm" />
                          {request.priority === 'urgent' && (
                            <Badge variant="destructive" className="text-xs">URGENT</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.items.length} item{request.items.length > 1 ? 's' : ''} • 
                          Created {format(new Date(request.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">₹{request.total_estimated_cost.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {request.items.map((item, idx) => (
                          <Badge key={idx} variant="outline">
                            {item.item_name} ({item.quantity})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredRequests.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No purchase requests found</p>
                    <Button className="mt-4" onClick={() => setIsCreateRequestOpen(true)}>
                      Create Your First Request
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreatePurchaseRequestDialog
        isOpen={isCreateRequestOpen}
        onOpenChange={setIsCreateRequestOpen}
        onSubmit={handleCreatePurchaseRequest}
      />

      <PurchaseRequestDetailDialog
        isOpen={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        request={selectedRequest}
      />

      <AddComponentDialog
        isOpen={isAddComponentOpen}
        onOpenChange={setIsAddComponentOpen}
        onSubmit={handleAddComponent}
        projects={projects}
      />
    </Layout>
  );
}
