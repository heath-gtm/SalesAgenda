import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { insertMeetingSchema, type Meeting } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

const formSchema = insertMeetingSchema.omit({ userId: true }).extend({
  scheduledAt: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface EditMeetingModalProps {
  meeting: Meeting;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMeetingModal({ meeting, onClose, onSuccess }: EditMeetingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: meeting.title,
      type: meeting.type,
      scheduledAt: format(meeting.scheduledAt, "yyyy-MM-dd'T'HH:mm"),
      duration: meeting.duration || 60,
      companyId: meeting.companyId,
      agenda: meeting.agenda || "",
      notes: meeting.notes || "",
      dealSize: meeting.dealSize || "$0-$25K",
      priority: meeting.priority || "Medium",
      stage: meeting.stage || "Discovery",
      competitiveSituation: meeting.competitiveSituation || "",
      painPoints: meeting.painPoints || [],
      opportunityAreas: meeting.opportunityAreas || [],
      nextSteps: meeting.nextSteps || [],
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
    retry: false,
  });

  const updateMeetingMutation = useMutation({
    mutationFn: async (meetingData: any) => {
      const response = await apiRequest("PUT", `/api/meetings/${meeting.id}`, meetingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      toast({
        title: "Success",
        description: "Meeting updated successfully",
      });
      onSuccess();
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
        description: "Failed to update meeting",
        variant: "destructive",
      });
    },
  });

  const deleteMeetingMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/meetings/${meeting.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });
      onSuccess();
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
        description: "Failed to delete meeting",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    const meetingData = {
      ...data,
      scheduledAt: new Date(data.scheduledAt),
      painPoints: data.painPoints || [],
      opportunityAreas: data.opportunityAreas || [],
      nextSteps: data.nextSteps || [],
    };

    await updateMeetingMutation.mutateAsync(meetingData);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      deleteMeetingMutation.mutate();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-meeting">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-slate-800">Edit Meeting</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
              data-testid="button-close-edit-modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        data-testid="input-edit-scheduled-at"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="45">45</SelectItem>
                        <SelectItem value="60">60</SelectItem>
                        <SelectItem value="90">90</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter meeting title" 
                      {...field}
                      data-testid="input-edit-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-company">
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((company: any) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meeting Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Discovery">Discovery Call</SelectItem>
                        <SelectItem value="Demo">Product Demo</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Contract">Contract Discussion</SelectItem>
                        <SelectItem value="Technical">Technical Deep-dive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dealSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-deal-size">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="$0-$25K">$0-$25K</SelectItem>
                        <SelectItem value="$25K-$50K">$25K-$50K</SelectItem>
                        <SelectItem value="$50K-$100K">$50K-$100K</SelectItem>
                        <SelectItem value="$100K+">$100K+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="agenda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Agenda/Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Enter meeting agenda, notes, or preparation items"
                      {...field}
                      data-testid="textarea-edit-agenda"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="competitiveSituation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competitive Situation (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Outreach, HubSpot" 
                      {...field}
                      data-testid="input-edit-competitive-situation"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal Stage</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-stage">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Discovery">Discovery</SelectItem>
                      <SelectItem value="Demo">Demo</SelectItem>
                      <SelectItem value="Proposal">Proposal</SelectItem>
                      <SelectItem value="Negotiation">Negotiation</SelectItem>
                      <SelectItem value="Closing">Closing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                disabled={updateMeetingMutation.isPending}
                className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium"
                data-testid="button-update-meeting"
              >
                {updateMeetingMutation.isPending ? "Updating..." : "Update Meeting"}
              </Button>
              <Button 
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMeetingMutation.isPending}
                className="px-6 py-2"
                data-testid="button-delete-meeting"
              >
                {deleteMeetingMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
