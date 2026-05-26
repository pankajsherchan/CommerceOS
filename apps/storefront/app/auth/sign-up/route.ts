import type { NextRequest } from "next/server";

import { startAuthorization } from "@/lib/auth/oidc";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return startAuthorization(request, "sign-up");
}
