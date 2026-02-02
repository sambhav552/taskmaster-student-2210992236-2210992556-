import { useState } from 'react';
import { Task, Priority, Status } from '@/types/task';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, Clock, MoreVertical, Pencil, Trash2, Flag } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'priority-low' },
  medium: { label: 'Medium', className: 'priority-medium' },
  high: { label: 'High', className: 'priority-high' },
  urgent: { label: 'Urgent', className: 'priority-urgent' },
};

const statusConfig: Record<Status, { label: string; className: string }> = {
  todo: { label: 'To Do', className: 'status-todo' },
  in_progress: { label: 'In Progress', className: 'status-progress' },
  completed: { label: 'Completed', className: 'status-completed' },
};

export function TaskCard({ task, onUpdate, onDelete, onEdit }: TaskCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isCompleted = task.status === 'completed';
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isCompleted;

  const formatDueDate = () => {
    if (!dueDate) return null;
    if (isToday(dueDate)) return 'Today';
    if (isTomorrow(dueDate)) return 'Tomorrow';
    return format(dueDate, 'MMM d');
  };

  const handleStatusToggle = () => {
    const newStatus: Status = isCompleted ? 'todo' : 'completed';
    onUpdate(task.id, { status: newStatus });
  };

  return (
    <>
      <Card
        className={cn(
          'group transition-all duration-300 hover:shadow-md border-l-4',
          isCompleted && 'opacity-60',
          isOverdue && 'border-l-destructive',
          !isOverdue && task.priority === 'urgent' && 'border-l-red-500',
          !isOverdue && task.priority === 'high' && 'border-l-orange-500',
          !isOverdue && task.priority === 'medium' && 'border-l-yellow-500',
          !isOverdue && task.priority === 'low' && 'border-l-green-500'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleStatusToggle}
              className="mt-1"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={cn(
                    'font-medium text-foreground leading-tight',
                    isCompleted && 'line-through text-muted-foreground'
                  )}
                >
                  {task.title}
                </h3>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="secondary" className={priorityConfig[task.priority].className}>
                  <Flag className="h-3 w-3 mr-1" />
                  {priorityConfig[task.priority].label}
                </Badge>

                <Badge variant="secondary" className={statusConfig[task.status].className}>
                  {statusConfig[task.status].label}
                </Badge>

                {task.category && (
                  <Badge variant="outline">{task.category}</Badge>
                )}

                {dueDate && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'flex items-center gap-1',
                      isOverdue && 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {isOverdue ? (
                      <Clock className="h-3 w-3" />
                    ) : (
                      <Calendar className="h-3 w-3" />
                    )}
                    {formatDueDate()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete &quot;{task.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(task.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
