import { prisma } from '@/lib/prisma'
import { getDefinitions } from '../definitions'
import { formatAmmount } from '../utils'

const def = getDefinitions()

export type AmountType = {
  amount: number
  currency: string
  formatted: string
}

type CreateKingInput = {
  name?: string
  message?: string
  imageUrl: string
  imageBgColor: string
  audioUrl?: string
  locale: string
  amount: number
  currency: string
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

  async getNextAmount(): Promise<AmountType> {
    const result = await prisma.king.aggregate({
      _max: { amount: true },
    })

    const maxAmount = result._max.amount ?? 0
    const paymentInitial = parseFloat(def('paymentInitial')) || 100
    const paymentIncrement = parseFloat(def('paymentIncrement')) || 100
    const value = {
      amount: Number(maxAmount === 0 ? paymentInitial : maxAmount + paymentIncrement),
      currency: def('paymentCurrency') || 'brl',
    }
    return {
      ...value,
      formatted: formatAmmount(value),
    }
  },
}
