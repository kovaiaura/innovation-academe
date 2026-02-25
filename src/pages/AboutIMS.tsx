import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Calculator, Trophy } from 'lucide-react';
import { AboutIMSTab } from '@/components/about-ims/AboutIMSTab';
import { AssessmentWeightageTab } from '@/components/about-ims/AssessmentWeightageTab';
import { GamificationRulesTab } from '@/components/about-ims/GamificationRulesTab';
import { supabase } from '@/integrations/supabase/client';

export default function AboutIMS() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdfUrl = async () => {
      const { data } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'about_ims_pdf_url')
        .single();

      if (data?.value) {
        const val = typeof data.value === 'string' ? data.value : (data.value as any)?.url;
        setPdfUrl(val || null);
      }
    };
    fetchPdfUrl();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">About IMS</h1>
          <p className="text-muted-foreground">Platform information, assessment guidelines, and gamification rules</p>
        </div>

        <Tabs defaultValue="about" className="space-y-6">
          <TabsList>
            <TabsTrigger value="about">
              <FileText className="mr-2 h-4 w-4" />
              About IMS
            </TabsTrigger>
            <TabsTrigger value="weightage">
              <Calculator className="mr-2 h-4 w-4" />
              Assessment Weightage
            </TabsTrigger>
            <TabsTrigger value="gamification">
              <Trophy className="mr-2 h-4 w-4" />
              Gamification Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <AboutIMSTab pdfUrl={pdfUrl} />
          </TabsContent>
          <TabsContent value="weightage">
            <AssessmentWeightageTab />
          </TabsContent>
          <TabsContent value="gamification">
            <GamificationRulesTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
