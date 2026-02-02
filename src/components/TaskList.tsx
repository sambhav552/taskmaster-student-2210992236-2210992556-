import { useState, useMemo } from 'react';
import { Task, Status, Priority } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ListFilter, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

type FilterStatus = Status | 'all';
type FilterPriority = Priority | 'all';
type ViewMode = 'list' | 'grid';

export function TaskList({ tasks, isLoading, onUpdate, onDelete, onEdit }: TaskListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const taskCounts = useMemo(() => {
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
            <SelectTrigger className="w-[140px]">
              <ListFilter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as FilterPriority)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className={cn('rounded-r-none', viewMode === 'list' && 'bg-muted')}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('rounded-l-none', viewMode === 'grid' && 'bg-muted')}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 flex-wrap">
        <Badge
          variant={statusFilter === 'all' ? 'default' : 'secondary'}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setStatusFilter('all')}
        >
          All ({taskCounts.all})
        </Badge>
        <Badge
          variant={statusFilter === 'todo' ? 'default' : 'secondary'}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setStatusFilter('todo')}
        >
          To Do ({taskCounts.todo})
        </Badge>
        <Badge
          variant={statusFilter === 'in_progress' ? 'default' : 'secondary'}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setStatusFilter('in_progress')}
        >
          In Progress ({taskCounts.in_progress})
        </Badge>
        <Badge
          variant={statusFilter === 'completed' ? 'default' : 'secondary'}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setStatusFilter('completed')}
        >
          Completed ({taskCounts.completed})
        </Badge>
      </div>

      {/* Tasks */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {tasks.length === 0
              ? 'No tasks yet. Create your first task to get started!'
              : 'No tasks match your filters.'}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          )}
        >
          {filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <TaskCard
                task={task}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
