import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { useToast } from './use-toast';

type AIAction = 'suggest' | 'prioritize' | 'breakdown';

interface UseAIAssistantReturn {
  suggestion: string | null;
  isLoading: boolean;
  getSuggestions: (tasks: Task[]) => Promise<void>;
  getPrioritization: (tasks: Task[]) => Promise<void>;
  getBreakdown: (taskTitle: string, taskDescription?: string) => Promise<void>;
  clearSuggestion: () => void;
}

export function useAIAssistant(): UseAIAssistantReturn {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const callAI = async (action: AIAction, payload: Record<string, unknown>) => {
    setIsLoading(true);
    setSuggestion(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-task-assistant', {
        body: { action, ...payload },
      });

      if (error) throw error;

      setSuggestion(data.suggestion);
    } catch (error) {
      console.error('AI Assistant error:', error);
      toast({
        variant: 'destructive',
        title: 'AI Assistant Error',
        description: 'Failed to get AI suggestions. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = async (tasks: Task[]) => {
    await callAI('suggest', { tasks });
  };

  const getPrioritization = async (tasks: Task[]) => {
    await callAI('prioritize', { tasks });
  };

  const getBreakdown = async (taskTitle: string, taskDescription?: string) => {
    await callAI('breakdown', { taskTitle, taskDescription });
  };

  const clearSuggestion = () => {
    setSuggestion(null);
  };

  return {
    suggestion,
    isLoading,
    getSuggestions,
    getPrioritization,
    getBreakdown,
    clearSuggestion,
  };
}
