const SHEET_ID = "1PEnbPeZzaTyl7ckL_NgtqdJXOwXSeUVmgUcHRyX363I";

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

async function getSheetRows(sheetName) {
  const sheetUrl =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
    `?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(sheetUrl);

  if (!response.ok) {
    throw new Error(`Google Sheets returned ${response.status}`);
  }

  const data = parseVisualizationResponse(await response.text());
  const headers = data.table.cols.map((column) => column.label);

  return data.table.rows.map((row) => {
    const values = {};
    headers.forEach((header, index) => {
      if (header) values[header] = cellValue(row, index);
    });
    return values;
  });
}

async function getProducts() {
  const rows = await getSheetRows("Products");

  return rows
    .map((row) => ({
      productId: row["Product ID"],
      itemName: row["Item Name"] || row["Product ID"],
      priceUS: asNumber(row["Price US"]),
      stockUS: asBoolean(row["Stock US"]),
      priceIL: asNumber(row["Price IL"]),
      stockIL: asBoolean(row["Stock IL"]),
    }))
    .filter((product) => product.productId);
}

async function getDeliveries() {
  const rows = await getSheetRows("Deliveries");

  return rows
    .map((row) => ({
      active: asBoolean(row.Active) === true,
      deliveryId: row["Delivery ID"],
      region: row.Region,
      label: row.Label,
      priceUS: asNumber(row["Price US"]),
      priceIL: asNumber(row["Price IL"]),
      requiresLocationConfirmation:
        asBoolean(row["Requires Location Confirmation"]) === true,
      whatsappOnly: asBoolean(row["WhatsApp Only"]) === true,
    }))
    .filter((delivery) => delivery.deliveryId && delivery.label);
}

async function getPromos() {
  const rows = await getSheetRows("Promos");

  return rows
    .map((row) => ({
      active: asBoolean(row.Active) === true,
      code: String(row["Promo Code"] || "").trim(),
      description: String(row.Description || "").trim(),
      discountPercent: asNumber(row["Discount Percent"]),
    }))
    .filter((promo) => promo.code);
}

module.exports = { getProducts, getDeliveries, getPromos };
