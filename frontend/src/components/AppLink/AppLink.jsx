import { useNotice } from '../Notice/NoticeProvider';

export default function AppLink({ href, ready = true, onClick, children, ...rest }) {
  const { showNotice } = useNotice();

  const handleClick = (event) => {
    if (!ready) {
      event.preventDefault();
      showNotice('Ця сторінка ще в розробці.');
    }

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}