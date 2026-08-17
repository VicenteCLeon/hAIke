import { clsx } from 'clsx'

/** Material Symbols Outlined icon. Pass `filled` for the solid variant. */
export function Icon({
  name,
  filled = false,
  className,
  style,
}: {
  name: string
  filled?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={clsx('material-symbols-outlined', filled && 'filled', className)}
      style={style}
      aria-hidden
    >
      {name}
    </span>
  )
}
