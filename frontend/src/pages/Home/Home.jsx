import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';
import { ANALYSIS_LINK } from '../../constants/siteLinks';
import './Home.css';

const AUDIENCE_POINTS = [
  'Для фермерів та господарств',
  'Зрозуміла рекомендація замість складних таблиць',
];

const VALUE_CARDS = [
  {
    id: 'field',
    title: 'Для конкретного поля',
    text: 'Рекомендації враховують особливості саме вашої ділянки.',
  },
  {
    id: 'complex',
    title: 'Комплексний аналіз',
    text: 'Поєднуємо дані про поле, погоду, ринок та логістику.',
  },
  {
    id: 'result',
    title: 'Зрозумілий результат',
    text: 'Ви отримуєте просту рекомендацію замість складних наборів даних.',
  },
  {
    id: 'data',
    title: 'На основі актуальних даних',
    text: 'Система враховує поточні умови сезону та ринку.',
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

export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container">
          <div className="hero__copy">
            <h1 id="hero-title" className="hero__title">
              Обирайте найперспективнішу культуру для свого поля
            </h1>
            <p className="hero__text">
              SIVAY аналізує стан ґрунту, погодні умови, попередні культури, ринкові ціни та
              логістичні витрати, щоб допомогти вам прийняти обґрунтоване рішення щодо посіву.
            </p>
            <div className="hero__actions">
              <Button href={ANALYSIS_LINK.href} ready={ANALYSIS_LINK.ready} arrow>
                Перейти до аналізу
              </Button>
              <Button variant="secondary" href="#why-sivay">
                Дізнатися більше
              </Button>
            </div>
            <ul className="hero__points">
              {AUDIENCE_POINTS.map((point) => (
                <li key={point} className="hero__point">
                  <Icon name="check-circle" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="why-sivay" className="section section--white" aria-labelledby="why-title">
        <div className="container section__inner">
          <header className="section-heading">
            <p className="section-heading__eyebrow">ПЕРЕВАГИ</p>
            <h2 id="why-title" className="section-heading__title">
              Чому SIVAY
            </h2>
          </header>
          <ul className="value-grid">
            {VALUE_CARDS.map((card) => (
              <li key={card.id} className="value-card">
                <span className="value-card__icon">
                  <Icon name="check" />
                </span>
                <h3 className="value-card__title">{card.title}</h3>
                <p className="value-card__text">{card.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cta" aria-labelledby="cta-title">
        <div className="container">
          <div className="cta__panel">
            <span className="cta__blob cta__blob--top" aria-hidden="true" />
            <span className="cta__blob cta__blob--bottom" aria-hidden="true" />
            <Icon name="leaf" className="cta__decor cta__decor--leaf" strokeWidth={1.5} />
            <Icon name="sprout" className="cta__decor cta__decor--sprout" strokeWidth={1.5} />
            <Icon name="sun" className="cta__decor cta__decor--sun" strokeWidth={1.5} />
            <Icon name="wheat" className="cta__decor cta__decor--wheat" strokeWidth={1.5} />
            <h2 id="cta-title" className="cta__title">
              Дізнайтеся, яка культура найперспективніша для вашого поля
            </h2>
            <p className="cta__text">Приймайте рішення на основі даних, а не припущень.</p>
            <Button
              href={ANALYSIS_LINK.href}
              ready={ANALYSIS_LINK.ready}
              arrow
              className="cta__button"
            >
              Почати аналіз
            </Button>
          </div>
        </div>
      </section>

      <section className="section section--white" aria-labelledby="benefits-title">
        <div className="container section__inner">
          <header className="section-heading">
            <p className="section-heading__eyebrow">ЩО ВРАХОВУЄ SIVAY</p>
            <h2 id="benefits-title" className="section-heading__title">
              Рішення на основі даних
            </h2>
            <p className="section-heading__lead">
              Чотири ключові чинники, які SIVAY бере до уваги для вашого поля.
            </p>
          </header>
          <ul className="benefit-grid">
            {BENEFIT_CARDS.map((card) => (
              <li key={card.id} className="benefit-card" data-tone={card.tone}>
                <span className="benefit-card__icon">
                  <Icon name={card.icon} />
                </span>
                <h3 className="benefit-card__title">{card.title}</h3>
                <p className="benefit-card__text">{card.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--alt section--steps" aria-labelledby="steps-title">
        <div className="container section__inner">
          <header className="section-heading">
            <p className="section-heading__eyebrow">ПРОСТИЙ ПРОЦЕС</p>
            <h2 id="steps-title" className="section-heading__title">
              Як працює SIVAY
            </h2>
            <p className="section-heading__lead">
              Чотири прості кроки від вибору поля до рекомендації.
            </p>
          </header>
          <ol className="steps">
            {STEPS.map((step) => (
              <li key={step.id} className="step">
                <div className="step__marker" aria-hidden="true">
                  <span className="step__line step__line--before" />
                  <span className="step__number">{step.id}</span>
                  <span className="step__line step__line--after">
                    <span className="step__rule" />
                    <Icon name="chevron-right" className="step__chevron" />
                  </span>
                </div>
                <article className="step__card">
                  <span className="step__icon">
                    <Icon name={step.icon} />
                  </span>
                  <h3 className="step__title">{step.title}</h3>
                  <p className="step__text">{step.text}</p>
                </article>
                <span className="step__connector" aria-hidden="true">
                  <Icon name="chevron-right" />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--white" aria-labelledby="preview-title">
        <div className="container">
          <div className="preview">
            <span className="preview__blob" aria-hidden="true" />
            <div className="preview__copy">
              <p className="preview__eyebrow">РЕЗУЛЬТАТ</p>
              <h2 id="preview-title" className="preview__title">
                Ваш результат
              </h2>
              <p className="preview__text">
                Отримайте зрозумілий рейтинг культур, які найбільше відповідають умовам вашого поля
                та поточного сезону.
              </p>
              <Button
                href={ANALYSIS_LINK.href}
                ready={ANALYSIS_LINK.ready}
                arrow
                className="preview__cta"
              >
                Провести аналіз поля
              </Button>
            </div>

            <figure className="mockup preview__mockup">
              <div className="mockup__header">
                <div className="mockup__headline">
                  <span className="mockup__pin">
                    <Icon name="map-pin" />
                  </span>
                  <div>
                    <p className="mockup__title">Результат аналізу</p>
                    <p className="mockup__subtitle">Поле №3 — Південне · 24,6 га</p>
                  </div>
                </div>
                <span className="mockup__tag">Приклад</span>
              </div>
              <div className="mockup__body">
                <p className="mockup__caption">Топ-5 культур для вашого поля</p>
                <ol className="ranking">
                  {RANKING.map((item, index) => (
                    <li key={item.id} className={`rank${index === 0 ? ' rank--top' : ''}`}>
                      <span className="rank__number">{index + 1}</span>
                      <span className="rank__icon" data-tone={item.tone}>
                        <Icon name={item.icon} />
                      </span>
                      <span className="rank__copy">
                        <span className="rank__name">{item.name}</span>
                        <span className="rank__note">{item.note}</span>
                      </span>
                      <span
                        className="rank__bar"
                        style={{ '--score': `${item.score}%` }}
                        aria-hidden="true"
                      />
                    </li>
                  ))}
                </ol>
              </div>
              <figcaption className="mockup__footer">
                <Icon name="info" />
                <span>Приклад для ілюстрації. Це не реальний прогноз.</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
    </>
  );
}