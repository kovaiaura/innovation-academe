import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'Springfield Univ', students: 5420, teachers: 248, revenue: 425000 },
  { name: 'River College', students: 3200, teachers: 145, revenue: 285000 },
  { name: 'Oakwood Inst', students: 2100, teachers: 92, revenue: 178000 },
  { name: 'Tech Valley', students: 1800, teachers: 78, revenue: 165000 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function CustomAnalytics() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['students', 'teachers']);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [dateRange, setDateRange] = useState('month');

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    );
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    toast.success(`Exporting custom report as ${format.toUpperCase()}...`);
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedMetrics.includes('students') && <Bar dataKey="students" fill={COLORS[0]} />}
              {selectedMetrics.includes('teachers') && <Bar dataKey="teachers" fill={COLORS[1]} />}
              {selectedMetrics.includes('revenue') && (
                <Bar dataKey="revenue" fill={COLORS[2]} name="Revenue ($)" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedMetrics.includes('students') && (
                <Line type="monotone" dataKey="students" stroke={COLORS[0]} strokeWidth={2} />
              )}
              {selectedMetrics.includes('teachers') && (
                <Line type="monotone" dataKey="teachers" stroke={COLORS[1]} strokeWidth={2} />
              )}
              {selectedMetrics.includes('revenue') && (
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS[2]}
                  strokeWidth={2}
                  name="Revenue ($)"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        const pieMetric = selectedMetrics[0] || 'students';
        const pieData = mockData.map((item) => ({
          name: item.name,
          value: item[pieMetric as keyof typeof item] as number,
        }));
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Custom Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Build and export custom reports with selected metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button onClick={() => handleExport('pdf')}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Customize your analytics report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Select Metrics</Label>
                <div className="space-y-3">
                  {[
                    { id: 'students', label: 'Student Count' },
                    { id: 'teachers', label: 'Teacher Count' },
                    { id: 'revenue', label: 'Revenue' },
                  ].map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric.id}
                        checked={selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => handleMetricToggle(metric.id)}
                      />
                      <label
                        htmlFor={metric.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {metric.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="chart-type">Chart Type</Label>
                <Select value={chartType} onValueChange={(v) => setChartType(v as any)}>
                  <SelectTrigger id="chart-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Bar Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="line">
                      <div className="flex items-center gap-2">
                        <LineChartIcon className="h-4 w-4" />
                        Line Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="pie">
                      <div className="flex items-center gap-2">
                        <PieChartIcon className="h-4 w-4" />
                        Pie Chart
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date-range">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger id="date-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Analytics Visualization</CardTitle>
              <CardDescription>
                {selectedMetrics.length > 0
                  ? `Showing ${selectedMetrics.join(', ')} data`
                  : 'Select metrics to visualize'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedMetrics.length > 0 ? (
                renderChart()
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  Select at least one metric to display the chart
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Summary</CardTitle>
            <CardDescription>Raw data for selected metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Institution</th>
                    {selectedMetrics.includes('students') && (
                      <th className="text-right py-2 px-4">Students</th>
                    )}
                    {selectedMetrics.includes('teachers') && (
                      <th className="text-right py-2 px-4">Teachers</th>
                    )}
                    {selectedMetrics.includes('revenue') && (
                      <th className="text-right py-2 px-4">Revenue</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {mockData.map((row) => (
                    <tr key={row.name} className="border-b">
                      <td className="py-2 px-4 font-medium">{row.name}</td>
                      {selectedMetrics.includes('students') && (
                        <td className="text-right py-2 px-4">{row.students.toLocaleString()}</td>
                      )}
                      {selectedMetrics.includes('teachers') && (
                        <td className="text-right py-2 px-4">{row.teachers}</td>
                      )}
                      {selectedMetrics.includes('revenue') && (
                        <td className="text-right py-2 px-4">${row.revenue.toLocaleString()}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
