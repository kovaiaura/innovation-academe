import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IdConfigurationForm } from '@/components/settings/IdConfigurationForm';
import { Settings, Users, Building2, GraduationCap, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function IdConfiguration() {
  const [activeTab, setActiveTab] = useState('employee');

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">ID Configuration</h1>
            <p className="text-muted-foreground">
              Configure unique ID generation patterns for employees, institutions, and students
            </p>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>About ID Generation</AlertTitle>
        <AlertDescription>
          Customize how unique IDs are generated for different entities. Once configured, 
          IDs will be automatically generated when onboarding new employees, institutions, 
          or students. <strong>Student IDs are permanent</strong> and will follow the student 
          throughout their entire educational journey.
        </AlertDescription>
      </Alert>

      {/* Configuration Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Configure ID Patterns</CardTitle>
          <CardDescription>
            Set up custom patterns for generating unique identifiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="employee" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Employee IDs</span>
                <span className="sm:hidden">Employees</span>
              </TabsTrigger>
              <TabsTrigger value="institution" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Institution IDs</span>
                <span className="sm:hidden">Institutions</span>
              </TabsTrigger>
              <TabsTrigger value="student" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Student IDs</span>
                <span className="sm:hidden">Students</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employee" className="mt-6">
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Employee ID Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Configure the ID pattern for all employees including officers, teachers, 
                  and administrative staff. Employee IDs can be set to reset annually.
                </p>
              </div>
              <IdConfigurationForm entityType="employee" />
            </TabsContent>

            <TabsContent value="institution" className="mt-6">
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Institution ID Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Configure the ID pattern for institutions and partner organizations. 
                  These IDs are used when onboarding new educational institutions.
                </p>
              </div>
              <IdConfigurationForm entityType="institution" />
            </TabsContent>

            <TabsContent value="student" className="mt-6">
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Student ID Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Configure the ID pattern for students. <strong className="text-yellow-600 dark:text-yellow-500">
                  Student IDs are permanent and lifelong</strong> - they will not reset and will 
                  remain with the student throughout their entire educational journey.
                </p>
              </div>
              <IdConfigurationForm entityType="student" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-primary" />
                Employees
              </div>
              <p className="text-xs text-muted-foreground">
                Generated when onboarding officers, teachers, or staff members. 
                Can be configured to reset annually based on hiring cycles.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4 text-primary" />
                Institutions
              </div>
              <p className="text-xs text-muted-foreground">
                Generated when adding new partner institutions. Used for 
                organization-wide identification and tracking.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <GraduationCap className="h-4 w-4 text-primary" />
                Students
              </div>
              <p className="text-xs text-muted-foreground">
                Generated at admission and stays with the student for life. 
                <strong> Never resets</strong> and can be used for alumni tracking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}
