import {orders} from '../data/orders.js';
import {addToCart} from '../data/cart.js';
import {loadProducts, getProduct} from '../data/products.js';
import {updateCartQuantity} from './header.js';
import './search.js';

const ordersEl = document.querySelector('.orders');

function formatOrderDate(isoString){
  return new Date(isoString).toLocaleDateString('en-US', {month: 'long', day: 'numeric'});
}

function productRowHTML(order, item){
  const product = getProduct(item.productId);
  if(!product) return '';

  return `
    <div class="product-row">
      <div class="image">
        <img class="product-image" src="${product.image}" alt="${product.name}">
      </div>

      <div class="description-and-buttons">
        <div class="description">
          <p class="order-title">${product.name}</p>
          <p class="delivery-date">Delivered on: ${item.deliveryDate}</p>
          <p class="quantity">Quantity: ${item.quantity}</p>

          <button class="buy-it-again" data-product-id="${item.productId}">
            <img class="buy-again-icon" src="../images/icons/buy-again.png" alt="">
            Buy it again
          </button>
        </div>

        <div class="buttons">
          <a class="track-package" href="tracking.html?orderId=${order.id}&productId=${item.productId}">
            Track package
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderOrders(){
  if(orders.length === 0){
    ordersEl.innerHTML = '<p class="no-orders">No orders yet.</p>';
    return;
  }

  let html = '';

  orders.forEach(order => {
    html += `
      <div class="order">
        <div class="order-header">
          <div class="order-header-left">
            <div class="order-date">
              <p class="label">Order Placed:</p>
              <p>${formatOrderDate(order.orderTime)}</p>
            </div>

            <div class="total-cost">
              <p class="label">Total:</p>
              <p>$${(order.totalCents / 100).toFixed(2)}</p>
            </div>
          </div>

          <div class="order-id">
            <p class="label">Order ID:</p>
            <p>${order.id}</p>
          </div>
        </div>

        <div class="order-details">
          ${order.products.map(item => productRowHTML(order, item)).join('')}
        </div>
      </div>
    `;
  });

  ordersEl.innerHTML = html;
}

// Buy it again

ordersEl.addEventListener('click', event => {
  const button = event.target.closest('.buy-it-again');
  if(!button) return;

  if(!addToCart(button.dataset.productId, 1)){
    alert('Cannot add more of this item to the cart.');
    return;
  }

  updateCartQuantity();
  showAdded(button);
});

// Briefly swap the button text so the click visibly does something
function showAdded(button){
  if(!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;

  button.innerHTML = '&#10003; Added';
  clearTimeout(button.addedTimeout);
  button.addedTimeout = setTimeout(() => {
    button.innerHTML = button.dataset.originalHtml;
  }, 1500);
}

//----------start------------

loadProducts().then(renderOrders).catch(error => console.error('Failed to load products:', error));
