import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-[720px] flex-col items-center justify-center px-4 py-16 text-center md:py-24">
      <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft text-brand-dark" aria-hidden="true">
        <Icon name="info" size={32} />
      </span>
      <h1 className="m-0 text-3xl font-bold leading-tight text-brand-text md:text-4xl">
        404 — Сторінку не знайдено
      </h1>
      <p className="mt-3 mb-8 max-w-[480px] text-[15px] leading-relaxed text-muted md:text-[17px]">
        Схоже, адреса сторінки вказана з помилкою або її було переміщено.
      </p>
      <Button href="/" arrow>
        Повернутися на головну
      </Button>
    </main>
  );
}

