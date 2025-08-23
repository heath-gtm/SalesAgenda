import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Users, 
  Search, 
  TrendingUp, 
  Settings, 
  Plus,
  LogOut
} from "lucide-react";
import { format } from "date-fns";

interface SidebarProps {
  onAddMeeting: () => void;
  selectedDate: Date;
}

export default function Sidebar({ onAddMeeting, selectedDate }: SidebarProps) {
  const { user } = useAuth();

  const { data: dailyGoal } = useQuery({
    queryKey: ["/api/daily-goals", format(selectedDate, "yyyy-MM-dd")],
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const progressPercentage = dailyGoal ? 
    Math.round(((dailyGoal.newProspectsCompleted + dailyGoal.linkedinConnectionsCompleted + dailyGoal.followUpMeetingsCompleted) / 
    (dailyGoal.newProspects + dailyGoal.linkedinConnections + dailyGoal.followUpMeetings)) * 100) : 0;

  return (
    <div className="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col">
      {/* User Profile Section */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {user?.firstName?.[0] || user?.email?.[0] || "U"}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800" data-testid="text-user-name">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
            </h3>
            <p className="text-sm text-slate-600" data-testid="text-user-role">
              {user?.role || "Sales Rep"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button className="w-full flex items-center space-x-3 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg font-medium text-left"
                    data-testid="nav-today">
              <Calendar className="w-5 h-5" />
              <span>Today's Plan</span>
            </button>
          </li>
          <li>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-left"
                    data-testid="nav-meetings">
              <Users className="w-5 h-5" />
              <span>Meetings</span>
            </button>
          </li>
          <li>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-left"
                    data-testid="nav-prospects">
              <Search className="w-5 h-5" />
              <span>Prospects</span>
            </button>
          </li>
          <li>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-left"
                    data-testid="nav-analytics">
              <TrendingUp className="w-5 h-5" />
              <span>Analytics</span>
            </button>
          </li>
          <li>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-left"
                    data-testid="nav-settings">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </li>
        </ul>
      </nav>
      
      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-200">
        <Button 
          onClick={onAddMeeting}
          className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center justify-center space-x-2 mb-3"
          data-testid="button-add-meeting"
        >
          <Plus className="w-4 h-4" />
          <span>Add Meeting</span>
        </Button>
        
        {/* Daily Progress */}
        <div className="p-3 bg-slate-100 rounded-lg mb-3">
          <div className="text-xs text-slate-600 mb-1">Today's Progress</div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-success-600 font-medium" data-testid="text-progress-completed">
              {dailyGoal ? 
                `${dailyGoal.newProspectsCompleted + dailyGoal.linkedinConnectionsCompleted + dailyGoal.followUpMeetingsCompleted} of ${dailyGoal.newProspects + dailyGoal.linkedinConnections + dailyGoal.followUpMeetings}` 
                : "0 of 0"}
            </span>
            <span className="text-slate-500">goals</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2" 
            data-testid="progress-daily"
          />
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center justify-center space-x-2"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
