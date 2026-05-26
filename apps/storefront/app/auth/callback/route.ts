import type { NextRequest } from "next/server";

import { completeAuthorization } from "@/lib/auth/oidc";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return completeAuthorization(request);
}
