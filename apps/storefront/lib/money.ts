type Money = {
  amount: number;
  currency: string;
};

export function formatMoney({ amount, currency }: Money) {
  return new Intl.NumberFormat("en-US", {
    currency,
    style: "currency",
  }).format(amount / 100);
}
