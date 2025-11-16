import { CheckCircle, Circle, XCircle } from 'lucide-react';
import { PurchaseRequest } from '@/types/inventory';
import { format } from 'date-fns';

interface PurchaseRequestTimelineProps {
  request: PurchaseRequest;
}

export function PurchaseRequestTimeline({ request }: PurchaseRequestTimelineProps) {
  const timelineEvents = [];

  // 1. Request Created
  timelineEvents.push({
    status: 'completed',
    title: 'Request Created',
    description: `${request.officer_name} submitted purchase request`,
    date: request.created_at,
  });

  // 2. System Admin Review (First Stage)
  if (request.status === 'pending_system_admin') {
    timelineEvents.push({
      status: 'pending',
      title: 'Pending System Admin Review',
      description: 'Waiting for initial approval from System Admin',
      date: null,
    });
  } else if (request.status === 'rejected_by_system_admin') {
    timelineEvents.push({
      status: 'rejected',
      title: 'Rejected by System Admin',
      description: request.system_admin_rejection_reason || 'Request was rejected',
      date: request.system_admin_reviewed_at,
    });
  } else {
    // System Admin approved - proceed to next stages
    timelineEvents.push({
      status: 'completed',
      title: 'Approved by System Admin',
      description: `${request.system_admin_reviewed_by_name || 'System Admin'} reviewed and forwarded to institution`,
      date: request.system_admin_reviewed_at,
      comments: request.system_admin_review_comments,
    });

    // 3. Institution Review (Second Stage)
    if (request.status === 'approved_by_system_admin' || request.status === 'pending_institution_approval') {
      timelineEvents.push({
        status: 'pending',
        title: 'Pending Institution Approval',
        description: 'Waiting for institution management review',
        date: null,
      });
    } else if (request.status === 'rejected_by_institution') {
      timelineEvents.push({
        status: 'rejected',
        title: 'Rejected by Institution',
        description: request.institution_rejection_reason || 'Request was rejected by institution',
        date: request.institution_approved_at,
      });
    } else {
      // Institution approved - proceed to fulfillment
      timelineEvents.push({
        status: 'completed',
        title: 'Approved by Institution',
        description: `${request.institution_approved_by_name || 'Institution'} approved the request`,
        date: request.institution_approved_at,
        comments: request.institution_comments,
      });

      // 4. Fulfillment Process (Third Stage)
      if (request.status === 'approved_by_institution') {
        timelineEvents.push({
          status: 'pending',
          title: 'Ready for Processing',
          description: 'Approved by all parties, ready for System Admin to process',
          date: null,
        });
      } else if (request.status === 'in_progress') {
        timelineEvents.push({
          status: 'completed',
          title: 'In Progress',
          description: `${request.system_admin_processed_by_name || 'System Admin'} is processing the order`,
          date: request.system_admin_processed_at,
          comments: request.system_admin_processing_comments,
        });
      } else if (request.status === 'fulfilled') {
        timelineEvents.push({
          status: 'completed',
          title: 'In Progress',
          description: `${request.system_admin_processed_by_name || 'System Admin'} processed the order`,
          date: request.system_admin_processed_at,
          comments: request.system_admin_processing_comments,
        });

        timelineEvents.push({
          status: 'completed',
          title: 'Fulfilled',
          description: 'Items delivered and added to inventory',
          date: request.fulfillment_date,
          comments: request.fulfillment_details,
        });
      }
    }
  }

  const getIcon = (status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === 'rejected') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {timelineEvents.map((event, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            {getIcon(event.status)}
            {index < timelineEvents.length - 1 && (
              <div className={`w-0.5 h-full min-h-[40px] ${event.status === 'completed' ? 'bg-green-500' : 'bg-border'}`} />
            )}
          </div>
          <div className="flex-1 pb-4">
            <h4 className="font-semibold text-sm">{event.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            {event.date && (
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(event.date), 'MMM dd, yyyy • hh:mm a')}
              </p>
            )}
            {event.comments && (
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <span className="font-medium">Comment: </span>
                {event.comments}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
