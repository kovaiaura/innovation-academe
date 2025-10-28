import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Search, Phone, Mail, Video, Calendar as CalendarIcon, FileText, CheckCircle, Clock, AlertCircle, Building2, User, MessageSquare, DollarSign, Bell, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Data Types
interface Contact {
  id: string;
  institution_id: string;
  institution_name: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  type: 'lead' | 'customer' | 'partner';
  status: 'active' | 'inactive';
}

interface CommunicationLog {
  id: string;
  contact_id: string;
  contact_name: string;
  institution_id: string;
  institution_name: string;
  type: 'call' | 'meeting' | 'email' | 'follow_up';
  subject: string;
  notes: string;
  date: string;
  next_action?: string;
  next_action_date?: string;
  created_by: string;
}

interface RenewalContract {
  id: string;
  institution_id: string;
  institution_name: string;
  contact_id: string;
  contact_name: string;
  contract_type: string;
  start_date: string;
  expiry_date: string;
  value: number;
  status: 'active' | 'expiring_soon' | 'expired' | 'renewed';
  mou_document_url?: string;
  renewal_notes?: string;
}

interface FollowUpTask {
  id: string;
  institution_id: string;
  institution_name: string;
  contact_id: string;
  contact_name: string;
  task_description: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue';
  created_from?: string;
  assigned_to: string;
}

interface PurchaseRequest {
  id: string;
  institution_id: string;
  institution_name: string;
  requested_by: string;
  items: Array<{ name: string; quantity: number; unit_price: number }>;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_date: string;
  category: string;
  notes?: string;
}

interface ActionNote {
  id: string;
  date: string;
  related_to_type: 'institution' | 'contact' | 'communication';
  related_to_id: string;
  related_to_name: string;
  category: 'discussion' | 'follow_up' | 'decision' | 'action_item';
  priority: 'high' | 'medium' | 'low';
  content: string;
  action_required: boolean;
  assigned_to?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_by: string;
  created_at: string;
}

// Mock Data
const mockContacts: Contact[] = [
  { id: "1", institution_id: "inst1", institution_name: "Tech Valley University", name: "Dr. Sarah Johnson", designation: "Principal", email: "sarah.j@techvalley.edu", phone: "+1-555-0101", type: "customer", status: "active" },
  { id: "2", institution_id: "inst2", institution_name: "Innovation High School", name: "Prof. Michael Chen", designation: "Lab Head", email: "m.chen@innovationhs.edu", phone: "+1-555-0102", type: "customer", status: "active" },
  { id: "3", institution_id: "inst3", institution_name: "Future Skills Academy", name: "Ms. Emily Rodriguez", designation: "Academic Director", email: "e.rodriguez@futureskills.edu", phone: "+1-555-0103", type: "lead", status: "active" },
  { id: "4", institution_id: "inst1", institution_name: "Tech Valley University", name: "Mr. David Kumar", designation: "HOD Computer Science", email: "d.kumar@techvalley.edu", phone: "+1-555-0104", type: "customer", status: "active" },
  { id: "5", institution_id: "inst4", institution_name: "Global Learning Institute", name: "Dr. Amanda White", designation: "Dean of Innovation", email: "a.white@globallearning.edu", phone: "+1-555-0105", type: "partner", status: "active" },
];

const mockCommunicationLogs: CommunicationLog[] = [
  { id: "1", contact_id: "1", contact_name: "Dr. Sarah Johnson", institution_id: "inst1", institution_name: "Tech Valley University", type: "call", subject: "License Renewal Discussion", notes: "Discussed renewal terms and additional student seats. Interested in premium tier.", date: "2025-01-15", next_action: "Send proposal for premium upgrade", next_action_date: "2025-01-20", created_by: "Admin" },
  { id: "2", contact_id: "2", contact_name: "Prof. Michael Chen", institution_id: "inst2", institution_name: "Innovation High School", type: "meeting", subject: "Lab Equipment Requirements", notes: "Met to discuss lab setup and equipment needs. Provided equipment catalog.", date: "2025-01-10", next_action: "Follow up on equipment quotation", next_action_date: "2025-01-25", created_by: "Admin" },
  { id: "3", contact_id: "3", contact_name: "Ms. Emily Rodriguez", institution_id: "inst3", institution_name: "Future Skills Academy", type: "email", subject: "Initial Inquiry Response", notes: "Responded to inquiry about institutional packages. Sent brochure and pricing.", date: "2025-01-12", next_action: "Schedule demo session", next_action_date: "2025-01-22", created_by: "Admin" },
  { id: "4", contact_id: "1", contact_name: "Dr. Sarah Johnson", institution_id: "inst1", institution_name: "Tech Valley University", type: "follow_up", subject: "Premium Upgrade Follow-up", notes: "Following up on premium tier proposal. Awaiting management approval.", date: "2025-01-18", created_by: "Admin" },
];

const mockRenewalContracts: RenewalContract[] = [
  { id: "1", institution_id: "inst1", institution_name: "Tech Valley University", contact_id: "1", contact_name: "Dr. Sarah Johnson", contract_type: "Annual License", start_date: "2024-03-01", expiry_date: "2025-02-28", value: 50000, status: "expiring_soon" },
  { id: "2", institution_id: "inst2", institution_name: "Innovation High School", contact_id: "2", contact_name: "Prof. Michael Chen", contract_type: "2-Year License", start_date: "2023-06-01", expiry_date: "2025-05-31", value: 85000, status: "active" },
  { id: "3", institution_id: "inst3", institution_name: "Future Skills Academy", contact_id: "3", contact_name: "Ms. Emily Rodriguez", contract_type: "Annual Support", start_date: "2024-01-15", expiry_date: "2025-01-14", value: 30000, status: "expired" },
  { id: "4", institution_id: "inst4", institution_name: "Global Learning Institute", contact_id: "5", contact_name: "Dr. Amanda White", contract_type: "Enterprise License", start_date: "2024-08-01", expiry_date: "2026-07-31", value: 120000, status: "active" },
];

const mockFollowUpTasks: FollowUpTask[] = [
  { id: "1", institution_id: "inst1", institution_name: "Tech Valley University", contact_id: "1", contact_name: "Dr. Sarah Johnson", task_description: "Send premium upgrade proposal", due_date: "2025-01-20", priority: "high", status: "pending", created_from: "1", assigned_to: "Admin" },
  { id: "2", institution_id: "inst2", institution_name: "Innovation High School", contact_id: "2", contact_name: "Prof. Michael Chen", task_description: "Follow up on equipment quotation", due_date: "2025-01-25", priority: "medium", status: "pending", created_from: "2", assigned_to: "Admin" },
  { id: "3", institution_id: "inst3", institution_name: "Future Skills Academy", contact_id: "3", contact_name: "Ms. Emily Rodriguez", task_description: "Schedule demo session", due_date: "2025-01-22", priority: "high", status: "pending", created_from: "3", assigned_to: "Admin" },
  { id: "4", institution_id: "inst1", institution_name: "Tech Valley University", contact_id: "1", contact_name: "Dr. Sarah Johnson", task_description: "Check renewal decision status", due_date: "2025-02-15", priority: "high", status: "pending", assigned_to: "Admin" },
];

const mockPurchaseRequests: PurchaseRequest[] = [
  { id: "1", institution_id: "inst1", institution_name: "Tech Valley University", requested_by: "Dr. Sarah Johnson", items: [{ name: "Arduino Kits", quantity: 50, unit_price: 45 }, { name: "Raspberry Pi", quantity: 30, unit_price: 75 }], total_amount: 4500, status: "pending", requested_date: "2025-01-10", category: "Electronics" },
  { id: "2", institution_id: "inst2", institution_name: "Innovation High School", requested_by: "Prof. Michael Chen", items: [{ name: "3D Printer", quantity: 2, unit_price: 2500 }], total_amount: 5000, status: "approved", requested_date: "2025-01-08", category: "Lab Equipment" },
  { id: "3", institution_id: "inst3", institution_name: "Future Skills Academy", requested_by: "Ms. Emily Rodriguez", items: [{ name: "Laptops", quantity: 25, unit_price: 800 }], total_amount: 20000, status: "pending", requested_date: "2025-01-12", category: "Computers" },
];

const mockActionNotes: ActionNote[] = [
  { id: "1", date: "2025-01-15", related_to_type: "institution", related_to_id: "inst1", related_to_name: "Tech Valley University", category: "action_item", priority: "high", content: "Need to finalize premium upgrade terms and send proposal by EOW", action_required: true, assigned_to: "Admin", due_date: "2025-01-20", status: "pending", created_by: "Admin", created_at: "2025-01-15T10:00:00Z" },
  { id: "2", date: "2025-01-10", related_to_type: "contact", related_to_id: "2", related_to_name: "Prof. Michael Chen", category: "discussion", priority: "medium", content: "Discussed lab modernization plans. Interested in IoT equipment package.", action_required: false, status: "completed", created_by: "Admin", created_at: "2025-01-10T14:30:00Z" },
  { id: "3", date: "2025-01-18", related_to_type: "communication", related_to_id: "4", related_to_name: "Premium Upgrade Follow-up", category: "follow_up", priority: "high", content: "Awaiting management approval on premium tier. Follow up again next week if no response.", action_required: true, assigned_to: "Admin", due_date: "2025-01-25", status: "in_progress", created_by: "Admin", created_at: "2025-01-18T09:00:00Z" },
];

export default function CRMCommunication() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(mockCommunicationLogs);
  const [renewalContracts, setRenewalContracts] = useState<RenewalContract[]>(mockRenewalContracts);
  const [followUpTasks, setFollowUpTasks] = useState<FollowUpTask[]>(mockFollowUpTasks);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(mockPurchaseRequests);
  const [actionNotes, setActionNotes] = useState<ActionNote[]>(mockActionNotes);

  const [searchTerm, setSearchTerm] = useState("");
  const [contactTypeFilter, setContactTypeFilter] = useState<string>("all");
  const [logTypeFilter, setLogTypeFilter] = useState<string>("all");
  const [renewalStatusFilter, setRenewalStatusFilter] = useState<string>("all");
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("all");
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("all");
  const [noteStatusFilter, setNoteStatusFilter] = useState<string>("all");

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  // Contact Form
  const [contactForm, setContactForm] = useState({
    institution_name: "",
    name: "",
    designation: "",
    email: "",
    phone: "",
    type: "customer" as Contact['type'],
  });

  // Communication Log Form
  const [logForm, setLogForm] = useState({
    contact_name: "",
    institution_name: "",
    type: "call" as CommunicationLog['type'],
    subject: "",
    notes: "",
    date: new Date(),
    next_action: "",
    next_action_date: undefined as Date | undefined,
  });

  // Follow-up Task Form
  const [taskForm, setTaskForm] = useState({
    institution_name: "",
    contact_name: "",
    task_description: "",
    due_date: undefined as Date | undefined,
    priority: "medium" as FollowUpTask['priority'],
  });

  // Action Note Form
  const [noteForm, setNoteForm] = useState({
    related_to_type: "institution" as ActionNote['related_to_type'],
    related_to_name: "",
    category: "action_item" as ActionNote['category'],
    priority: "medium" as ActionNote['priority'],
    content: "",
    action_required: false,
    assigned_to: "",
    due_date: undefined as Date | undefined,
  });

  // Handlers
  const handleAddContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      institution_id: `inst${Date.now()}`,
      institution_name: contactForm.institution_name,
      name: contactForm.name,
      designation: contactForm.designation,
      email: contactForm.email,
      phone: contactForm.phone,
      type: contactForm.type,
      status: "active",
    };
    setContacts([newContact, ...contacts]);
    setContactDialogOpen(false);
    setContactForm({ institution_name: "", name: "", designation: "", email: "", phone: "", type: "customer" });
    toast.success("Contact added successfully");
  };

  const handleAddLog = () => {
    const newLog: CommunicationLog = {
      id: Date.now().toString(),
      contact_id: `contact${Date.now()}`,
      contact_name: logForm.contact_name,
      institution_id: `inst${Date.now()}`,
      institution_name: logForm.institution_name,
      type: logForm.type,
      subject: logForm.subject,
      notes: logForm.notes,
      date: format(logForm.date, "yyyy-MM-dd"),
      next_action: logForm.next_action || undefined,
      next_action_date: logForm.next_action_date ? format(logForm.next_action_date, "yyyy-MM-dd") : undefined,
      created_by: "Admin",
    };
    setCommunicationLogs([newLog, ...communicationLogs]);
    
    // Auto-create follow-up task if next action exists
    if (logForm.next_action && logForm.next_action_date) {
      const newTask: FollowUpTask = {
        id: Date.now().toString(),
        institution_id: newLog.institution_id,
        institution_name: newLog.institution_name,
        contact_id: newLog.contact_id,
        contact_name: newLog.contact_name,
        task_description: logForm.next_action,
        due_date: format(logForm.next_action_date, "yyyy-MM-dd"),
        priority: "medium",
        status: "pending",
        created_from: newLog.id,
        assigned_to: "Admin",
      };
      setFollowUpTasks([newTask, ...followUpTasks]);
    }
    
    setLogDialogOpen(false);
    setLogForm({ contact_name: "", institution_name: "", type: "call", subject: "", notes: "", date: new Date(), next_action: "", next_action_date: undefined });
    toast.success("Communication logged successfully");
  };

  const handleRenewContract = (id: string) => {
    setRenewalContracts(renewalContracts.map(contract => 
      contract.id === id ? { ...contract, status: "renewed" as const } : contract
    ));
    toast.success("Contract renewed successfully");
  };

  const handleAddTask = () => {
    const newTask: FollowUpTask = {
      id: Date.now().toString(),
      institution_id: `inst${Date.now()}`,
      institution_name: taskForm.institution_name,
      contact_id: `contact${Date.now()}`,
      contact_name: taskForm.contact_name,
      task_description: taskForm.task_description,
      due_date: taskForm.due_date ? format(taskForm.due_date, "yyyy-MM-dd") : "",
      priority: taskForm.priority,
      status: "pending",
      assigned_to: "Admin",
    };
    setFollowUpTasks([newTask, ...followUpTasks]);
    setTaskDialogOpen(false);
    setTaskForm({ institution_name: "", contact_name: "", task_description: "", due_date: undefined, priority: "medium" });
    toast.success("Follow-up task created");
  };

  const handleCompleteTask = (id: string) => {
    setFollowUpTasks(followUpTasks.map(task =>
      task.id === id ? { ...task, status: "completed" as const } : task
    ));
    toast.success("Task marked as completed");
  };

  const handleApproveRequest = (id: string) => {
    setPurchaseRequests(purchaseRequests.map(req =>
      req.id === id ? { ...req, status: "approved" as const } : req
    ));
    toast.success("Purchase request approved");
  };

  const handleRejectRequest = (id: string) => {
    setPurchaseRequests(purchaseRequests.map(req =>
      req.id === id ? { ...req, status: "rejected" as const } : req
    ));
    toast.success("Purchase request rejected");
  };

  const handleAddNote = () => {
    const newNote: ActionNote = {
      id: Date.now().toString(),
      date: format(new Date(), "yyyy-MM-dd"),
      related_to_type: noteForm.related_to_type,
      related_to_id: `rel${Date.now()}`,
      related_to_name: noteForm.related_to_name,
      category: noteForm.category,
      priority: noteForm.priority,
      content: noteForm.content,
      action_required: noteForm.action_required,
      assigned_to: noteForm.assigned_to || undefined,
      due_date: noteForm.due_date ? format(noteForm.due_date, "yyyy-MM-dd") : undefined,
      status: "pending",
      created_by: "Admin",
      created_at: new Date().toISOString(),
    };
    setActionNotes([newNote, ...actionNotes]);
    setNoteDialogOpen(false);
    setNoteForm({ related_to_type: "institution", related_to_name: "", category: "action_item", priority: "medium", content: "", action_required: false, assigned_to: "", due_date: undefined });
    toast.success("Note added successfully");
  };

  const handleUpdateNoteStatus = (id: string, status: ActionNote['status']) => {
    setActionNotes(actionNotes.map(note =>
      note.id === id ? { ...note, status } : note
    ));
    toast.success(`Note status updated to ${status}`);
  };

  // Filters
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.institution_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = contactTypeFilter === "all" || contact.type === contactTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredLogs = communicationLogs.filter(log => {
    const matchesSearch = log.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.institution_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = logTypeFilter === "all" || log.type === logTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredContracts = renewalContracts.filter(contract => {
    const matchesSearch = contract.institution_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = renewalStatusFilter === "all" || contract.status === renewalStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTasks = followUpTasks.filter(task => {
    const matchesSearch = task.institution_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.contact_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = taskStatusFilter === "all" || task.status === taskStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRequests = purchaseRequests.filter(req => {
    const matchesSearch = req.institution_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = requestStatusFilter === "all" || req.status === requestStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredNotes = actionNotes.filter(note => {
    const matchesSearch = note.related_to_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = noteStatusFilter === "all" || note.status === noteStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Badge Helpers
  const getTypeBadge = (type: Contact['type']) => {
    const variants: Record<Contact['type'], "default" | "secondary" | "outline"> = { 
      lead: "secondary", 
      customer: "default", 
      partner: "outline" 
    };
    return <Badge variant={variants[type]}>{type}</Badge>;
  };

  const getLogTypeBadge = (type: CommunicationLog['type']) => {
    const config: Record<CommunicationLog['type'], { icon: any, variant: "default" | "secondary" | "outline" }> = {
      call: { icon: Phone, variant: "default" },
      meeting: { icon: Video, variant: "secondary" },
      email: { icon: Mail, variant: "outline" },
      follow_up: { icon: Bell, variant: "secondary" },
    };
    const { icon: Icon, variant } = config[type];
    return <Badge variant={variant}><Icon className="w-3 h-3 mr-1" />{type.replace('_', ' ')}</Badge>;
  };

  const getRenewalStatusBadge = (status: RenewalContract['status']) => {
    const variants: Record<RenewalContract['status'], "default" | "secondary" | "destructive" | "outline"> = { 
      active: "default", 
      expiring_soon: "secondary", 
      expired: "destructive", 
      renewed: "outline" 
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: FollowUpTask['priority']) => {
    const variants: Record<FollowUpTask['priority'], "default" | "secondary" | "destructive" | "outline"> = { 
      high: "destructive", 
      medium: "secondary", 
      low: "outline" 
    };
    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  const getTaskStatusBadge = (status: FollowUpTask['status']) => {
    const variants: Record<FollowUpTask['status'], "default" | "secondary" | "destructive"> = { 
      pending: "secondary", 
      completed: "default", 
      overdue: "destructive" 
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getRequestStatusBadge = (status: PurchaseRequest['status']) => {
    const variants: Record<PurchaseRequest['status'], "default" | "secondary" | "destructive" | "outline"> = { 
      pending: "secondary", 
      approved: "default", 
      rejected: "destructive", 
      completed: "outline" 
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getNoteStatusBadge = (status: ActionNote['status']) => {
    const variants: Record<ActionNote['status'], "default" | "secondary" | "outline"> = { 
      pending: "secondary", 
      in_progress: "default", 
      completed: "outline" 
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getCategoryBadge = (category: ActionNote['category']) => {
    const variants: Record<ActionNote['category'], "default" | "secondary" | "destructive" | "outline"> = { 
      discussion: "outline", 
      follow_up: "secondary", 
      decision: "default", 
      action_item: "destructive" 
    };
    return <Badge variant={variants[category]}>{category.replace('_', ' ')}</Badge>;
  };

  // Stats
  const contactStats = {
    total: contacts.length,
    leads: contacts.filter(c => c.type === 'lead').length,
    customers: contacts.filter(c => c.type === 'customer').length,
  };

  const renewalStats = {
    expiring: renewalContracts.filter(c => c.status === 'expiring_soon').length,
    expired: renewalContracts.filter(c => c.status === 'expired').length,
    totalValue: renewalContracts.reduce((sum, c) => sum + c.value, 0),
  };

  const taskStats = {
    pending: followUpTasks.filter(t => t.status === 'pending').length,
    overdue: followUpTasks.filter(t => t.status === 'overdue').length,
  };

  const requestStats = {
    pending: purchaseRequests.filter(r => r.status === 'pending').length,
    pendingValue: purchaseRequests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.total_amount, 0),
  };

  const noteStats = {
    actionItems: actionNotes.filter(n => n.action_required && n.status !== 'completed').length,
    overdue: actionNotes.filter(n => n.action_required && n.due_date && new Date(n.due_date) < new Date() && n.status !== 'completed').length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">CRM & Communication</h1>
          <p className="text-muted-foreground">Manage contacts, communications, renewals, and follow-ups</p>
        </div>

        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="contacts">Contacts & Leads ({contactStats.total})</TabsTrigger>
            <TabsTrigger value="logs">Communication Logs</TabsTrigger>
            <TabsTrigger value="renewals">Renewal Tracker ({renewalStats.expiring})</TabsTrigger>
            <TabsTrigger value="followups">Follow-Up Scheduler ({taskStats.pending})</TabsTrigger>
            <TabsTrigger value="purchases">Purchase Requests ({requestStats.pending})</TabsTrigger>
            <TabsTrigger value="notes">Notes & Actions ({noteStats.actionItems})</TabsTrigger>
          </TabsList>

          {/* Contacts & Leads Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contactStats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contactStats.leads}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customers</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contactStats.customers}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contact Directory</CardTitle>
                    <CardDescription>Manage your contacts and leads</CardDescription>
                  </div>
                  <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Add Contact</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Contact</DialogTitle>
                        <DialogDescription>Enter contact details</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label>Institution Name</Label>
                          <Input value={contactForm.institution_name} onChange={(e) => setContactForm({ ...contactForm, institution_name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Contact Name</Label>
                          <Input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Designation</Label>
                          <Input value={contactForm.designation} onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })} placeholder="e.g., Principal, Lab Head" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Email</Label>
                          <Input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Phone</Label>
                          <Input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Type</Label>
                          <Select value={contactForm.type} onValueChange={(value: Contact['type']) => setContactForm({ ...contactForm, type: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lead">Lead</SelectItem>
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="partner">Partner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddContact}>Add Contact</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search contacts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                  </div>
                  <Select value={contactTypeFilter} onValueChange={setContactTypeFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.designation}</TableCell>
                        <TableCell>{contact.institution_name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{contact.email}</div>
                            <div className="text-muted-foreground">{contact.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(contact.type)}</TableCell>
                        <TableCell><Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>{contact.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Communication History</CardTitle>
                    <CardDescription>Track all interactions with contacts</CardDescription>
                  </div>
                  <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Log Communication</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Log Communication</DialogTitle>
                        <DialogDescription>Record interaction details</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Contact Name</Label>
                            <Input value={logForm.contact_name} onChange={(e) => setLogForm({ ...logForm, contact_name: e.target.value })} />
                          </div>
                          <div className="grid gap-2">
                            <Label>Institution</Label>
                            <Input value={logForm.institution_name} onChange={(e) => setLogForm({ ...logForm, institution_name: e.target.value })} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Type</Label>
                            <Select value={logForm.type} onValueChange={(value: CommunicationLog['type']) => setLogForm({ ...logForm, type: value })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="call">Call</SelectItem>
                                <SelectItem value="meeting">Meeting</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="follow_up">Follow-up</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("justify-start text-left font-normal", !logForm.date && "text-muted-foreground")}>
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {logForm.date ? format(logForm.date, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={logForm.date} onSelect={(date) => date && setLogForm({ ...logForm, date })} /></PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Subject</Label>
                          <Input value={logForm.subject} onChange={(e) => setLogForm({ ...logForm, subject: e.target.value })} placeholder="What was discussed?" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Notes</Label>
                          <Textarea value={logForm.notes} onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })} rows={4} placeholder="Detailed notes about the communication..." />
                        </div>
                        <div className="grid gap-2">
                          <Label>Next Action</Label>
                          <Input value={logForm.next_action} onChange={(e) => setLogForm({ ...logForm, next_action: e.target.value })} placeholder="What to follow up on?" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Next Action Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("justify-start text-left font-normal", !logForm.next_action_date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {logForm.next_action_date ? format(logForm.next_action_date, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={logForm.next_action_date} onSelect={(date) => setLogForm({ ...logForm, next_action_date: date })} /></PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddLog}>Log Communication</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                  </div>
                  <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <Card key={log.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getLogTypeBadge(log.type)}
                              <span className="text-sm text-muted-foreground">{log.date}</span>
                            </div>
                            <CardTitle className="text-lg">{log.subject}</CardTitle>
                            <CardDescription>{log.contact_name} - {log.institution_name}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">{log.notes}</p>
                          {log.next_action && (
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="text-sm font-medium">Next Action:</p>
                              <p className="text-sm">{log.next_action}</p>
                              {log.next_action_date && <p className="text-xs text-muted-foreground mt-1">Due: {log.next_action_date}</p>}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Renewal Tracker Tab */}
          <TabsContent value="renewals" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{renewalStats.expiring}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expired</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{renewalStats.expired}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${renewalStats.totalValue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contract Renewals</CardTitle>
                    <CardDescription>Track contracts approaching expiry</CardDescription>
                  </div>
                  <Select value={renewalStatusFilter} onValueChange={setRenewalStatusFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="renewed">Renewed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Contract Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.institution_name}</TableCell>
                        <TableCell>{contract.contact_name}</TableCell>
                        <TableCell>{contract.contract_type}</TableCell>
                        <TableCell>{contract.start_date}</TableCell>
                        <TableCell>{contract.expiry_date}</TableCell>
                        <TableCell>${contract.value.toLocaleString()}</TableCell>
                        <TableCell>{getRenewalStatusBadge(contract.status)}</TableCell>
                        <TableCell>
                          {contract.status !== 'renewed' && (
                            <Button size="sm" onClick={() => handleRenewContract(contract.id)}>Renew</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Follow-Up Scheduler Tab */}
          <TabsContent value="followups" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{taskStats.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{taskStats.overdue}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Follow-Up Tasks</CardTitle>
                    <CardDescription>Schedule and track follow-up reminders</CardDescription>
                  </div>
                  <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Add Reminder</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Follow-Up Task</DialogTitle>
                        <DialogDescription>Schedule a reminder to follow up</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label>Institution</Label>
                          <Input value={taskForm.institution_name} onChange={(e) => setTaskForm({ ...taskForm, institution_name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Contact Name</Label>
                          <Input value={taskForm.contact_name} onChange={(e) => setTaskForm({ ...taskForm, contact_name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Task Description</Label>
                          <Textarea value={taskForm.task_description} onChange={(e) => setTaskForm({ ...taskForm, task_description: e.target.value })} rows={3} placeholder="What needs to be followed up?" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Due Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("justify-start text-left font-normal", !taskForm.due_date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {taskForm.due_date ? format(taskForm.due_date, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={taskForm.due_date} onSelect={(date) => setTaskForm({ ...taskForm, due_date: date })} /></PopoverContent>
                          </Popover>
                        </div>
                        <div className="grid gap-2">
                          <Label>Priority</Label>
                          <Select value={taskForm.priority} onValueChange={(value: FollowUpTask['priority']) => setTaskForm({ ...taskForm, priority: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddTask}>Create Task</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                  </div>
                  <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.institution_name}</TableCell>
                        <TableCell>{task.contact_name}</TableCell>
                        <TableCell>{task.task_description}</TableCell>
                        <TableCell>{task.due_date}</TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>{getTaskStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          {task.status !== 'completed' && (
                            <Button size="sm" variant="outline" onClick={() => handleCompleteTask(task.id)}>
                              <CheckCircle className="mr-1 h-3 w-3" />Complete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchase Requests Tab */}
          <TabsContent value="purchases" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{requestStats.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${requestStats.pendingValue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Purchase Requests</CardTitle>
                    <CardDescription>Review and approve purchase requests from institutions</CardDescription>
                  </div>
                  <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.institution_name}</TableCell>
                        <TableCell>{request.requested_by}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {request.items.map((item, idx) => (
                              <div key={idx}>{item.name} x{item.quantity}</div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{request.category}</TableCell>
                        <TableCell>${request.total_amount.toLocaleString()}</TableCell>
                        <TableCell>{request.requested_date}</TableCell>
                        <TableCell>{getRequestStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleApproveRequest(request.id)}>Approve</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectRequest(request.id)}>Reject</Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes & Actions Tab */}
          <TabsContent value="notes" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Action Items</CardTitle>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{noteStats.actionItems}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Actions</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{noteStats.overdue}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Notes & Action Items</CardTitle>
                    <CardDescription>Track discussions, decisions, and follow-up actions</CardDescription>
                  </div>
                  <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Add Note</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Note or Action</DialogTitle>
                        <DialogDescription>Record important information and action items</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Related To Type</Label>
                            <Select value={noteForm.related_to_type} onValueChange={(value: ActionNote['related_to_type']) => setNoteForm({ ...noteForm, related_to_type: value })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="institution">Institution</SelectItem>
                                <SelectItem value="contact">Contact</SelectItem>
                                <SelectItem value="communication">Communication</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Related Entity</Label>
                            <Input value={noteForm.related_to_name} onChange={(e) => setNoteForm({ ...noteForm, related_to_name: e.target.value })} placeholder="Institution/Contact name" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Category</Label>
                            <Select value={noteForm.category} onValueChange={(value: ActionNote['category']) => setNoteForm({ ...noteForm, category: value })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="discussion">Discussion</SelectItem>
                                <SelectItem value="follow_up">Follow-up</SelectItem>
                                <SelectItem value="decision">Decision</SelectItem>
                                <SelectItem value="action_item">Action Item</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Priority</Label>
                            <Select value={noteForm.priority} onValueChange={(value: ActionNote['priority']) => setNoteForm({ ...noteForm, priority: value })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Note Content</Label>
                          <Textarea value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} rows={4} placeholder="What was discussed or needs to be done?" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="action_required" checked={noteForm.action_required} onChange={(e) => setNoteForm({ ...noteForm, action_required: e.target.checked })} className="rounded" />
                          <Label htmlFor="action_required">Action Required</Label>
                        </div>
                        {noteForm.action_required && (
                          <>
                            <div className="grid gap-2">
                              <Label>Assigned To</Label>
                              <Input value={noteForm.assigned_to} onChange={(e) => setNoteForm({ ...noteForm, assigned_to: e.target.value })} placeholder="Person responsible" />
                            </div>
                            <div className="grid gap-2">
                              <Label>Due Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className={cn("justify-start text-left font-normal", !noteForm.due_date && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {noteForm.due_date ? format(noteForm.due_date, "PPP") : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={noteForm.due_date} onSelect={(date) => setNoteForm({ ...noteForm, due_date: date })} /></PopoverContent>
                              </Popover>
                            </div>
                          </>
                        )}
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddNote}>Add Note</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search notes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                  </div>
                  <Select value={noteStatusFilter} onValueChange={setNoteStatusFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  {filteredNotes.map((note) => (
                    <Card key={note.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getCategoryBadge(note.category)}
                              {getPriorityBadge(note.priority)}
                              {getNoteStatusBadge(note.status)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">{note.related_to_name}</span> • {note.date}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">{note.content}</p>
                        {note.action_required && (
                          <div className="bg-muted p-3 rounded-lg space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <span className="font-medium">Assigned to:</span> {note.assigned_to}
                              </div>
                              <div className="text-sm text-muted-foreground">Due: {note.due_date}</div>
                            </div>
                            {note.status !== 'completed' && (
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline" onClick={() => handleUpdateNoteStatus(note.id, 'in_progress')}>Start</Button>
                                <Button size="sm" onClick={() => handleUpdateNoteStatus(note.id, 'completed')}>
                                  <CheckCircle className="mr-1 h-3 w-3" />Complete
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
