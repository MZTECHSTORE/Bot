const orders = {};

function createOrder(phone, category, product) {
  const ref = "MZ-" + Math.floor(Math.random() * 90000);
  orders[ref] = { phone, category, product, paid: false, mpesaId: null };
  return ref;
}

function submitMpesaId(ref, mpesaId) {
  if (orders[ref]) {
    orders[ref].mpesaId = mpesaId;
    orders[ref].paid = true;
    return orders[ref];
  }
  return null;
}

module.exports = { createOrder, submitMpesaId, orders };
