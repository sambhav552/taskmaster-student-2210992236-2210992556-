import { useState } from 'react';
import { Task } from '@/types/task';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Sparkles,
  Lightbulb,
  ListOrdered,
  Layers,
  Loader2,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIAssistantProps {
  tasks: Task[];
}

export function AIAssistant({ tasks }: AIAssistantProps) {
  const {
    suggestion,
    isLoading,
    getSuggestions,
    getPrioritization,
    getBreakdown,
    clearSuggestion,
  } = useAIAssistant();

  const [showBreakdownDialog, setShowBreakdownDialog] = useState(false);
  const [breakdownTitle, setBreakdownTitle] = useState('');
  const [breakdownDescription, setBreakdownDescription] = useState('');

  const handleBreakdownSubmit = async () => {
    if (!breakdownTitle.trim()) return;
    setShowBreakdownDialog(false);
    await getBreakdown(breakdownTitle, breakdownDescription);
    setBreakdownTitle('');
    setBreakdownDescription('');
  };

  const incompleteTasks = tasks.filter((t) => t.status !== 'completed');

  return (
    <>
      <Card className="glass border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              AI Study Assistant
            </CardTitle>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Ask AI
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => getSuggestions(incompleteTasks)}
                  disabled={incompleteTasks.length === 0}
                >
                  <Lightbulb className="h-4 w-4 mr-2 text-warning" />
                  Get Productivity Tips
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => getPrioritization(incompleteTasks)}
                  disabled={incompleteTasks.length === 0}
                >
                  <ListOrdered className="h-4 w-4 mr-2 text-primary" />
                  Prioritize My Tasks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowBreakdownDialog(true)}>
                  <Layers className="h-4 w-4 mr-2 text-accent-foreground" />
                  Break Down a Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>AI is thinking...</span>
              </div>
            </div>
          ) : suggestion ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={clearSuggestion}
              >
                <X className="h-4 w-4" />
              </Button>
              <div
                className={cn(
                  'prose prose-sm max-w-none dark:prose-invert',
                  'bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-4',
                  'whitespace-pre-wrap'
                )}
              >
                {suggestion}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Click &quot;Ask AI&quot; to get personalized study tips and task suggestions! ✨
            </p>
          )}
        </CardContent>
      </Card>

      {/* Breakdown Dialog */}
      <Dialog open={showBreakdownDialog} onOpenChange={setShowBreakdownDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Break Down a Task
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                placeholder="e.g., Complete research paper"
                value={breakdownTitle}
                onChange={(e) => setBreakdownTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-desc">Description (optional)</Label>
              <Textarea
                id="task-desc"
                placeholder="Add any details about the task..."
                value={breakdownDescription}
                onChange={(e) => setBreakdownDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowBreakdownDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBreakdownSubmit}
                disabled={!breakdownTitle.trim()}
                className="gradient-hero"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Get Subtasks
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
