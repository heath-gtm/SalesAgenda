import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Download, 
  Eye, 
  Users, 
  DollarSign, 
  Building,
  CheckCircle,
  Calendar,
  Clock,
  AlertTriangle,
  Target
} from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import type { Meeting, ActionItem, TimeBlock, DailyGoal } from "@shared/schema";
import { generatePDF } from "@/lib/pdfExport";

interface TimelineViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onMeetingSelect: (meeting: Meeting) => void;
  onEditMeeting: (meeting: Meeting) => void;
  selectedMeeting?: Meeting | null;
}

export default function TimelineView({ 
  selectedDate, 
  onMeetingSelect, 
  onEditMeeting, 
  selectedMeeting 
}: TimelineViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ["/api/meetings", dateStr],
    retry: false,
  });

  const { data: timeBlocks = [] } = useQuery({
    queryKey: ["/api/timeblocks", dateStr],
    retry: false,
  });

  const { data: actionItems = [] } = useQuery({
    queryKey: ["/api/action-items", dateStr],
    retry: false,
  });

  const { data: dailyGoal } = useQuery({
    queryKey: ["/api/daily-goals", dateStr],
    retry: false,
  });

  const updateActionItemMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      await apiRequest("PUT", `/api/action-items/${id}`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/action-items"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update action item",
        variant: "destructive",
      });
    },
  });

  const handleExportPDF = async () => {
    try {
      await generatePDF({
        date: selectedDate,
        meetings,
        timeBlocks,
        actionItems,
        dailyGoal
      });
      toast({
        title: "Success",
        description: "Daily agenda exported to PDF",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const handleToggleActionItem = (id: string, isCompleted: boolean) => {
    updateActionItemMutation.mutate({ id, isCompleted: !isCompleted });
  };

  const getMeetingBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'demo':
        return 'bg-success-100 text-success-700';
      case 'discovery':
        return 'bg-primary-100 text-primary-700';
      case 'follow-up':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getTimeBlockColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'prospecting':
        return 'bg-primary-50 border-l-4 border-primary-500';
      case 'admin':
        return 'bg-slate-100 border-l-4 border-slate-400';
      case 'prep':
        return 'bg-warning-50 border-l-4 border-warning-500';
      default:
        return 'bg-slate-100 border border-slate-200';
    }
  };

  const completedMeetings = meetings.filter(m => m.status === 'Completed').length;
  const totalMeetings = meetings.length;
  const pendingFollowUps = actionItems.filter(item => !item.isCompleted && item.type === 'follow-up').length;

  if (meetingsLoading) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800" data-testid="text-current-date">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h1>
            <p className="text-slate-600 mt-1" data-testid="text-daily-stats">
              {totalMeetings} meetings • {pendingFollowUps} follow-ups pending
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={handleExportPDF}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center space-x-2"
              data-testid="button-export-pdf"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </Button>
            <Button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-2"
              data-testid="button-print"
            >
              <Eye className="w-4 h-4" />
              <span>Print View</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            
            {/* Time Blocks and Meetings */}
            {[...timeBlocks, ...meetings]
              .sort((a, b) => {
                const aTime = 'startTime' in a ? a.startTime : format(a.scheduledAt, 'HH:mm');
                const bTime = 'startTime' in b ? b.startTime : format(b.scheduledAt, 'HH:mm');
                return aTime.localeCompare(bTime);
              })
              .map((item) => {
                const isTimeBlock = 'startTime' in item;
                
                if (isTimeBlock) {
                  const block = item as TimeBlock;
                  return (
                    <div key={block.id} className={`p-4 rounded-r-lg ${getTimeBlockColor(block.type)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-semibold text-slate-700">
                            {block.startTime} - {block.endTime}
                          </div>
                          <Badge className={`px-2 py-1 text-xs font-medium ${
                            block.type === 'prospecting' ? 'bg-primary-100 text-primary-700' :
                            block.type === 'prep' ? 'bg-warning-100 text-warning-700' :
                            'bg-slate-200 text-slate-600'
                          }`}>
                            {block.type.toUpperCase()}
                          </Badge>
                        </div>
                        {block.isCompleted && (
                          <CheckCircle className="w-4 h-4 text-success-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{block.description}</p>
                    </div>
                  );
                }
                
                const meeting = item as Meeting;
                const isSelected = selectedMeeting?.id === meeting.id;
                
                return (
                  <div 
                    key={meeting.id} 
                    className={`bg-white border ${isSelected ? 'border-primary-300 ring-2 ring-primary-100' : 'border-slate-200'} rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer`}
                    onClick={() => onMeetingSelect(meeting)}
                    data-testid={`card-meeting-${meeting.id}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-semibold text-slate-800">
                            {format(meeting.scheduledAt, 'h:mm a')}
                          </div>
                          <Badge className={`px-3 py-1 text-sm font-medium ${getMeetingBadgeColor(meeting.type)}`}>
                            {meeting.type.toUpperCase()}
                          </Badge>
                          {meeting.competitiveSituation && (
                            <Badge className="bg-error-100 px-2 py-1 text-xs font-medium text-error-700">
                              COMPETITIVE
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-500">{meeting.duration} min</div>
                      </div>
                      
                      <div className="mt-3">
                        <h3 className="font-semibold text-slate-800 text-lg" data-testid={`text-meeting-title-${meeting.id}`}>
                          {meeting.title}
                        </h3>
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                          {meeting.dealSize && (
                            <span className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{meeting.dealSize}</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1">
                            <Building className="w-4 h-4" />
                            <span>{meeting.stage}</span>
                          </span>
                          {meeting.priority && (
                            <Badge variant={meeting.priority === 'High' ? 'destructive' : 'secondary'}>
                              {meeting.priority}
                            </Badge>
                          )}
                        </div>
                        
                        {meeting.painPoints && meeting.painPoints.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {meeting.painPoints.slice(0, 3).map((point, index) => (
                              <span key={index} className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">
                                {point}
                              </span>
                            ))}
                            {meeting.painPoints.length > 3 && (
                              <span className="text-xs text-slate-500">+{meeting.painPoints.length - 3} more</span>
                            )}
                          </div>
                        )}

                        {meeting.competitiveSituation && (
                          <div className="mt-2 flex items-center space-x-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-error-500" />
                            <span className="text-error-600">vs {meeting.competitiveSituation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Daily Summary */}
            <div className="mt-8 bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-primary-500" />
                <span>Daily Action Items</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Pre-Meeting Prep</h4>
                  <ul className="space-y-1 text-sm">
                    {actionItems
                      .filter(item => item.type === 'prep')
                      .map(item => (
                        <li key={item.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={item.isCompleted}
                            onCheckedChange={() => handleToggleActionItem(item.id, item.isCompleted)}
                            data-testid={`checkbox-action-${item.id}`}
                          />
                          <span className={item.isCompleted ? "text-slate-600 line-through" : "text-slate-600"}>
                            {item.title}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Follow-up Actions</h4>
                  <ul className="space-y-1 text-sm">
                    {actionItems
                      .filter(item => item.type === 'follow-up')
                      .map(item => (
                        <li key={item.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={item.isCompleted}
                            onCheckedChange={() => handleToggleActionItem(item.id, item.isCompleted)}
                            data-testid={`checkbox-followup-${item.id}`}
                          />
                          <span className={item.isCompleted ? "text-slate-600 line-through" : "text-slate-600"}>
                            {item.title}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
              
              {dailyGoal && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Daily Prospecting Goal</span>
                    <span className="font-medium text-slate-800" data-testid="text-prospecting-goal">
                      {dailyGoal.newProspectsCompleted} of {dailyGoal.newProspects} new prospects
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (dailyGoal.newProspectsCompleted / dailyGoal.newProspects) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
