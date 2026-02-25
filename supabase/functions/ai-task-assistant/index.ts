import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation schema
const TaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").nullable(),
  priority: z.string().max(20),
  status: z.string().max(20),
  due_date: z.string().nullable(),
  category: z.string().max(50).nullable(),
});

const RequestSchema = z.object({
  action: z.enum(["suggest", "prioritize", "breakdown"]),
  tasks: z.array(TaskSchema).max(100, "Too many tasks").optional(),
  taskTitle: z.string().max(200, "Title too long").optional(),
  taskDescription: z.string().max(1000, "Description too long").optional(),
});

// Sanitize text for prompt injection prevention
function sanitizeForPrompt(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .slice(0, 500) // Limit length
    .replace(/[<>{}[\]\\]/g, "") // Remove special characters
    .trim();
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Input validation
    let validatedInput;
    try {
      const body = await req.json();
      validatedInput = RequestSchema.parse(body);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { action, tasks, taskTitle, taskDescription } = validatedInput;

    console.log(`AI Assistant action: ${action} for user: ${user.id}`);

    let prompt = "";
    
    switch (action) {
      case "suggest":
        prompt = `You are a helpful study assistant for students. Based on the following tasks, provide 3 actionable suggestions to help the student be more productive and manage their time better.

Current tasks:
${tasks?.map(t => `- ${sanitizeForPrompt(t.title)} (Priority: ${sanitizeForPrompt(t.priority)}, Status: ${sanitizeForPrompt(t.status)}, Due: ${t.due_date || 'No deadline'})`).join('\n') || 'No tasks yet'}

Provide brief, actionable suggestions in a friendly tone. Format as a numbered list.`;
        break;
        
      case "prioritize":
        prompt = `You are a study planning expert. Analyze these student tasks and suggest the optimal order to tackle them based on urgency, importance, and deadlines.

Tasks:
${tasks?.map(t => `- ${sanitizeForPrompt(t.title)} (Priority: ${sanitizeForPrompt(t.priority)}, Status: ${sanitizeForPrompt(t.status)}, Due: ${t.due_date || 'No deadline'}, Category: ${sanitizeForPrompt(t.category) || 'General'})`).join('\n') || 'No tasks'}

Provide a prioritized order with brief reasoning for each. Be concise and actionable.`;
        break;
        
      case "breakdown":
        prompt = `You are a study coach helping break down complex tasks. Break down this task into smaller, manageable subtasks that a student can complete step by step.

Task: ${sanitizeForPrompt(taskTitle)}
${taskDescription ? `Description: ${sanitizeForPrompt(taskDescription)}` : ''}

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
      throw new Error("AI service unavailable");
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
      JSON.stringify({ error: "Failed to process your request. Please try again later." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
