import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("storefront home page", () => {
  it("renders the bootstrap placeholder content", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "CommerceOS storefront" }),
    ).toBeInTheDocument();
    expect(screen.getByText("pnpm test")).toBeInTheDocument();
  });
});
