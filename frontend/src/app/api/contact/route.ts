import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

type ReqBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

const CONTACT_TO = process.env.CONTACT_TO || "thetalentafrica@zohomail.com";

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

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json();
    const { name = "", email = "", subject = "Contact form", message = "" } = body;

    const transporter = await createTransporter();
    if (!transporter) {
      return NextResponse.json({ error: "SMTP not configured" }, { status: 500 });
    }

    const mail = {
      from: `${name || "Website"} <${process.env.SMTP_USER}>`,
      to: CONTACT_TO,
      subject: subject || "Website contact",
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p><strong>Subject:</strong> ${subject}</p><hr/><p>${(message || "").replace(/\n/g, "<br/>")}</p>`,
    };

    await transporter.sendMail(mail);

    return NextResponse.json({ message: "Message sent" });
  } catch (err: any) {
    console.error("/api/contact error", err);
    return NextResponse.json({ error: err?.message ?? "Failed to send" }, { status: 500 });
  }
}

export const runtime = "nodejs";
