import {
  getLocalStorage,
  setLocalStorage,
  qs,
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

    const response = await this.services.checkout(order);
    console.log('Checkout response:', response);
    setLocalStorage(this.key, []);
    return response;
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
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!checkout.list.length) {
      alert('Your cart is empty.');
      return;
    }
    // Ensure totals exist even if zip blur didn't fire yet
    checkout.calculateOrderTotal();
    try {
      const result = await checkout.checkout(form);
      alert(`Order submitted successfully.\n${JSON.stringify(result)}`);
      window.location.href = '/index.html';
    } catch (err) {
      console.error(err);
      alert('There was a problem submitting your order. Check the console.');
    }
  });
}
