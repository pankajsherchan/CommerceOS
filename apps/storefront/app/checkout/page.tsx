import { CheckoutPageView } from "@/components/checkout-page-view";
import { requireAuth } from "@/lib/auth/guards";

export default async function CheckoutPage() {
  await requireAuth("/checkout");

  return (
    <main className="storefront-section">
      <section className="shell-container">
        <CheckoutPageView />
      </section>
    </main>
  );
}
