import {getCartQuantity, reloadCart} from '../data/cart.js';

// One header for every page that has <header class="amazon-header-section">.
// Edit it here once instead of in each HTML file.
const header = document.querySelector('.amazon-header-section');

header.innerHTML = `
  <a class="header-link amazon-header-logo" href="amazon.html">
    <img class="amazon-logo" src="../images/amazon-logo-white.png" alt="Amazon home">
  </a>

  <div class="amazon-input-bar">
    <input class="search-bar" placeholder="Search" aria-label="Search products">
    <button class="search-button" aria-label="Search">
      <img class="search-icon" src="../images/icons/search-icon.png" alt="">
    </button>
  </div>

  <a class="header-link order-and-cart" href="orders.html">
    <span class="returns-text">Returns</span>
    <span class="orders-text">&amp; Orders</span>
  </a>

  <a class="header-link cart-link" href="checkout.html">
    <img class="cart" src="../images/icons/cart-icon.png" alt="">
    <span class="cart-quantity" hidden>0</span>
    <span class="cart-text">Cart</span>
  </a>
`;

const cartQuantityElement = header.querySelector('.cart-quantity');

export function updateCartQuantity(){
  const total = getCartQuantity();
  cartQuantityElement.textContent = total;
  cartQuantityElement.hidden = total === 0;
}

// 'storage' fires in OTHER open tabs when this site's localStorage changes
// (key is null when storage was cleared). Keep the badge in sync.
window.addEventListener('storage', event => {
  if(event.key !== 'cart' && event.key !== null) return;
  reloadCart();
  updateCartQuantity();
});

updateCartQuantity();
