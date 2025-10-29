import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Camera,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Plus,
  Clock,
  UserCheck,
} from 'lucide-react';
import { systemAdminService, OfficerDetails, OfficerDocument, OfficerActivityLog } from '@/services/systemadmin.service';
import DocumentUploadDialog from '@/components/officer/DocumentUploadDialog';
import EditOfficerDialog from '@/components/officer/EditOfficerDialog';
import DocumentCard from '@/components/officer/DocumentCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock institutions for assignment
const mockInstitutions = [
  { id: 'inst1', name: 'Springfield University' },
  { id: 'inst2', name: 'River College' },
  { id: 'inst3', name: 'Oakwood Institute' },
  { id: 'inst4', name: 'Tech Valley School' },
  { id: 'inst5', name: 'Innovation Hub' },
];

// Mock data for officer details
const mockOfficerDetails: Record<string, OfficerDetails> = {
  '1': {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@metainnova.com',
    phone: '+1234567890',
    assigned_institutions: ['Springfield University', 'River College'],
    employment_type: 'full_time',
    salary: 65000,
    join_date: '2023-01-15',
    status: 'active',
    date_of_birth: '1985-06-15',
    address: '123 Main St, Springfield, IL 62701',
    emergency_contact_name: 'Jane Smith',
    emergency_contact_phone: '+1234567899',
    employee_id: 'EMP001',
    department: 'Innovation Management',
    bank_account_number: '****1234',
    bank_name: 'Chase Bank',
    bank_ifsc: 'CHAS0001234',
    bank_branch: 'Springfield Branch',
    statutory_info: {
      pf_number: 'PF123456789',
      uan_number: 'UAN987654321',
      esi_number: '',
      pan_number: 'ABCDE1234F',
      pt_registration: 'PT12345',
      pf_applicable: true,
      esi_applicable: false,
      pt_applicable: true,
    },
    salary_structure: {
      basic_pay: 26000,
      hra: 13000,
      da: 6500,
      transport_allowance: 3250,
      special_allowance: 13000,
      medical_allowance: 3250,
    },
    qualifications: ['MBA in Innovation Management', 'BS in Computer Science'],
    certifications: ['PMP', 'Agile Scrum Master'],
    skills: ['Project Management', 'Innovation Strategy', 'Team Leadership'],
    profile_photo_url: '',
  },
  '2': {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@metainnova.com',
    phone: '+1234567891',
    assigned_institutions: ['Oakwood Institute'],
    employment_type: 'full_time',
    salary: 62000,
    join_date: '2023-03-20',
    status: 'active',
    date_of_birth: '1990-03-22',
    address: '456 Oak Ave, Oakwood, CA 90210',
    emergency_contact_name: 'Michael Johnson',
    emergency_contact_phone: '+1234567898',
    employee_id: 'EMP002',
    department: 'Innovation Management',
    qualifications: ['MS in Educational Technology'],
    certifications: ['ITIL Foundation'],
    skills: ['Educational Innovation', 'Digital Transformation'],
  },
  '3': {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.c@metainnova.com',
    phone: '+1234567892',
    assigned_institutions: ['Tech Valley School', 'Innovation Hub'],
    employment_type: 'contract',
    salary: 55000,
    join_date: '2023-06-10',
    status: 'active',
    date_of_birth: '1988-11-05',
    address: '789 Tech Blvd, Valley City, TX 75001',
    employee_id: 'EMP003',
    department: 'Innovation Management',
    qualifications: ['BS in Engineering'],
    skills: ['Technology Integration', 'STEM Education'],
  },
};

// Mock documents
const mockDocuments: OfficerDocument[] = [
  {
    id: '1',
    officer_id: '1',
    document_type: 'appointment_letter',
    document_name: 'Appointment Letter 2023',
    file_url: '#',
    file_size_mb: 2.5,
    file_type: 'pdf',
    uploaded_by: 'Admin',
    uploaded_date: '2023-01-15',
    description: 'Official appointment letter',
  },
  {
    id: '2',
    officer_id: '1',
    document_type: 'certificate',
    document_name: 'MBA Certificate',
    file_url: '#',
    file_size_mb: 1.8,
    file_type: 'pdf',
    uploaded_by: 'John Smith',
    uploaded_date: '2023-02-01',
  },
];

// Mock activity log
const mockActivityLog: OfficerActivityLog[] = [
  {
    id: '1',
    officer_id: '1',
    action_type: 'profile_update',
    action_description: 'Updated contact information',
    performed_by: 'Admin',
    performed_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    officer_id: '1',
    action_type: 'assignment',
    action_description: 'Assigned to River College',
    performed_by: 'System Admin',
    performed_at: '2024-01-10T14:20:00Z',
  },
  {
    id: '3',
    officer_id: '1',
    action_type: 'document_upload',
    action_description: 'Uploaded MBA Certificate',
    performed_by: 'John Smith',
    performed_at: '2024-01-05T09:15:00Z',
  },
];

export default function OfficerDetail() {
  const { officerId } = useParams<{ officerId: string }>();
  const navigate = useNavigate();
  
  const [officer, setOfficer] = useState<OfficerDetails | null>(null);
  const [documents, setDocuments] = useState<OfficerDocument[]>([]);
  const [activityLog, setActivityLog] = useState<OfficerActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isUploadDocumentOpen, setIsUploadDocumentOpen] = useState(false);
  const [isAssignInstitutionOpen, setIsAssignInstitutionOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');

  useEffect(() => {
    const fetchOfficerData = async () => {
      if (!officerId) return;
      
      setIsLoading(true);
      try {
        // Using mock data for now
        const officerData = mockOfficerDetails[officerId];
        const documentsData = mockDocuments.filter(d => d.officer_id === officerId);
        const activityData = mockActivityLog.filter(a => a.officer_id === officerId);
        
        if (officerData) {
          setOfficer(officerData);
          setDocuments(documentsData);
          setActivityLog(activityData);
        } else {
          toast.error('Officer not found');
          navigate('/system-admin/officers');
        }
      } catch (error) {
        toast.error('Failed to load officer data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOfficerData();
  }, [officerId, navigate]);

  const handleProfileUpdate = async (updatedData: Partial<OfficerDetails>) => {
    if (!officerId) return;
    
    try {
      toast.loading('Updating profile...', { id: 'update' });
      // API call would go here
      // const result = await systemAdminService.updateOfficerProfile(officerId, updatedData);
      
      setOfficer(prev => prev ? { ...prev, ...updatedData } : null);
      setIsEditProfileOpen(false);
      toast.success('Profile updated successfully', { id: 'update' });
    } catch (error) {
      toast.error('Failed to update profile', { id: 'update' });
    }
  };

  const handleDocumentUpload = async (
    file: File,
    documentType: string,
    documentName: string,
    description?: string
  ) => {
    if (!officerId) return;
    
    try {
      toast.loading('Uploading document...', { id: 'upload' });
      // API call would go here
      // const result = await systemAdminService.uploadOfficerDocument(officerId, file, documentType, documentName, description);
      
      const newDoc: OfficerDocument = {
        id: String(documents.length + 1),
        officer_id: officerId,
        document_type: documentType as any,
        document_name: documentName,
        file_url: '#',
        file_size_mb: file.size / (1024 * 1024),
        file_type: file.type.split('/')[1],
        uploaded_by: 'Current User',
        uploaded_date: new Date().toISOString().split('T')[0],
        description,
      };
      
      setDocuments([...documents, newDoc]);
      setIsUploadDocumentOpen(false);
      toast.success('Document uploaded successfully', { id: 'upload' });
    } catch (error) {
      toast.error('Failed to upload document', { id: 'upload' });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !officerId) return;
    
    try {
      toast.loading('Uploading photo...', { id: 'photo' });
      // API call would go here
      // const result = await systemAdminService.uploadOfficerPhoto(officerId, file);
      
      const photoUrl = URL.createObjectURL(file);
      setOfficer(prev => prev ? { ...prev, profile_photo_url: photoUrl } : null);
      toast.success('Photo updated successfully', { id: 'photo' });
    } catch (error) {
      toast.error('Failed to upload photo', { id: 'photo' });
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!officerId) return;
    
    try {
      toast.loading('Deleting document...', { id: 'delete' });
      // API call would go here
      // await systemAdminService.deleteOfficerDocument(officerId, documentId);
      
      setDocuments(documents.filter(d => d.id !== documentId));
      toast.success('Document deleted successfully', { id: 'delete' });
    } catch (error) {
      toast.error('Failed to delete document', { id: 'delete' });
    }
  };

  const handleAddInstitution = async () => {
    if (!selectedInstitution || !officerId) {
      toast.error('Please select an institution');
      return;
    }
    
    try {
      toast.loading('Adding assignment...', { id: 'assign' });
      const institution = mockInstitutions.find(i => i.id === selectedInstitution);
      
      if (institution && officer) {
        setOfficer({
          ...officer,
          assigned_institutions: [...officer.assigned_institutions, institution.name],
        });
        setIsAssignInstitutionOpen(false);
        setSelectedInstitution('');
        toast.success('Institution assigned successfully', { id: 'assign' });
      }
    } catch (error) {
      toast.error('Failed to assign institution', { id: 'assign' });
    }
  };

  const handleRemoveInstitution = async (institutionName: string) => {
    if (!officerId || !officer) return;
    
    try {
      toast.loading('Removing assignment...', { id: 'remove' });
      setOfficer({
        ...officer,
        assigned_institutions: officer.assigned_institutions.filter(i => i !== institutionName),
      });
      toast.success('Institution removed successfully', { id: 'remove' });
    } catch (error) {
      toast.error('Failed to remove institution', { id: 'remove' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      on_leave: 'secondary',
      terminated: 'destructive',
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status.replace('_', ' ')}</Badge>;
  };

  const getEmploymentBadge = (type: string) => {
    return <Badge variant="outline">{type.replace('_', ' ')}</Badge>;
  };

  const openUploadDialog = (docType: string) => {
    setSelectedDocumentType(docType);
    setIsUploadDocumentOpen(true);
  };

  const getDocumentsByType = (type: string) => {
    return documents.filter(d => d.document_type === type);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!officer) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Officer not found</p>
          <Button onClick={() => navigate('/system-admin/officers')} className="mt-4">
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/system-admin/officers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Officers
          </Button>
        </div>

        {/* Hero Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Profile Photo */}
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={officer.profile_photo_url} />
                  <AvatarFallback className="text-4xl">
                    {officer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  id="photo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
                <label htmlFor="photo-upload">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 cursor-pointer"
                    asChild
                  >
                    <span>
                      <Camera className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
              </div>

              {/* Officer Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{officer.name}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {getStatusBadge(officer.status)}
                  {getEmploymentBadge(officer.employment_type)}
                  {officer.employee_id && (
                    <Badge variant="outline">ID: {officer.employee_id}</Badge>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Join Date</p>
                    <p className="font-semibold">{formatDate(officer.join_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Salary</p>
                    <p className="font-semibold">₹{officer.salary.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Institutions</p>
                    <p className="font-semibold">{officer.assigned_institutions.length}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditProfileOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="institutions">Institutions</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Personal Information */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{officer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{officer.phone}</span>
                    </div>
                    {officer.date_of_birth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">DOB: {formatDate(officer.date_of_birth)}</span>
                      </div>
                    )}
                    {officer.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{officer.address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Employment Information */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Employment Information</h3>
                  <div className="space-y-3">
                    {officer.employee_id && (
                      <div>
                        <p className="text-sm text-muted-foreground">Employee ID</p>
                        <p className="font-medium">{officer.employee_id}</p>
                      </div>
                    )}
                    {officer.department && (
                      <div>
                        <p className="text-sm text-muted-foreground">Department</p>
                        <p className="font-medium">{officer.department}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Employment Type</p>
                      <p className="font-medium">{officer.employment_type.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Annual Salary</p>
                        <p className="font-medium">₹{officer.salary.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Details */}
              {(officer.bank_account_number || officer.bank_name) && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Banking Information</h3>
                    <div className="space-y-3">
                      {officer.bank_account_number && (
                        <div>
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="font-medium">{officer.bank_account_number}</p>
                        </div>
                      )}
                      {officer.bank_name && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bank Name</p>
                          <p className="font-medium">{officer.bank_name}</p>
                        </div>
                      )}
                      {officer.bank_ifsc && (
                        <div>
                          <p className="text-sm text-muted-foreground">IFSC Code</p>
                          <p className="font-medium">{officer.bank_ifsc}</p>
                        </div>
                      )}
                      {officer.bank_branch && (
                        <div>
                          <p className="text-sm text-muted-foreground">Branch</p>
                          <p className="font-medium">{officer.bank_branch}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Statutory Information */}
              {officer.statutory_info && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Statutory Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {officer.statutory_info.pf_number && (
                        <div>
                          <p className="text-sm text-muted-foreground">PF Number</p>
                          <p className="font-medium">{officer.statutory_info.pf_number}</p>
                        </div>
                      )}
                      {officer.statutory_info.uan_number && (
                        <div>
                          <p className="text-sm text-muted-foreground">UAN Number</p>
                          <p className="font-medium">{officer.statutory_info.uan_number}</p>
                        </div>
                      )}
                      {officer.statutory_info.esi_number && (
                        <div>
                          <p className="text-sm text-muted-foreground">ESI Number</p>
                          <p className="font-medium">{officer.statutory_info.esi_number}</p>
                        </div>
                      )}
                      {officer.statutory_info.pan_number && (
                        <div>
                          <p className="text-sm text-muted-foreground">PAN Number</p>
                          <p className="font-medium">{officer.statutory_info.pan_number}</p>
                        </div>
                      )}
                    </div>
                    <div className="pt-2 space-y-2">
                      <p className="text-sm font-medium">Applicability:</p>
                      <div className="flex gap-4">
                        <Badge variant={officer.statutory_info.pf_applicable ? "default" : "outline"}>
                          PF {officer.statutory_info.pf_applicable ? "Applicable" : "Not Applicable"}
                        </Badge>
                        <Badge variant={officer.statutory_info.esi_applicable ? "default" : "outline"}>
                          ESI {officer.statutory_info.esi_applicable ? "Applicable" : "Not Applicable"}
                        </Badge>
                        <Badge variant={officer.statutory_info.pt_applicable ? "default" : "outline"}>
                          PT {officer.statutory_info.pt_applicable ? "Applicable" : "Not Applicable"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Salary Structure */}
              {officer.salary_structure && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Salary Structure</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Basic Pay</span>
                        <span className="font-medium">₹{officer.salary_structure.basic_pay.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">HRA</span>
                        <span className="font-medium">₹{officer.salary_structure.hra.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">DA</span>
                        <span className="font-medium">₹{officer.salary_structure.da.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Transport Allowance</span>
                        <span className="font-medium">₹{officer.salary_structure.transport_allowance.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Special Allowance</span>
                        <span className="font-medium">₹{officer.salary_structure.special_allowance.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Medical Allowance</span>
                        <span className="font-medium">₹{officer.salary_structure.medical_allowance.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-3 border-t-2 mt-2">
                        <span className="font-bold">Total (CTC)</span>
                        <span className="font-bold text-lg">₹{officer.salary.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Emergency Contact */}
              {(officer.emergency_contact_name || officer.emergency_contact_phone) && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Emergency Contact</h3>
                    <div className="space-y-3">
                      {officer.emergency_contact_name && (
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{officer.emergency_contact_name}</p>
                        </div>
                      )}
                      {officer.emergency_contact_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{officer.emergency_contact_phone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Qualifications */}
              {officer.qualifications && officer.qualifications.length > 0 && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Qualifications</h3>
                    <ul className="space-y-2">
                      {officer.qualifications.map((qual, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-sm">{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Institutions Tab */}
          <TabsContent value="institutions" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setIsAssignInstitutionOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Assign Institution
              </Button>
            </div>

            <div className="grid gap-4">
              {officer.assigned_institutions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No institutions assigned yet</p>
                  </CardContent>
                </Card>
              ) : (
                officer.assigned_institutions.map((institution, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{institution}</h4>
                            <p className="text-sm text-muted-foreground">Active Assignment</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View Institution</Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveInstitution(institution)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {/* Appointment Letters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Appointment Letters</h3>
                  <Button size="sm" onClick={() => openUploadDialog('appointment_letter')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
                <div className="space-y-3">
                  {getDocumentsByType('appointment_letter').length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No appointment letters uploaded
                    </p>
                  ) : (
                    getDocumentsByType('appointment_letter').map(doc => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onView={() => window.open(doc.file_url, '_blank')}
                        onDownload={() => window.open(doc.file_url, '_blank')}
                        onDelete={() => handleDeleteDocument(doc.id)}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Certificates</h3>
                  <Button size="sm" onClick={() => openUploadDialog('certificate')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
                <div className="space-y-3">
                  {getDocumentsByType('certificate').length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No certificates uploaded
                    </p>
                  ) : (
                    getDocumentsByType('certificate').map(doc => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onView={() => window.open(doc.file_url, '_blank')}
                        onDownload={() => window.open(doc.file_url, '_blank')}
                        onDelete={() => handleDeleteDocument(doc.id)}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ID Cards */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">ID Cards</h3>
                  <Button size="sm" onClick={() => openUploadDialog('id_card')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
                <div className="space-y-3">
                  {getDocumentsByType('id_card').length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No ID cards uploaded
                    </p>
                  ) : (
                    getDocumentsByType('id_card').map(doc => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onView={() => window.open(doc.file_url, '_blank')}
                        onDownload={() => window.open(doc.file_url, '_blank')}
                        onDelete={() => handleDeleteDocument(doc.id)}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">Activity Log</h3>
                {activityLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No activity recorded yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activityLog.map((log) => (
                      <div key={log.id} className="flex gap-4 border-l-2 border-primary pl-4 py-2">
                        <div className="flex-1">
                          <p className="font-medium">{log.action_description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(log.performed_at)}
                            <span>•</span>
                            <UserCheck className="h-3 w-3" />
                            {log.performed_by}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <EditOfficerDialog
          isOpen={isEditProfileOpen}
          onOpenChange={setIsEditProfileOpen}
          officer={officer}
          onSaveSuccess={handleProfileUpdate}
        />

        <DocumentUploadDialog
          isOpen={isUploadDocumentOpen}
          onOpenChange={setIsUploadDocumentOpen}
          officerId={officerId || ''}
          documentType={selectedDocumentType}
          onUploadSuccess={handleDocumentUpload}
        />

        <Dialog open={isAssignInstitutionOpen} onOpenChange={setIsAssignInstitutionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign to Institution</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="institution">Select Institution</Label>
                <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose institution..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockInstitutions
                      .filter(inst => !officer.assigned_institutions.includes(inst.name))
                      .map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddInstitution} className="w-full">
                Assign Institution
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
