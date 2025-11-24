import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Plus, Search, Filter } from "lucide-react";
import { CommunicationLogCard } from "@/components/crm/CommunicationLogCard";
import { ContractTracker } from "@/components/crm/ContractTracker";
import { BillingDashboard } from "@/components/crm/BillingDashboard";
import { CRMTaskManager } from "@/components/crm/CRMTaskManager";
import { CommunicationTimeline } from "@/components/crm/CommunicationTimeline";
import { AddCommunicationDialog } from "@/components/crm/AddCommunicationDialog";
import { AddContractDialog } from "@/components/crm/AddContractDialog";
import { AddInvoiceDialog } from "@/components/crm/AddInvoiceDialog";
import { AddTaskDialog } from "@/components/crm/AddTaskDialog";
import { TimelineFilterDialog } from "@/components/crm/TimelineFilterDialog";
import { 
  mockCommunicationLogs, 
  mockContracts, 
  mockBillingRecords, 
  mockCRMTasks,
  type CommunicationLog 
} from "@/data/mockCRMData";
import { toast } from "sonner";

export default function CRM() {
  const [activeTab, setActiveTab] = useState("communications");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddContractDialogOpen, setIsAddContractDialogOpen] = useState(false);
  const [isAddInvoiceDialogOpen, setIsAddInvoiceDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isTimelineFilterOpen, setIsTimelineFilterOpen] = useState(false);
  
  // Data states
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(mockCommunicationLogs);
  const [contracts, setContracts] = useState(mockContracts);
  const [billingRecords, setBillingRecords] = useState(mockBillingRecords);
  const [tasks, setTasks] = useState(mockCRMTasks);

  // Extract unique institutions from existing logs
  const getUniqueInstitutions = (logs: CommunicationLog[]) => {
    const institutionsMap = new Map();
    logs.forEach(log => {
      if (!institutionsMap.has(log.institution_id)) {
        institutionsMap.set(log.institution_id, {
          id: log.institution_id,
          name: log.institution_name,
        });
      }
    });
    return Array.from(institutionsMap.values());
  };

  const handleAddCommunication = () => {
    setIsAddDialogOpen(true);
  };

  const handleSaveCommunication = (newLog: Omit<CommunicationLog, 'id'>) => {
    const logWithId: CommunicationLog = {
      ...newLog,
      id: `comm-${Date.now()}`,
    };
    
    setCommunicationLogs(prev => [logWithId, ...prev]);
    setIsAddDialogOpen(false);
    toast.success("Communication logged successfully");
  };

  const handleViewContract = () => {
    toast.info("Contract details dialog would open here");
  };

  const handleInitiateRenewal = () => {
    toast.info("Contract renewal workflow would start here");
  };

  const handleViewInvoice = () => {
    toast.info("Invoice details dialog would open here");
  };

  const handleSendReminder = () => {
    toast.success("Payment reminder sent successfully");
  };

  const handleCompleteTask = () => {
    toast.success("Task marked as completed");
  };

  // Contract handlers
  const handleAddContract = () => {
    setIsAddContractDialogOpen(true);
  };

  const handleSaveContract = (newContract: Omit<typeof mockContracts[0], 'id'>) => {
    const contractWithId = {
      ...newContract,
      id: `cnt-${Date.now()}`,
    };
    setContracts(prev => [contractWithId, ...prev]);
    setIsAddContractDialogOpen(false);
    toast.success("Contract created successfully");
  };

  // Invoice handlers
  const handleAddInvoice = () => {
    setIsAddInvoiceDialogOpen(true);
  };

  const handleSaveInvoice = (newInvoice: Omit<typeof mockBillingRecords[0], 'id'>) => {
    const invoiceWithId = {
      ...newInvoice,
      id: `inv-${Date.now()}`,
    };
    setBillingRecords(prev => [invoiceWithId, ...prev]);
    setIsAddInvoiceDialogOpen(false);
    toast.success("Invoice created successfully");
  };

  // Task handlers
  const handleAddTask = () => {
    setIsAddTaskDialogOpen(true);
  };

  const handleSaveTask = (newTask: Omit<typeof mockCRMTasks[0], 'id'>) => {
    const taskWithId = {
      ...newTask,
      id: `task-${Date.now()}`,
    };
    setTasks(prev => [taskWithId, ...prev]);
    setIsAddTaskDialogOpen(false);
    toast.success("Task created successfully");
  };

  // Timeline handlers
  const handleFilterTimeline = () => {
    setIsTimelineFilterOpen(true);
  };

  const handleApplyTimelineFilters = (filters: any) => {
    toast.success("Filters applied to timeline");
  };

  const handleExportTimeline = () => {
    toast.success("Exporting timeline to PDF...");
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Phone className="h-8 w-8 text-primary" />
            CRM & Client Relations
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage communications, contracts, billing, and client relationships
          </p>
        </div>
        
        {/* Dynamic Action Buttons Based on Active Tab */}
        <div className="flex gap-2">
          {activeTab === "communications" && (
            <Button onClick={handleAddCommunication}>
              <Plus className="h-4 w-4 mr-2" />
              Log Communication
            </Button>
          )}
          
          {activeTab === "contracts" && (
            <Button onClick={handleAddContract}>
              <Plus className="h-4 w-4 mr-2" />
              Create Contract
            </Button>
          )}
          
          {activeTab === "billing" && (
            <Button onClick={handleAddInvoice}>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          )}
          
          {activeTab === "tasks" && (
            <Button onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          )}
          
          {activeTab === "timeline" && (
            <>
              <Button variant="outline" onClick={handleFilterTimeline}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button onClick={handleExportTimeline}>
                <Plus className="h-4 w-4 mr-2" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="communications">Communication Tracking</TabsTrigger>
          <TabsTrigger value="contracts">Renewals & Contracts</TabsTrigger>
          <TabsTrigger value="billing">Billing & Invoices</TabsTrigger>
          <TabsTrigger value="tasks">Tasks & Reminders</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        {/* Communication Tracking Tab */}
        <TabsContent value="communications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Communications</CardTitle>
              <CardDescription>
                Track all interactions with institution administrators and stakeholders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search communications by institution, subject, or contact..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {communicationLogs
                  .filter(log => {
                    const searchLower = searchQuery.toLowerCase();
                    return (
                      log.institution_name.toLowerCase().includes(searchLower) ||
                      log.subject.toLowerCase().includes(searchLower) ||
                      log.contact_person.toLowerCase().includes(searchLower) ||
                      log.notes.toLowerCase().includes(searchLower)
                    );
                  })
                  .map((log) => (
                    <CommunicationLogCard
                      key={log.id}
                      log={log}
                      onEdit={() => toast.info("Edit dialog would open")}
                      onViewDetails={() => toast.info("Details dialog would open")}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {contracts.filter(c => c.status === 'active').length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-600">Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {contracts.filter(c => c.status === 'expiring_soon').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{(contracts.reduce((sum, c) => sum + c.contract_value, 0) / 10000000).toFixed(1)}Cr
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contracts.map((contract) => (
              <ContractTracker
                key={contract.id}
                contract={contract}
                onViewDetails={handleViewContract}
                onRenew={handleInitiateRenewal}
              />
            ))}
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <BillingDashboard
            billingRecords={billingRecords}
            onViewInvoice={handleViewInvoice}
            onSendReminder={handleSendReminder}
          />
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <CRMTaskManager
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
            onEditTask={() => toast.info("Edit task dialog would open")}
          />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <CommunicationTimeline logs={communicationLogs} />
        </TabsContent>
        </Tabs>

        <AddCommunicationDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSave={handleSaveCommunication}
          institutions={getUniqueInstitutions(communicationLogs)}
        />

        <AddContractDialog
          open={isAddContractDialogOpen}
          onOpenChange={setIsAddContractDialogOpen}
          onSave={handleSaveContract}
          institutions={getUniqueInstitutions(communicationLogs)}
        />

        <AddInvoiceDialog
          open={isAddInvoiceDialogOpen}
          onOpenChange={setIsAddInvoiceDialogOpen}
          onSave={handleSaveInvoice}
          institutions={getUniqueInstitutions(communicationLogs)}
        />

        <AddTaskDialog
          open={isAddTaskDialogOpen}
          onOpenChange={setIsAddTaskDialogOpen}
          onSave={handleSaveTask}
          institutions={getUniqueInstitutions(communicationLogs)}
        />

        <TimelineFilterDialog
          open={isTimelineFilterOpen}
          onOpenChange={setIsTimelineFilterOpen}
          onApplyFilters={handleApplyTimelineFilters}
          institutions={getUniqueInstitutions(communicationLogs)}
        />
      </div>
    </Layout>
  );
}
