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
import { ContactsManager } from "@/components/crm/contacts/ContactsManager";
import { 
  mockCommunicationLogs, 
  mockContracts, 
  mockBillingRecords, 
  mockCRMTasks,
  type CommunicationLog 
} from "@/data/mockCRMData";
import { mockContacts, type InstitutionContact } from "@/data/mockCRMContacts";
import { toast } from "sonner";

export default function CRM() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(mockCommunicationLogs);
  const [contacts, setContacts] = useState<InstitutionContact[]>(mockContacts);

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

  const handleAddContact = (newContact: Omit<InstitutionContact, 'id' | 'date_added' | 'last_contacted' | 'total_interactions'>) => {
    const contactWithId: InstitutionContact = {
      ...newContact,
      id: `contact-${Date.now()}`,
      date_added: new Date().toISOString().split('T')[0],
      last_contacted: new Date().toISOString().split('T')[0],
      total_interactions: 0,
    };
    
    setContacts(prev => [...prev, contactWithId]);
    toast.success("Contact added successfully");
  };

  const handleEditContact = (id: string, updatedContact: Partial<InstitutionContact>) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === id ? { ...contact, ...updatedContact } : contact
      )
    );
    toast.success("Contact updated successfully");
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
        <Button onClick={handleAddCommunication}>
          <Plus className="h-4 w-4 mr-2" />
          Log Communication
        </Button>
      </div>

      <Tabs defaultValue="communications" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
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

        {/* Contacts Directory Tab */}
        <TabsContent value="contacts">
          <ContactsManager
            contacts={contacts}
            institutions={getUniqueInstitutions(communicationLogs)}
            onAddContact={handleAddContact}
            onEditContact={handleEditContact}
            communicationLogs={communicationLogs}
          />
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
                  {mockContracts.filter(c => c.status === 'active').length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-600">Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {mockContracts.filter(c => c.status === 'expiring_soon').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{(mockContracts.reduce((sum, c) => sum + c.contract_value, 0) / 10000000).toFixed(1)}Cr
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockContracts.map((contract) => (
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
            billingRecords={mockBillingRecords}
            onViewInvoice={handleViewInvoice}
            onSendReminder={handleSendReminder}
          />
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <CRMTaskManager
            tasks={mockCRMTasks}
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
          contacts={contacts}
        />
      </div>
    </Layout>
  );
}
