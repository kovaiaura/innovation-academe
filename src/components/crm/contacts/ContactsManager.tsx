import { useState } from "react";
import { InstitutionContact } from "@/data/mockCRMContacts";
import { CommunicationLog } from "@/data/mockCRMData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Users, Star, Award } from "lucide-react";
import { ContactCard } from "./ContactCard";
import { AddContactDialog } from "./AddContactDialog";
import { ContactDetailView } from "./ContactDetailView";

interface ContactsManagerProps {
  contacts: InstitutionContact[];
  institutions: Array<{ id: string; name: string }>;
  onAddContact: (contact: Omit<InstitutionContact, 'id' | 'date_added' | 'last_contacted' | 'total_interactions'>) => void;
  onEditContact: (id: string, contact: Partial<InstitutionContact>) => void;
  communicationLogs: CommunicationLog[];
}

export function ContactsManager({
  contacts,
  institutions,
  onAddContact,
  onEditContact,
  communicationLogs,
}: ContactsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterInstitution, setFilterInstitution] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<InstitutionContact | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<InstitutionContact | null>(null);

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.institution_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesInstitution = 
      filterInstitution === "all" || contact.institution_id === filterInstitution;

    const matchesType = 
      filterType === "all" ||
      (filterType === "primary" && contact.is_primary_contact) ||
      (filterType === "decision_maker" && contact.is_decision_maker);

    return matchesSearch && matchesInstitution && matchesType;
  });

  // Summary stats
  const totalContacts = contacts.length;
  const primaryContacts = contacts.filter(c => c.is_primary_contact).length;
  const decisionMakers = contacts.filter(c => c.is_decision_maker).length;

  const handleAddContact = () => {
    setEditingContact(null);
    setIsAddDialogOpen(true);
  };

  const handleEditContact = (contact: InstitutionContact) => {
    setEditingContact(contact);
    setIsAddDialogOpen(true);
    setIsDetailViewOpen(false);
  };

  const handleViewDetails = (contact: InstitutionContact) => {
    setSelectedContact(contact);
    setIsDetailViewOpen(true);
  };

  const handleSaveContact = (contactData: Omit<InstitutionContact, 'id' | 'date_added' | 'last_contacted' | 'total_interactions'>) => {
    if (editingContact) {
      onEditContact(editingContact.id, contactData);
    } else {
      onAddContact(contactData);
    }
    setIsAddDialogOpen(false);
    setEditingContact(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contacts Directory</CardTitle>
              <CardDescription>
                Manage all institution contacts and relationships
              </CardDescription>
            </div>
            <Button onClick={handleAddContact}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalContacts}</p>
                    <p className="text-sm text-muted-foreground">Total Contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{primaryContacts}</p>
                    <p className="text-sm text-muted-foreground">Primary Contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{decisionMakers}</p>
                    <p className="text-sm text-muted-foreground">Decision Makers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, designation, or institution..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterInstitution} onValueChange={setFilterInstitution}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Institutions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {institutions.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id}>
                    {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="primary">Primary Only</SelectItem>
                <SelectItem value="decision_maker">Decision Makers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contacts Grid */}
          {filteredContacts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={() => handleEditContact(contact)}
                  onViewDetails={() => handleViewDetails(contact)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || filterInstitution !== "all" || filterType !== "all"
                  ? "Try adjusting your filters"
                  : "Start by adding your first contact"}
              </p>
              {!searchQuery && filterInstitution === "all" && filterType === "all" && (
                <Button onClick={handleAddContact}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Contact
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddContactDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveContact}
        institutions={institutions}
        editContact={editingContact}
      />

      <ContactDetailView
        contact={selectedContact}
        open={isDetailViewOpen}
        onOpenChange={setIsDetailViewOpen}
        onEdit={() => selectedContact && handleEditContact(selectedContact)}
        communicationLogs={communicationLogs}
      />
    </>
  );
}
