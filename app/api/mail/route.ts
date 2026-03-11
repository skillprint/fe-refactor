import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { to } = body;

        if (!to) {
            return NextResponse.json(
                { success: false, error: "Missing 'to' email address." },
                { status: 400 }
            );
        }

        const result = await sendTestEmail(to);

        if (result.success) {
            return NextResponse.json({ success: true, message: "Email sent successfully." });
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in mail API route:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
