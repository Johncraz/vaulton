import type { PropsWithChildren } from 'hono/jsx'
import { twMerge } from 'tailwind-merge'
import { Spinner } from '@/components/icons/Spinner'

interface ButtonProps extends PropsWithChildren {
  id?: string
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
  intent?: ButtonIntent
  className?: string
  disabled?: boolean
  isFetchable?: boolean
  [key: string]: any
}

type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link' | 'icon'
type ButtonIntent =
  | 'default'
  | 'primary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'neutral'

const intents: Record<
  ButtonIntent,
  {
    base: string
    softBase: string
    softHover: string
    ghostHover: string
    hover: string
    text: string
    textHover: string
    textGhostHover: string
    textOnSolid: string
    border: string
  }
> = {
  default: {
    base: 'bg-zinc-200 dark:bg-zinc-700',
    softBase: 'bg-zinc-400/15 dark:bg-zinc-500/15',
    softHover: 'hover:bg-zinc-400/30 dark:hover:bg-zinc-500/30',
    ghostHover: 'hover:bg-zinc-400/15 dark:hover:bg-zinc-500/15',
    hover: 'hover:bg-zinc-300 dark:hover:bg-zinc-600',
    text: 'text-zinc-700 dark:text-zinc-200',
    textHover: 'hover:text-zinc-800 dark:hover:text-zinc-50',
    textGhostHover: 'hover:text-zinc-900 dark:hover:text-white',
    textOnSolid: 'text-zinc-900 dark:text-white',
    border: 'border-zinc-300 dark:border-zinc-600'
  },
  primary: {
    base: 'bg-emerald-600 dark:bg-emerald-500',
    softBase: 'bg-emerald-600/15 dark:bg-emerald-400/15',
    softHover: 'hover:bg-emerald-600/30 dark:hover:bg-emerald-400/30',
    ghostHover: 'hover:bg-emerald-600/15 dark:hover:bg-emerald-400/15',
    hover: 'hover:bg-emerald-700 dark:hover:bg-emerald-600',
    text: 'text-emerald-600 dark:text-emerald-400',
    textHover: 'hover:text-emerald-50',
    textGhostHover: 'hover:text-emerald-500',
    textOnSolid: 'text-white',
    border: 'border-emerald-600 dark:border-emerald-500'
  },
  danger: {
    base: 'bg-red-600 dark:bg-red-500',
    softBase: 'bg-red-600/15 dark:bg-red-400/15',
    softHover: 'hover:bg-red-600/30 dark:hover:bg-red-400/30',
    ghostHover: 'hover:bg-red-600/15 dark:hover:bg-red-400/15',
    hover: 'hover:bg-red-700 dark:hover:bg-red-600',
    text: 'text-red-600 dark:text-red-400',
    textHover: 'hover:text-red-50',
    textGhostHover: 'hover:text-red-500',
    textOnSolid: 'text-white',
    border: 'border-red-600 dark:border-red-500'
  },
  success: {
    base: 'bg-green-600 dark:bg-green-500',
    softBase: 'bg-green-600/15 dark:bg-green-400/15',
    softHover: 'hover:bg-green-600/30 dark:hover:bg-green-400/30',
    ghostHover: 'hover:bg-green-600/15 dark:hover:bg-green-400/15',
    hover: 'hover:bg-green-700 dark:hover:bg-green-600',
    text: 'text-green-600 dark:text-green-400',
    textHover: 'hover:text-green-50',
    textGhostHover: 'hover:text-green-500',
    textOnSolid: 'text-white',
    border: 'border-green-600 dark:border-green-500'
  },
  warning: {
    base: 'bg-amber-500 dark:bg-amber-400',
    softBase: 'bg-amber-500/20 dark:bg-amber-400/20',
    softHover: 'hover:bg-amber-500/35 dark:hover:bg-amber-400/35',
    ghostHover: 'hover:bg-amber-500/20 dark:hover:bg-amber-400/20',
    hover: 'hover:bg-amber-600 dark:hover:bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    textHover: 'hover:text-amber-50',
    textGhostHover: 'hover:text-amber-500',
    textOnSolid: 'text-black dark:text-zinc-900',
    border: 'border-amber-500 dark:border-amber-400'
  },
  info: {
    base: 'bg-blue-600 dark:bg-blue-500',
    softBase: 'bg-blue-600/15 dark:bg-blue-400/15',
    softHover: 'hover:bg-blue-600/30 dark:hover:bg-blue-400/30',
    ghostHover: 'hover:bg-blue-600/15 dark:hover:bg-blue-400/15',
    hover: 'hover:bg-blue-700 dark:hover:bg-blue-600',
    text: 'text-blue-600 dark:text-blue-400',
    textHover: 'hover:text-blue-50',
    textGhostHover: 'hover:text-blue-500',
    textOnSolid: 'text-white',
    border: 'border-blue-600 dark:border-blue-500'
  },
  neutral: {
    base: 'bg-zinc-400 dark:bg-zinc-500',
    softBase: 'bg-zinc-500/15 dark:bg-zinc-400/15',
    softHover: 'hover:bg-zinc-500/30 dark:hover:bg-zinc-400/30',
    ghostHover: 'hover:bg-zinc-500/15 dark:hover:bg-zinc-400/15',
    hover: 'hover:bg-zinc-500 dark:hover:bg-zinc-600',
    text: 'text-zinc-600 dark:text-zinc-300',
    textHover: 'hover:text-zinc-50',
    textGhostHover: 'hover:text-zinc-500',
    textOnSolid: 'text-black dark:text-white',
    border: 'border-zinc-400 dark:border-zinc-500'
  }
}

export function Button({
  variant = 'solid',
  intent = 'default',
  className = '',
  disabled = false,
  isFetchable = false,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition duration-200 group gap-x-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const c = intents[intent]
  let variantClass = ''

  switch (variant) {
    case 'solid':
      variantClass = `${c.base} ${c.hover} ${c.textOnSolid}`
      break
    case 'soft':
      variantClass = `${c.softBase} ${c.softHover} ${c.text} ${c.textHover}`
      break
    case 'outline':
      variantClass = `border ${c.border} ${c.text} ${c.textHover} ${c.hover} bg-transparent`
      break
    case 'ghost':
      variantClass = `${c.text} ${c.textHover} ${c.textGhostHover} ${c.ghostHover} bg-transparent`
      break
    case 'link':
      variantClass = `${c.text} ${c.textHover} ${c.textGhostHover} underline-offset-4 hover:underline bg-transparent`
      break
    case 'icon':
      variantClass = `${c.base} ${c.hover} ${c.textOnSolid} w-9 h-9 p-0 rounded-full`
      break
  }

  return (
    <button
      {...props}
      disabled={disabled}
      className={twMerge(
        base,
        variant !== 'icon' ? 'px-4 py-2' : '',
        variantClass,
        className
      )}
      data-fetchable={isFetchable}
      data-fetch-status="idle"
    >
      <span className="group-data-[fetch-status=loading]:hidden">{props.children}</span>
      <Spinner className="hidden group-data-[fetch-status=loading]:block size-6" />
    </button>
  )
}

export default function ButtonShowcase() {
  const variants = ['solid', 'soft', 'outline', 'ghost', 'link', 'icon'] as const
  const intents = [
    'default',
    'primary',
    'danger',
    'success',
    'warning',
    'info',
    'neutral'
  ] as const

  return (
    <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8 text-zinc-900 dark:text-zinc-100">
      <h1 class="text-2xl font-bold mb-6">Button Component Showcase</h1>

      {variants.map((variant) => (
        <div class="mb-10">
          <h2 class="text-lg font-semibold capitalize mb-4">{variant} Variant</h2>
          <div class="flex flex-wrap gap-4">
            {intents.map((intent) => (
              <Button
                variant={variant}
                intent={intent}
                className="capitalize"
              >
                {intent}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
