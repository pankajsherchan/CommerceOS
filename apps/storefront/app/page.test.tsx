import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("storefront home page", () => {
  it("renders the mocked catalog entry experience", async () => {
    render(await Home());

    expect(
      screen.getByRole("heading", { name: "Objects for a calm, high-output desk." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Shop the catalog" }),
    ).toHaveAttribute("href", "/products");
    expect(
      screen.getByRole("heading", { name: "Best-sellers for the mocked launch." }),
    ).toBeInTheDocument();
  });
});
