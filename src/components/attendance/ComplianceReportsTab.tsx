import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Shield, Calculator, Building } from 'lucide-react';
import { toast } from 'sonner';
import { complianceService } from '@/services/compliance.service';

export function ComplianceReportsTab() {
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [selectedYear, setSelectedYear] = useState('2024');
  
  const handleGeneratePFReport = async () => {
    try {
      toast.loading('Generating PF ECR report...', { id: 'pf-report' });
      await complianceService.generatePFReport(selectedMonth);
      toast.success('PF ECR report generated successfully', { id: 'pf-report' });
    } catch (error) {
      toast.error('Failed to generate PF report', { id: 'pf-report' });
    }
  };
  
  const handleGenerateESIReport = async () => {
    try {
      toast.loading('Generating ESI report...', { id: 'esi-report' });
      await complianceService.generateESIReport(selectedMonth);
      toast.success('ESI report generated successfully', { id: 'esi-report' });
    } catch (error) {
      toast.error('Failed to generate ESI report', { id: 'esi-report' });
    }
  };
  
  const handleGenerateTDSReport = async () => {
    try {
      toast.loading('Generating TDS Form 24Q...', { id: 'tds-report' });
      await complianceService.generateTDSReport(selectedYear);
      toast.success('TDS Form 24Q generated successfully', { id: 'tds-report' });
    } catch (error) {
      toast.error('Failed to generate TDS report', { id: 'tds-report' });
    }
  };
  
  const handleGeneratePTReport = async () => {
    try {
      toast.loading('Generating PT report...', { id: 'pt-report' });
      await complianceService.generatePTReport(selectedMonth);
      toast.success('Professional Tax report generated successfully', { id: 'pt-report' });
    } catch (error) {
      toast.error('Failed to generate PT report', { id: 'pt-report' });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024-01">January 2024</SelectItem>
            <SelectItem value="2023-12">December 2023</SelectItem>
            <SelectItem value="2023-11">November 2023</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">FY 2023-24</SelectItem>
            <SelectItem value="2023">FY 2022-23</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Provident Fund (PF)
            </CardTitle>
            <CardDescription>
              Generate PF ECR (Electronic Challan cum Return) for monthly PF contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Required for PF remittance to EPFO (Employees' Provident Fund Organization)
              </p>
              <Button onClick={handleGeneratePFReport}>
                <Download className="mr-2 h-4 w-4" />
                Generate PF ECR
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Employee State Insurance (ESI)
            </CardTitle>
            <CardDescription>
              Generate ESI contribution report for monthly remittance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                For employees with gross salary ≤ ₹21,000/month
              </p>
              <Button onClick={handleGenerateESIReport}>
                <Download className="mr-2 h-4 w-4" />
                Generate ESI Report
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              TDS - Form 24Q
            </CardTitle>
            <CardDescription>
              Quarterly TDS return for salary payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Quarterly submission to Income Tax Department
              </p>
              <Button onClick={handleGenerateTDSReport}>
                <Download className="mr-2 h-4 w-4" />
                Generate Form 24Q
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Professional Tax (PT)
            </CardTitle>
            <CardDescription>
              State-specific professional tax report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Monthly/Annual submission to State Commercial Tax Department
              </p>
              <Button onClick={handleGeneratePTReport}>
                <Download className="mr-2 h-4 w-4" />
                Generate PT Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Form 16 (TDS Certificate)
          </CardTitle>
          <CardDescription>
            Annual TDS certificate for individual employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Generate Form 16 for each officer showing annual salary and TDS deducted. Navigate to individual officer profiles to generate their Form 16.
          </p>
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <p className="text-sm">
              <strong>Note:</strong> Form 16 generation is available in the individual officer detail pages under the Payslips tab.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
