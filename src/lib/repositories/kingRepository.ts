import { prisma } from '@/lib/prisma'
import { getDefinitions } from '../definitions'
import { formatAmount } from '../utilsApp'

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
  baseAmount: number
  amount: number
  currency: string
}

export const KingRepository = {
  async create(data: CreateKingInput) {
    return prisma.king.create({ data })
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
      _max: { baseAmount: true },
    })

    const maxBaseAmount = result._max.baseAmount ?? 0
    const paymentInitial = parseFloat(def('paymentInitial')) || 100
    const paymentIncrement = parseFloat(def('paymentIncrement')) || 100
    const value = {
      amount: Number(maxBaseAmount === 0 ? paymentInitial : maxBaseAmount + paymentIncrement),
      currency: def('paymentCurrency') || 'brl',
    }
    return {
      ...value,
      formatted: formatAmount(value),
    }
  },
}
