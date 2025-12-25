import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { holidayService } from '@/services/holiday.service';
import { HolidayCalendar } from '@/components/calendar/HolidayCalendar';
import { CreateHolidayInput } from '@/types/leave';

export default function CompanyHolidays() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ['company-holidays', currentYear],
    queryFn: () => holidayService.getCompanyHolidays(currentYear)
  });

  const createMutation = useMutation({
    mutationFn: holidayService.createCompanyHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-holidays'] });
      toast.success('Holiday added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateHolidayInput> }) => 
      holidayService.updateCompanyHoliday(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-holidays'] });
      toast.success('Holiday updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: holidayService.deleteCompanyHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-holidays'] });
      toast.success('Holiday deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Company Holidays</h1>
            <p className="text-muted-foreground">Manage holiday calendar for Meta staff</p>
          </div>
        </div>

        <HolidayCalendar
          holidays={holidays}
          isLoading={isLoading}
          onAddHoliday={(data) => createMutation.mutate(data)}
          onUpdateHoliday={(id, data) => updateMutation.mutate({ id, data })}
          onDeleteHoliday={(id) => deleteMutation.mutate(id)}
          allowedTypes={['company', 'national', 'optional']}
          title="Company Holiday Calendar"
          isMutating={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
        />
      </div>
    </Layout>
  );
}
