import { renderListWithTemplate } from './utils.mjs';

function productCardTemplate(product) {
  const image =
    product.Images?.PrimaryMedium || product.Image || '';
  return `<li class="product-card">
    <a href="/product_pages/?product=${product.Id}">
      <img src="${image}" alt="Image of ${product.Name}">
      <h2 class="card__brand">${product.Brand.Name}</h2>
      <h3 class="card__name">${product.NameWithoutBrand}</h3>
      <p class="product-card__price">$${product.FinalPrice}</p>
    </a>
  </li>`;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    const list = await this.dataSource.getData(this.category);
    this.renderList(list);
    this.updateTitle();
  }

  renderList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list, 'afterbegin', true);
  }

  updateTitle() {
    const titleEl = document.querySelector('.products h2');
    if (!titleEl || !this.category) return;
    const label = this.category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    titleEl.textContent = `Top Products: ${label}`;
  }
}
