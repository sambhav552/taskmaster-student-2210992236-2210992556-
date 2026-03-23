import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Resend API helper
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "StudyFlow <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
  
  return response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-function-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: string;
  user_id: string;
  reminder_sent: boolean;
}

interface Profile {
  email: string | null;
  full_name: string | null;
}

// Sanitize text to prevent XSS in emails
function sanitizeForHtml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .slice(0, 500); // Limit length
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Send task reminders function invoked");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get tasks due within the next 24 hours OR due today that haven't had reminders sent
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfTomorrow = new Date(startOfToday.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    // Limit the number of tasks to process to prevent resource exhaustion
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("reminder_sent", false)
      .neq("status", "completed")
      .gte("due_date", startOfToday.toISOString())
      .lte("due_date", endOfTomorrow.toISOString())
      .limit(500); // Prevent processing too many tasks at once

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw tasksError;
    }

    console.log(`Found ${tasks?.length || 0} tasks needing reminders`);

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tasks need reminders", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group tasks by user
    const tasksByUser = tasks.reduce((acc: Record<string, Task[]>, task: Task) => {
      if (!acc[task.user_id]) {
        acc[task.user_id] = [];
      }
      acc[task.user_id].push(task);
      return acc;
    }, {});

    let emailsSent = 0;
    const taskIdsToUpdate: string[] = [];

    for (const [userId, userTasks] of Object.entries(tasksByUser)) {
      // Get user's email from profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", userId)
        .single();

      if (profileError || !profile?.email) {
        console.error(`Could not find email for user ${userId}:`, profileError);
        continue;
      }

      const taskList = (userTasks as Task[])
        .map((task) => {
          const dueDate = new Date(task.due_date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          return `• ${sanitizeForHtml(task.title)} (Due: ${dueDate}, Priority: ${sanitizeForHtml(task.priority)})`;
        })
        .join("\n");

      const userName = sanitizeForHtml(profile.full_name) || "Student";

      try {
        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #6366f1; margin-bottom: 20px;">📚 StudyFlow Reminder</h1>
            <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
            <p style="font-size: 16px; color: #374151;">You have upcoming tasks that need your attention:</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <pre style="font-family: inherit; white-space: pre-wrap; margin: 0; color: #374151;">${taskList}</pre>
            </div>
            <p style="font-size: 14px; color: #6b7280;">Stay on track and keep up the great work! 🎯</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 12px; color: #9ca3af;">This is an automated reminder from StudyFlow.</p>
          </div>
        `;

        await sendEmail(
          profile.email,
          `⏰ Task Reminder: ${(userTasks as Task[]).length} task(s) due soon!`,
          emailHtml
        );

        emailsSent++;
        taskIdsToUpdate.push(...(userTasks as Task[]).map((t) => t.id));
        console.log(`Sent reminder email to user for ${(userTasks as Task[]).length} tasks`);
      } catch (sendError) {
        console.error(`Error sending email:`, sendError);
      }
    }

    // Mark tasks as reminded
    if (taskIdsToUpdate.length > 0) {
      const { error: updateError } = await supabase
        .from("tasks")
        .update({ reminder_sent: true })
        .in("id", taskIdsToUpdate);

      if (updateError) {
        console.error("Error updating reminder_sent status:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Reminders processed successfully",
        sent: emailsSent
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-task-reminders:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: "Failed to send reminders. Please try again later." }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
