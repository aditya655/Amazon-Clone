export let products = [];

let loadPromise = null;

// Cached so pages that call this more than once (e.g. the page script and the
// search bar) only fetch products.json one time.
export function loadProducts(){
  if(!loadPromise){
    loadPromise = fetch('../backend/products.json')
      .then(response => {
        // fetch only rejects on network failure, so a 404 or 500 has to be checked by hand.
        if(!response.ok) throw new Error(`HTTP ${response.status} loading products.json`);
        return response.json();
      })
      .then(data => {products = data;})
      .catch(error => {
        loadPromise = null;
        throw error;
      });
  }
  return loadPromise;
}

export function getProduct(productId){
  return products.find(product => product.id === productId);
}