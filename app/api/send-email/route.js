import { sendEmail } from "@/utils/email";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { to, subject, content } = await request.json();

    await sendEmail(to, subject, content);
    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Error sending email" },
      { status: 500 }
    );
  }
}
