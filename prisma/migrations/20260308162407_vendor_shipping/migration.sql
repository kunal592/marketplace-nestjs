-- AlterTable
ALTER TABLE "vendor_orders" ADD COLUMN     "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "vendor_shipping_configs" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "baseShippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "perKgRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freeShippingThreshold" DOUBLE PRECISION,
    "estimatedDeliveryDays" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_shipping_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_shipping_configs_vendorId_key" ON "vendor_shipping_configs"("vendorId");

-- AddForeignKey
ALTER TABLE "vendor_shipping_configs" ADD CONSTRAINT "vendor_shipping_configs_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
