-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('CREATED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED');

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "vendorOrderId" TEXT NOT NULL,
    "courier" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "shippingCost" DOUBLE PRECISION,
    "estimatedDelivery" TIMESTAMP(3),
    "status" "ShipmentStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shipments_vendorOrderId_key" ON "shipments"("vendorOrderId");

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_vendorOrderId_fkey" FOREIGN KEY ("vendorOrderId") REFERENCES "vendor_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
