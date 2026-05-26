import type { NextRequest } from "next/server";

import { startSignOut } from "@/lib/auth/oidc";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return startSignOut(request);
}

export async function POST(request: NextRequest) {
  return startSignOut(request);
}
