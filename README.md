# Amazon Clone

A front-end Amazon-style store built with plain **HTML, CSS and JavaScript**, without frameworks or a server.
Product data is loaded from a JSON file, and the cart and order history are saved in the browser's **localStorage**.

## Features

- **Product grid** with ratings, prices and a quantity picker (1–10 from a dropdown, or type any amount up to 999)
- **Search bar** with live suggestions, arrow-key navigation, and a shareable results URL (`amazon.html?search=socks`)
- **Cart** with a badge in the header that stays in sync across open tabs
- **Checkout**: change quantities, remove items, pick one of three delivery speeds per item, and see the totals with 10% tax
- **Orders page**: past orders, newest first, with a "Buy it again" button
- **Package tracking**: progress bar and Preparing → Shipped → Delivered stages based on the order and delivery dates
- Responsive layout down to phone width

## Tech

| Area | How it's done |
| --- | --- |
| Structure | Semantic HTML5, one page per view |
| Styling | CSS Flexbox and Grid, media queries, shared and page-specific stylesheets |
| Logic | Vanilla JavaScript ES modules (`import` / `export`) |
| Data | `backend/products.json` loaded with `fetch` and Promises |
| Persistence | `localStorage` (cart and orders), with a guarded JSON reader |
| Patterns | Event delegation, "change data → re-render", money stored in cents, dates stored as ISO strings |

## Run it locally

ES modules and `fetch` don't work when the HTML file is opened directly from disk (`file://`), so serve the folder over HTTP:

- **VS Code:** install the *Live Server* extension, right-click `html/amazon.html` and choose **Open with Live Server**
- **Or** from the project root, run `npx serve .` (or `python -m http.server`) and open `http://localhost:<port>/html/amazon.html`

Nothing needs to be installed or built.

## Project structure

```
backend/
  products.json          product catalog (42 products)
data/                    state and persistence (no DOM code)
  storage.js             safe localStorage read / write
  products.js            loadProducts() (cached Promise), getProduct()
  cart.js                cart array + add / update / remove / clear
  deliveryOptions.js     shipping options and delivery-date maths
  orders.js              order history
JavaScript/              one script per page, plus shared UI
  header.js              shared header + cart badge
  search.js              search bar and suggestions
  amazon.js              product grid
  checkout.js            cart review and place order
  orders.js              order history page
  tracking.js            package tracking page
html/                    amazon, checkout, orders, tracking pages
css/
  shared/                base styles and header
  pages/                 one stylesheet per page
images/
```

## How data flows

1. A page script calls `loadProducts()`, which fetches `products.json` once and shares that one Promise with every caller.
2. User actions call functions in `data/` (for example `addToCart`). They update the in-memory array and save it to `localStorage`.
3. The page re-renders from that data.
4. Placing an order turns the cart into an order record. The cart is cleared, and the order shows up on the orders page.
5. "Track package" opens `tracking.html?orderId=…&productId=…`, and the tracking page reads those values from the URL.

## Limitations

This version has no backend, so everything lives in one browser on one device. Clearing site data resets the cart and orders, and there are no user accounts or real payments.

## Roadmap

Planned next version, after learning React, TypeScript and SQL:

- **Frontend:** rebuild in React + TypeScript
- **Backend:** a REST API (for example Node + Express) backed by a SQL database
  - `GET /products`, `GET /products/:id`
  - `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:productId`, `DELETE /cart/items/:productId`
  - `POST /orders`, `GET /orders`, `GET /orders/:id`
- Replace `localStorage` with the API so the cart and orders persist per user across devices
- User accounts and authentication
