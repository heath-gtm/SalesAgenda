import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Edit, 
  Copy, 
  Building, 
  Users, 
  AlertTriangle, 
  Target, 
  CheckSquare,
  ExternalLink
} from "lucide-react";
import type { Meeting, Company, Contact } from "@shared/schema";
import { getDiscoveryQuestions } from "@/lib/discoveryQuestions";

interface DetailPanelProps {
  meeting: Meeting;
  onClose: () => void;
  onEdit: () => void;
}

export default function DetailPanel({ meeting, onClose, onEdit }: DetailPanelProps) {
  const { data: company } = useQuery<Company>({
    queryKey: ["/api/companies", meeting.companyId],
    retry: false,
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/companies", meeting.companyId, "contacts"],
    retry: false,
  });

  const discoveryQuestions = getDiscoveryQuestions(meeting.type, company?.industry);
  const attendees = contacts.filter(contact => 
    meeting.attendeeIds?.includes(contact.id)
  );

  return (
    <div className="w-80 bg-white shadow-lg border-l border-slate-200 overflow-hidden flex flex-col">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Meeting Intelligence</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            data-testid="button-close-detail"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          
          {/* Meeting Info */}
          <div>
            <h4 className="font-medium text-slate-800 mb-2">{meeting.title}</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={`px-2 py-1 text-xs ${
                meeting.type === 'Demo' ? 'bg-success-100 text-success-700' :
                meeting.type === 'Discovery' ? 'bg-primary-100 text-primary-700' :
                meeting.type === 'Follow-up' ? 'bg-warning-100 text-warning-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {meeting.type}
              </Badge>
              {meeting.priority && (
                <Badge variant={meeting.priority === 'High' ? 'destructive' : 'secondary'}>
                  {meeting.priority}
                </Badge>
              )}
              {meeting.dealSize && (
                <Badge variant="outline">
                  {meeting.dealSize}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Company Overview */}
          {company && (
            <div>
              <h4 className="font-medium text-slate-800 mb-2 flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Company Overview</span>
              </h4>
              <div className="bg-slate-50 p-3 rounded-lg text-sm">
                <div className="font-medium text-slate-700 mb-1">{company.name}</div>
                {company.size && (
                  <div className="text-slate-600 mb-2">{company.size}</div>
                )}
                {company.overview && (
                  <p className="text-slate-600 text-xs leading-relaxed">{company.overview}</p>
                )}
                {company.website && (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-xs mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Visit website</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Key Stakeholders */}
          {attendees.length > 0 && (
            <div>
              <h4 className="font-medium text-slate-800 mb-2 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Key Stakeholders</span>
              </h4>
              <div className="space-y-2">
                {attendees.map(contact => (
                  <div key={contact.id} className="flex items-center space-x-3 p-2 bg-slate-50 rounded">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-xs font-semibold">
                        {contact.firstName[0]}{contact.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-slate-800">
                        {contact.firstName} {contact.lastName}
                      </div>
                      {contact.title && (
                        <div className="text-xs text-slate-600">{contact.title}</div>
                      )}
                    </div>
                    {contact.linkedinUrl && (
                      <a 
                        href={contact.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-600"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discovery Questions */}
          <div>
            <h4 className="font-medium text-slate-800 mb-2 flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Discovery Questions</span>
            </h4>
            <div className="space-y-2">
              {discoveryQuestions.slice(0, 3).map((question, index) => (
                <div key={index} className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-700 font-medium mb-1">
                    "{question.question}"
                  </p>
                  <div className="text-xs text-primary-600">
                    Focus: {question.focus}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitive Intelligence */}
          {meeting.competitiveSituation && (
            <div>
              <h4 className="font-medium text-slate-800 mb-2 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-error-500" />
                <span>Competitive Intelligence</span>
              </h4>
              <div className="bg-error-50 border border-error-200 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-error-500" />
                  <span className="font-medium text-error-700 text-sm">
                    {meeting.competitiveSituation} in play
                  </span>
                </div>
                <div className="text-xs text-error-600">
                  <strong>Strategy:</strong> Focus on unique value proposition and differentiation points
                </div>
              </div>
            </div>
          )}

          {/* Opportunity Areas */}
          {meeting.opportunityAreas && meeting.opportunityAreas.length > 0 && (
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Opportunity Areas</h4>
              <div className="space-y-2">
                {meeting.opportunityAreas.map((area, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span className="text-slate-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {meeting.nextSteps && meeting.nextSteps.length > 0 && (
            <div>
              <h4 className="font-medium text-slate-800 mb-2 flex items-center space-x-2">
                <CheckSquare className="w-4 h-4" />
                <span>Next Steps</span>
              </h4>
              <div className="space-y-2">
                {meeting.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-4 h-4 border border-slate-300 rounded mt-1"></div>
                    <div className="text-sm">
                      <div className="text-slate-700">{step}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Notes */}
          {meeting.notes && (
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Notes</h4>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{meeting.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-slate-200 p-4">
        <div className="space-y-2">
          <Button 
            onClick={onEdit}
            className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center justify-center space-x-2"
            data-testid="button-edit-meeting"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Meeting</span>
          </Button>
          <Button 
            variant="outline"
            className="w-full border border-slate-300 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors font-medium flex items-center justify-center space-x-2"
            data-testid="button-duplicate-meeting"
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate Meeting</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
