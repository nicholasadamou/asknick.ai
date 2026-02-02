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
    if (!body.description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const { description, debugInfo } = body;

    // Format debug info for email
    const debugInfoHtml = Object.entries(debugInfo)
      .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
      .join("");

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: process.env.NOTIFICATION_EMAIL || "your-email@example.com",
      subject: `Bug Report - ${siteConfig.emailSubjectPrefix}`,
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
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
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
                color: #f97316;
                font-size: 16px;
              }
              .description {
                background: #fef3c7;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #f59e0b;
                margin: 15px 0;
                white-space: pre-wrap;
              }
              .debug-info {
                background: #f3f4f6;
                padding: 10px;
                border-radius: 4px;
                font-size: 12px;
              }
              .debug-info ul {
                list-style: none;
                padding: 0;
                margin: 0;
              }
              .debug-info li {
                padding: 5px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .debug-info li:last-child {
                border-bottom: none;
              }
              .debug-info strong {
                color: #6b7280;
                display: inline-block;
                min-width: 120px;
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
              <h2 style="margin: 0;">🐛 Bug Report</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">${siteConfig.emailSubjectPrefix} - Issue Report</p>
            </div>
            
            <div class="content">
              <div class="section">
                <h3>Issue Description</h3>
                <div class="description">${description}</div>
              </div>

              <div class="section">
                <h3>Debug Information</h3>
                <div class="debug-info">
                  <ul>
                    ${debugInfoHtml}
                  </ul>
                </div>
              </div>

              <div class="section">
                <h3>Next Steps</h3>
                <p style="margin: 0;">
                  1. Review the issue description and debug info<br>
                  2. Reproduce the issue if possible<br>
                  3. Create a ticket in your issue tracker<br>
                  4. Investigate and fix the bug
                </p>
              </div>
            </div>

            <div class="footer">
              <p>Sent from ${siteConfig.emailSubjectPrefix} Bug Reporter</p>
              <p>${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `,
      // Plain text fallback
      text: `
Bug Report - ${siteConfig.emailSubjectPrefix}
${'='.repeat(13 + siteConfig.emailSubjectPrefix.length)}

Issue Description:
${description}

Debug Information:
${Object.entries(debugInfo)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}

---
Sent: ${new Date().toISOString()}
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send issue report" },
        { status: 500 }
      );
    }

    // Log successful submission
    console.log("Issue report sent:", {
      emailId: data?.id,
      description: description.substring(0, 100),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, message: "Issue report sent successfully", emailId: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error reporting issue:", error);
    return NextResponse.json(
      { error: "Failed to report issue" },
      { status: 500 }
    );
  }
}
