The database has been successfully seeded! 🌱

I created a complete test ecosystem for you. Here are the credentials you can use to test the different roles and flows on your running server (all passwords are the same for simplicity):

👑 Admin User

Email: admin@nox.com
Password: admin123
Use this to test the analytics, vendor approvals, and payout processing endpoints.
🏪 Vendor 1 (Nike)

Email: nike@nox.com
Password: vendor123
Has a heavy-weight t-shirt with size variants (S, M, L, XL).
🛹 Vendor 2 (Skate Syndicate)

Email: skate@nox.com
Password: vendor123
Has an oversized graphic acid wash tee with variants, and a basic white tee.
🛒 Normal Customer

Email: customer@nox.com
Password: customer123
Use this account to add items from both vendors to your cart simultaneously, so you can test the multi-vendor order splitting logic.
Quick Test Flow Idea
You can use Postman, Bruno, or curl to test the core checkout constraint:

Login as customer@nox.com to get a JWT.
Hit GET /api/products to see the seeded t-shirts and grab their ids.
Add the Nike shirt and the Skate Syndicate shirt to your cart (POST /api/cart/items).
Hit POST /api/orders to checkout.
In the database (or via the Admin GET /api/admin/orders endpoint), you should see exactly one parent 

Order
 created, and two 

VendorOrders
 successfully split out and assigned to each vendor with their respective commissions calculated automatically!



 ---



 Here is the comprehensive, final list of all the API endpoints currently implemented in the multi-vendor marketplace backend. I have organized them logically by domain and included the expected roles/auth requirements:

1. Authentication & Users (AuthModule)
Public endpoints for user onboarding and identity.

POST /auth/register - Register a new customer account.
POST /auth/login - Authenticate a user and return a JWT token.
GET /auth/me - (Auth) Retrieve the currently logged-in user profile.
2. Vendors (VendorModule)
Core operations for sellers establishing their storefronts.

POST /vendors/register - (Auth) Apply to become a vendor (creates a pending store profile).
GET /vendors/me - (Vendor) Fetch the authenticated vendor's store details.
3. Products & Inventory (ProductModule)
Catalog management connecting buyers to sellers.

GET /products - (Public) Fetch active products with filtering, search, and pagination.
GET /products/:slug - (Public) Get detailed product info by slug (includes active variants/reviews).
POST /products - (Vendor) Create a new product listing.
POST /products/:id/variants - (Vendor) Attach a new SKU/variant to an existing product.
4. Categories (CategoryModule)
Hierarchical taxonomy.

GET /categories - (Public) Retrieve the category tree (handles nested subcategories).
GET /categories/:slug - (Public) Retrieve a specific category.
POST /categories - (Admin) Create a new category.
5. Shopping Cart (CartModule)
Volatile storage holding pre-checkout intent.

GET /cart - (Auth) Retrieve the user's active cart and all item details.
POST /cart/items - (Auth) Add a product (or product variant) to the cart.
PATCH /cart/items/:productId/:variantId - (Auth) Increment/decrement item quantity.
DELETE /cart/items/:productId/:variantId - (Auth) Remove an item cleanly from the cart.
6. Customer Addresses (AddressesModule)
Recently added: Management of shipping destinations.

POST /addresses - (Auth) Create a new shipping address.
GET /addresses - (Auth) List all addresses for the logged-in user.
PATCH /addresses/:id - (Auth) Update address details (street, city, etc).
PATCH /addresses/:id/default - (Auth) Set a specific address as the primary/default shipping profile.
DELETE /addresses/:id - (Auth) Securely delete an address (prevents deletion if tied to active orders).
7. Coupons & Promotions (

CouponsModule
)
Recently added: Discounts and cart modifications.

GET /coupons - (Admin/Vendor) List all generated coupons (Vendors see theirs, Admins see platform-wide).
POST /coupons - (Admin/Vendor) Create a new percentage or fixed discount promotional code.
PATCH /coupons/:id - (Admin/Vendor) Modify limits or expiration dates.
DELETE /coupons/:id - (Admin/Vendor) Remove a coupon.
8. Orders & Checkout (

OrdersModule
)
The transactional core splitting multi-vendor purchases. Customer Order Actions

POST /orders/apply-coupon - (Auth) Dry-run a coupon calculation safely before paying.
POST /orders - (Auth) [Idempotent] The primary checkout endpoint. Turns cart into Orders, splits into VendorOrders, reserves stock, creates Shipments, drops totals, and returns a Payment ticket.
GET /orders/my - (Auth) List a user's past and current orders.
GET /orders/:id - (Auth) Get specific details of a parent order.
GET /orders/:id/tracking - (Auth) Fetch the shipment tracking configurations nested inside an order.
Vendor Fulfillment Actions

GET /vendor-orders - (Vendor) List all items sold by this vendor across various customer orders.
PATCH /vendor-orders/:id/status - (Vendor) Update the status of their slice of the order (e.g., PROCESSING).
POST /vendor-orders/:id/ship - (Vendor) Generate/initiate the outbound tracking shipment flow.
PATCH /vendor-orders/:id/tracking - (Vendor) Update the active tracking number or ETA.
9. Wishlist (

WishlistModule
)
Recently added: Saving intents for later.

GET /wishlist - (Auth) Retrieve the user's saved wishlist products.
POST /wishlist - (Auth) Add a product natively to a wishlist (zero-duplicate guard active).
DELETE /wishlist/:productId - (Auth) Remove an item from the list.
10. Reviews & Ratings (ReviewsModule)
Post-delivery feedback.

GET /reviews/products/:id/summary - (Public) Get aggregate stats (average rating, count).
GET /reviews/products/:id - (Public) List all text reviews for an item.
POST /reviews/products/:id - (Auth) Submit a star rating and comment (prevents duplicates).
11. Payments (PaymentsModule)
Integration with Razorpay pipelines.

POST /payments/create - (Auth) [Idempotent] Generate a Razorpay order shell.
POST /payments/verify - (Auth) Customer front-end returns the Razorpay signed ticket to safely execute the payment completion sequence.
POST /payments/webhook - (Public) Razorpay asynchronous webhook ingress (server-to-server).
12. Wallets & Payouts (WalletsModule & PayoutsModule)
Managing vendor balances seamlessly.

GET /wallets/my - (Vendor) Check their current balance (withdrawable) vs pendingBalance (not yet delivered).
POST /payouts/request - (Vendor) [Idempotent] Propose withdrawing funds to a bank account.
GET /payouts/my - (Vendor) Check the status of historically requested payouts.
13. System Administration (AdminModule)
Platform moderation and oversight.

GET /admin/vendors - (Admin) List all sellers on the platform.
PATCH /admin/vendors/:id/status - (Admin) Approve/Reject a vendor's registration application.
GET /admin/wallets - (Admin) Overview of all vendor liquidity currently locked in the system.
GET /admin/payouts - (Admin) List all vendor withdrawal requests.
PATCH /admin/payouts/:id/status - (Admin) Approve a payout and deduct it from the platform ledger.
14. Emergency & Maintenance Controls (SystemController & HealthModule)
Disaster recovery endpoints.

GET /health - (Public) [Rate Limited] Returns the alive status of the API, Postgres connection latency, and memory checks.
GET /admin/system/cooldown - (Admin) Fetch the current cooldown lock state.
PATCH /admin/system/cooldown - (Admin) CRITICAL LOCK. Toggles the system cooldown on/off. Instantly 403 blocks all transactional operations (checkout, payments, payouts) globally until fixed.
Everything listed above is fully functional, heavily typed via TS DTOs, protected gracefully by system guards (Rate Limits, RBAC Roles, JWT), and database structured mapping relations directly. Let me know what to target next!