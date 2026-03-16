import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    error: "Old create route disabled. Use /api/generate-pdf instead."
  }, { status: 410 });
}
