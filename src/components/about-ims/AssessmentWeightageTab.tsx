import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, AlertTriangle, Info } from 'lucide-react';

const WEIGHTAGE_CATEGORIES = [
  { label: 'FA1 (Formative Assessment 1)', weight: 20, color: 'bg-blue-500' },
  { label: 'FA2 (Formative Assessment 2)', weight: 20, color: 'bg-green-500' },
  { label: 'Final Assessment', weight: 40, color: 'bg-purple-500' },
  { label: 'Internal Assessment', weight: 20, color: 'bg-orange-500' },
];

export function AssessmentWeightageTab() {
  return (
    <div className="space-y-6">
      {/* Formula Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Total Weighted Score Formula
          </CardTitle>
          <CardDescription>
            How the final weighted score is calculated for each student
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Weightage Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WEIGHTAGE_CATEGORIES.map((cat) => (
              <div key={cat.label} className="rounded-lg border p-4 text-center space-y-2">
                <div className={`h-2 rounded-full ${cat.color}`} />
                <p className="text-sm font-medium">{cat.label}</p>
                <p className="text-3xl font-bold text-primary">{cat.weight}%</p>
              </div>
            ))}
          </div>

          {/* Visual bar */}
          <div className="w-full h-6 rounded-full overflow-hidden flex">
            <div className="bg-blue-500 h-full" style={{ width: '20%' }} />
            <div className="bg-green-500 h-full" style={{ width: '20%' }} />
            <div className="bg-purple-500 h-full" style={{ width: '40%' }} />
            <div className="bg-orange-500 h-full" style={{ width: '20%' }} />
          </div>
          <div className="flex text-xs text-muted-foreground">
            <span style={{ width: '20%' }} className="text-center">FA1 (20%)</span>
            <span style={{ width: '20%' }} className="text-center">FA2 (20%)</span>
            <span style={{ width: '40%' }} className="text-center">Final (40%)</span>
            <span style={{ width: '20%' }} className="text-center">Internal (20%)</span>
          </div>

          <Separator />

          {/* Formula */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium mb-2">Formula:</p>
            <code className="text-sm font-mono bg-background rounded px-3 py-2 block">
              Total = (FA1% × 0.20) + (FA2% × 0.20) + (Final% × 0.40) + (Internal% × 0.20)
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Example Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Example Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">Category</th>
                  <th className="px-4 py-2 text-center font-medium">Score</th>
                  <th className="px-4 py-2 text-center font-medium">Max Marks</th>
                  <th className="px-4 py-2 text-center font-medium">Percentage</th>
                  <th className="px-4 py-2 text-center font-medium">Weight</th>
                  <th className="px-4 py-2 text-center font-medium">Weighted Score</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2">FA1</td>
                  <td className="px-4 py-2 text-center">24</td>
                  <td className="px-4 py-2 text-center">30</td>
                  <td className="px-4 py-2 text-center">80%</td>
                  <td className="px-4 py-2 text-center">× 0.20</td>
                  <td className="px-4 py-2 text-center font-medium">16.0</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">FA2</td>
                  <td className="px-4 py-2 text-center">18</td>
                  <td className="px-4 py-2 text-center">30</td>
                  <td className="px-4 py-2 text-center">60%</td>
                  <td className="px-4 py-2 text-center">× 0.20</td>
                  <td className="px-4 py-2 text-center font-medium">12.0</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Final Assessment</td>
                  <td className="px-4 py-2 text-center">45</td>
                  <td className="px-4 py-2 text-center">50</td>
                  <td className="px-4 py-2 text-center">90%</td>
                  <td className="px-4 py-2 text-center">× 0.40</td>
                  <td className="px-4 py-2 text-center font-medium">36.0</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Internal Assessment</td>
                  <td className="px-4 py-2 text-center">70</td>
                  <td className="px-4 py-2 text-center">100</td>
                  <td className="px-4 py-2 text-center">70%</td>
                  <td className="px-4 py-2 text-center">× 0.20</td>
                  <td className="px-4 py-2 text-center font-medium">14.0</td>
                </tr>
                <tr className="border-t bg-primary/5">
                  <td className="px-4 py-3 font-bold" colSpan={5}>Total Weighted Score</td>
                  <td className="px-4 py-3 text-center font-bold text-primary text-lg">78.0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Badge variant="destructive" className="mt-0.5">Absent</Badge>
            <p className="text-sm text-muted-foreground">
              If a student is marked as <strong>absent</strong> for any assessment category, they receive a <strong>0%</strong> score for that category, which is included in the weighted total calculation.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Badge variant="secondary" className="mt-0.5">Internal</Badge>
            <p className="text-sm text-muted-foreground">
              The Internal Assessment score is a manual score (0-100) entered by the assigned Innovation Officer or CEO.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Badge variant="outline" className="mt-0.5">Unmapped</Badge>
            <p className="text-sm text-muted-foreground">
              If assessments are not mapped for a specific class, the respective category scores default to <strong>0%</strong> in analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
