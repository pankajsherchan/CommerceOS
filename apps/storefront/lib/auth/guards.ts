import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";

export async function requireAuth(returnTo: string) {
  const session = await getCurrentSession();

  if (!session) {
    redirect(`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return session;
}
