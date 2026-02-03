import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  category: string | null;
}

interface AIRequest {
  action: "suggest" | "prioritize" | "breakdown";
  tasks?: Task[];
  taskTitle?: string;
  taskDescription?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, tasks, taskTitle, taskDescription }: AIRequest = await req.json();

    console.log(`AI Assistant action: ${action}`);

    let prompt = "";
    
    switch (action) {
      case "suggest":
        prompt = `You are a helpful study assistant for students. Based on the following tasks, provide 3 actionable suggestions to help the student be more productive and manage their time better.

Current tasks:
${tasks?.map(t => `- ${t.title} (Priority: ${t.priority}, Status: ${t.status}, Due: ${t.due_date || 'No deadline'})`).join('\n') || 'No tasks yet'}

Provide brief, actionable suggestions in a friendly tone. Format as a numbered list.`;
        break;
        
      case "prioritize":
        prompt = `You are a study planning expert. Analyze these student tasks and suggest the optimal order to tackle them based on urgency, importance, and deadlines.

Tasks:
${tasks?.map(t => `- ${t.title} (Priority: ${t.priority}, Status: ${t.status}, Due: ${t.due_date || 'No deadline'}, Category: ${t.category || 'General'})`).join('\n') || 'No tasks'}

Provide a prioritized order with brief reasoning for each. Be concise and actionable.`;
        break;
        
      case "breakdown":
        prompt = `You are a study coach helping break down complex tasks. Break down this task into smaller, manageable subtasks that a student can complete step by step.

Task: ${taskTitle}
${taskDescription ? `Description: ${taskDescription}` : ''}

Provide 3-5 specific subtasks that are actionable and measurable. Format as a numbered list with brief descriptions.`;
        break;
        
      default:
        throw new Error("Invalid action");
    }

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a friendly and encouraging study assistant for students. Keep responses concise, actionable, and supportive. Use emojis sparingly to keep things engaging."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const suggestion = aiData.choices?.[0]?.message?.content || "I couldn't generate a suggestion at this time.";

    console.log("AI response generated successfully");

    return new Response(
      JSON.stringify({ suggestion }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in ai-task-assistant:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
