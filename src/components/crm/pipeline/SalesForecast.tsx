import { SalesLead, stageConfig } from '@/data/mockSalesPipeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface SalesForecastProps {
  leads: SalesLead[];
}

export function SalesForecast({ leads }: SalesForecastProps) {
  const activeLeads = leads.filter(l => l.status === 'active');
  
  // Calculate totals
  const totalPipelineValue = activeLeads.reduce((sum, lead) => sum + lead.estimated_deal_value, 0);
  const weightedPipelineValue = activeLeads.reduce((sum, lead) => sum + (lead.estimated_deal_value * lead.probability / 100), 0);
  
  // Expected closures this month
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const expectedClosuresThisMonth = activeLeads.filter(lead => {
    const closeDate = new Date(lead.expected_close_date);
    return closeDate <= endOfMonth && closeDate >= today;
  });
  const expectedRevenueThisMonth = expectedClosuresThisMonth.reduce((sum, lead) => sum + (lead.estimated_deal_value * lead.probability / 100), 0);

  // Pipeline value by stage
  const stageData = Object.entries(stageConfig)
    .filter(([stage]) => stage !== 'lost')
    .map(([stage, config]) => {
      const stageLeads = activeLeads.filter(l => l.stage === stage);
      const value = stageLeads.reduce((sum, lead) => sum + lead.estimated_deal_value, 0);
      return {
        stage: config.label,
        value: value / 100000, // Convert to lakhs
        count: stageLeads.length,
      };
    });

  // Win rate calculation
  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === 'won').length;
  const lostLeads = leads.filter(l => l.status === 'lost').length;
  const winRate = totalLeads > 0 ? ((wonLeads / (wonLeads + lostLeads)) * 100).toFixed(1) : '0';

  // Average deal size
  const avgDealSize = activeLeads.length > 0 ? totalPipelineValue / activeLeads.length : 0;

  // Contract type distribution
  const contractTypeData = [
    {
      name: 'Basic',
      value: activeLeads.filter(l => l.proposed_contract_type === 'basic').length,
      color: '#94a3b8'
    },
    {
      name: 'Standard',
      value: activeLeads.filter(l => l.proposed_contract_type === 'standard').length,
      color: '#3b82f6'
    },
    {
      name: 'Enterprise',
      value: activeLeads.filter(l => l.proposed_contract_type === 'enterprise').length,
      color: '#8b5cf6'
    },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              Total Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalPipelineValue / 10000000).toFixed(1)}Cr</div>
            <p className="text-xs text-muted-foreground mt-1">{activeLeads.length} active leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Weighted Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(weightedPipelineValue / 10000000).toFixed(1)}Cr</div>
            <p className="text-xs text-muted-foreground mt-1">Based on probability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Expected This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(expectedRevenueThisMonth / 10000000).toFixed(1)}Cr</div>
            <p className="text-xs text-muted-foreground mt-1">{expectedClosuresThisMonth.length} deals closing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{wonLeads} won, {lostLeads} lost</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pipeline by Stage */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
            <CardDescription>Deal value across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="stage" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  className="text-xs"
                />
                <YAxis 
                  label={{ value: 'Value (₹L)', angle: -90, position: 'insideLeft' }}
                  className="text-xs"
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'value' ? `₹${value.toFixed(1)}L` : value,
                    name === 'value' ? 'Pipeline Value' : 'Deals'
                  ]}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contract Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Type Distribution</CardTitle>
            <CardDescription>Active leads by contract type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contractTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contractTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Average Deal Size</div>
              <div className="text-xl font-bold">₹{(avgDealSize / 100000).toFixed(1)}L</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Deals Won</div>
              <div className="text-xl font-bold text-green-600">{wonLeads}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Deals Lost</div>
              <div className="text-xl font-bold text-red-600">{lostLeads}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
