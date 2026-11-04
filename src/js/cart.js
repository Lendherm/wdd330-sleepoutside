import { getLocalStorage } from './utils.mjs';

function renderCartContents() {
  const cartItems = getLocalStorage('so-cart');
  const productList = document.querySelector('.product-list');
  const cartFooter = document.querySelector('.cart-footer');
  const cartTotalEl = document.querySelector('.cart-total');

  // Empty / missing cart should not throw (Empty Card Error: cart.html)
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    productList.innerHTML =
      '<li class="cart-empty">Your cart is empty. <a href="/index.html">Continue shopping</a></li>';
    if (cartFooter) {
      cartFooter.classList.add('hide');
    }
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  productList.innerHTML = htmlItems.join('');

  // Total$ in Cart
  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.FinalPrice || 0),
    0,
  );
  if (cartFooter && cartTotalEl) {
    cartFooter.classList.remove('hide');
    cartTotalEl.textContent = `Total: $${total.toFixed(2)}`;
  }
}

function cartItemTemplate(item) {
  const newItem = `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img
      src="${item.Image}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors[0].ColorName}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
</li>`;

  return newItem;
}

renderCartContents();
