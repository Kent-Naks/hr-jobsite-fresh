export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const password = body?.password as string | undefined;
  
    if (!password) {
      return Response.json({ error: "Password required" }, { status: 400 });
    }
  
    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }
  
    const token = process.env.ADMIN_SESSION_TOKEN;
    if (!token) {
      return Response.json({ error: "Server not configured" }, { status: 500 });
    }
  
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // 7 days, HttpOnly session cookie
        "Set-Cookie": `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
      },
    });
  }
  