import {loadFromStorage, saveToStorage} from './storage.js';

export const orders = loadFromStorage('orders', []);

function saveOrders(){
  saveToStorage('orders', orders);
}

export function addOrder(order){
  orders.unshift(order);
  saveOrders();
}
