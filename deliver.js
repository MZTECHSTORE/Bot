function deliverProduct(order, products) {
  const p = products[order.category][order.product];

  if (!order.paid) return "❌ Aguardando envio do ID de transferência M-Pesa.";

  if (p.delivery === "link") {
    return `📚 Seu produto está pronto para download: https://mztechstore.com/ebooks`;
  }

  if (p.delivery === "account") {
    return `🎬 Acesso Netflix:\nEmail: conta@netflix.com\nSenha: 123456`;
  }

  if (p.delivery === "manual") {
    return "✅ Pedido confirmado! Um atendente entrará em contato para concluir a entrega.";
  }

  return "📦 Pedido processado com sucesso.";
}

module.exports = deliverProduct;
