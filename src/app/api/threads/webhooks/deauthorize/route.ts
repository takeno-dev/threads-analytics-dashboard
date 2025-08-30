import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Threads deauthorization webhook:", body);

    // Webhook payload example:
    // {
    //   "object": "threads",
    //   "entry": [{
    //     "id": "user_id",
    //     "time": timestamp,
    //     "changes": [{
    //       "field": "deauthorize",
    //       "value": {
    //         "user_id": "user_id"
    //       }
    //     }]
    //   }]
    // }

    if (body.object === "threads" && body.entry) {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === "deauthorize") {
              const userId = change.value?.user_id;
              
              if (userId) {
                // Remove user's Threads access token and data
                await db.user.updateMany({
                  where: { threadsUserId: userId },
                  data: {
                    threadsAccessToken: null,
                    threadsUserId: null,
                  },
                });

                console.log(`Deauthorized Threads user: ${userId}`);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Threads deauthorization webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// For webhook verification (if required)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Verify the webhook (replace with your verify token)
  if (mode === "subscribe" && token === process.env.THREADS_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}