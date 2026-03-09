-- CreateTable
CREATE TABLE "vendor_stores" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "banner" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_stores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_stores_vendorId_key" ON "vendor_stores"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_stores_slug_key" ON "vendor_stores"("slug");

-- AddForeignKey
ALTER TABLE "vendor_stores" ADD CONSTRAINT "vendor_stores_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
