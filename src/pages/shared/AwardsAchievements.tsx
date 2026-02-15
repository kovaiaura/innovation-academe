import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAwardsAchievements } from '@/hooks/useAwardsAchievements';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Calendar, Download, Search, Trophy, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const typeBadgeVariant = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'award': return 'default';
    case 'participation': return 'secondary';
    case 'achievement': return 'outline';
    default: return 'secondary';
  }
};

export default function AwardsAchievements() {
  const { user } = useAuth();
  const { data: achievements, isLoading } = useAwardsAchievements();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const showInstitution = user?.role === 'super_admin' || user?.role === 'system_admin';

  const filtered = (achievements || []).filter((a) => {
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.project_title.toLowerCase().includes(search.toLowerCase()) ||
      a.student_names.some(n => n.toLowerCase().includes(search.toLowerCase())) ||
      (a.event_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || a.type?.toLowerCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Awards & Achievements
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'student'
              ? 'Your project awards and achievements'
              : 'Project awards and achievements across your institution'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, project, student, or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="award">Award</SelectItem>
              <SelectItem value="participation">Participation</SelectItem>
              <SelectItem value="achievement">Achievement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{(achievements || []).length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{(achievements || []).filter(a => a.type === 'award').length}</p>
                <p className="text-xs text-muted-foreground">Awards</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary/70" />
              <div>
                <p className="text-2xl font-bold">{(achievements || []).filter(a => a.type === 'participation').length}</p>
                <p className="text-xs text-muted-foreground">Participations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary/50" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set((achievements || []).map(a => a.event_name).filter(Boolean)).size}
                </p>
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading achievements...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No awards or achievements found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <Card key={a.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{a.title}</CardTitle>
                    <Badge variant={typeBadgeVariant(a.type)} className="shrink-0 capitalize">
                      {a.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {/* Project */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-4 w-4 shrink-0" />
                    <span className="truncate">{a.project_title}</span>
                  </div>

                  {/* Event */}
                  {a.event_name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {a.event_name}
                        {a.event_date && ` · ${format(new Date(a.event_date), 'dd MMM yyyy')}`}
                      </span>
                    </div>
                  )}

                  {/* Students */}
                  {a.student_names.length > 0 && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{a.student_names.join(', ')}</span>
                    </div>
                  )}

                  {/* Institution (CEO view) */}
                  {showInstitution && a.institution_name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">{a.institution_name}</span>
                    </div>
                  )}

                  {/* Description */}
                  {a.description && (
                    <p className="text-muted-foreground line-clamp-2">{a.description}</p>
                  )}

                  {/* Certificate */}
                  {a.certificate_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      asChild
                    >
                      <a href={a.certificate_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        View Certificate
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
