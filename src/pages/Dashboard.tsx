import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { Task, CreateTaskInput } from '@/types/task';
import { TaskList } from '@/components/TaskList';
import { TaskDialog } from '@/components/TaskDialog';
import { TaskStats } from '@/components/TaskStats';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  Plus,
  User,
  LogOut,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useEffect } from 'react';

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { tasks, isLoading: tasksLoading, createTask, updateTask, deleteTask } = useTasks();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCreateTask = async (input: CreateTaskInput) => {
    await createTask.mutateAsync(input);
    setIsDialogOpen(false);
  };

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, ...input });
      setEditingTask(null);
      setIsDialogOpen(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask.mutateAsync(id);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 gradient-hero rounded-xl">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">StudyFlow</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setEditingTask(null);
                  setIsDialogOpen(true);
                }}
                className="gap-2 gradient-hero hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Task</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="h-8 w-8 rounded-full gradient-hero flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Signed in</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">
              {greeting()}, {user.user_metadata?.full_name?.split(' ')[0] || 'Student'}!
            </h1>
          </div>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s on your plate today. Let&apos;s get things done!
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <TaskStats tasks={tasks} />
        </div>

        {/* Task List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
          <TaskList
            tasks={tasks}
            isLoading={tasksLoading}
            onUpdate={(id, updates) => updateTask.mutate({ id, ...updates })}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
          />
        </div>
      </main>

      {/* Task Dialog */}
      <TaskDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        isLoading={createTask.isPending || updateTask.isPending}
      />
    </div>
  );
};

export default Dashboard;
