ALTER TABLE "Employee" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Employee" ADD COLUMN "deactivatedAt" TIMESTAMP(3);
ALTER TABLE "Employee" ADD COLUMN "terminationReason" TEXT;
