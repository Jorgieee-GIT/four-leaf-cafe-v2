# Four Leaves Café

Front-end only website (HTML, CSS, vanilla JS). Everything is saved in the browser with localStorage.
Open `index.html` to start. A local server such as VS Code Live Server is recommended.

## Structure
```
index.html            Landing page, login and sign-up (entry point)
pages/
  menu.html           Product menu (search, categories, add to cart)
  item.html           Product details (?id=<product-id>)
  checkout.html       Cart, shipping and billing, payment popup
  receipt.html        Order confirmation (?id=<order-number>)
  orders.html         My Orders (order history of the logged-in user)
  admin.html          Admin dashboard (products and all orders), separate from the customer pages
css/
  base.css            Shared: colors, header, footer, buttons, forms, popups, toast
  landing.css  menu.css  item.css  checkout.css  orders.css  admin.css
js/
  products.js         Default product catalog
  common.js           Shared: cart, accounts, orders, session, page guard, toast, header
  landing.js  menu.js  item.js  checkout.js  receipt.js  orders.js  admin.js
assets/images/
  brand/  products/  people/  icons/  ui/
```

## Demo accounts
- Customer: `user@gmail.com` / `user123`
- Admin: `admin@gmail.com` / `admin123`
- New customers can sign up on the landing page. Accounts are saved in this browser only.

## How it works
Customers and the admin are kept apart. After login, customers use the menu, item, checkout, orders and receipt pages,
and the admin only sees the admin dashboard (each side is redirected away from the other's pages).
Landing page (login) leads to the menu. Menu, item page and checkout share one cart. Paying creates an order,
shows the receipt, and saves it to My Orders. The admin dashboard lists every order (with a details popup) and
manages extra products that also appear on the customer menu. Logins and payments are demos and are not secure.

## Visual refresh (October 2026)
- Unified palette: warm page background `#F7F4ED`, cream `#FFFCF6`, brand beige `#D9CEBB`, charcoal `#292A23`, and supporting olive `#57544A`.
- The header logo is displayed in a bordered rounded-square frame throughout the website.
- The landing page uses a responsive editorial layout: welcome copy, prominently framed café artwork, and a sign-in/sign-up panel. `hero-framed.webp` is a carefully cropped variant of the original image made for this layout; the original `hero.webp` is kept.
- All six page-specific stylesheets reuse the shared colors, border styles, form controls and card surfaces from `css/base.css`.
- Existing JavaScript logic and demo account/checkout flows have not been changed.
