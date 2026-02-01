import products from "../products.js";
import { createOrder } from "../orders.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método inválido" });
  }

  const { phone, category, option } = req.body;
  const product = products[category]?.[option];

  if (!product) {
    return res.status(400).json({ error: "Produto inválido" });
  }

  const ref = createOrder(phone, category, option);

  return res.status(200).json({
    ref,
    price: product.price
  });
}
