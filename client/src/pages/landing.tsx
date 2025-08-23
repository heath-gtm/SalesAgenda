import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Target, TrendingUp, CheckCircle, Clock } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-slate-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-xl mx-auto mb-6 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
              Sales Day Planner
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              The comprehensive sales management platform that helps you plan your day, 
              track prospects, and optimize every selling moment.
            </p>
          </div>
          
          <div className="flex justify-center gap-4 mb-12">
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3"
              data-testid="button-login"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>

          {/* Feature Preview */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <img 
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600" 
              alt="Professional dashboard interface preview"
              className="w-full h-80 object-cover rounded-xl mb-6"
            />
            <p className="text-slate-600">
              Professional dashboard with timeline view, meeting management, and intelligent prospect tracking
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-success-600" />
              </div>
              <CardTitle className="text-xl">Meeting Management</CardTitle>
              <CardDescription>
                Organize meetings with detailed prospect information, discovery questions, and follow-up actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Company & contact tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Pre-meeting preparation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Automated follow-up reminders</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
              <CardTitle className="text-xl">Time Blocking</CardTitle>
              <CardDescription>
                Visual timeline with smart time blocks for prospecting, prep, and administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Morning & evening prospecting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Meeting preparation time</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Administrative blocks</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-warning-600" />
              </div>
              <CardTitle className="text-xl">Smart Discovery</CardTitle>
              <CardDescription>
                AI-generated discovery questions tailored to each prospect and meeting type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Industry-specific questions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Competitive intelligence</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Pain point identification</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-error-600" />
              </div>
              <CardTitle className="text-xl">Daily Goals</CardTitle>
              <CardDescription>
                Track prospecting targets and daily objectives with progress monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>New prospect tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>LinkedIn connection goals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Follow-up completion</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Professional Results</CardTitle>
              <CardDescription>
                Join thousands of sales professionals who have transformed their daily workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary-600 mb-2">50%</div>
                  <div className="text-sm text-slate-600">Faster meeting prep</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success-600 mb-2">100%</div>
                  <div className="text-sm text-slate-600">Follow-up completion</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-warning-600 mb-2">3x</div>
                  <div className="text-sm text-slate-600">Better conversion</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-slate-800 rounded-2xl p-12 max-w-4xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Sales Process?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Start planning your sales success today with our comprehensive day planner
            </p>
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3"
              data-testid="button-cta-login"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
