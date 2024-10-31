import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    return NextResponse.json({ 
      authenticated: true, 
      user: session.user 
    });
  }

  return NextResponse.json({ 
    authenticated: false 
  });
}
