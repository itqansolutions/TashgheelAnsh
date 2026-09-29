import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const uptime = process.uptime();
  let dbStatus = "disconnected";

  try {
    // Ping PostgreSQL
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (error) {
    dbStatus = "unreachable";
  }

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(uptime),
      environment: process.env.NODE_ENV || "development",
      database: dbStatus,
      version: "1.0.0",
    },
    { status: 200 }
  );
}
