import { useNotice } from '../Notice/useNotice';
import { navigate } from '../../router/navigation';

export default function AppLink({ href, ready = true, onClick, children, ...rest }) {
  const { showNotice } = useNotice();

  const handleClick = (event) => {
    if (!ready) {
      event.preventDefault();
      showNotice('Ця сторінка ще в розробці.');
      if (onClick) onClick(event);
      return;
    }

    if (onClick) {
      onClick(event);
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      !href ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('//') ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      rest.target === '_blank'
    ) {
      return;
    }

    event.preventDefault();
    navigate(href);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
