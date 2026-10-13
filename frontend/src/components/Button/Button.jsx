import AppLink from '../AppLink/AppLink';
import Icon from '../Icon/Icon';

const BASE_STYLES =
  'inline-flex items-center justify-center rounded-xl font-semibold leading-[1.2] no-underline whitespace-nowrap cursor-pointer transition-[background-color,border-color,transform] duration-150 active:translate-y-[1px] disabled:opacity-65 disabled:cursor-progress';

const SIZES = {
  lg: 'h-14 px-7 text-[17px] gap-3',
  sm: 'h-11 px-[18px] text-[15px] gap-2',
};

const VARIANTS = {
  primary: 'bg-brand text-brand-darkest shadow-button hover:bg-brand-hover border-0',
  secondary: 'bg-white text-brand-dark border-[1.5px] border-border-main shadow-button-soft hover:border-brand',
};

export default function Button({
  variant = 'primary',
  size = 'lg',
  arrow = false,
  href,
  ready,
  onClick,
  className = '',
  children,
  ...rest
}) {
  const classes = `${BASE_STYLES} ${SIZES[size] || SIZES.lg} ${VARIANTS[variant] || VARIANTS.primary} ${className}`.trim();

  const arrowSize = size === 'sm' ? 16 : 20;

  const content = (
    <>
      <span>{children}</span>
      {arrow && <Icon name="arrow-right" size={arrowSize} className="shrink-0" />}
    </>
  );

  if (href) {
    return (
      <AppLink href={href} ready={ready} className={classes} {...rest}>
        {content}
      </AppLink>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick} {...rest}>
      {content}
    </button>
  );
}