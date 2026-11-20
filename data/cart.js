import {loadFromStorage, saveToStorage} from './storage.js';

export const cart = loadFromStorage('cart', []);

export const MAX_QUANTITY = 999;

function isValidQuantity(q){
  return Number.isInteger(q) && q >= 1 && q <= MAX_QUANTITY;
}

export function saveCart(){
  saveToStorage('cart', cart);
}

// Total number of items (not rows) - used for the cart badge.
export function getCartQuantity(){
  return cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
}

// Re-read the cart after another tab changed it. Refills the SAME array
// in place, so every module that imported `cart` sees the new contents.
export function reloadCart(){
  cart.splice(0, cart.length, ...loadFromStorage('cart', []));
}

export function addToCart(productId,quantity){
  const existing = cart.find(cartItem => cartItem.productId === productId);
  const newTotal = (existing ? existing.quantity : 0) + quantity;

  if(!isValidQuantity(quantity) || newTotal > MAX_QUANTITY) return false;

  if(existing)
    existing.quantity = newTotal;
  else
    cart.push({productId,quantity,deliveryOptionId:'1'});

  saveCart();
  return true;
}

export function updateQuantity(productId, quantity){
  const existing = cart.find(cartItem => cartItem.productId === productId);
  if(!existing || !isValidQuantity(quantity)) return false;

  existing.quantity = quantity;
  saveCart();
  return true;
}

export function removeFromCart(productId){
  const index = cart.findIndex(cartItem => cartItem.productId === productId);

  if(index === -1) return;

  cart.splice(index,1);
  saveCart();
}

export function updateDeliveryOption(productId,deliveryOptionId){
  const existing = cart.find(cartItem => cartItem.productId === productId);
  if(!existing) return;

  existing.deliveryOptionId = deliveryOptionId;
  saveCart();
}

export function clearCart(){
  cart.length = 0;
  saveCart();
}