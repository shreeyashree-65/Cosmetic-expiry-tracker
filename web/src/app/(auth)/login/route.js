import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // 1. Parse the incoming request body (email + password)
    const body = await req.json();
    const { email, password } = body;

    // 2. Check if user exists in DB
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // 3. Compare entered password with hashed password in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
      });
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email }, // payload
      process.env.JWT_SECRET,                 // secret key
      { expiresIn: "7d" }                     // token expiry
    );

    // 5. Return token + user info
    return new Response(
      JSON.stringify({
        message: "Login successful",
        token,
        user: { id: user.id, email: user.email },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ error: "Login failed" }), {
      status: 500,
    });
  }
}
