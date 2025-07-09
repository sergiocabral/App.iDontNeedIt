import { prisma } from '@/lib/prisma'

type CreateKingInput = {
  name?: string
  message?: string
  imageUrl?: string
  audioUrl?: string
  locale: string
  amount: number
}

export const KingRepository = {
  async create(data: CreateKingInput) {
    return prisma.king.create({ data })
  },

  async getLatest() {
    return prisma.king.findFirst({
      orderBy: { amount: 'desc' },
    })
  },

  async getById(id: string) {
    return prisma.king.findUnique({ where: { id } })
  },

  async listAll() {
    return prisma.king.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },

  async getNextAmount(): Promise<number> {
    const result = await prisma.king.aggregate({
      _max: { amount: true },
    })

    const maxAmount = result._max.amount ?? 0
    const oneDollar = 100
    const tenCents = 10
    return Number(maxAmount === 0 ? oneDollar : maxAmount + tenCents)
  },
}
