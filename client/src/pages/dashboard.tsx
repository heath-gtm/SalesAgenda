import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import TimelineView from "@/components/TimelineView";
import DetailPanel from "@/components/DetailPanel";
import AddMeetingModal from "@/components/AddMeetingModal";
import EditMeetingModal from "@/components/EditMeetingModal";
import type { Meeting } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [showEditMeeting, setShowEditMeeting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const handleMeetingSelect = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowEditMeeting(true);
  };

  const handleClosePanels = () => {
    setSelectedMeeting(null);
    setShowAddMeeting(false);
    setShowEditMeeting(false);
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Left Sidebar */}
      <Sidebar 
        onAddMeeting={() => setShowAddMeeting(true)}
        selectedDate={selectedDate}
        data-testid="sidebar-main"
      />

      {/* Center Timeline View */}
      <TimelineView
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onMeetingSelect={handleMeetingSelect}
        onEditMeeting={handleEditMeeting}
        selectedMeeting={selectedMeeting}
        data-testid="timeline-view"
      />

      {/* Right Detail Panel */}
      {selectedMeeting && (
        <DetailPanel
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onEdit={() => setShowEditMeeting(true)}
          data-testid="detail-panel"
        />
      )}

      {/* Modals */}
      {showAddMeeting && (
        <AddMeetingModal
          selectedDate={selectedDate}
          onClose={() => setShowAddMeeting(false)}
          onSuccess={handleClosePanels}
          data-testid="modal-add-meeting"
        />
      )}

      {showEditMeeting && selectedMeeting && (
        <EditMeetingModal
          meeting={selectedMeeting}
          onClose={() => setShowEditMeeting(false)}
          onSuccess={handleClosePanels}
          data-testid="modal-edit-meeting"
        />
      )}
    </div>
  );
}
