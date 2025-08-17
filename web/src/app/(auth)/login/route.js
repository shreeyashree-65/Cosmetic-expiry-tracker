import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Secret key (in real projects put this in .env file)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1️⃣ Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2️⃣ Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // 3️⃣ Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email }, // payload
      JWT_SECRET, // secret
      { expiresIn: "1h" } // validity
    );

    // 4️⃣ Return token to frontend
    return NextResponse.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
