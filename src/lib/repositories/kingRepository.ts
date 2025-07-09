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
}
