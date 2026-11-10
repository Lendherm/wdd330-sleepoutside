import { getLocalStorage, renderListWithTemplate } from './utils.mjs';

function cartItemTemplate(item) {
  return `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img
      src="${item.Image}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors?.[0]?.ColorName || ''}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
</li>`;
}

export default class ShoppingCart {
  constructor(key, listElement) {
    this.key = key;
    this.listElement = listElement;
  }

  init() {
    const cartItems = getLocalStorage(this.key);
    const cartFooter = document.querySelector('.cart-footer');
    const cartTotalEl = document.querySelector('.cart-total');

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      this.listElement.innerHTML =
        '<li class="cart-empty">Your cart is empty. <a href="/index.html">Continue shopping</a></li>';
      if (cartFooter) {
        cartFooter.classList.add('hide');
      }
      return;
    }

    renderListWithTemplate(
      cartItemTemplate,
      this.listElement,
      cartItems,
      'afterbegin',
      true,
    );

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
