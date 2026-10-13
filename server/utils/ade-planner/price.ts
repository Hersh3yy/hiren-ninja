// What a party costs to get in, as far as we know. ADE publishes no prices: `free` is
// ADE's own ticket status, "Free Festival Events" is ADE's label for free entry that
// still needs a (free) ticket, and `priceFrom` is the lowest ticket on sale in the
// Weeztix or Resident Advisor shop (VAMS php artisan ade:prices). The app imports this file too.

export type PriceBand = 'free' | 'free-ticket' | 'paid' | 'unknown'

interface Priced {
  ticketStatus?: string
  categories?: string | null
  priceFrom?: number | null
}

const FREE_LABEL = /free festival events/i

export function priceBand(event: Priced): PriceBand {
  if (event.ticketStatus === 'free') return 'free'
  // A sold-out event's old price is no use; ADE Pro sessions need a pass.
  if (event.ticketStatus && event.ticketStatus !== 'available' && event.ticketStatus !== 'unknown') return 'unknown'
  if (event.priceFrom === 0) return 'free-ticket'
  if (typeof event.priceFrom === 'number') return 'paid'
  if (FREE_LABEL.test(event.categories ?? '')) return 'free-ticket'
  return 'unknown'
}

export const isFreeEntry = (event: Priced): boolean => ['free', 'free-ticket'].includes(priceBand(event))

/** Budget filter: '' = any, 'free', or a limit in euros ('25' = under €25). Unknown prices only pass 'any'. */
export function withinBudget(event: Priced, budget: string): boolean {
  if (!budget) return true
  if (isFreeEntry(event)) return true
  if (budget === 'free') return false
  return priceBand(event) === 'paid' && (event.priceFrom as number) < Number(budget)
}

const wholeEuros = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const centEuros = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })
// "€15", "€12.50"
const euros = { format: (amount: number): string => (Number.isInteger(amount) ? wholeEuros : centEuros).format(amount) }

/** "Free", "Free, get a ticket", "From €12.50", or '' when we don't know. */
export function priceLabel(event: Priced): string {
  switch (priceBand(event)) {
    case 'free': return 'Free'
    case 'free-ticket': return 'Free, get a ticket'
    case 'paid': return `From ${euros.format(event.priceFrom as number)}`
    default: return ''
  }
}

export const BUDGETS = Object.freeze([
  { value: 'free', label: 'Free' },
  { value: '25', label: 'Under €25' },
  { value: '50', label: 'Under €50' },
])
