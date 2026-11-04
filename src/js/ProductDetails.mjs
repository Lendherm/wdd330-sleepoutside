import { getLocalStorage, setLocalStorage } from './utils.mjs';

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    // use the datasource to get the details for the current product
    this.product = await this.dataSource.findProductById(this.productId);

    // the product details are needed before rendering the HTML
    this.renderProductDetails();

    // once the HTML is rendered, add a listener to the Add to Cart button
    // Notice the .bind(this). Without it, `this` inside addToCart would not be the class instance.
    document
      .getElementById('addToCart')
      .addEventListener('click', this.addToCart.bind(this));
  }

  addToCart() {
    this.addProductToCart(this.product);
  }

  addProductToCart(product) {
    let cartItems = getLocalStorage('so-cart') || [];
    if (!Array.isArray(cartItems)) {
      cartItems = [cartItems];
    }
    cartItems.push(product);
    setLocalStorage('so-cart', cartItems);
  }

  renderProductDetails() {
    document.querySelector('title').textContent =
      `Sleep Outside | ${this.product.NameWithoutBrand}`;

    const productDetail = document.querySelector('.product-detail');
    productDetail.innerHTML = `
      <h3>${this.product.Brand.Name}</h3>
      <h2 class="divider">${this.product.NameWithoutBrand}</h2>
      <img
        class="divider"
        src="${this.product.Image}"
        alt="${this.product.Name}"
      />
      <p class="product-card__price">$${this.product.FinalPrice}</p>
      <p class="product__color">${this.product.Colors[0].ColorName}</p>
      <p class="product__description">${this.product.DescriptionHtmlSimple}</p>
      <div class="product-detail__add">
        <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
      </div>
    `;
  }
}
