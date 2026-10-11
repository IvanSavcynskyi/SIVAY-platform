import AppLink from '../AppLink/AppLink';
import Icon from '../Icon/Icon';
import './Button.css';

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
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();

  const content = (
    <>
      <span>{children}</span>
      {arrow && <Icon name="arrow-right" className="btn__arrow" />}
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