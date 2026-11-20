import {cart, removeFromCart,updateDeliveryOption,updateQuantity,clearCart,reloadCart} from '../data/cart.js';
import{deliveryOptions,getDeliveryOption, getDeliveryDate, getDeliveryTime} from '../data/deliveryOptions.js';
import {loadProducts,getProduct} from '../data/products.js';
import {addOrder} from '../data/orders.js';


const cartItemsEl = document.querySelector('.cart-items');
const summaryEl = document.querySelector('.order-summary');
const itemCountEl = document.querySelector('.item-count');


function formatMoney(cents){
  return `$${(cents / 100).toFixed(2)}`;
}

function calculateTotals(){
  let itemCount = 0;
  let itemsCents = 0;
  let shippingCents = 0;

  cart.forEach(cartItem => {
    const product = getProduct(cartItem.productId);
    if(!product) return;

    itemCount += cartItem.quantity;
    itemsCents += product.priceCents * cartItem.quantity;
    shippingCents += getDeliveryOption(cartItem.deliveryOptionId).priceCents;
  });

  const beforeTaxCents = itemsCents + shippingCents;
  const taxCents = Math.round(beforeTaxCents * 0.1);
  const totalCents = beforeTaxCents + taxCents;

  return {itemCount, itemsCents, shippingCents,beforeTaxCents,taxCents,totalCents};
}

function renderOrderSummary(){
  const total = calculateTotals();

  summaryEl.innerHTML = `<div class="summary-title">Order Summary</div>

          <div class="summary-row">
            <span>Items (${total.itemCount}):</span>
            <span>${formatMoney(total.itemsCents)}</span>
          </div>

          <div class="summary-row">
            <span>Shipping &amp; handling:</span>
            <span class="subtotal-line">${formatMoney(total.shippingCents)}</span>
          </div>

          <div class="summary-row">
            <span>Total before tax:</span>
            <span>${formatMoney(total.beforeTaxCents)}</span>
          </div>

          <div class="summary-row">
            <span>Estimated tax (10%):</span>
            <span>${formatMoney(total.taxCents)}</span>
          </div>

          <div class="summary-row total-row">
            <span>Order total:</span>
            <span>${formatMoney(total.totalCents)}</span>
          </div>

          <button class="order-button" ${cart.length === 0 ? 'disabled' : ''}>Place your order</button>`;

          itemCountEl.textContent = `${total.itemCount} items`;
}

function renderDeliveryOptions(){
  let html = '';

  cart.forEach(cartItem => {
    const product = getProduct(cartItem.productId);
    if (!product) return;

    const selected = getDeliveryOption(cartItem.deliveryOptionId);
    
    let optionsHTML = '';
    deliveryOptions.forEach(option => {
      const priceText = option.priceCents === 0 ? 'FREE Shipping' : `${formatMoney(option.priceCents)} - Shipping`;

      optionsHTML += `
        <label class = "option">
          <input type ="radio" class = "delivery-radio"
          name = "delivery-${cartItem.productId}"
          value = "${option.id}"
          ${option.id === selected.id ? 'checked' : ''}>
          
          <div>
            <div class = "option-date"> ${getDeliveryDate(option.deliveryDays)} </div>
            <div class = "option-price"> ${priceText} </div>
          </div>
      
        </label>
      `;
    });
     
    html += `
      <div class = "delivery" data-product-id = "${product.id}">
        <div class = "delivery-date"> Delivery date : ${getDeliveryDate(selected.deliveryDays)} </div>

        <div class = "delivery-body">
          <div class = "item">
            <img class = "image" src = "${product.image}" alt = "${product.name}">
            <div class = "text">
              <div class = "name"> ${product.name} </div>
              <div class = "price"> ${formatMoney(product.priceCents)} </div>
              <div class = "quantity">
                Quantity: <span class = "quantity-label"> ${cartItem.quantity} </span>
                <input class = "quantity-input" type = "number" min = "1" max = "999" value = "${cartItem.quantity}" aria-label = "Quantity">
                <button type = "button" class = "link update-link">Update</button>
                <button type = "button" class = "link save-link">Save</button>
                <button type = "button" class = "link delete-link">Delete</button>
              </div>
            </div>
          </div>

          <div class = "delivery-option">
            <div class = "options-title"> Choose a delivery option: </div>
            ${optionsHTML}
          </div>
        </div>
      </div>
    `;
  });

  if(cart.length === 0)
     html = `<p> Your cart is empty. <a class = "link" href = "amazon.html"> View products</a></p>`;
  
    cartItemsEl.innerHTML = html;
  }

function renderCheckout(){
  renderOrderSummary();
  renderDeliveryOptions();
}

// event handlers

function saveQuantity(card){
  const productId = card.dataset.productId;
  const value = Number(card.querySelector('.quantity-input').value);

  if(!updateQuantity(productId,value)){
    alert('Quantity must be between 1 and 999.');
    return;
  }
  renderCheckout();
}

// Update / Save / Delete
cartItemsEl.addEventListener('click', event => {
  const card = event.target.closest('.delivery');
  if (!card) return;

  if (event.target.classList.contains('delete-link')){
    removeFromCart(card.dataset.productId);
    renderCheckout();
  } else if (event.target.classList.contains('update-link')){
    card.classList.add('is-editing');
    card.querySelector('.quantity-input').focus();
  } else if (event.target.classList.contains('save-link'))
    saveQuantity(card);
});

// Quantity textbox: Enter = save, Escape = cancel

cartItemsEl.addEventListener('keydown', event => {
  if(!event.target.classList.contains('quantity-input')) return;
  const card = event.target.closest('.delivery');

  if (event.key === 'Enter') saveQuantity(card);
  if (event.key === 'Escape') renderCheckout();
});

// Delivery option radios

cartItemsEl.addEventListener('change', event => {
  if (!event.target.classList.contains('delivery-radio')) return;

  const productId = event.target.closest('.delivery').dataset.productId;
  updateDeliveryOption(productId,event.target.value);
  renderCheckout();
});

// Place order

summaryEl.addEventListener('click', event => {
  if (!event.target.classList.contains('order-button')) return;
  if(cart.length === 0) return;

  addOrder({
    id: crypto.randomUUID(),
    orderTime: new Date().toISOString(),
    totalCents : calculateTotals().totalCents,
    products: cart.map(cartItem => ({
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      deliveryDate: getDeliveryDate(getDeliveryOption(cartItem.deliveryOptionId).deliveryDays),
      deliveryTime: getDeliveryTime(getDeliveryOption(cartItem.deliveryOptionId).deliveryDays).toISOString()
    }))
  });

  clearCart();
  window.location.href = 'orders.html';
});

// Another tab changed the cart: reload it and redraw this page.
window.addEventListener('storage', event => {
  if(event.key !== 'cart' && event.key !== null) return;
  reloadCart();
  renderCheckout();
});

//----------start------------

loadProducts().then(renderCheckout).catch(error => console.error('Failed to load products:', error));