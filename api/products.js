const SHEET_ID = "1PEnbPeZzaTyl7ckL_NgtqdJXOwXSeUVmgUcHRyX363I";
const SHEET_NAME = "Products";

const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
  `?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

function parseVisualizationResponse(body) {
  const match = body.match(
    /google\.visualization\.Query\.setResponse\(([\s\S]+)\);?\s*$/
  );

  if (!match) {
    throw new Error("Unexpected Google Sheets response format");
  }

  return JSON.parse(match[1]);
}

function cellValue(row, index) {
  const value = row?.c?.[index]?.v;
  return value === undefined ? null : value;
}

function asNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function asBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return null;
}

module.exports = async function products(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) {
      throw new Error(`Google Sheets returned ${response.status}`);
    }

    const data = parseVisualizationResponse(await response.text());
    const headers = data.table.cols.map((column) => column.label);
    const indexOf = (header) => headers.indexOf(header);

    const productIdIndex = indexOf("Product ID");
    const priceUSIndex = indexOf("Price US");
    const stockUSIndex = indexOf("Stock US");
    const priceILIndex = indexOf("Price IL");
    const stockILIndex = indexOf("Stock IL");

    if (
      productIdIndex === -1 ||
      priceUSIndex === -1 ||
      stockUSIndex === -1 ||
      priceILIndex === -1 ||
      stockILIndex === -1
    ) {
      throw new Error("Products sheet is missing a required column");
    }

    const products = data.table.rows
      .map((row) => ({
        productId: cellValue(row, productIdIndex),
        priceUS: asNumber(cellValue(row, priceUSIndex)),
        stockUS: asBoolean(cellValue(row, stockUSIndex)),
        priceIL: asNumber(cellValue(row, priceILIndex)),
        stockIL: asBoolean(cellValue(row, stockILIndex)),
      }))
      .filter((product) => product.productId);

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );
    return res.status(200).json({ products });
  } catch (error) {
    console.error("Unable to load product catalog from Google Sheets", error);
    return res.status(502).json({ error: "Unable to load product catalog" });
  }
};
