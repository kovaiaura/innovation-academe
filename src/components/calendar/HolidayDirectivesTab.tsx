import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Search, Download } from 'lucide-react';
import { mockHolidays } from '@/data/mockCalendarData';
import { Holiday } from '@/types/calendar';
import { exportHolidaysToCSV } from '@/utils/calendarHelpers';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function HolidayDirectivesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [holidays] = useState<Holiday[]>(mockHolidays);

  const filteredHolidays = holidays.filter((holiday) => {
    const matchesSearch = holiday.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || holiday.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const nationalHolidays = holidays.filter((h) => h.type === 'national').length;
  const institutionHolidays = holidays.filter((h) => h.type === 'institution').length;

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      national: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500',
      regional: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500',
      institution: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500',
      optional: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500',
    };
    return colors[type as keyof typeof colors] || colors.national;
  };

  const handleExport = () => {
    exportHolidaysToCSV(filteredHolidays);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Holidays</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{holidays.length}</div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">National Holidays</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nationalHolidays}</div>
            <p className="text-xs text-muted-foreground">Applicable to all</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Institution-specific</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{institutionHolidays}</div>
            <p className="text-xs text-muted-foreground">Custom holidays</p>
          </CardContent>
        </Card>
      </div>

      {/* Holiday Management */}
      <Card>
        <CardHeader>
          <CardTitle>Holiday Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search holidays..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="institution">Institution-specific</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Holiday
              </Button>
            </div>
          </div>

          {/* Holidays Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Holiday Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Applicable To</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHolidays.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No holidays found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHolidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">{holiday.name}</TableCell>
                      <TableCell>
                        {format(new Date(holiday.date), 'MMM dd, yyyy')}
                        {holiday.end_date && (
                          <> - {format(new Date(holiday.end_date), 'MMM dd, yyyy')}</>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${getTypeBadgeColor(holiday.type)}`}>
                          {holiday.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {holiday.applicable_to.length === 0
                          ? 'All Institutions'
                          : `${holiday.applicable_to.length} Institution(s)`}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {holiday.description || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
