const { getProducts } = require("../lib/productCatalog");

module.exports = async function products(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const products = await getProducts();

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
