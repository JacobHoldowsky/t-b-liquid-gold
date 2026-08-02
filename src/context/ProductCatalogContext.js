import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ProductCatalogContext = createContext({
  overrides: {},
  loading: true,
  error: null,
});

export function ProductCatalogProvider({ children }) {
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Product catalog request failed (${response.status})`);
        }
        return response.json();
      })
      .then(({ products = [] }) => {
        if (cancelled) return;

        const byId = products.reduce((catalog, product) => {
          catalog[product.productId] = product;
          return catalog;
        }, {});

        setOverrides(byId);
        setError(null);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ overrides, loading, error }),
    [overrides, loading, error]
  );

  return (
    <ProductCatalogContext.Provider value={value}>
      {children}
    </ProductCatalogContext.Provider>
  );
}

export function useProductCatalog() {
  return useContext(ProductCatalogContext);
}

export function applyCatalogOverride(
  item,
  productId,
  overrides,
  shopRegion
) {
  const resolvedProductId = productId || item.productId || item.id;
  const override = overrides[resolvedProductId];

  if (!override) {
    return { ...item, productId: resolvedProductId };
  }

  const inStock = shopRegion === "US" ? override.stockUS : override.stockIL;

  return {
    ...item,
    productId: resolvedProductId,
    ...((override.priceUS !== null || override.priceIL !== null) ? {
      priceDollar: override.priceUS ?? item.priceDollar,
      priceShekel: override.priceIL ?? item.priceShekel,
    } : {}),
    ...(typeof inStock === "boolean" ? { isSoldOut: !inStock } : {}),
  };
}

export function applyCatalogOverrides(items, overrides, shopRegion) {
  return items.map((item) =>
    applyCatalogOverride(
      item,
      item.productId || item.id,
      overrides,
      shopRegion
    )
  );
}
