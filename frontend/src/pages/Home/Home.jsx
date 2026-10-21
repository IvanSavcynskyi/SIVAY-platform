import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';
import { ANALYSIS_LINK } from '../../constants/siteLinks';

const AUDIENCE_POINTS = [
  'Для фермерів та господарств',
  'Зрозуміла рекомендація замість складних таблиць',
  'Дані про ґрунт, погоду та ринок в одному місці',
];

const VALUE_CARDS = [
  {
    id: 'field',
    title: 'Для конкретного поля',
    text: 'Рекомендації враховують особливості саме вашої ділянки.',
    icon: 'value_card_1',
  },
  {
    id: 'complex',
    title: 'Комплексний аналіз',
    text: 'Поєднуємо дані про поле, погоду, ринок та логістику.',
    icon: 'value_card_2',
  },
  {
    id: 'result',
    title: 'Зрозумілий результат',
    text: 'Ви отримуєте просту рекомендацію замість складних наборів даних.',
    icon: 'value_card_3',
  },
  {
    id: 'data',
    title: 'На основі актуальних даних',
    text: 'Система враховує поточні умови сезону та ринку.',
    icon: 'value_card_4',
  },
];

const BENEFIT_CARDS = [
  {
    id: 'soil',
    title: 'Стан ґрунту',
    text: 'Оцінюємо стан поля за супутниковими даними.',
    icon: 'satellite',
    tone: 'sand',
  },
  {
    id: 'climate',
    title: 'Клімат',
    text: 'Враховуємо прогнозований клімат вашого регіону.',
    icon: 'cloud-sun',
    tone: 'sky',
  },
  {
    id: 'previous',
    title: 'Попередні культури',
    text: 'Враховуємо культури, які вирощувалися на полі раніше.',
    icon: 'wheat',
    tone: 'sun',
  },
  {
    id: 'prices',
    title: 'Ринкові ціни',
    text: 'Аналізуємо актуальні ціни та ринкові тенденції.',
    icon: 'trending-up',
    tone: 'peach',
  },
];

const STEPS = [
  {
    id: 1,
    title: 'Додайте поле',
    text: 'Вкажіть своє поле, попередні культури та культури, які розглядаєте для посіву.',
    icon: 'map-pin',
  },
  {
    id: 2,
    title: 'Аналізуємо дані',
    text: 'Система обробляє супутникові, погодні та історичні дані.',
    icon: 'satellite',
  },
  {
    id: 3,
    title: 'Порівнюємо культури',
    text: 'Оцінюємо потенціал культур з урахуванням урожайності та ринкових умов.',
    icon: 'chart',
  },
  {
    id: 4,
    title: 'Отримайте рекомендацію',
    text: 'SIVAY формує рейтинг найперспективніших культур для вашого поля.',
    icon: 'check-circle',
  },
];

const RANKING = [
  { id: 'sunflower', name: 'Соняшник', note: 'Найвищий потенціал', icon: 'sun', tone: 'peach', score: 100 },
  { id: 'soy', name: 'Соя', note: 'Висока перспективність', icon: 'sprout', tone: 'tint', score: 88 },
  { id: 'corn', name: 'Кукурудза', note: 'Стабільний прогноз', icon: 'leaf', tone: 'sky', score: 76 },
  { id: 'wheat', name: 'Пшениця', note: 'Сприятливі умови', icon: 'wheat', tone: 'sun', score: 66 },
  { id: 'potato', name: 'Картопля', note: 'Перспективний варіант', icon: 'circle-dot', tone: 'sand', score: 56 },
];

const TONE_CLASSES = {
  sand: 'bg-sand',
  sky: 'bg-sky',
  sun: 'bg-sun',
  peach: 'bg-peach',
  tint: 'bg-brand-tint',
};

export default function Home() {
  const scrollToWhy = (event) => {
    event.preventDefault();

    document.getElementById('why-sivay')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <>
      {/* Hero section */}
      <section
        className="relative flex items-center bg-brand-dark bg-cover bg-center py-[18px] pb-6 text-white [background-image:linear-gradient(90deg,rgba(5,47,35,0.7),rgba(5,47,35,0.3)),url('/images/hero.jpg')] md:py-12 md:pb-16 xl:min-h-[800px] xl:py-16 xl:pb-[88px]"
        aria-labelledby="hero-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8 xl:px-20">
          <div className="flex max-w-[860px] flex-col items-start gap-3.5 md:gap-6">
            <h1
              id="hero-title"
              className="m-0 text-[28px] font-bold leading-[1.12] tracking-[-0.7px] md:text-[46px] md:tracking-[-1.4px] xl:text-[54px]"
            >
              Обирайте найперспективнішу культуру для свого поля
            </h1>
            <p className="m-0 text-[15px] leading-[1.48] md:text-[19px] md:leading-[1.55]">
              SIVAY аналізує стан ґрунту, погодні умови, попередні культури, ринкові ціни та
              логістичні витрати, щоб допомогти вам прийняти обґрунтоване рішення щодо посіву.
            </p>
            <div className="flex w-full gap-2.5 md:w-auto md:gap-3.5">
              <Button
                href={ANALYSIS_LINK.href}
                ready={ANALYSIS_LINK.ready}
                arrow
                className="h-auto min-h-12 w-full flex-1 whitespace-normal px-3 py-2 text-center text-[15px] md:h-14 md:min-h-0 md:w-auto md:flex-none md:whitespace-nowrap md:px-7 md:py-0 md:text-[17px] [&_svg]:hidden md:[&_svg]:block"
              >
                Перейти до аналізу
              </Button>
              <Button
                variant="secondary"
                href="#why-sivay"
                onClick={scrollToWhy}
                className="h-auto min-h-12 w-full flex-1 whitespace-normal px-3 py-2 text-center text-[15px] md:h-14 md:min-h-0 md:w-auto md:flex-none md:whitespace-nowrap md:px-7 md:py-0 md:text-[17px]"
              >
                Дізнатися більше
              </Button>
            </div>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 md:gap-2.5">
              {AUDIENCE_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm font-medium md:gap-2.5 md:text-base">
                  <Icon name="check-circle" size={18} className="shrink-0 text-brand md:h-5 md:w-5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Why SIVAY section */}
      <section id="why-sivay" className="bg-surface-alt py-6 md:py-14 xl:py-[72px]" aria-labelledby="why-title">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3.5 px-4 md:gap-10 md:px-8 xl:px-20">
          <header className="flex flex-col items-center gap-1.5 text-center md:gap-3">
            <p className="m-0 text-xs font-bold tracking-[0.8px] text-brand-dark md:text-[13px]">ПЕРЕВАГИ</p>
            <h2
              id="why-title"
              className="m-0 text-2xl font-bold leading-[1.16] tracking-[-0.5px] md:text-4xl md:tracking-[-0.9px] xl:text-[42px]"
            >
              Чому SIVAY
            </h2>
          </header>
          <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 md:gap-4 xl:grid-cols-4 xl:gap-5">
            {VALUE_CARDS.map((card) => (
              <li
                key={card.id}
                className="flex flex-col items-start gap-2 rounded-2xl border border-brand-soft bg-brand-tint p-3.5 transition-[transform,filter,box-shadow] duration-250 ease-out hover:z-[1] hover:scale-[1.04] hover:shadow-[0_8px_20px_rgba(13,45,32,0.14)] hover:brightness-[0.92] md:gap-3.5 md:rounded-[20px] md:p-6"
              >
                <span className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-brand text-brand md:h-12 md:w-12">
                  <Icon name={card.icon} size={24} />
                </span>
                <h3 className="m-0 text-[15px] font-bold leading-[1.15] tracking-[-0.2px] md:text-[19px] md:leading-[1.2]">
                  {card.title}
                </h3>
                <p className="m-0 text-[13px] leading-[1.45] text-muted md:text-base md:leading-[1.5]">
                  {card.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-surface-alt py-2 pb-6 md:py-4 md:pb-16 xl:py-20" aria-labelledby="cta-title">
        <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8 xl:px-20">
          <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl bg-brand-dark px-5 py-7 pb-6 text-center shadow-[0_14px_30px_-8px_rgba(13,45,32,0.2)] md:gap-6 md:rounded-[32px] md:p-16 md:px-12 md:shadow-[0_18px_40px_-10px_rgba(13,45,32,0.22)] xl:p-20 xl:px-24">
            <span
              className="pointer-events-none absolute -top-20 -right-8 h-[190px] w-[190px] rounded-full [background:radial-gradient(circle,rgba(25,196,99,0.3),rgba(25,196,99,0)_70%)] md:-top-[130px] md:-right-[60px] md:h-[320px] md:w-[320px] xl:-top-[170px] xl:-right-[20px] xl:h-[420px] xl:w-[420px]"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -bottom-[70px] -left-[50px] h-[140px] w-[140px] rounded-full [background:radial-gradient(circle,rgba(25,196,99,0.3),rgba(25,196,99,0)_70%)] md:-bottom-[100px] md:-left-[90px] md:h-[240px] md:w-[240px] xl:-bottom-[120px] xl:-left-[110px] xl:h-[300px] xl:w-[300px]"
              aria-hidden="true"
            />
            <Icon
              name="leaf"
              className="pointer-events-none absolute top-2 right-3.5 block h-7 w-7 text-white opacity-[0.18] md:top-7 md:left-8 md:right-auto md:h-14 md:w-14 xl:top-14 xl:left-24 xl:h-[72px] xl:w-[72px]"
              strokeWidth={1.5}
            />
            <Icon
              name="sprout"
              className="pointer-events-none absolute bottom-8 left-10 hidden h-[52px] w-[52px] text-white opacity-[0.18] md:block xl:bottom-10 xl:left-[140px] xl:h-16 xl:w-16"
              strokeWidth={1.5}
            />
            <Icon
              name="sun"
              className="pointer-events-none absolute right-10 bottom-8 hidden h-[52px] w-[52px] text-white opacity-[0.18] md:block xl:right-[60px] xl:bottom-9 xl:h-16 xl:w-16"
              strokeWidth={1.5}
            />
            <Icon
              name="wheat"
              className="pointer-events-none absolute right-20 bottom-[130px] hidden h-14 w-14 text-white opacity-[0.18] xl:block"
              strokeWidth={1.5}
            />
            <h2
              id="cta-title"
              className="relative m-0 max-w-[900px] text-2xl font-bold leading-[1.14] tracking-[-0.5px] text-white md:text-[38px] md:tracking-[-1px] xl:text-[46px]"
            >
              Дізнайтеся, яка культура найперспективніша для вашого поля
            </h2>
            <p className="relative m-0 text-[15px] leading-[1.48] text-brand-soft md:text-xl md:leading-[1.5]">
              Приймайте рішення на основі даних, а не припущень.
            </p>
            <Button
              href={ANALYSIS_LINK.href}
              ready={ANALYSIS_LINK.ready}
              arrow
              className="relative h-[50px] w-full text-[15px] md:h-14 md:w-auto md:text-[17px] [&_svg]:h-4 [&_svg]:w-4 md:[&_svg]:h-5 md:[&_svg]:w-5"
            >
              Почати аналіз
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits section */}
      <section className="bg-surface-alt py-6 md:py-14 xl:py-[72px]" aria-labelledby="benefits-title">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3.5 px-4 md:gap-10 md:px-8 xl:px-20">
          <header className="flex flex-col items-center gap-1.5 text-center md:gap-3">
            <p className="m-0 text-xs font-bold tracking-[0.8px] text-brand-dark md:text-[13px]">ЩО ВРАХОВУЄ SIVAY</p>
            <h2
              id="benefits-title"
              className="m-0 text-2xl font-bold leading-[1.16] tracking-[-0.5px] md:text-4xl md:tracking-[-0.9px] xl:text-[42px]"
            >
              Рішення на основі даних
            </h2>
            <p className="m-0 hidden text-lg leading-[1.5] text-muted md:block">
              Чотири ключові чинники, які SIVAY бере до уваги для вашого поля.
            </p>
          </header>
          <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 md:gap-4 xl:grid-cols-4 xl:gap-5">
            {BENEFIT_CARDS.map((card) => (
              <li
                key={card.id}
                className={`flex flex-col items-start gap-2.5 rounded-2xl border border-border-soft p-3.5 shadow-[0_5px_7px_rgba(13,45,32,0.06)] transition-[transform,filter,box-shadow] duration-250 ease-out hover:z-[1] hover:scale-[1.04] hover:shadow-[0_8px_20px_rgba(13,45,32,0.14)] hover:brightness-[0.92] md:gap-4 md:rounded-[20px] md:p-6 md:shadow-card ${
                  TONE_CLASSES[card.tone] || 'bg-white'
                }`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/72 text-brand-dark md:h-[52px] md:w-[52px] md:rounded-[14px]">
                  <Icon name={card.icon} size={20} className="md:h-[26px] md:w-[26px]" />
                </span>
                <h3 className="m-0 text-base font-bold leading-[1.12] tracking-[-0.2px] md:text-xl md:leading-[1.2]">
                  {card.title}
                </h3>
                <p className="m-0 text-[13px] leading-[1.45] text-muted md:text-base md:leading-[1.5]">
                  {card.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Steps section */}
      <section className="bg-surface-alt py-6 md:py-14 xl:py-[72px]" aria-labelledby="steps-title">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3.5 px-4 md:gap-11 md:px-8 xl:px-20">
          <header className="flex flex-col items-center gap-1.5 text-center md:gap-3">
            <p className="m-0 text-xs font-bold tracking-[0.8px] text-brand-dark md:text-[13px]">ПРОСТИЙ ПРОЦЕС</p>
            <h2
              id="steps-title"
              className="m-0 text-2xl font-bold leading-[1.16] tracking-[-0.5px] md:text-4xl md:tracking-[-0.9px] xl:text-[42px]"
            >
              Як працює SIVAY
            </h2>
            <p className="m-0 hidden text-lg leading-[1.5] text-muted md:block">
              Чотири прості кроки від вибору поля до рекомендації.
            </p>
          </header>
          <ol className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 md:flex md:flex-col md:gap-0 xl:flex-row xl:items-stretch">
            {STEPS.map((step, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === STEPS.length - 1;
              const isThirdOrFourth = idx >= 2;

              return (
                <li
                  key={step.id}
                  className={`relative flex ${
                    isThirdOrFourth ? 'col-span-2 md:col-auto' : ''
                  } md:grid md:grid-cols-[44px_minmax(0,1fr)] md:gap-5 md:pb-4 last:md:pb-0 xl:flex xl:flex-1 xl:flex-col xl:gap-[22px] xl:min-w-0 xl:pb-0`}
                >
                  <div
                    className="absolute top-3.5 left-3.5 z-[1] md:static md:flex md:flex-col md:items-center md:gap-1.5 xl:w-full xl:flex-row xl:gap-2"
                    aria-hidden="true"
                  >
                    <span
                      className={`hidden xl:flex xl:flex-1 xl:items-center xl:min-w-0 xl:h-0.5 xl:bg-border-main ${
                        isFirst ? 'xl:invisible' : ''
                      }`}
                    />
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-[15px] font-bold text-brand-darkest shadow-[0_3px_5px_rgba(13,45,32,0.12)] md:h-11 md:w-11 md:text-[19px] md:shadow-[0_5px_7px_rgba(13,45,32,0.12)]">
                      {step.id}
                    </span>
                    <span
                      className={`hidden md:flex md:flex-1 md:flex-col md:items-center ${
                        isLast ? 'md:hidden xl:flex xl:invisible' : ''
                      } xl:flex-row`}
                    >
                      <span className="w-0.5 flex-1 bg-border-main xl:h-0.5 xl:w-auto" />
                      <Icon name="chevron-right" size={20} className="hidden shrink-0 text-muted xl:block" />
                    </span>
                  </div>

                  <article
                    className={`relative flex flex-1 flex-col gap-2 rounded-2xl p-3.5 pt-14 shadow-[0_5px_7px_rgba(13,45,32,0.06)] transition-[transform,filter,box-shadow] duration-250 ease-out hover:z-[1] hover:scale-[1.04] hover:shadow-[0_8px_20px_rgba(13,45,32,0.14)] hover:brightness-[0.92] ${
                      isLast
                        ? 'border-2 border-brand bg-brand-tint md:border-border-soft md:bg-white'
                        : 'border border-border-soft bg-white'
                    } md:gap-3.5 md:rounded-[20px] md:p-[22px] md:shadow-card xl:mx-2.5 xl:min-h-[264px]`}
                  >
                    <span className="absolute top-3.5 right-3.5 grid h-[34px] w-[34px] place-items-center rounded-[10px] border border-brand-soft bg-brand-tint text-brand-dark md:static md:h-12 md:w-12 md:rounded-[14px]">
                      <Icon name={step.icon} size={18} className="md:h-6 md:w-6" />
                    </span>
                    <h3 className="m-0 text-[15px] font-bold leading-[1.15] tracking-[-0.2px] md:text-[19px] md:leading-[1.2]">
                      {step.title}
                    </h3>
                    <p className="m-0 text-[13px] leading-[1.45] text-muted md:text-base md:leading-[1.5]">
                      {step.text}
                    </p>
                  </article>

                  {/* Connectors for mobile only */}
                  {idx === 0 && (
                    <span
                      className="absolute top-[17px] -right-[18px] z-[2] grid h-[26px] w-[26px] place-items-center rounded-full border border-border-main bg-white text-muted shadow-[0_2px_4px_rgba(13,45,32,0.08)] md:hidden"
                      aria-hidden="true"
                    >
                      <Icon name="chevron-right" size={14} />
                    </span>
                  )}
                  {isThirdOrFourth && (
                    <span
                      className="absolute -top-[18px] left-1/2 z-[2] -ml-[13px] grid h-[26px] w-[26px] rotate-90 place-items-center rounded-full border border-border-main bg-white text-muted shadow-[0_2px_4px_rgba(13,45,32,0.08)] md:hidden"
                      aria-hidden="true"
                    >
                      <Icon name="chevron-right" size={14} />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Preview section */}
      <section className="bg-surface-alt py-6 md:py-14 xl:py-[72px]" aria-labelledby="preview-title">
        <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8 xl:px-20">
          <div className="relative flex flex-col overflow-hidden rounded-3xl border border-brand-soft bg-brand-tint p-3.5 md:gap-8 md:rounded-[32px] md:p-9 xl:flex-row xl:items-center xl:gap-14 xl:p-14">
            <span
              className="pointer-events-none absolute -top-[71px] -left-[61px] h-[170px] w-[170px] rounded-full [background:radial-gradient(circle,rgba(25,196,99,0.22),rgba(25,196,99,0)_70%)] md:-top-[101px] md:-left-[91px] md:h-[260px] md:w-[260px] xl:-top-[121px] xl:-left-[121px] xl:h-[360px] xl:w-[360px]"
              aria-hidden="true"
            />
            <div className="contents md:flex md:flex-col md:items-start md:gap-[18px] xl:min-w-[300px] xl:flex-[0_1_400px]">
              <p className="relative m-0 mb-1.5 text-xs font-bold tracking-[0.8px] text-brand-dark md:m-0 md:text-[13px]">
                РЕЗУЛЬТАТ
              </p>
              <h2
                id="preview-title"
                className="relative m-0 mb-1.5 text-2xl font-bold leading-[1.16] tracking-[-0.5px] md:m-0 md:text-4xl md:tracking-[-0.9px] xl:text-[42px]"
              >
                Ваш результат
              </h2>
              <p className="relative m-0 mb-3 text-sm leading-[1.48] text-muted md:m-0 md:text-lg md:leading-[1.5]">
                Отримайте зрозумілий рейтинг культур, які найбільше відповідають умовам вашого поля
                та поточного сезону.
              </p>
              <Button
                href={ANALYSIS_LINK.href}
                ready={ANALYSIS_LINK.ready}
                arrow
                className="relative order-2 h-12 w-full text-[15px] md:order-none md:h-14 md:w-auto md:text-[17px] [&_svg]:h-4 [&_svg]:w-4 md:[&_svg]:h-5 md:[&_svg]:w-5"
              >
                Провести аналіз поля
              </Button>
            </div>

            <figure className="relative order-1 mb-3 overflow-hidden rounded-[18px] border border-border-soft bg-white shadow-[0_12px_28px_-6px_rgba(13,45,32,0.14)] md:order-none md:mb-0 md:rounded-3xl md:shadow-[0_18px_40px_-8px_rgba(13,45,32,0.16)] xl:min-w-0 xl:flex-1">
              <div className="flex items-center justify-between gap-2.5 border-b border-border-soft bg-surface-panel p-2.5 px-3 md:p-4 md:px-[22px]">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-brand-soft bg-brand-tint text-brand-dark md:h-10 md:w-10 md:rounded-xl">
                    <Icon name="map-pin" size={16} className="md:h-5 md:w-5" />
                  </span>
                  <div>
                    <p className="m-0 text-sm font-bold leading-[1.2] md:text-base">Результат аналізу</p>
                    <p className="m-0 text-xs font-medium text-muted md:text-[13px]">Поле №3 — Південне · 24,6 га</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-border-main bg-white px-2.5 py-[3px] text-xs font-semibold text-brand-dark md:px-3 md:py-1 md:text-[13px]">
                  Приклад
                </span>
              </div>
              <div className="md:flex md:flex-col md:gap-2.5 md:p-5">
                <p className="m-0 p-2.5 px-3 pb-0.5 text-xs font-semibold text-muted md:p-0 md:text-sm">
                  Топ-5 культур для вашого поля
                </p>
                <ol className="m-0 list-none p-0 md:flex md:flex-col md:gap-2.5">
                  {RANKING.map((item, index) => {
                    const isTop = index === 0;

                    return (
                      <li
                        key={item.id}
                        className={`flex items-center gap-2.5 border-b border-border-soft p-[9px_12px] last:border-b-0 md:gap-4 md:rounded-2xl md:border md:border-border-soft md:p-[14px_18px_14px_16px] ${
                          isTop
                            ? 'bg-brand-tint md:border-2 md:border-brand md:bg-brand-tint'
                            : 'md:bg-white'
                        }`}
                      >
                        <span
                          className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full text-[13px] font-bold md:h-9 md:w-9 md:text-[17px] ${
                            isTop ? 'bg-brand text-brand-darkest' : 'bg-brand-soft text-brand-dark'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span
                          className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] text-brand-dark md:h-12 md:w-12 md:rounded-[14px] ${
                            TONE_CLASSES[item.tone] || 'bg-brand-soft'
                          }`}
                        >
                          <Icon name={item.icon} size={17} className="md:h-6 md:w-6" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-px md:gap-[3px]">
                          <span className="text-[15px] font-bold leading-[1.2] md:text-[19px] md:tracking-[-0.2px]">
                            {item.name}
                          </span>
                          <span className="text-xs font-medium text-brand-dark md:text-[15px]">
                            {item.note}
                          </span>
                        </span>
                        <span
                          className="relative hidden h-2 min-w-14 flex-[0_1_120px] overflow-hidden rounded bg-border-soft md:block"
                          aria-hidden="true"
                        >
                          <span
                            className="absolute top-0 bottom-0 left-0 rounded bg-brand"
                            style={{ width: `${item.score}%` }}
                          />
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
              <figcaption className="flex items-center gap-1.5 border-t border-border-soft bg-surface-panel p-2 px-3 text-[11px] font-medium text-muted md:gap-2 md:p-3.5 md:px-[22px] md:text-[13px]">
                <Icon name="info" size={14} className="shrink-0 md:h-[18px] md:w-[18px]" />
                <span>Приклад для ілюстрації. Це не реальний прогноз.</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
    </>
  );
}