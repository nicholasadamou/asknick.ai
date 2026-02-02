import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { siteConfig } from "@/config/site";

export async function POST(request: NextRequest) {
  // Initialize Resend lazily to avoid build-time errors
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 500 }
    );
  }
  
  const resend = new Resend(apiKey);

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const { question, context } = body;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: process.env.NOTIFICATION_EMAIL || "your-email@example.com",
      subject: `Question Suggestion - ${siteConfig.emailSubjectPrefix}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 20px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .section {
                background: white;
                padding: 15px;
                margin-bottom: 15px;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
              }
              .section h3 {
                margin-top: 0;
                color: #3b82f6;
                font-size: 16px;
              }
              .question {
                background: #dbeafe;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #3b82f6;
                margin: 15px 0;
                white-space: pre-wrap;
                font-size: 16px;
                font-weight: 500;
              }
              .context {
                background: #f3f4f6;
                padding: 15px;
                border-radius: 6px;
                margin: 15px 0;
                white-space: pre-wrap;
                font-style: italic;
                color: #6b7280;
              }
              .next-steps {
                background: #fef3c7;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #f59e0b;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 style="margin: 0;">💡 Question Suggestion</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">${siteConfig.emailSubjectPrefix} - Knowledge Base Enhancement</p>
            </div>
            
            <div class="content">
              <div class="section">
                <h3>Suggested Question</h3>
                <div class="question">${question}</div>
              </div>

              ${context ? `
                <div class="section">
                  <h3>Additional Context</h3>
                  <div class="context">${context}</div>
                </div>
              ` : ''}

              <div class="section">
                <div class="next-steps">
                  <h3 style="margin-top: 0; color: #f59e0b;">Next Steps</h3>
                  <p style="margin: 0;">
                    1. Review the question and context<br>
                    2. Research and prepare a comprehensive answer<br>
                    3. Update your AI assistant's knowledge base<br>
                    4. Consider adding this to suggested questions
                  </p>
                </div>
              </div>

              <div class="section">
                <h3>Tips for Implementation</h3>
                <ul style="margin: 5px 0; padding-left: 20px; color: #6b7280;">
                  <li>Add the question to your training data</li>
                  <li>Create detailed examples and use cases</li>
                  <li>Test the response quality</li>
                  <li>Update the SuggestedQuestions component if appropriate</li>
                </ul>
              </div>
            </div>

            <div class="footer">
              <p>Sent from ${siteConfig.emailSubjectPrefix} Question Suggester</p>
              <p>${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `,
      // Plain text fallback
      text: `
Question Suggestion - ${siteConfig.emailSubjectPrefix}
${'='.repeat(22 + siteConfig.emailSubjectPrefix.length)}

Suggested Question:
${question}

${context ? `Additional Context:\n${context}\n` : ''}

Next Steps:
1. Review the question and context
2. Research and prepare a comprehensive answer
3. Update your AI assistant's knowledge base
4. Consider adding this to suggested questions

---
Sent: ${new Date().toISOString()}
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send question suggestion" },
        { status: 500 }
      );
    }

    // Log successful submission
    console.log("Question suggestion sent:", {
      emailId: data?.id,
      question: question.substring(0, 100),
      hasContext: !!context,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, message: "Question suggestion sent successfully", emailId: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting question suggestion:", error);
    return NextResponse.json(
      { error: "Failed to submit question suggestion" },
      { status: 500 }
    );
  }
}
