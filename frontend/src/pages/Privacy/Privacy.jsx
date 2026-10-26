import { useEffect, useState } from 'react';
import AppLink from '../../components/AppLink/AppLink';
import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';

const SECTIONS = [
  { id: 'general', title: '1. Загальні положення та володілець даних' },
  { id: 'data-collected', title: '2. Які дані ми збираємо' },
  { id: 'purposes', title: '3. Мета обробки даних' },
  { id: 'geo-confidentiality', title: '4. Захист геоданих та комерційної таємниці' },
  { id: 'third-parties', title: '5. Передача даних третім сторонам' },
  { id: 'security', title: '6. Безпека та термін зберігання' },
  { id: 'user-rights', title: '7. Ваші права щодо персональних даних' },
  { id: 'cookies', title: '8. Використання файлів cookie' },
  { id: 'contacts', title: '9. Зміни до політики та контакти' },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const offset = 140;
          let current = SECTIONS[0].id;

          for (const section of SECTIONS) {
            const el = document.getElementById(section.id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= offset) {
                current = section.id;
              }
            }
          }

          const isBottom =
            Math.ceil(window.innerHeight + window.scrollY) >=
            document.documentElement.scrollHeight - 60;
          if (isBottom) {
            current = SECTIONS[SECTIONS.length - 1].id;
          }

          setActiveSection(current);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pt-6 pb-16 md:px-8 md:pt-10 md:pb-24 xl:px-20">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Хлібні крихти" className="mb-4 flex items-center gap-2 text-[13px] font-medium text-muted">
        <AppLink href="/" className="transition-colors hover:text-brand-dark">
          Головна
        </AppLink>
        <Icon name="chevron-right" size={14} className="text-muted/60" />
        <span className="text-brand-text">Політика конфіденційності</span>
      </nav>

      {/* Header Banner */}
      <header className="mb-8 flex flex-col gap-3 rounded-2xl border border-border-main bg-gradient-to-br from-brand-tint via-white to-surface-panel p-6 shadow-sm md:mb-12 md:rounded-[24px] md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[12px] font-bold tracking-wider text-brand-dark uppercase">
            <Icon name="check-circle" size={14} /> Безпека та конфіденційність
          </span>
          <span className="text-xs font-semibold text-muted">
            Редакція від 26 жовтня 2026 р.
          </span>
        </div>

        <h1 className="m-0 text-2xl font-bold leading-[1.15] text-brand-text md:text-4xl xl:text-[44px]">
          Політика конфіденційності SIVAY
        </h1>

        <p className="m-0 max-w-[820px] text-[15px] leading-[1.6] text-muted md:text-[17px]">
          Ми поважаємо вашу приватність і прагнемо захищати ваші персональні дані та агрономічну інформацію. 
          У цій Політиці описано, які дані ми збираємо, як їх використовуємо та як забезпечуємо безпеку ваших полів.
        </p>

        {/* Quick Page Switcher */}
        <div className="mt-2 flex flex-wrap gap-2.5 pt-2 border-t border-border-soft">
          <AppLink
            href="/privacy"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-[14px] font-semibold text-brand-darkest shadow-sm"
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

      {/* Main Grid: Sticky Sidebar + Content */}
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-12">
        {/* Left Column: Navigation Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-6">
            <div className="rounded-2xl border border-border-main bg-white p-5 shadow-sm">
              <h2 className="m-0 mb-3 text-xs font-bold tracking-wider text-brand-dark uppercase">
                Зміст документа
              </h2>
              <nav aria-label="Розділи політики" className="flex flex-col gap-1">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollTo(sec.id)}
                    className={`cursor-pointer rounded-lg px-3 py-2 text-left text-[14px] font-medium transition-all ${
                      activeSection === sec.id
                        ? 'bg-brand-tint font-bold text-brand-dark'
                        : 'text-muted hover:bg-surface-alt hover:text-brand-text'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>
            </div>

            <div className="rounded-2xl border border-brand-soft bg-brand-tint p-5">
              <span className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-darkest">
                <Icon name="lock-keyhole" size={20} />
              </span>
              <h3 className="m-0 text-base font-bold text-brand-text">
                Захист персональних даних
              </h3>
              <p className="mt-1.5 mb-4 text-[13px] leading-[1.5] text-muted">
                Ви можете в будь-який момент отримати копію своїх даних або надіслати запит на їх повне видалення.
              </p>
              <a
                href="mailto:privacy@sivay.com.ua"
                className="text-[14px] font-bold text-brand-dark hover:underline"
              >
                privacy@sivay.com.ua →
              </a>
            </div>
          </div>
        </aside>

        {/* Right Column: Full Legal Content */}
        <article className="flex flex-col gap-8 text-[15px] leading-[1.7] text-brand-text md:text-base">
          {/* Section 1 */}
          <section id="general" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              1. Загальні положення та володілець даних
            </h2>
            <p className="mb-3">
              1.1. Ця Політика конфіденційності регулює порядок збирання, використання, зберігання та захисту персональних та геопросторових даних користувачів платформи <strong>SIVAY</strong>.
            </p>
            <p className="mb-3">
              1.2. Володільцем та розпорядником персональних даних є онлайн-сервіс SIVAY Platform (Україна).
            </p>
            <p>
              1.3. Обробка персональних даних здійснюється у повній відповідності до Закону України «Про захист персональних даних» № 2297-VI, а також з урахуванням європейських стандартів Загального регламенту захисту даних (GDPR, Regulation (EU) 2016/679).
            </p>
          </section>

          {/* Section 2 */}
          <section id="data-collected" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              2. Які дані ми збираємо
            </h2>
            <p className="mb-3">Для надання сервісів платформи SIVAY ми можемо обробляти такі категорії даних:</p>
            <div className="space-y-4">
              <div className="rounded-xl border border-border-soft bg-surface-alt p-4">
                <h3 className="m-0 text-base font-bold text-brand-text">А. Облікові (реєстраційні) дані:</h3>
                <p className="m-0 mt-1 text-[14px] text-muted">
                  Адреса електронної пошти (email), хешований пароль, ім'я та прізвище, номер телефону (за бажанням), дата народження (за бажанням).
                </p>
              </div>

              <div className="rounded-xl border border-border-soft bg-surface-alt p-4">
                <h3 className="m-0 text-base font-bold text-brand-text">Б. Агрономічні та геопросторові дані:</h3>
                <p className="m-0 mt-1 text-[14px] text-muted">
                  Географічні координати (GPS-точки) меж ваших полів, контури ділянок, розрахункова площа в гектарах, назви полів та ділянок, історія вирощуваних культур за минулі сезони (сівозміна).
                </p>
              </div>

              <div className="rounded-xl border border-border-soft bg-surface-alt p-4">
                <h3 className="m-0 text-base font-bold text-brand-text">В. Технічні та аналітичні дані:</h3>
                <p className="m-0 mt-1 text-[14px] text-muted">
                  IP-адреса, тип та версія браузера, параметри пристрою, файли cookie, логи відвідування та успішності виконання API-запитів.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="purposes" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              3. Мета обробки даних
            </h2>
            <p className="mb-3">Ми використовуємо зібрану інформацію виключно для таких цілей:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted">
              <li><strong>Надання основного функціоналу:</strong> забезпечення реєстрації, автентифікації сесії, збереження меж полів та формування аналітичних рекомендацій;</li>
              <li><strong>Агрономічний аналіз:</strong> поєднання контурів поля із супутниковими знімками, картами ґрунтів та моделями прогнозу погоди для розрахунку маржинальності культур;</li>
              <li><strong>Безпека сервісу:</strong> запобігання шахрайству, спаму, несанкціонованим спробам зламу чи підбору паролів;</li>
              <li><strong>Технічна підтримка:</strong> комунікація з користувачем щодо статусу сервісу, вирішення технічних запитів та оновлень платформи;</li>
              <li><strong>Вдосконалення математичних моделей:</strong> використання виключно знеособлених (анонімізованих) даних для поліпшення точності прогностичних алгоритмів.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="geo-confidentiality" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              4. Захист геоданих та комерційної таємниці
            </h2>
            <div className="mb-4 rounded-xl border border-brand-soft bg-brand-tint p-4 text-[14px] leading-relaxed text-brand-dark">
              <strong>Гарантія конфіденційності полів:</strong> SIVAY суворо дотримується принципу збереження комерційної таємниці в агросекторі. 
              Координати ваших ділянок, історія врожайності та заплановані культури ні за яких умов не публікуються у відкритому доступі та не передаються іншим фермерським господарствам чи конкурентам.
            </div>
            <p>
              Доступ до цифрової карти ваших полів маєте виключно ви через авторизований обліковий запис, або довірені технічні фахівці SIVAY виключно в разі вашого офіційного звернення до служби підтримки для усунення збоїв.
            </p>
          </section>

          {/* Section 5 */}
          <section id="third-parties" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              5. Передача даних третім сторонам
            </h2>
            <p className="mb-3">
              5.1. Ми <strong>не продаємо</strong> та не передаємо персональні дані комерційним рекламним мережам чи стороннім брокерам даних.
            </p>
            <p className="mb-3">
              5.2. Для забезпечення роботи карт та розрахунків ми використовуємо виключно технічні інтеграції з перевіреними постачальниками інфраструктури:
            </p>
            <ul className="mb-3 list-disc pl-5 space-y-1.5 text-muted">
              <li><strong>Google Maps API:</strong> для відображення супутникової підкладки та пошуку населених пунктів (передаються географічні координати вікна перегляду);</li>
              <li><strong>Хмарні хостинг-провайдери:</strong> сервери баз даних із захищеними каналами зв’язку для збереження облікових записів;</li>
              <li><strong>Постачальники метеорологічних та супутникових даних:</strong> для отримання супутникових індексів (NDVI, вологості ґрунту) на основі координат контуру поля без персональних даних його власника.</li>
            </ul>
            <p>
              5.3. Розкриття даних державним органам можливе виключно на підставі законного рішення суду або в інших випадках, передбачених чинним законодавством України.
            </p>
          </section>

          {/* Section 6 */}
          <section id="security" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              6. Безпека та термін зберігання
            </h2>
            <p className="mb-3">
              6.1. Ми застосовуємо багаторівневі організаційні та технічні заходи захисту інформації:
            </p>
            <ul className="mb-4 list-disc pl-5 space-y-1 text-muted">
              <li>Криптографічний захист каналів передачі даних (протокол HTTPS/TLS з 256-бітним шифруванням);</li>
              <li>Надійне одностороннє хешування паролів за стандартом <em>bcrypt</em> (паролі не зберігаються у відкритому вигляді навіть для розробників);</li>
              <li>Авторизація через криптографічно підписані токени JWT;</li>
              <li>Регулярне резервне копіювання баз даних.</li>
            </ul>
            <p>
              6.2. <strong>Термін зберігання:</strong> Дані зберігаються протягом усього часу активності вашого облікового запису. У разі надсилання запиту на видалення акаунта всі пов'язані з ним персональні та просторові дані остаточно знищуються з робочих баз протягом 30 днів.
            </p>
          </section>

          {/* Section 7 */}
          <section id="user-rights" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              7. Ваші права щодо персональних даних
            </h2>
            <p className="mb-3">Відповідно до законодавства України ви маєте право:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-muted">
              <li>Знати про джерела збору, місцезнаходження своїх даних та мету їх обробки;</li>
              <li>Отримувати доступ до своїх персональних даних та перелік полів, збережених у системі;</li>
              <li>Вимагати виправлення неточних або застарілих даних;</li>
              <li>Вимагати повного видалення (знищення) свого облікового запису та збережених полів («право на забуття»);</li>
              <li>Відкликати надану згоду на обробку персональних даних у будь-який момент.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="cookies" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              8. Використання файлів cookie
            </h2>
            <p className="mb-3">
              8.1. Платформа використовує технічні файли cookie та локальне сховище браузера (localStorage) для забезпечення автентифікації користувача та збереження поточного стану інтерфейсу під час роботи з картою.
            </p>
            <p>
              8.2. Ви можете вимкнути файли cookie в налаштуваннях свого браузера, однак зверніть увагу, що в такому разі частина функціоналу авторизації та збереження розрахунків може працювати некоректно.
            </p>
          </section>

          {/* Section 9 */}
          <section id="contacts" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              9. Зміни до політики та контакти
            </h2>
            <p className="mb-3">
              9.1. Ми залишаємо за собою право вносити зміни до цієї Політики у разі зміни законодавства чи розширення функцій сервісу. Нова редакція публікується на цій сторінці.
            </p>
            <div className="mt-4 rounded-xl border border-border-soft bg-surface-alt p-4">
              <p className="m-0 font-bold text-brand-text">Контакти з питань захисту персональних даних:</p>
              <p className="m-0 mt-1 text-[14px] text-muted">
                Спеціальна адреса для запитів щодо приватності: <a href="mailto:privacy@sivay.com.ua" className="font-semibold text-brand-dark hover:underline">privacy@sivay.com.ua</a>
              </p>
              <p className="m-0 mt-0.5 text-[14px] text-muted">
                Загальна підтримка користувачів: <a href="mailto:support@sivay.com.ua" className="font-semibold text-brand-dark hover:underline">support@sivay.com.ua</a>
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/" variant="secondary" arrow>
                На головну сторінку
              </Button>
              <Button href="/terms">
                Переглянути Умови використання
              </Button>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}

