import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function buildConfirmationHtml(name: string, jobTitle: string): string {
  const displayName = name.trim() || "Applicant";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Received</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#111111;border-radius:8px;overflow:hidden;border:1px solid #1f1f1f;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0d0d0d;padding:28px 40px;border-bottom:2px solid #10b981;text-align:left;">
              <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">The Talent Africa</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px;font-size:16px;color:#e5e7eb;line-height:1.6;">
                Dear ${displayName},
              </p>
              <p style="margin:0 0 20px;font-size:16px;color:#e5e7eb;line-height:1.6;">
                Thank you for submitting your application for the position of
                <strong style="color:#ffffff;">${jobTitle}</strong>.
                We are pleased to confirm that your application has been successfully received.
              </p>
              <p style="margin:0 0 20px;font-size:16px;color:#e5e7eb;line-height:1.6;">
                Please note that The Talent Africa is a platform that connects job seekers with employers. We do not
                have access to the hiring process, nor do we determine who is selected. Your application has been
                forwarded directly to the employer, who will carefully review all submissions and reach out directly
                to shortlisted candidates whose profiles align with their requirements. You can expect to hear from
                them within <strong style="color:#10b981;">2&ndash;4 weeks</strong>, or in accordance with their
                own hiring timelines.
              </p>
              <p style="margin:0 0 32px;font-size:16px;color:#e5e7eb;line-height:1.6;">
                We truly appreciate you choosing The Talent Africa as your platform to pursue this opportunity.
                We wish you all the very best with this application.
              </p>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="border-top:1px solid #1f2937;"></td>
                </tr>
              </table>

              <p style="margin:0 0 4px;font-size:14px;color:#9ca3af;">Warm regards,</p>
              <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#ffffff;">The Talent Africa Team</p>
              <p style="margin:0;font-size:13px;color:#6b7280;">thetalentafrica.org</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0a0a0a;padding:20px 40px;border-top:1px solid #1a1a1a;">
              <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.6;">
                This is an automated confirmation. Please do not reply directly to this email.<br />
                &copy; ${new Date().getFullYear()} The Talent Africa. All rights reserved. Nairobi, Kenya.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { name = "", email = "" } = body as { name?: string; email?: string };

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Resolve job title for the email subject and body
    const job = await prisma.job.findUnique({ where: { id }, select: { title: true } });
    const rawTitle = job?.title ?? "the position";
    // Strip "[Openings: X]" tags from the title (e.g. "Call Centre Trainee [Openings: 5]" → "Call Centre Trainee")
    const jobTitle = rawTitle.replace(/\s*\[Openings:[^\]]*\]/gi, "").trim();

    // Send confirmation email — failure must NOT block the response
    try {
      const transporter = await createTransporter();
      if (transporter) {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: email,
          subject: `Application Received \u2013 ${jobTitle}`,
          html: buildConfirmationHtml(name, jobTitle),
        });
      }
    } catch (emailErr) {
      console.error("[apply] confirmation email failed:", emailErr);
    }

    // Record application for analytics
    try {
      const fullJob = await prisma.job.findUnique({ where: { id }, select: { title: true, categoryId: true } });
      if (fullJob) {
        await prisma.jobApplication.create({ data: { jobId: id, categoryId: fullJob.categoryId } });
      } else {
        console.error("[apply] jobApplication skipped — job not found for id:", id);
      }
    } catch (appErr) {
      console.error("[apply] jobApplication.create failed for id:", id, appErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/api/jobs/[id]/apply error", err);
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
