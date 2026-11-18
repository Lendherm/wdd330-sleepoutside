import {
  getLocalStorage,
  setLocalStorage,
  updateCartCount,
} from './utils.mjs';

function cartItemTemplate(item, index) {
  const image = item.Image || item.Images?.PrimaryMedium || '';
  return `<li class="cart-card divider" data-index="${index}">
  <a href="#" class="cart-card__image">
    <img
      src="${image}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors?.[0]?.ColorName || ''}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
  <button
    type="button"
    class="cart-card__remove"
    data-index="${index}"
    aria-label="Remove ${item.Name} from cart"
  >
    X
  </button>
</li>`;
}

export default class ShoppingCart {
  constructor(key, listElement) {
    this.key = key;
    this.listElement = listElement;
  }

  init() {
    this.renderCart();
    this.listElement.addEventListener('click', (event) => {
      const button = event.target.closest('.cart-card__remove');
      if (!button) return;
      const index = Number(button.dataset.index);
      if (Number.isNaN(index)) return;
      this.removeItem(index);
    });
  }

  getCartItems() {
    const cartItems = getLocalStorage(this.key);
    return Array.isArray(cartItems) ? cartItems : [];
  }

  removeItem(index) {
    const cartItems = this.getCartItems();
    if (index < 0 || index >= cartItems.length) return;
    cartItems.splice(index, 1);
    setLocalStorage(this.key, cartItems);
    this.renderCart();
    updateCartCount();
  }

  renderCart() {
    const cartItems = this.getCartItems();
    const cartFooter = document.querySelector('.cart-footer');
    const cartTotalEl = document.querySelector('.cart-total');

    if (cartItems.length === 0) {
      this.listElement.innerHTML =
        '<li class="cart-empty">Your cart is empty. <a href="/index.html">Continue shopping</a></li>';
      if (cartFooter) {
        cartFooter.classList.add('hide');
      }
      return;
    }

    // Preserve index for remove buttons (duplicates share the same Id)
    const htmlStrings = cartItems.map((item, index) =>
      cartItemTemplate(item, index),
    );
    this.listElement.innerHTML = htmlStrings.join('');

    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.FinalPrice || 0),
      0,
    );
    if (cartFooter && cartTotalEl) {
      cartFooter.classList.remove('hide');
      cartTotalEl.textContent = `Total: $${total.toFixed(2)}`;
    }
  }
}
