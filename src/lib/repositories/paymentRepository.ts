import { prisma } from '@/lib/prisma'

type CreatePaymentInput = {
  stripeIntentId: string
  amount: number
  currency: string
}

export const PaymentRepository = {
  async create(data: CreatePaymentInput) {
    return prisma.payment.create({ data })
  },

  async getByIntentId(stripeIntentId: string) {
    return prisma.payment.findUnique({
      where: { stripeIntentId },
    })
  },

  async listAll() {
    return prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },
}
