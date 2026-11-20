import './header.js'; // the search bar lives in the header, so it must exist first
import {products, loadProducts} from '../data/products.js';

const MAX_SUGGESTIONS = 8;

// True when every word the user typed appears somewhere in the product name.
export function matchesSearch(product, term){
  const name = product.name.toLowerCase();
  return term.toLowerCase().split(/\s+/).filter(Boolean).every(word => name.includes(word));
}

export function getSearchTerm(){
  return (new URLSearchParams(window.location.search).get('search') || '').trim();
}

export function escapeHtml(text){
  return text.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

export function initSearchBar(){
  const bar = document.querySelector('.amazon-input-bar');
  if(!bar) return;

  const input = bar.querySelector('.search-bar');
  const button = bar.querySelector('.search-button');

  const list = document.createElement('ul');
  list.className = 'search-suggestions';
  list.hidden = true;
  bar.appendChild(list);

  let activeIndex = -1;

  input.value = getSearchTerm();
  input.setAttribute('autocomplete', 'off');

  function runSearch(term = input.value){
    term = term.trim();
    window.location.href = term
      ? `amazon.html?search=${encodeURIComponent(term)}`
      : 'amazon.html';
  }

  function hideSuggestions(){
    list.hidden = true;
    activeIndex = -1;
  }

  function setActive(index){
    const items = list.querySelectorAll('li');
    if(items.length === 0) return;
    activeIndex = (index + items.length) % items.length;
    items.forEach((li, i) => li.classList.toggle('active', i === activeIndex));
    input.value = items[activeIndex].dataset.name;
  }

  function showSuggestions(){
    const term = input.value.trim();
    if(!term){ hideSuggestions(); return; }

    const matches = products.filter(p => matchesSearch(p, term)).slice(0, MAX_SUGGESTIONS);
    if(matches.length === 0){ hideSuggestions(); return; }

    list.innerHTML = matches.map(p => `
      <li data-name="${escapeHtml(p.name)}">${escapeHtml(p.name)}</li>
    `).join('');
    activeIndex = -1;
    list.hidden = false;
  }

  loadProducts().catch(error => console.error('Failed to load products for search:', error));

  input.addEventListener('input', showSuggestions);
  input.addEventListener('focus', showSuggestions);

  input.addEventListener('keydown', event => {
    if(event.key === 'Enter'){
      event.preventDefault();
      runSearch();
    } else if(event.key === 'ArrowDown' && !list.hidden){
      event.preventDefault();
      setActive(activeIndex + 1);
    } else if(event.key === 'ArrowUp' && !list.hidden){
      event.preventDefault();
      setActive(activeIndex - 1);
    } else if(event.key === 'Escape'){
      hideSuggestions();
    }
  });

  button.addEventListener('click', () => runSearch());

  // mousedown fires before the input's blur, so the click isn't lost.
  list.addEventListener('mousedown', event => {
    const li = event.target.closest('li');
    if(!li) return;
    event.preventDefault();
    input.value = li.dataset.name;
    runSearch();
  });

  input.addEventListener('blur', hideSuggestions);
}

initSearchBar();
