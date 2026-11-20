import {orders} from '../data/orders.js';
import {loadProducts, getProduct} from '../data/products.js';
import './header.js';
import './search.js';

const trackingEl = document.querySelector('.tracking');

// The "Track package" link on orders.html sends: tracking.html?orderId=...&productId=...
const url = new URLSearchParams(window.location.search);
const orderId = url.get('orderId');
const productId = url.get('productId');

function formatDeliveryDate(isoString){
  return new Date(isoString).toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric'});
}

// Older orders only saved text like "Monday, November 23" (no year),
// so rebuild the date using the year the order was placed.
function getDeliveryTime(order, item){
  if(item.deliveryTime) return item.deliveryTime;

  const orderDate = new Date(order.orderTime);
  const monthAndDay = item.deliveryDate.split(', ')[1]; // "November 23"
  const date = new Date(`${monthAndDay}, ${orderDate.getFullYear()}`);

  // Ordered in December, delivered in January -> next year
  if(date < orderDate) date.setFullYear(date.getFullYear() + 1);

  return date.toISOString();
}

// 0 = just ordered, 100 = delivery date reached
function getProgressPercent(orderTime, deliveryTime){
  const start = new Date(orderTime).getTime();
  const end = new Date(deliveryTime).getTime();
  const now = Date.now();

  const percent = ((now - start) / (end - start)) * 100;
  return Math.min(Math.max(percent, 0), 100);
}

function renderTracking(){
  // Find the matching order and the matching product inside it
  let matchingOrder;
  let matchingItem;

  orders.forEach(order => {
    if(order.id !== orderId) return;
    matchingOrder = order;

    order.products.forEach(item => {
      if(item.productId === productId) matchingItem = item;
    });
  });

  const product = matchingItem && getProduct(productId);

  if(!matchingOrder || !matchingItem || !product){
    trackingEl.innerHTML = `
      <a class="back-to-orders-link" href="orders.html">View all orders</a>
      <p>Order not found.</p>
    `;
    return;
  }

  const deliveryTime = getDeliveryTime(matchingOrder, matchingItem);
  const percent = getProgressPercent(matchingOrder.orderTime, deliveryTime);
  const dateText = formatDeliveryDate(deliveryTime);

  const delivered = percent >= 100;

  // Which stage label is highlighted: 0 Preparing, 1 Shipped, 2 Delivered
  let currentStage = 0;
  if(delivered) currentStage = 2;
  else if(percent >= 50) currentStage = 1;

  let labelsHTML = '';
  ['Preparing', 'Shipped', 'Delivered'].forEach((stage, index) => {
    labelsHTML += `<div class="label ${index === currentStage ? 'current' : ''}">${stage}</div>`;
  });

  trackingEl.innerHTML = `
    <a class="back-to-orders-link" href="orders.html">View all orders</a>

    <div class="item">
      <div class="text">
        <div class="delivery-date">${delivered ? 'Delivered' : 'Arriving'} on ${dateText}</div>
        <div class="product-name">${product.name}</div>
        <div class="quantity">Quantity: ${matchingItem.quantity}</div>
      </div>

      <div class="image">
        <img src="${product.image}" alt="${product.name}">
      </div>
    </div>

    <div class="stages">
      <div class="labels">
        ${labelsHTML}
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${percent}%"></div>
      </div>
    </div>
  `;
}

//----------start------------

loadProducts().then(renderTracking).catch(error => console.error('Failed to load products:', error));
