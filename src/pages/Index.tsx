import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Brain,
  Bell,
  BarChart3,
  Zap,
} from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: CheckCircle2,
      title: 'Task Management',
      description: 'Create, organize, and track your assignments with ease.',
    },
    {
      icon: Brain,
      title: 'AI Assistant',
      description: 'Get smart suggestions to prioritize and manage tasks efficiently.',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Never miss a deadline with automated email notifications.',
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Visualize your productivity and stay motivated.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 gradient-hero rounded-xl">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">StudyFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="gradient-hero gap-2 hover:opacity-90">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Task Management</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
              Master Your Studies,
              <br />
              <span className="text-primary">One Task at a Time</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              The intelligent task manager designed for students. Stay organized, meet deadlines, and achieve your academic goals with AI-powered assistance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/auth">
                <Button size="lg" className="gradient-hero gap-2 text-lg px-8 hover:opacity-90 shadow-glow">
                  Start Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm">No credit card required</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {[
              { value: '10K+', label: 'Active Students' },
              { value: '50K+', label: 'Tasks Completed' },
              { value: '98%', label: 'Satisfaction Rate' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful features designed specifically for students to help you stay on top of your academic workload.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="p-3 gradient-hero rounded-xl w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="gradient-hero rounded-3xl p-12 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Boost Your Productivity?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
                Join thousands of students who are already achieving their academic goals with StudyFlow.
              </p>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 text-lg px-8"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 gradient-hero rounded-lg">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">StudyFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} StudyFlow. Built for students, by students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
