import axios from "axios";
import products from "../products.js";
import { createOrder, submitMpesaId, getOrder } from "../orders.js";
import deliverProduct from "../deliver.js";

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const MPESA_NUMBER = process.env.M_PESA_NUMBER;

// ------------------ FUNÇÃO DE ENVIO ------------------
async function sendMessage(to, message) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message }
    },
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

// ------------------ WEBHOOK ------------------
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) {
      return res.status(200).send("NO MESSAGE");
    }

    const phone = message.from;
    const text = message.text?.body?.trim();

    // ================= MENU =================
    if (text?.toUpperCase() === "MENU") {
      await sendMessage(
        phone,
`👋 *MZ TECH STORE*

1️⃣ Netflix  
2️⃣ eBooks  
3️⃣ Design de Logotipo  
4️⃣ Criação de Currículo  

📌 Responda com o número`
      );
      return res.status(200).send("OK");
    }

    // ================= SUBMENUS =================
    if (text === "1") {
      await sendMessage(
        phone,
`🎬 *NETFLIX*
1️⃣ Premium – 200MT  
2️⃣ Ultra HD – 400MT  

👉 Envie: netflix-1 ou netflix-2`
      );
      return res.status(200).send("OK");
    }

    if (text === "2") {
      await sendMessage(
        phone,
`📚 *EBOOKS*
1️⃣ Básico – 300MT  
2️⃣ Completo – 500MT  

👉 Envie: ebooks-1 ou ebooks-2`
      );
      return res.status(200).send("OK");
    }

    if (text === "3") {
      await sendMessage(
        phone,
`🎨 *LOGOTIPOS*
1️⃣ Empresas – 1000MT  
2️⃣ Panfletos/Músicas – 500MT  
3️⃣ Camisetas – 400MT  

👉 Ex: logotipo-1`
      );
      return res.status(200).send("OK");
    }

    if (text === "4") {
      await sendMessage(
        phone,
`📄 *CURRÍCULO PROFISSIONAL*
💰 1000MT  

👉 Envie: curriculo-1`
      );
      return res.status(200).send("OK");
    }

    // ================= CRIAR PEDIDO =================
    if (text?.includes("-") && !text.toUpperCase().startsWith("MPESA-")) {
      const [category, option] = text.split("-");
      const product = products[category]?.[option];

      if (!product) {
        await sendMessage(phone, "❌ Produto inválido. Envie MENU.");
        return res.status(200).send("OK");
      }

      const ref = createOrder(phone, category, option);

      await sendMessage(
        phone,
`💳 *PAGAMENTO M-PESA*

📞 Número: ${MPESA_NUMBER}  
💰 Valor: ${product.price} MT  
🆔 Referência: ${ref}

📌 Após pagar, envie o *ID da transferência* assim:

MPESA-${ref}-SEU_ID

⚠️ O produto só é entregue após envio do ID`
      );
      return res.status(200).send("OK");
    }

    // ================= CONFIRMAR PAGAMENTO =================
    if (text?.toUpperCase().startsWith("MPESA-")) {
      const parts = text.split("-");
      const ref = parts[1];
      const mpesaId = parts.slice(2).join("-");

      const order = submitMpesaId(ref, mpesaId);

      if (!order) {
        await sendMessage(phone, "❌ Referência não encontrada.");
        return res.status(200).send("OK");
      }

      const delivery = deliverProduct(order, products);

      await sendMessage(
        phone,
`✅ *Pagamento confirmado!*

${delivery}

🙏 Obrigado por comprar na *MZ TECH STORE*`
      );

      return res.status(200).send("OK");
    }

    // ================= FALLBACK =================
    await sendMessage(phone, "❓ Comando não reconhecido. Envie MENU.");
    return res.status(200).send("OK");

  } catch (err) {
    console.error(err);
    return res.status(200).send("ERROR");
  }
}
