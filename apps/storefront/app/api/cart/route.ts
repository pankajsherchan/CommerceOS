import { NextResponse } from "next/server";

import { clearStorefrontCart, CommerceApiError } from "@/lib/commerce-api";

export async function DELETE() {
  try {
    const lines = await clearStorefrontCart();

    return NextResponse.json({ lines });
  } catch (error) {
    if (error instanceof CommerceApiError) {
      return NextResponse.json(
        { error: "Commerce API cart mutation failed." },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Commerce API cart mutation failed." },
      { status: 502 },
    );
  }
}
