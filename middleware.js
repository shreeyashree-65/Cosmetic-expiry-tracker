import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function middleware(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next(); // ✅ allow request
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }
}

// Apply middleware only to protected routes
export const config = {
  matcher: ["/api/protected/:path*"], 
};
