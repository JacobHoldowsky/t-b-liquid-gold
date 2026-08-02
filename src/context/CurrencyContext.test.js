import React, { useContext } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CurrencyContext, CurrencyProvider } from "./CurrencyContext";
import { ShopProvider, useShopContext } from "./ShopContext";

function CurrencyProbe() {
  const { currency } = useContext(CurrencyContext);
  const { shopRegion, toggleShopRegion } = useShopContext();

  return (
    <>
      <span data-testid="currency">{currency}</span>
      <span data-testid="shop-region">{shopRegion}</span>
      <button onClick={toggleShopRegion}>Toggle shop region</button>
    </>
  );
}

function renderCurrencyProbe() {
  return render(
    <ShopProvider>
      <CurrencyProvider>
        <CurrencyProbe />
      </CurrencyProvider>
    </ShopProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

test("US region always uses dollars despite stale stored currency", () => {
  localStorage.setItem("shopRegion", "US");
  localStorage.setItem("currency", "Shekel");

  renderCurrencyProbe();

  expect(screen.getByTestId("currency")).toHaveTextContent("Dollar");
});

test("Israel region always uses shekels despite stale stored currency", () => {
  localStorage.setItem("shopRegion", "Israel");
  localStorage.setItem("currency", "Dollar");

  renderCurrencyProbe();

  expect(screen.getByTestId("currency")).toHaveTextContent("Shekel");
});

test("currency follows the shop region when the region changes", () => {
  localStorage.setItem("shopRegion", "US");

  renderCurrencyProbe();
  expect(screen.getByTestId("currency")).toHaveTextContent("Dollar");

  fireEvent.click(screen.getByRole("button", { name: "Toggle shop region" }));

  expect(screen.getByTestId("shop-region")).toHaveTextContent("Israel");
  expect(screen.getByTestId("currency")).toHaveTextContent("Shekel");
});
