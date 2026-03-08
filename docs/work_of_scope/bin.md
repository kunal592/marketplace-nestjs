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