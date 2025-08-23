import { format } from "date-fns";
import type { Meeting, TimeBlock, ActionItem, DailyGoal } from "@shared/schema";

interface ExportData {
  date: Date;
  meetings: Meeting[];
  timeBlocks: TimeBlock[];
  actionItems: ActionItem[];
  dailyGoal?: DailyGoal | null;
}

export async function generatePDF(data: ExportData): Promise<void> {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window');
  }

  const { date, meetings, timeBlocks, actionItems, dailyGoal } = data;
  
  // Sort meetings by time
  const sortedMeetings = [...meetings].sort((a, b) => 
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  // Sort time blocks by start time
  const sortedTimeBlocks = [...timeBlocks].sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );

  // Combine and sort timeline items
  const timelineItems = [
    ...sortedTimeBlocks.map(block => ({
      type: 'timeblock' as const,
      time: block.startTime,
      data: block
    })),
    ...sortedMeetings.map(meeting => ({
      type: 'meeting' as const,
      time: format(meeting.scheduledAt, 'HH:mm'),
      data: meeting
    }))
  ].sort((a, b) => a.time.localeCompare(b.time));

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sales Day Planner - ${format(date, 'MMMM d, yyyy')}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          background: white;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #1565c0;
          padding-bottom: 20px;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1565c0;
          margin-bottom: 5px;
        }
        
        .header .date {
          font-size: 18px;
          color: #64748b;
          font-weight: 500;
        }
        
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
        }
        
        .summary-item {
          text-align: center;
        }
        
        .summary-item .number {
          font-size: 24px;
          font-weight: 700;
          color: #1565c0;
        }
        
        .summary-item .label {
          font-size: 14px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .timeline {
          margin-bottom: 30px;
        }
        
        .timeline h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #1e293b;
        }
        
        .timeline-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #e2e8f0;
        }
        
        .timeline-item.meeting {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-left: 4px solid #1565c0;
        }
        
        .timeline-item.timeblock {
          background: #f1f5f9;
          border-left: 4px solid #64748b;
        }
        
        .timeline-item.timeblock.prospecting {
          background: #e3f2fd;
          border-left-color: #1565c0;
        }
        
        .timeline-item.timeblock.prep {
          background: #fff3e0;
          border-left-color: #f57c00;
        }
        
        .time {
          font-weight: 700;
          font-size: 16px;
          color: #1e293b;
          min-width: 80px;
          margin-right: 15px;
        }
        
        .content {
          flex: 1;
        }
        
        .title {
          font-weight: 600;
          font-size: 16px;
          color: #1e293b;
          margin-bottom: 5px;
        }
        
        .details {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 8px;
        }
        
        .badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }
        
        .badge.demo {
          background: #e8f5e8;
          color: #2e7d32;
        }
        
        .badge.discovery {
          background: #e3f2fd;
          color: #1565c0;
        }
        
        .badge.follow-up {
          background: #fff3e0;
          color: #f57c00;
        }
        
        .badge.competitive {
          background: #ffebee;
          color: #c62828;
        }
        
        .badge.prospecting {
          background: #e3f2fd;
          color: #1565c0;
        }
        
        .badge.admin {
          background: #f1f5f9;
          color: #64748b;
        }
        
        .action-items {
          margin-top: 30px;
        }
        
        .action-items h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #1e293b;
        }
        
        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .action-section {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
        }
        
        .action-section h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #1e293b;
        }
        
        .action-list {
          list-style: none;
        }
        
        .action-list li {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .checkbox {
          width: 16px;
          height: 16px;
          border: 2px solid #d1d5db;
          border-radius: 3px;
          margin-right: 10px;
          display: inline-block;
        }
        
        .checkbox.checked {
          background: #1565c0;
          border-color: #1565c0;
          position: relative;
        }
        
        .checkbox.checked::after {
          content: '✓';
          color: white;
          font-size: 12px;
          position: absolute;
          top: -2px;
          left: 2px;
        }
        
        .completed {
          text-decoration: line-through;
          color: #9ca3af;
        }
        
        .goals {
          margin-top: 30px;
          padding: 20px;
          background: #f1f5f9;
          border-radius: 8px;
        }
        
        .goals h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #1e293b;
        }
        
        .goal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding: 10px;
          background: white;
          border-radius: 6px;
        }
        
        .goal-label {
          font-weight: 500;
          color: #1e293b;
        }
        
        .goal-progress {
          font-weight: 600;
          color: #1565c0;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .header {
            page-break-after: avoid;
          }
          
          .timeline-item {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Sales Day Planner</h1>
        <div class="date">${format(date, 'EEEE, MMMM d, yyyy')}</div>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <div class="number">${meetings.length}</div>
          <div class="label">Meetings</div>
        </div>
        <div class="summary-item">
          <div class="number">${timeBlocks.length}</div>
          <div class="label">Time Blocks</div>
        </div>
        <div class="summary-item">
          <div class="number">${actionItems.filter(item => !item.isCompleted).length}</div>
          <div class="label">Pending Actions</div>
        </div>
        ${dailyGoal ? `
        <div class="summary-item">
          <div class="number">${Math.round(((dailyGoal.newProspectsCompleted + dailyGoal.linkedinConnectionsCompleted + dailyGoal.followUpMeetingsCompleted) / (dailyGoal.newProspects + dailyGoal.linkedinConnections + dailyGoal.followUpMeetings)) * 100)}%</div>
          <div class="label">Goal Progress</div>
        </div>` : ''}
      </div>
      
      <div class="timeline">
        <h2>Daily Schedule</h2>
        ${timelineItems.map(item => {
          if (item.type === 'meeting') {
            const meeting = item.data as Meeting;
            return `
              <div class="timeline-item meeting">
                <div class="time">${format(meeting.scheduledAt, 'h:mm a')}</div>
                <div class="content">
                  <div class="title">${meeting.title}</div>
                  <div class="details">
                    ${meeting.duration} minutes • ${meeting.dealSize || 'TBD'} • ${meeting.stage}
                  </div>
                  <div class="badges">
                    <span class="badge ${meeting.type.toLowerCase()}">${meeting.type}</span>
                    ${meeting.competitiveSituation ? `<span class="badge competitive">vs ${meeting.competitiveSituation}</span>` : ''}
                  </div>
                  ${meeting.agenda ? `<div style="margin-top: 10px; font-size: 14px; color: #64748b;">${meeting.agenda}</div>` : ''}
                </div>
              </div>
            `;
          } else {
            const block = item.data as TimeBlock;
            return `
              <div class="timeline-item timeblock ${block.type.toLowerCase()}">
                <div class="time">${block.startTime} - ${block.endTime}</div>
                <div class="content">
                  <div class="title">${block.description}</div>
                  <div class="badges">
                    <span class="badge ${block.type.toLowerCase()}">${block.type.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            `;
          }
        }).join('')}
      </div>
      
      <div class="action-items">
        <h2>Action Items</h2>
        <div class="action-grid">
          <div class="action-section">
            <h3>Pre-Meeting Preparation</h3>
            <ul class="action-list">
              ${actionItems.filter(item => item.type === 'prep').map(item => `
                <li>
                  <span class="checkbox ${item.isCompleted ? 'checked' : ''}"></span>
                  <span class="${item.isCompleted ? 'completed' : ''}">${item.title}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          
          <div class="action-section">
            <h3>Follow-up Actions</h3>
            <ul class="action-list">
              ${actionItems.filter(item => item.type === 'follow-up').map(item => `
                <li>
                  <span class="checkbox ${item.isCompleted ? 'checked' : ''}"></span>
                  <span class="${item.isCompleted ? 'completed' : ''}">${item.title}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
      
      ${dailyGoal ? `
      <div class="goals">
        <h2>Daily Goals</h2>
        <div class="goal-item">
          <span class="goal-label">New Prospects</span>
          <span class="goal-progress">${dailyGoal.newProspectsCompleted} of ${dailyGoal.newProspects}</span>
        </div>
        <div class="goal-item">
          <span class="goal-label">LinkedIn Connections</span>
          <span class="goal-progress">${dailyGoal.linkedinConnectionsCompleted} of ${dailyGoal.linkedinConnections}</span>
        </div>
        <div class="goal-item">
          <span class="goal-label">Follow-up Meetings</span>
          <span class="goal-progress">${dailyGoal.followUpMeetingsCompleted} of ${dailyGoal.followUpMeetings}</span>
        </div>
      </div>` : ''}
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
