import { useState } from 'react';
import AppLink from '../../components/AppLink/AppLink';
import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';
import { useNotice } from '../../components/Notice/useNotice';

const CONTACT_CHANNELS = [
  {
    id: 'support',
    icon: 'headphones',
    title: 'Служба підтримки',
    description: 'Технічні запитання щодо сервісу, карт ділянок та розрахунків маржинальності.',
    value: 'support@sivay.com.ua',
    href: 'mailto:support@sivay.com.ua',
    badge: 'Пн-Нд 08:00 - 20:00',
  },
  {
    id: 'agronomist',
    icon: 'sprout',
    title: 'Черговий агроном',
    description: 'Фахові консультації щодо сівозміни, сортів насіння, NDVI та стану ґрунту.',
    value: 'agronomist@sivay.com.ua',
    href: 'mailto:agronomist@sivay.com.ua',
    badge: 'Експертна допомога',
  },
  {
    id: 'partners',
    icon: 'trending-up',
    title: 'Партнерство та співпраця',
    description: 'Для агрохолдингів, дистриб’юторів насіння/ЗЗР та інтеграцій з IoT-системами.',
    value: 'partners@sivay.com.ua',
    href: 'mailto:partners@sivay.com.ua',
    badge: 'B2B та інтеграції',
  },
  {
    id: 'phone',
    icon: 'phone',
    title: 'Гаряча лінія',
    description: 'Безкоштовні дзвінки по всій території України для оперативних консультацій.',
    value: '+380 (800) 33-01-44',
    href: 'tel:+380800330144',
    badge: 'Безкоштовно по Україні',
  },
  {
    id: 'telegram',
    icon: 'send',
    title: 'Telegram-підтримка',
    description: 'Швидкий зв’язок із черговим спеціалістом та оперативні сповіщення.',
    value: '@sivay_support_bot',
    href: 'https://t.me',
    badge: 'Швидка відповідь',
  },
  {
    id: 'office',
    icon: 'map-pin',
    title: 'Головний офіс',
    description: 'м. Київ, вул. Велика Васильківська, 72 (зустрічі за попереднім записом).',
    value: 'Київ, Україна',
    href: 'https://maps.google.com/?q=Kyiv,Ukraine',
    badge: 'Особисті зустрічі',
  },
];

const FAQS = [
  {
    question: 'Як швидко відповідає служба підтримки SIVAY?',
    answer:
      'У робочий час (08:00 – 20:00) наші спеціалісти відповідають на звернення електронною поштою та в Telegram упродовж 15–30 хвилин. У сезон посівної та збору врожаю черговий агроном доступний у розширеному режимі.',
  },
  {
    question: 'Чи можу я надіслати межі полів у файлах KML, KMZ або SHP?',
    answer:
      'Так, ви можете прикріпити або надіслати ваші файли контурів на support@sivay.com.ua, і наша технічна служба допоможе безкоштовно імпортувати їх до вашого кабінету.',
  },
  {
    question: 'Чи захищені координати моїх полів від сторонніх осіб?',
    answer:
      'Так. Усі геопросторові контури ділянок є суворою комерційною таємницею. Дані шифруються за стандартом AES-256 і ніколи не передаються третім сторонам або конкурентам. Детальніше дивіться у нашій Політиці конфіденційності.',
  },
  {
    question: 'Чи можлива індивідуальна інтеграція з нашою системою обліку (1С / BAS / ERP)?',
    answer:
      'Так, платформа SIVAY надає відкритий REST API для партнерів. Напишіть нашому комерційному відділу на partners@sivay.com.ua для отримання документації та ключів доступу.',
  },
];

export default function Contacts() {
  const { showNotice } = useNotice();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Технічна підтримка',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Будь ласка, вкажіть ваше ім'я";
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Вкажіть адресу електронної пошти';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Введіть коректний email (наприклад: name@farm.ua)';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Введіть текст вашого повідомлення';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Повідомлення має містити щонайменше 10 символів';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Імітація надійного відправлення форми (клієнтська частина)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showNotice("Дякуємо! Ваше звернення надіслано. Ми відповімо вам найближчим часом.");
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Технічна підтримка',
        message: '',
      });
    }, 600);
  };

  const toggleFaq = (index) => {
    setExpandedFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pt-6 pb-16 md:px-8 md:pt-10 md:pb-24 xl:px-20">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Хлібні крихти" className="mb-4 flex items-center gap-2 text-[13px] font-medium text-muted">
        <AppLink href="/" className="transition-colors hover:text-brand-dark">
          Головна
        </AppLink>
        <Icon name="chevron-right" size={14} className="text-muted/60" />
        <span className="text-brand-text">Контакти</span>
      </nav>

      {/* Header Banner */}
      <header className="mb-8 flex flex-col gap-3 rounded-2xl border border-border-main bg-gradient-to-br from-brand-tint via-white to-surface-panel p-6 shadow-sm md:mb-12 md:rounded-[24px] md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[12px] font-bold tracking-wider text-brand-dark uppercase">
            <Icon name="check-circle" size={14} /> Зв’язок та підтримка
          </span>
          <span className="text-xs font-semibold text-muted">
            Працюємо по всій Україні
          </span>
        </div>

        <h1 className="m-0 text-2xl font-bold leading-[1.15] text-brand-text md:text-4xl xl:text-[44px]">
          Контакти платформи SIVAY
        </h1>

        <p className="m-0 max-w-[840px] text-[15px] leading-[1.6] text-muted md:text-[17px]">
          Маєте запитання щодо розрахунку культур, створення полів чи інтеграцій? 
          Наша команда агрономів, аналітиків та технічних фахівців готова допомогти вам отримати максимальний прибуток з кожного гектара.
        </p>

        {/* Quick Page Switcher */}
        <div className="mt-2 flex flex-wrap gap-2.5 pt-2 border-t border-border-soft">
          <AppLink
            href="/contacts"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-[14px] font-semibold text-brand-darkest shadow-sm"
          >
            Контакти
          </AppLink>
          <AppLink
            href="/privacy"
            className="inline-flex items-center gap-2 rounded-xl border border-border-main bg-white px-4 py-2 text-[14px] font-semibold text-muted transition-colors hover:border-brand hover:text-brand-dark"
          >
            Політика конфіденційності
          </AppLink>
          <AppLink
            href="/terms"
            className="inline-flex items-center gap-2 rounded-xl border border-border-main bg-white px-4 py-2 text-[14px] font-semibold text-muted transition-colors hover:border-brand hover:text-brand-dark"
          >
            Умови використання
          </AppLink>
        </div>
      </header>

      {/* Main Grid: Contact Channels + Feedback Form */}
      <div className="grid gap-8 lg:grid-cols-12 xl:gap-12">
        {/* Left Column: Contact Channels Grid (7 cols on lg) */}
        <div className="flex flex-col gap-8 lg:col-span-7">
          <section aria-labelledby="channels-heading">
            <h2 id="channels-heading" className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              Прямі канали комунікації
            </h2>
            <p className="m-0 mb-6 text-[15px] leading-[1.6] text-muted">
              Оберіть зручний для вас спосіб зв’язку. Ми оперативно відповідаємо та консультуємо на кожному етапі користування сервісом.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {CONTACT_CHANNELS.map((ch) => (
                <div
                  key={ch.id}
                  className="group flex flex-col justify-between rounded-2xl border border-border-main bg-white p-5 shadow-sm transition-all duration-200 hover:border-brand hover:shadow-card"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand-dark transition-colors group-hover:bg-brand group-hover:text-brand-darkest">
                        <Icon name={ch.icon} size={20} />
                      </span>
                      <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-[11px] font-semibold text-brand-dark">
                        {ch.badge}
                      </span>
                    </div>

                    <h3 className="m-0 text-base font-bold text-brand-text">
                      {ch.title}
                    </h3>
                    <p className="mt-1.5 mb-4 text-[13px] leading-[1.5] text-muted">
                      {ch.description}
                    </p>
                  </div>

                  <a
                    href={ch.href}
                    target={ch.href.startsWith('http') ? '_blank' : undefined}
                    rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1.5 text-[14px] font-bold text-brand-dark transition-colors hover:text-brand-hover"
                  >
                    <span>{ch.value}</span>
                    <Icon name="arrow-right" size={14} className="transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Working Hours & Guarantee Banner */}
          <section
            aria-labelledby="guarantee-heading"
            className="rounded-2xl border border-brand-soft bg-brand-tint p-6 md:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-brand-darkest shadow-sm">
                <Icon name="clock" size={24} />
              </span>
              <div>
                <h3 id="guarantee-heading" className="m-0 text-base font-bold text-brand-text md:text-lg">
                  Графік консультацій та сезонна підтримка
                </h3>
                <p className="m-0 mt-1 text-[14px] leading-[1.6] text-muted">
                  У періоди весняної посівної та осіннього збору врожаю служба технічної та агрономічної підтримки SIVAY працює в посиленому режимі без вихідних з 07:00 до 22:00.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Interactive Feedback Form (5 cols on lg) */}
        <div className="lg:col-span-5">
          <section
            aria-labelledby="form-heading"
            className="sticky top-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[24px] md:p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand-dark">
                <Icon name="message-square" size={22} />
              </span>
              <div>
                <h2 id="form-heading" className="m-0 text-lg font-bold text-brand-text md:text-xl">
                  Напишіть нам
                </h2>
                <p className="m-0 text-xs text-muted">
                  Відповімо протягом 30 хвилин у робочий час
                </p>
              </div>
            </div>

            {isSubmitted && (
              <div
                role="status"
                className="mb-6 rounded-xl border border-brand-soft bg-brand-tint p-4 text-[14px] text-brand-dark"
              >
                <div className="flex items-start gap-2.5">
                  <Icon name="check-circle" size={18} className="mt-0.5 shrink-0 text-brand" />
                  <div>
                    <strong className="font-bold">Повідомлення успішно надіслано!</strong>
                    <p className="m-0 mt-0.5 text-xs text-muted">
                      Наш спеціаліст зв’яжеться з вами за вказаною електронною поштою або телефоном.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-name" className="text-[13px] font-semibold text-brand-text">
                  Ваше ім’я <span className="text-danger">*</span>
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Олександр Коваленко"
                  aria-invalid={errors.name ? 'true' : undefined}
                  className={`h-12 w-full rounded-xl border px-3.5 text-[15px] text-brand-text outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 ${
                    errors.name
                      ? 'border-danger focus:border-danger focus:ring-3 focus:ring-danger/20'
                      : 'border-border-main focus:border-brand focus:ring-3 focus:ring-brand/20'
                  }`}
                />
                {errors.name && <p className="m-0 text-xs text-danger">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-email" className="text-[13px] font-semibold text-brand-text">
                  Електронна пошта <span className="text-danger">*</span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="oleksandr@agro.ua"
                  aria-invalid={errors.email ? 'true' : undefined}
                  className={`h-12 w-full rounded-xl border px-3.5 text-[15px] text-brand-text outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 ${
                    errors.email
                      ? 'border-danger focus:border-danger focus:ring-3 focus:ring-danger/20'
                      : 'border-border-main focus:border-brand focus:ring-3 focus:ring-brand/20'
                  }`}
                />
                {errors.email && <p className="m-0 text-xs text-danger">{errors.email}</p>}
              </div>

              {/* Phone (optional) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-phone" className="text-[13px] font-semibold text-brand-text">
                  Номер телефону <span className="text-xs font-normal text-muted">(за бажанням)</span>
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+380 50 123 4567"
                  className="h-12 w-full rounded-xl border border-border-main px-3.5 text-[15px] text-brand-text outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 focus:border-brand focus:ring-3 focus:ring-brand/20"
                />
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-subject" className="text-[13px] font-semibold text-brand-text">
                  Тема звернення
                </label>
                <select
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-border-main bg-white px-3.5 text-[15px] text-brand-text outline-none transition-[border-color,box-shadow] focus:border-brand focus:ring-3 focus:ring-brand/20"
                >
                  <option value="Технічна підтримка">Технічна підтримка сервісу</option>
                  <option value="Допомога агронома">Допомога агронома / сівозміна</option>
                  <option value="Питання по картах">Питання по картах та розрахунках</option>
                  <option value="Комерційна пропозиція">Комерційна пропозиція / Партнерство</option>
                  <option value="Інше">Інше запитання</option>
                </select>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-message" className="text-[13px] font-semibold text-brand-text">
                  Повідомлення <span className="text-danger">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Опишіть ваше запитання або ситуацію з полем..."
                  aria-invalid={errors.message ? 'true' : undefined}
                  className={`w-full rounded-xl border p-3.5 text-[15px] text-brand-text outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 resize-y ${
                    errors.message
                      ? 'border-danger focus:border-danger focus:ring-3 focus:ring-danger/20'
                      : 'border-border-main focus:border-brand focus:ring-3 focus:ring-brand/20'
                  }`}
                />
                {errors.message && <p className="m-0 text-xs text-danger">{errors.message}</p>}
              </div>

              {/* Legal consent note */}
              <p className="m-0 text-[12px] leading-[1.4] text-muted">
                Надсилаючи повідомлення, ви погоджуєтесь із{' '}
                <AppLink href="/terms" className="font-medium text-brand-dark hover:underline">
                  Умовами використання
                </AppLink>{' '}
                та{' '}
                <AppLink href="/privacy" className="font-medium text-brand-dark hover:underline">
                  Політикою конфіденційності
                </AppLink>
                .
              </p>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full gap-2 text-[16px]"
              >
                <Icon name="send" size={18} />
                <span>{isSubmitting ? 'Надсилання...' : 'Надіслати звернення'}</span>
              </Button>
            </form>
          </section>
        </div>
      </div>

      {/* FAQ Section */}
      <section aria-labelledby="faq-heading" className="mt-16 border-t border-border-main pt-12 md:mt-20 md:pt-16">
        <div className="mb-8 text-center md:mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-dark uppercase">
            Часті запитання
          </span>
          <h2 id="faq-heading" className="m-0 mt-2 text-2xl font-bold text-brand-text md:text-3xl">
            Поширені запитання щодо зв’язку та сервісу
          </h2>
          <p className="m-0 mt-2 text-[15px] text-muted">
            Знайдіть швидку відповідь на найбільш актуальні запитання фермерів
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {FAQS.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-border-main bg-white shadow-sm transition-colors hover:border-brand"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isExpanded}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left font-semibold text-brand-text transition-colors hover:text-brand-dark md:p-6"
                >
                  <span className="text-[15px] md:text-base">{faq.question}</span>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-alt text-brand-dark transition-transform duration-200 ${
                      isExpanded ? 'rotate-90 bg-brand-soft' : ''
                    }`}
                  >
                    <Icon name="chevron-right" size={16} />
                  </span>
                </button>
                {isExpanded && (
                  <div className="border-t border-border-soft px-5 pt-3 pb-5 text-[14px] leading-[1.6] text-muted md:px-6 md:pb-6 md:text-[15px]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Navigation Bar */}
      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
        <div>
          <h3 className="m-0 text-base font-bold text-brand-text md:text-lg">
            Бажаєте розпочати роботу з платформою SIVAY прямо зараз?
          </h3>
          <p className="m-0 mt-1 text-[14px] text-muted">
            Побудуйте точну сівозміну та розрахуйте прибутковість для вашого господарства.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button href="/" variant="secondary" arrow>
            На головну
          </Button>
          <Button href="/analysis/new" arrow>
            Розпочати аналіз
          </Button>
        </div>
      </div>
    </div>
  );
}

