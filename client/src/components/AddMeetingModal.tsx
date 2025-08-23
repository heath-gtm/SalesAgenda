import { useState } from "react";
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
import { insertMeetingSchema, insertCompanySchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

const formSchema = insertMeetingSchema.omit({ userId: true }).extend({
  // Make scheduledAt a string for the datetime-local input
  scheduledAt: z.string(),
  // Optional company creation fields
  newCompanyName: z.string().optional(),
  newCompanyWebsite: z.string().optional(),
  newCompanySize: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddMeetingModalProps {
  selectedDate: Date;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMeetingModal({ selectedDate, onClose, onSuccess }: AddMeetingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewCompany, setShowNewCompany] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "Discovery",
      scheduledAt: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
      duration: 60,
      agenda: "",
      notes: "",
      dealSize: "$0-$25K",
      priority: "Medium",
      stage: "Discovery",
      competitiveSituation: "",
      painPoints: [],
      opportunityAreas: [],
      nextSteps: [],
      newCompanyName: "",
      newCompanyWebsite: "",
      newCompanySize: "",
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
    retry: false,
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: { name: string; website?: string; size?: string }) => {
      const response = await apiRequest("POST", "/api/companies", companyData);
      return response.json();
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
        description: "Failed to create company",
        variant: "destructive",
      });
    },
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData: any) => {
      const response = await apiRequest("POST", "/api/meetings", meetingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      toast({
        title: "Success",
        description: "Meeting created successfully",
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
        description: "Failed to create meeting",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      let companyId = data.companyId;

      // Create new company if needed
      if (showNewCompany && data.newCompanyName) {
        const newCompany = await createCompanyMutation.mutateAsync({
          name: data.newCompanyName,
          website: data.newCompanyWebsite,
          size: data.newCompanySize,
        });
        companyId = newCompany.id;
      }

      // Create meeting
      const meetingData = {
        ...data,
        companyId,
        scheduledAt: new Date(data.scheduledAt),
        painPoints: data.painPoints || [],
        opportunityAreas: data.opportunityAreas || [],
        nextSteps: data.nextSteps || [],
      };

      // Remove company creation fields
      delete meetingData.newCompanyName;
      delete meetingData.newCompanyWebsite;
      delete meetingData.newCompanySize;

      await createMeetingMutation.mutateAsync(meetingData);
    } catch (error) {
      // Error handling is done in mutation onError callbacks
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-add-meeting">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-slate-800">Add New Meeting</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
              data-testid="button-close-modal"
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
                        data-testid="input-scheduled-at"
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
                        <SelectTrigger data-testid="select-duration">
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
                      placeholder="Enter meeting title (e.g., TechCorp - Product Demo)" 
                      {...field}
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Company</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewCompany(!showNewCompany)}
                  data-testid="button-toggle-new-company"
                >
                  {showNewCompany ? "Select Existing" : "Add New Company"}
                </Button>
              </div>

              {showNewCompany ? (
                <div className="space-y-3 border border-slate-200 rounded-lg p-3">
                  <FormField
                    control={form.control}
                    name="newCompanyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter company name" 
                            {...field}
                            data-testid="input-new-company-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="newCompanyWebsite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://company.com" 
                              {...field}
                              data-testid="input-new-company-website"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="newCompanySize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Series B, 200+ employees" 
                              {...field}
                              data-testid="input-new-company-size"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company">
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
              )}
            </div>

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
                        <SelectTrigger data-testid="select-type">
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
                        <SelectTrigger data-testid="select-deal-size">
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
                        <SelectTrigger data-testid="select-priority">
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
                      data-testid="textarea-agenda"
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
                      data-testid="input-competitive-situation"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                disabled={createMeetingMutation.isPending || createCompanyMutation.isPending}
                className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium"
                data-testid="button-create-meeting"
              >
                {(createMeetingMutation.isPending || createCompanyMutation.isPending) ? "Creating..." : "Create Meeting"}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                data-testid="button-cancel"
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
