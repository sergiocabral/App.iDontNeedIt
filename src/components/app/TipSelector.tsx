'use client'

import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { AmountType } from '@/lib/repositories/kingRepository'
import { formatAmount } from '@/lib/utilsApp'

const CHIP_VALUES = [500, 1000, 2500, 5000]

// Rótulo compacto pros chips caberem numa linha só (sem os centavos).
function formatChip(amount: number, currency: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

function getTier(tip: number, base: number): { emoji: string; key: string } {
  const ratio = tip / base
  if (ratio < 1) return { emoji: '😏', key: 'tier1' }
  if (ratio < 3) return { emoji: '🤑', key: 'tier2' }
  if (ratio < 10) return { emoji: '👑', key: 'tier3' }
  return { emoji: '🔥', key: 'tier4' }
}

export function TipSelector({
  baseAmount,
  tip,
  onTipChange,
  disabled,
}: {
  baseAmount: AmountType
  tip: number
  onTipChange: (tip: number) => void
  disabled?: boolean
}) {
  const t = useTranslations('TipSelectorComponent')

  const sliderMax = Math.max(baseAmount.amount * 10, 10000)
  const tier = getTier(tip, baseAmount.amount)
  const currency = baseAmount.currency

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <p className="text-sm text-center font-semibold text-purple-700">{t('title')}</p>

      <div className="flex flex-wrap justify-center gap-2">
        {CHIP_VALUES.map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={tip === value ? 'default' : 'secondary'}
            className="rounded-full cursor-pointer px-3"
            onClick={() => onTipChange(tip === value ? 0 : value)}
          >
            +{formatChip(value, currency)}
          </Button>
        ))}
      </div>

      <div className="px-1">
        <label className="block text-xs text-center text-muted-foreground italic mb-1">
          {t('sliderLabel')}
        </label>
        <input
          type="range"
          min={0}
          max={sliderMax}
          step={100}
          value={tip}
          onChange={(e) => onTipChange(Number(e.target.value))}
          className="w-full accent-purple-600 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatAmount({ amount: 0, currency })}</span>
          <span>{formatAmount({ amount: sliderMax, currency })}</span>
        </div>
      </div>

      {tip > 0 && (
        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 text-center space-y-1 transition-all">
          <p className="text-lg font-bold text-purple-800">
            {t('totalLabel', {
              amount: formatAmount({ amount: baseAmount.amount + tip, currency }),
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('breakdown', {
              base: baseAmount.formatted,
              tip: formatAmount({ amount: tip, currency }),
            })}
          </p>
          <p className="text-sm font-semibold text-purple-700">
            <span className="text-2xl align-middle mr-1">{tier.emoji}</span>
            {t(tier.key)}
          </p>
        </div>
      )}
    </div>
  )
}
