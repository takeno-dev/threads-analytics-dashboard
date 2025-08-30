import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env.js";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");
  const httpsUrl = env.NEXTAUTH_URL.replace('http:', 'https:');
  const httpUrl = env.NEXTAUTH_URL; // HTTP URL for redirects

  if (action === "authorize") {
    // Step 1: Redirect user to Threads authorization
    const authUrl = new URL("https://threads.net/oauth/authorize");
    
    authUrl.searchParams.append("client_id", env.THREADS_APP_ID);
    // Use HTTPS for Threads OAuth regardless of NEXTAUTH_URL
    authUrl.searchParams.append("redirect_uri", `${httpsUrl}/api/threads/auth?action=callback`);
    authUrl.searchParams.append("scope", "threads_basic,threads_content_publish,threads_manage_insights");
    authUrl.searchParams.append("response_type", "code");
    
    // Generate and store state parameter for security
    const state = crypto.randomUUID();
    // TODO: Store state in session or database for verification
    authUrl.searchParams.append("state", state);

    return NextResponse.redirect(authUrl.toString());
  }

  if (action === "callback") {
    // Step 2: Handle callback from Threads
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    if (error) {
      console.error("Threads OAuth error:", error);
      return NextResponse.redirect(`${httpUrl}/dashboard?threads_error=${error}`);
    }

    if (!code) {
      return NextResponse.redirect(`${httpUrl}/dashboard?threads_error=no_code`);
    }

    try {
      // Step 3: Exchange code for access token
      const tokenResponse = await fetch("https://graph.threads.net/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: env.THREADS_APP_ID,
          client_secret: env.THREADS_APP_SECRET,
          grant_type: "authorization_code",
          redirect_uri: `${httpsUrl}/api/threads/auth?action=callback`,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        console.error("Token exchange failed:", errorData);
        return NextResponse.redirect(`${httpUrl}/dashboard?threads_error=token_exchange_failed`);
      }

      const tokenData = await tokenResponse.json();
      const { access_token, user_id, expires_in } = tokenData;

      if (!access_token) {
        console.error("No access token received:", tokenData);
        return NextResponse.redirect(`${httpUrl}/dashboard?threads_error=no_access_token`);
      }

      // Step 4: Exchange short-lived token for long-lived token
      const longLivedUrl = new URL("https://graph.threads.net/access_token");
      longLivedUrl.searchParams.append("grant_type", "th_exchange_token");
      longLivedUrl.searchParams.append("client_secret", env.THREADS_APP_SECRET);
      longLivedUrl.searchParams.append("access_token", access_token);

      const longLivedTokenResponse = await fetch(longLivedUrl.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let finalToken = access_token;
      let finalExpiresIn = expires_in;

      if (longLivedTokenResponse.ok) {
        const longLivedData = await longLivedTokenResponse.json();
        finalToken = longLivedData.access_token || access_token;
        finalExpiresIn = longLivedData.expires_in || expires_in;
      }

      // Step 5: Store token (redirect to dashboard with token as URL parameter - not ideal for production)
      // In production, you'd store this in a secure session or database
      // Redirect back to HTTP for dashboard (Google OAuth compatibility)
      const redirectUrl = new URL(`${httpUrl}/dashboard`);
      redirectUrl.searchParams.append("threads_token", finalToken);
      redirectUrl.searchParams.append("threads_user_id", user_id || "");
      redirectUrl.searchParams.append("threads_expires_in", finalExpiresIn?.toString() || "");

      return NextResponse.redirect(redirectUrl.toString());

    } catch (error) {
      console.error("Threads OAuth callback error:", error);
      return NextResponse.redirect(`${httpUrl}/dashboard?threads_error=callback_failed`);
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}