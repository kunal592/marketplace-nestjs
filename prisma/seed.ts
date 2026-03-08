import { PrismaClient, Role, VendorStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { generateUniqueSlug } from '../src/utils/slug.util';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@nox.com' },
        update: {},
        create: {
            name: 'NØX Admin',
            email: 'admin@nox.com',
            password: adminPassword,
            role: Role.ADMIN,
            phone: '+18000000000',
        },
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // 2. Create Vendors (Users first, then Vendor profiles)
    const vendor1Password = await bcrypt.hash('vendor123', 10);
    const userVendor1 = await prisma.user.upsert({
        where: { email: 'nike@nox.com' },
        update: {},
        create: {
            name: 'Nike Official',
            email: 'nike@nox.com',
            password: vendor1Password,
            role: Role.VENDOR,
        },
    });

    const vendor1 = await prisma.vendor.upsert({
        where: { userId: userVendor1.id },
        update: {},
        create: {
            userId: userVendor1.id,
            storeName: 'Nike Official Store',
            storeSlug: 'nike-official-store',
            description: 'Authentic Nike Streetwear',
            status: VendorStatus.APPROVED,
            wallet: { create: {} }, // Auto-create wallet
        },
    });
    console.log(`✅ Vendor created: ${vendor1.storeName}`);

    const vendor2Password = await bcrypt.hash('vendor123', 10);
    const userVendor2 = await prisma.user.upsert({
        where: { email: 'skate@nox.com' },
        update: {},
        create: {
            name: 'Skate Syndicate',
            email: 'skate@nox.com',
            password: vendor2Password,
            role: Role.VENDOR,
        },
    });

    const vendor2 = await prisma.vendor.upsert({
        where: { userId: userVendor2.id },
        update: {},
        create: {
            userId: userVendor2.id,
            storeName: 'Skate Syndicate',
            storeSlug: 'skate-syndicate',
            description: 'Underground skate brands and local street tees',
            status: VendorStatus.APPROVED,
            wallet: { create: {} },
        },
    });
    console.log(`✅ Vendor created: ${vendor2.storeName}`);

    // 3. Create Categories
    const catMens = await prisma.category.upsert({
        where: { slug: 'mens' },
        update: {},
        create: { name: "Men's", slug: 'mens' },
    });

    const catWomens = await prisma.category.upsert({
        where: { slug: 'womens' },
        update: {},
        create: { name: "Women's", slug: 'womens' },
    });

    const catTShirts = await prisma.category.upsert({
        where: { slug: 't-shirts' },
        update: {},
        create: { name: 'T-Shirts', slug: 't-shirts', parentId: catMens.id },
    });
    console.log(`✅ Categories created`);

    // 4. Create Products for Vendor 1 (Nike)
    const prod1 = await prisma.product.upsert({
        where: { slug: 'nike-essential-tee-black' },
        update: {},
        create: {
            name: 'Nike Essential Heavyweight Tee',
            slug: 'nike-essential-tee-black',
            description: 'Premium heavyweight cotton classic fit tee.',
            price: 2499,
            stock: 0, // Managed by variants
            vendorId: vendor1.id,
            categoryId: catTShirts.id,
            images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'],
            variants: {
                create: [
                    { sku: 'NKE-ESS-BLK-S', price: 2499, stock: 15, attributes: { size: 'S', color: 'Black' } },
                    { sku: 'NKE-ESS-BLK-M', price: 2499, stock: 40, attributes: { size: 'M', color: 'Black' } },
                    { sku: 'NKE-ESS-BLK-L', price: 2499, stock: 35, attributes: { size: 'L', color: 'Black' } },
                    { sku: 'NKE-ESS-BLK-XL', price: 2899, stock: 10, attributes: { size: 'XL', color: 'Black' } }, // XL costs more
                ],
            },
        },
    });

    // 5. Create Products for Vendor 2 (Skate)
    const prod2 = await prisma.product.upsert({
        where: { slug: 'skull-box-logo-tee' },
        update: {},
        create: {
            name: 'Skull Box Logo Oversized Tee',
            slug: 'skull-box-logo-tee',
            description: 'Acid wash oversized drop shoulder graphic tee.',
            price: 1899,
            discountPrice: 1499,
            stock: 0,
            vendorId: vendor2.id,
            categoryId: catTShirts.id,
            images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800'],
            variants: {
                create: [
                    { sku: 'SKT-SKL-WSH-M', price: 1499, stock: 20, attributes: { size: 'M', color: 'Acid Wash' } },
                    { sku: 'SKT-SKL-WSH-L', price: 1499, stock: 25, attributes: { size: 'L', color: 'Acid Wash' } },
                ],
            },
        },
    });

    const prod3 = await prisma.product.upsert({
        where: { slug: 'basic-white-layering-tee' },
        update: {},
        create: {
            name: 'Basic White Layering Tee',
            slug: 'basic-white-layering-tee',
            description: 'Longline basic white tee perfect for streetwear layering.',
            price: 999,
            stock: 100, // No variants for this one, just base stock
            vendorId: vendor2.id,
            categoryId: catTShirts.id,
            images: ['https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800'],
        },
    });
    console.log(`✅ Products and Variants created`);

    // 6. Create a normal Customer User
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await prisma.user.upsert({
        where: { email: 'customer@nox.com' },
        update: {},
        create: {
            name: 'Test Customer',
            email: 'customer@nox.com',
            password: customerPassword,
            role: Role.CUSTOMER,
        },
    });
    console.log(`✅ Customer created: ${customer.email}`);

    console.log('🎉 Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
