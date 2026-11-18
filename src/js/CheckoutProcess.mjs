import {
  getLocalStorage,
  setLocalStorage,
  qs,
  alertMessage,
} from './utils.mjs';
import ExternalServices from './ExternalServices.mjs';

function formDataToJSON(formElement) {
  const formData = new FormData(formElement);
  const convertedJSON = {};
  formData.forEach((value, key) => {
    convertedJSON[key] = value;
  });
  return convertedJSON;
}

function packageItems(items) {
  return items.map((item) => ({
    id: item.Id,
    name: item.Name,
    price: item.FinalPrice,
    quantity: 1,
  }));
}

function formatServicesError(message) {
  if (!message) return 'There was a problem submitting your order.';
  if (typeof message === 'string') return message;
  // Server often returns { message: { field: "reason", ... } } or flat field map
  const details = message.message && typeof message.message === 'object'
    ? message.message
    : message;
  if (typeof details === 'string') return details;
  return Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join('<br>');
}

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
    this.services = new ExternalServices();
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    if (!Array.isArray(this.list)) {
      this.list = [];
    }
    this.calculateItemSubTotal();
  }

  calculateItemSubTotal() {
    const summary = document.querySelector(this.outputSelector);
    const itemCountEl = summary?.querySelector('#num-items');
    const subtotalEl = summary?.querySelector('#cartTotal');

    this.itemTotal = this.list.reduce(
      (sum, item) => sum + Number(item.FinalPrice || 0),
      0,
    );

    if (itemCountEl) {
      itemCountEl.textContent = String(this.list.length);
    }
    if (subtotalEl) {
      subtotalEl.textContent = `$${this.itemTotal.toFixed(2)}`;
    }
  }

  calculateOrderTotal() {
    this.tax = this.itemTotal * 0.06;
    this.shipping =
      this.list.length > 0 ? 10 + Math.max(0, this.list.length - 1) * 2 : 0;
    this.orderTotal = this.itemTotal + this.tax + this.shipping;
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const summary = document.querySelector(this.outputSelector);
    if (!summary) return;

    const tax = summary.querySelector('#tax');
    const shipping = summary.querySelector('#shipping');
    const orderTotal = summary.querySelector('#orderTotal');

    if (tax) tax.textContent = `$${this.tax.toFixed(2)}`;
    if (shipping) shipping.textContent = `$${this.shipping.toFixed(2)}`;
    if (orderTotal) orderTotal.textContent = `$${this.orderTotal.toFixed(2)}`;
  }

  async checkout(form) {
    const order = formDataToJSON(form);
    order.orderDate = new Date().toISOString();
    order.orderTotal = this.orderTotal.toFixed(2);
    order.tax = this.tax.toFixed(2);
    order.shipping = this.shipping;
    order.items = packageItems(this.list);

    try {
      const response = await this.services.checkout(order);
      console.log('Checkout response:', response);
      setLocalStorage(this.key, []);
      window.location.assign('/checkout/success.html');
    } catch (err) {
      console.error(err);
      if (err.name === 'servicesError') {
        alertMessage(formatServicesError(err.message));
      } else {
        alertMessage(err.message || 'There was a problem submitting your order.');
      }
    }
  }
}

export function listenForCheckout(checkout) {
  const form = qs('#checkout-form');
  const zip = qs('#zip');

  zip?.addEventListener('blur', () => {
    if (zip.value.trim()) {
      checkout.calculateOrderTotal();
    }
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const isValid = form.checkValidity();
    form.reportValidity();
    if (!isValid) return;

    if (!checkout.list.length) {
      alertMessage('Your cart is empty.');
      return;
    }

    checkout.calculateOrderTotal();
    await checkout.checkout(form);
  });
}
