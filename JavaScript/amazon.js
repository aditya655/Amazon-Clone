import {addToCart} from '../data/cart.js';
import {products, loadProducts} from '../data/products.js';
import {updateCartQuantity} from './header.js';
import {matchesSearch, getSearchTerm, escapeHtml} from './search.js';

let quantityOptions = '';

const itemsContainer = document.querySelector('.items');

for(let i = 1; i <= 10; i++){
      quantityOptions += `<option value="${i}">${i}</option>`;
}
quantityOptions += `<option value="10+"> 10+ </option>`;

function renderProducts(products){
  let html='';

  products.forEach(product => {

    const ratingImage = `../images/ratings/rating-${product.rating.stars * 10}.png`;

    html += `
     
      <div class="item">

        <div class="image">
         <img src="${product.image}" alt="${product.name}">
        </div>

        <div class="description">
          ${product.name}
        </div>

        <div class="ratings">
          <img class="rating-stars" src="${ratingImage}" alt="${product.rating.stars} out of 5 stars">
          <span class="rating-count">${product.rating.count}</span>
        </div>

        <div class="price"> 
          $${(product.priceCents / 100).toFixed(2)}
        </div>

        <div class="counter">
           <select class="quantity-selector" data-product-id="${product.id}" aria-label="Quantity"> ${quantityOptions} </select>

           <input type ="number" class="quantity-input" data-product-id="${product.id}" min = "11" max="999" value = "11" aria-label="Quantity" hidden>

        </div>

        <div class="add-to-cart">
          <button class="cart-button"> Add to Cart </button> 
        </div>

      </div>
    `;
  
  });
  itemsContainer.innerHTML = html;

}

loadProducts()
  .then(() => {
    const term = getSearchTerm();
    const results = term ? products.filter(p => matchesSearch(p, term)) : products;

    if(results.length === 0){
      itemsContainer.innerHTML = `<p class="no-results">No results for "${escapeHtml(term)}".</p>`;
      return;
    }
    renderProducts(results);
  })
  .catch(error => console.error('Failed to load products:', error));

itemsContainer.addEventListener('change',event =>{
  const select = event.target;
    if(!select.classList.contains('quantity-selector')) return;

  if(select.value === '10+'){
    const input = select.nextElementSibling;
    select.hidden = true;
    input.hidden = false;
    input.focus();
  } 
});

itemsContainer.addEventListener('click', event => {
  if(!event.target.classList.contains('cart-button')) return;

  const item = event.target.closest('.item');
  const select = item.querySelector('.quantity-selector');
  const input = item.querySelector('.quantity-input');
  const productId = select.dataset.productId;

  const quantity = input.hidden ? Number(select.value) : Number(input.value);

  if(!Number.isInteger(quantity) || quantity < 1 || quantity > 999){
    alert('Please enter a quantity between 1 and 999.');
    return;
  }

  if(!addToCart(productId, quantity)){
    alert('You can have at most 999 of one item in your cart.');
    return;
  }
  updateCartQuantity();
});

itemsContainer.addEventListener('focusout', event =>{
  const input = event.target;
  if(!input.classList.contains('quantity-input')) return;

  const value = Number(input.value);
  const valid = Number.isInteger(value) && value >= 11 && value <= 999;

  if(!valid){
    const select = input.previousElementSibling;
    input.hidden = true;
    input.value = 11;
    select.hidden = false;
    select.value = '1';
  }
});