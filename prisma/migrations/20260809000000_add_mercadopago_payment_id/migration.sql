-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "stripeIntentId" DROP NOT NULL;
ALTER TABLE "Payment" ADD COLUMN "mercadoPagoPaymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mercadoPagoPaymentId_key" ON "Payment"("mercadoPagoPaymentId");
