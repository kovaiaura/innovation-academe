import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { SalesLead, stageConfig } from '@/data/mockSalesPipeline';
import { LeadCard } from './LeadCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndianRupee } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface SalesPipelineBoardProps {
  leads: SalesLead[];
  onLeadMove: (leadId: string, newStage: SalesLead['stage']) => void;
  onViewDetails: (lead: SalesLead) => void;
}

export function SalesPipelineBoard({ leads, onLeadMove, onViewDetails }: SalesPipelineBoardProps) {
  const stages = Object.keys(stageConfig).filter(stage => stage !== 'lost') as SalesLead['stage'][];
  
  const getLeadsByStage = (stage: SalesLead['stage']) => {
    return leads.filter(lead => lead.stage === stage && lead.status === 'active');
  };

  const getStageValue = (stage: SalesLead['stage']) => {
    const stageLeads = getLeadsByStage(stage);
    return stageLeads.reduce((sum, lead) => sum + lead.estimated_deal_value, 0);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const leadId = result.draggableId;
    const newStage = result.destination.droppableId as SalesLead['stage'];
    
    onLeadMove(leadId, newStage);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 p-1 min-w-max">
          {stages.map((stage) => {
            const stageLeads = getLeadsByStage(stage);
            const stageValue = getStageValue(stage);
            const config = stageConfig[stage];

            return (
              <div key={stage} className="flex-shrink-0 w-80">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${config.color}`} />
                        {config.label}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {stageLeads.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <IndianRupee className="h-3.5 w-3.5" />
                      <span className="font-semibold">₹{(stageValue / 100000).toFixed(1)}L</span>
                    </div>
                  </CardHeader>
                  
                  <Droppable droppableId={stage}>
                    {(provided, snapshot) => (
                      <CardContent
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[400px] ${
                          snapshot.isDraggingOver ? 'bg-accent/50' : ''
                        }`}
                      >
                        {stageLeads.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={snapshot.isDragging ? 'opacity-50' : ''}
                              >
                                <LeadCard lead={lead} onViewDetails={onViewDetails} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {stageLeads.length === 0 && (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            No leads in this stage
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Droppable>
                </Card>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </DragDropContext>
  );
}
