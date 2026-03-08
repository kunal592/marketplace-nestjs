-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "cooldownEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);
