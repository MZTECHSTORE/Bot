import axios from "axios";
import products from "../products";
import { createOrder, submitMpesaId, orders } from "../orders";
import deliverProduct from "../deliver";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const MPESA_NUMBER = process.env.M_PESA_NUMBER;

async function sendMessage(phone, message) {
  await axios.post(`https://graph.facebook.com/v17.0/${PHONE_ID}/messages`, {
    messaging_product: "whatsapp",
    to: phone,
    text: { body: message }
  }, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } });
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const messages = req.body.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!messages) return res.status(200).send("No messages");

    const msg = messages[0];
    const phone = msg.from;
    const text = msg.text?.body;

    // MENU
    if (text?.toUpperCase() === "MENU") {
      await sendMessage(phone,
`👋 Bem-vindo à MZ TECH STORE
1️⃣ Netflix
2️⃣ eBooks
3️⃣ Design de Logotipo
4️⃣ Criação de Currículo
5️⃣ Atendimento Humano
Digite o número:`);
      return res.status(200).send("OK");
    }

    // Submenu
    if (["1","2","3","4","5"].includes(text)) {
      switch(text){
        case "1": await sendMessage(phone,"📺 Netflix:\n1️⃣ Premium – 200MT\n2️⃣ Ultra HD – 400MT\nDigite netflix-1 ou netflix-2 para escolher."); break;
        case "2": await sendMessage(phone,"📚 eBooks:\n1️⃣ Básico – 300MT\n2️⃣ Completo – 500MT\nDigite ebooks-1 ou ebooks-2 para escolher."); break;
        case "3": await sendMessage(phone,"🎨 Logotipo:\n1️⃣ Empresas – 1000MT\n2️⃣ Panfletos/Músicas – 500MT\n3️⃣ Camisetas – 400MT\nDigite logotipo-1, logotipo-2 ou logotipo-3."); break;
        case "4": await sendMessage(phone,"📄 Currículo Profissional – 1000MT\nDigite curriculo-1 para solicitar."); break;
        case "5": await sendMessage(phone,"👨‍💼 Um atendente entrará em contato em instantes."); break;
      }
      return res.status(200).send("OK");
    }

    // Seleção de produto
    if(text?.includes("-") && !text.toLowerCase().startsWith("mpesa-")){
      const [category, product] = text.split("-");
      const ref = createOrder(phone, category, product);
      const p = products[category][product];

      await sendMessage(phone,
`💳 PAGAMENTO M-PESA
Número: ${MPESA_NUMBER}
Valor: ${p.price} MT
Referência: ${ref}

➡️ Envie seu ID de transferência M-Pesa usando:
MPESA-${ref}-SEU_ID
Exemplo: MPESA-${ref}-123456`);
      return res.status(200).send("OK");
    }

    // Envio de ID M-Pesa
    if(text?.toUpperCase().startsWith("MPESA-")){
      const parts = text.split("-");
      if(parts.length >= 3){
        const ref = parts[1];
        const mpesaId = parts.slice(2).join("-");
        const order = submitMpesaId(ref, mpesaId);

        if(order){
          const delivery = deliverProduct(order, products);
          await sendMessage(phone, `✅ Pagamento confirmado!\n${delivery}`);
        } else {
          await sendMessage(phone, "❌ Pedido não encontrado. Verifique a referência.");
        }
        return res.status(200).send("OK");
      }
    }
  }

  res.status(200).send("OK");
}
