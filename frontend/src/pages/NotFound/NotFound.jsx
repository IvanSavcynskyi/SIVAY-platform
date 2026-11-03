import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';
import { useLanguage } from '../../context/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-[720px] flex-col items-center justify-center px-4 py-16 text-center md:py-24">
      <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft text-brand-dark" aria-hidden="true">
        <Icon name="info" size={32} />
      </span>
      <h1 className="m-0 text-3xl font-bold leading-tight text-brand-text md:text-4xl">
        {t('notFound.title', '404 — Сторінку не знайдено')}
      </h1>
      <p className="mt-3 mb-8 max-w-[480px] text-[15px] leading-relaxed text-muted md:text-[17px]">
        {t('notFound.subtitle', 'Схоже, адреса сторінки вказана з помилкою або її було переміщено.')}
      </p>
      <Button href="/" arrow>
        {t('notFound.backHome', 'Повернутися на головну')}
      </Button>
    </main>
  );
}
