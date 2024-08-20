function checkout(paymentCallback) {
  let paymentRequest = {
    merchant_code: document.getElementsByName("merchant_code")[0].value,
    pay_item_id: document.getElementsByName("pay_item_id")[0].value,
    txn_ref: document.getElementsByName("txn_ref")[0].value,
    amount: document.getElementsByName("cust_amount")[0].value,
    cust_email: document.getElementsByName("cust_email")[0].value,
    currency: document.getElementsByName("currency")[0].value,
    site_redirect_url: window.location.origin,
    onComplete: paymentCallback,
    mode: "LIVE",
  };
  window.webpayCheckout(paymentRequest);
}
