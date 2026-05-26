import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  addStorefrontCartItem,
  CommerceApiError,
  removeStorefrontCartItem,
  updateStorefrontCartItem,
} from "@/lib/commerce-api";

const cartItemMutationSchema = z.object({
  productSlug: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  size: z.string().min(1),
});

const removeCartItemSchema = cartItemMutationSchema.omit({ quantity: true });

export async function POST(request: NextRequest) {
  try {
    const item = cartItemMutationSchema.parse(await request.json());
    const lines = await addStorefrontCartItem(item);

    return NextResponse.json({ lines });
  } catch (error) {
    return cartMutationErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const item = cartItemMutationSchema.parse(await request.json());
    const lines = await updateStorefrontCartItem(item);

    return NextResponse.json({ lines });
  } catch (error) {
    return cartMutationErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const item = removeCartItemSchema.parse(await request.json());
    const lines = await removeStorefrontCartItem(item);

    return NextResponse.json({ lines });
  } catch (error) {
    return cartMutationErrorResponse(error);
  }
}

function cartMutationErrorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Invalid cart item payload." },
      { status: 400 },
    );
  }

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
