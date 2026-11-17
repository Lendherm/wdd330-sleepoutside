import { loadHeaderFooter } from './utils.mjs';
import CheckoutProcess, { listenForCheckout } from './CheckoutProcess.mjs';

loadHeaderFooter();

const checkout = new CheckoutProcess('so-cart', '.order-summary');
checkout.init();
listenForCheckout(checkout);
