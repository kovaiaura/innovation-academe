import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Award, QrCode, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

// Mock certificates data
const mockCertificates = [
  {
    id: '1',
    title: 'Innovation Workshop Completion',
    description: 'Successfully completed 40-hour Innovation and Entrepreneurship Workshop',
    issued_by: 'Dr. Sharma',
    issued_date: '2024-03-15',
    certificate_url: '#',
    qr_code: 'QR123456',
    verification_code: 'CERT-2024-001',
    type: 'workshop'
  },
  {
    id: '2',
    title: 'Project Excellence Award',
    description: 'Outstanding performance in Solar Water Purifier project',
    issued_by: 'Institution Admin',
    issued_date: '2024-02-28',
    certificate_url: '#',
    qr_code: 'QR789012',
    verification_code: 'CERT-2024-002',
    type: 'achievement'
  },
  {
    id: '3',
    title: 'Mathematics Olympiad Participation',
    description: 'Participated in National Mathematics Olympiad 2024',
    issued_by: 'Prof. Kumar',
    issued_date: '2024-01-20',
    certificate_url: '#',
    qr_code: 'QR345678',
    verification_code: 'CERT-2024-003',
    type: 'participation'
  }
];

export default function Certificates() {
  const [certificates] = useState(mockCertificates);

  const handleDownload = (cert: any) => {
    console.log('Downloading certificate:', cert.id);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-yellow-100 text-yellow-800';
      case 'workshop': return 'bg-blue-100 text-blue-800';
      case 'participation': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">View and download your earned certificates</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-meta-accent/20 to-transparent rounded-bl-full"></div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Award className="h-12 w-12 text-meta-accent" />
                  <Badge className={getTypeColor(cert.type)} variant="secondary">
                    {cert.type}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{cert.title}</CardTitle>
                <CardDescription>{cert.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Issued by:</span>
                    <span className="font-medium">{cert.issued_by}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {format(new Date(cert.issued_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Verification:</span>
                    <span className="font-mono text-xs">{cert.verification_code}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span>Verified Certificate</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleDownload(cert)}
                    className="flex-1 bg-meta-dark hover:bg-meta-dark-lighter"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="icon">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {certificates.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Award className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
              <p className="text-muted-foreground">
                Complete courses and projects to earn certificates
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
