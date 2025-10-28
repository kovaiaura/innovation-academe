import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Download, Plus, Trash2, FileText } from 'lucide-react';

// Mock resume data
const mockResumeData = {
  personal: {
    name: 'Jane Smith',
    email: 'jane.smith@school.com',
    phone: '+91 98765 43210',
    address: 'Delhi, India'
  },
  education: [
    {
      institution: 'Delhi Public School',
      degree: 'High School',
      year: '2022 - 2024'
    }
  ],
  skills: ['Python', 'Web Development', 'IoT', 'Project Management'],
  projects: [
    {
      title: 'Solar Water Purifier',
      description: 'Low-cost water purification using solar energy',
      sdg: 'SDG 6, 7'
    }
  ],
  certificates: [
    {
      title: 'Innovation Workshop Completion',
      issuer: 'Meta-INNOVA',
      date: 'March 2024'
    }
  ],
  achievements: [
    'Ranked #12 in class leaderboard',
    'Earned 3 achievement badges'
  ]
};

export default function Resume() {
  const [resumeData, setResumeData] = useState(mockResumeData);
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setCustomSkills([...customSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setCustomSkills(customSkills.filter((_, i) => i !== index));
  };

  const handleExport = () => {
    toast.success('Resume exported as PDF');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Resume Builder</h1>
            <p className="text-muted-foreground">Auto-filled from your LMS data</p>
          </div>
          <Button onClick={handleExport} className="bg-meta-dark hover:bg-meta-dark-lighter">
            <Download className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Auto-filled from your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={resumeData.personal.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={resumeData.personal.email} disabled />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={resumeData.personal.phone}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personal: { ...resumeData.personal, phone: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input 
                      value={resumeData.personal.address}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personal: { ...resumeData.personal, address: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>From your institution records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="font-semibold">{edu.institution}</div>
                    <div className="text-sm text-muted-foreground">{edu.degree}</div>
                    <div className="text-sm text-muted-foreground">{edu.year}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Add custom skills to complement your courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">From Courses</Label>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                      <div key={index} className="rounded-full bg-meta-dark px-3 py-1 text-sm text-white">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="mb-2 block">Additional Skills</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <Button onClick={handleAddSkill} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customSkills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 rounded-full bg-meta-accent px-3 py-1 text-sm text-meta-dark">
                        {skill}
                        <button onClick={() => handleRemoveSkill(index)}>
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>From your project portfolio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.projects.map((project, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="font-semibold">{project.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    <div className="text-xs text-meta-accent mt-2">{project.sdg}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificates</CardTitle>
                <CardDescription>Your earned certificates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {resumeData.certificates.map((cert, index) => (
                  <div key={index} className="flex items-start justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-medium">{cert.title}</div>
                      <div className="text-sm text-muted-foreground">{cert.issuer} • {cert.date}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Preview</CardTitle>
                <CardDescription>How your resume looks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-meta-dark">{resumeData.personal.name}</h2>
                    <p className="text-sm text-gray-600">{resumeData.personal.email}</p>
                    <p className="text-sm text-gray-600">{resumeData.personal.phone}</p>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h3 className="font-bold text-meta-dark mb-1">EDUCATION</h3>
                      {resumeData.education.map((edu, i) => (
                        <div key={i} className="text-xs text-gray-700">
                          <div className="font-semibold">{edu.institution}</div>
                          <div>{edu.degree} • {edu.year}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="font-bold text-meta-dark mb-1">SKILLS</h3>
                      <div className="text-xs text-gray-700">
                        {[...resumeData.skills, ...customSkills].join(', ')}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-meta-dark mb-1">PROJECTS</h3>
                      {resumeData.projects.map((proj, i) => (
                        <div key={i} className="text-xs text-gray-700 mb-1">
                          <div className="font-semibold">{proj.title}</div>
                          <div>{proj.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Download as PDF
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Download as Word
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
