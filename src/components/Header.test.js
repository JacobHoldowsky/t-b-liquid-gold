import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";
import { ShopProvider } from "../context/ShopContext";

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("shopRegion", "US");
});

test("keeps the shop region selector and removes the currency switcher", () => {
  render(
    <BrowserRouter>
      <ShopProvider>
        <Header cartItemCount={0} clearCart={() => {}} />
      </ShopProvider>
    </BrowserRouter>
  );

  expect(screen.getByText("Shop USA")).toBeInTheDocument();
  expect(screen.getByText("Shop Israel")).toBeInTheDocument();
  expect(screen.getByRole("checkbox")).toBeInTheDocument();
  expect(document.querySelector(".currency-toggle")).toBeNull();
});
