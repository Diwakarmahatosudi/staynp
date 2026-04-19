import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { publicUser } from "@/lib/user-dto";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user: publicUser(user) });
}
