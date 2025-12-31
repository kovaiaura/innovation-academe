import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CertificateCard } from '@/components/student/CertificateCard';
import { CertificatePreviewDialog } from '@/components/student/CertificatePreviewDialog';
import { mockStudentCertificates } from '@/data/mockStudentCertificates';
import { StudentCertificate } from '@/types/gamification';
import { Award } from 'lucide-react';

export default function Certificates() {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<StudentCertificate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    // In production, fetch from certificateService.getStudentCertificates(userId)
    setCertificates(mockStudentCertificates);
  }, []);

  const filteredCertificates = categoryFilter === 'all' 
    ? certificates 
    : certificates.filter(c => c.activity_type === categoryFilter);

  const handleViewCertificate = (certificate: StudentCertificate) => {
    setSelectedCertificate(certificate);
    setPreviewOpen(true);
  };

  const categoryCounts = {
    all: certificates.length,
    course: certificates.filter(c => c.activity_type === 'course').length,
    level: certificates.filter(c => c.activity_type === 'level').length,
    assessment: certificates.filter(c => c.activity_type === 'assessment').length,
    event: certificates.filter(c => c.activity_type === 'event').length
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">View and download your earned certificates</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
          >
            All ({categoryCounts.all})
          </Button>
          <Button
            variant={categoryFilter === 'course' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('course')}
          >
            Courses ({categoryCounts.course})
          </Button>
          <Button
            variant={categoryFilter === 'level' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('level')}
          >
            Levels ({categoryCounts.level})
          </Button>
          <Button
            variant={categoryFilter === 'assessment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('assessment')}
          >
            Assessments ({categoryCounts.assessment})
          </Button>
          <Button
            variant={categoryFilter === 'event' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('event')}
          >
            Events ({categoryCounts.event})
          </Button>
        </div>

        {/* Certificates Grid */}
        {filteredCertificates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCertificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                onView={() => handleViewCertificate(certificate)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Award className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
              <p className="text-muted-foreground">
                Complete courses, levels, assessments, and events to earn certificates
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedCertificate && (
        <CertificatePreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          certificate={selectedCertificate}
        />
      )}
    </Layout>
  );
}
