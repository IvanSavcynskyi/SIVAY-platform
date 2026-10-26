import { useEffect, useState } from 'react';
import AppLink from '../../components/AppLink/AppLink';
import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';

const SECTIONS = [
  { id: 'general', title: '1. Загальні положення' },
  { id: 'services', title: '2. Предмет та функції платформи' },
  { id: 'account', title: '3. Реєстрація та безпека акаунта' },
  { id: 'data-ownership', title: '4. Право власності на дані та інтелектуальна власність' },
  { id: 'recommendations', title: '5. Характер аналітичних рекомендацій' },
  { id: 'user-rules', title: '6. Правила користування та обмеження' },
  { id: 'liability', title: '7. Обмеження відповідальності' },
  { id: 'changes', title: '8. Зміни до умов та припинення дії' },
  { id: 'contacts', title: '9. Застосовне право та контактна інформація' },
];

export default function Terms() {
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
        <span className="text-brand-text">Умови використання</span>
      </nav>

      {/* Header Banner */}
      <header className="mb-8 flex flex-col gap-3 rounded-2xl border border-border-main bg-gradient-to-br from-brand-tint via-white to-surface-panel p-6 shadow-sm md:mb-12 md:rounded-[24px] md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[12px] font-bold tracking-wider text-brand-dark uppercase">
            <Icon name="check-circle" size={14} /> Юридична інформація
          </span>
          <span className="text-xs font-semibold text-muted">
            Редакція від 26 жовтня 2026 р.
          </span>
        </div>

        <h1 className="m-0 text-2xl font-bold leading-[1.15] text-brand-text md:text-4xl xl:text-[44px]">
          Умови використання платформи SIVAY
        </h1>

        <p className="m-0 max-w-[820px] text-[15px] leading-[1.6] text-muted md:text-[17px]">
          Будь ласка, уважно ознайомтеся з цими Умовами перед початком роботи з платформою SIVAY. 
          Використовуючи наш сервіс, ви погоджуєтеся з наведеними правилами та приймаєте на себе зобов’язання щодо їх дотримання.
        </p>

        {/* Quick Page Switcher */}
        <div className="mt-2 flex flex-wrap gap-2.5 pt-2 border-t border-border-soft">
          <AppLink
            href="/terms"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-[14px] font-semibold text-brand-darkest shadow-sm"
          >
            Умови використання
          </AppLink>
          <AppLink
            href="/privacy"
            className="inline-flex items-center gap-2 rounded-xl border border-border-main bg-white px-4 py-2 text-[14px] font-semibold text-muted transition-colors hover:border-brand hover:text-brand-dark"
          >
            Політика конфіденційності
          </AppLink>
          <AppLink
            href="/contacts"
            className="inline-flex items-center gap-2 rounded-xl border border-border-main bg-white px-4 py-2 text-[14px] font-semibold text-muted transition-colors hover:border-brand hover:text-brand-dark"
          >
            Контакти
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
              <nav aria-label="Розділи умов" className="flex flex-col gap-1">
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
                <Icon name="sprout" size={20} />
              </span>
              <h3 className="m-0 text-base font-bold text-brand-text">
                Потрібна консультація?
              </h3>
              <p className="mt-1.5 mb-4 text-[13px] leading-[1.5] text-muted">
                Якщо у вас виникли запитання щодо умов використання платформи, зв'яжіться з нашою командою.
              </p>
              <a
                href="mailto:legal@sivay.com.ua"
                className="text-[14px] font-bold text-brand-dark hover:underline"
              >
                legal@sivay.com.ua →
              </a>
            </div>
          </div>
        </aside>

        {/* Right Column: Full Legal Content */}
        <article className="flex flex-col gap-8 text-[15px] leading-[1.7] text-brand-text md:text-base">
          {/* Section 1 */}
          <section id="general" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              1. Загальні положення
            </h2>
            <p className="mb-3">
              1.1. Цей документ є публічним договором (публічною офертою) між онлайн-платформою <strong>SIVAY</strong> (далі — «Платформа», «ми», «нас») та будь-якою дієздатною фізичною або юридичною особою (далі — «Користувач», «ви»), що використовує функціонал платформи.
            </p>
            <p className="mb-3">
              1.2. Платформа SIVAY є спеціалізованим програмним комплексом та інформаційно-аналітичним сервісом для оптимізації структури посівних площ, аналізу просторових геоданих і моделювання маржинальності вирощування агрокультур.
            </p>
            <p>
              1.3. Створюючи обліковий запис або виконуючи будь-які дії на веб-сайті, Користувач беззастережно погоджується з цими Умовами використання та Політикою конфіденційності. Якщо ви не згодні з цими Умовами, ви зобов'язані припинити використання Платформи.
            </p>
          </section>

          {/* Section 2 */}
          <section id="services" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              2. Предмет та функції платформи
            </h2>
            <p className="mb-3">
              2.1. SIVAY надає Користувачам цифровий доступ до таких основних можливостей:
            </p>
            <ul className="mb-4 list-disc pl-5 space-y-1.5 text-muted">
              <li>Інтерактивне позначення, редагування та розрізання контурів полів і ділянок на супутниковій карті;</li>
              <li>Ведення цифрової історії попередників (сівозміни) за попередні сільськогосподарські сезони;</li>
              <li>Аналітичний розрахунок і формування рекомендацій щодо потенціалу культур на основі комбінації просторових, погодних та ринкових чинників;</li>
              <li>Оцінка площ ділянок у гектарах із високою точністю за геодезичними алгоритмами.</li>
            </ul>
            <p>
              2.2. Платформа постійно вдосконалюється, тому ми маємо право розширювати функціонал, впроваджувати нові інструменти або оптимізувати наявні модулі сервісу.
            </p>
          </section>

          {/* Section 3 */}
          <section id="account" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              3. Реєстрація та безпека акаунта
            </h2>
            <p className="mb-3">
              3.1. Для збереження створених полів, історії ділянок та отримання доступу до аналізу Користувач проходить процедуру реєстрації з наданням достовірної адреси електронної пошти та встановленням надійного пароля (не менше 8 символів).
            </p>
            <p className="mb-3">
              3.2. Користувач несе повну відповідальність за збереження в таємниці своїх автентифікаційних даних (логіна, пароля, сесійних токенів) та за всі дії, вчинені під його обліковим записом.
            </p>
            <p>
              3.3. У разі виявлення несанкціонованого доступу до вашого акаунта ви зобов'язані негайно повідомити службу підтримки SIVAY для тимчасового блокування або зміни ключів доступу.
            </p>
          </section>

          {/* Section 4 */}
          <section id="data-ownership" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              4. Право власності на дані та інтелектуальна власність
            </h2>
            <div className="mb-4 rounded-xl border border-brand-soft bg-brand-tint/60 p-4 text-[14px] leading-relaxed text-brand-dark">
              <strong>Ключовий принцип SIVAY:</strong> Ваші поля та агрономічні дані належать виключно вам. Ми не продаємо і не передаємо межі ваших ділянок конкурентам чи третім особам.
            </div>
            <p className="mb-3">
              4.1. <strong>Дані Користувача:</strong> Усі введені вами координати меж полів, площі, назви ділянок та записи про вирощувані культури є вашою власністю. Ви надаєте SIVAY обмежену технічну ліцензію на збереження та обробку цих даних виключно з метою надання вам аналітичних послуг.
            </p>
            <p>
              4.2. <strong>Інтелектуальна власність Платформи:</strong> Програмний код, користувацький інтерфейс, дизайн, логотипи SIVAY, аналітичні алгоритми порівняння культур та моделі розрахунку маржинальності є об’єктами інтелектуальної власності розробників SIVAY і захищені законодавством України та міжнародними договорами.
            </p>
          </section>

          {/* Section 5 */}
          <section id="recommendations" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              5. Характер аналітичних рекомендацій
            </h2>
            <p className="mb-3">
              5.1. Рекомендації щодо вибору культур, показники перспективності та аналітичні висновки формуються автоматизованими алгоритмами на основі математичних моделей, узагальнених погодних прогнозів та ринкових індикаторів.
            </p>
            <div className="mb-3 rounded-xl border border-[#f4c7c3] bg-danger-soft p-4 text-[14px] leading-relaxed text-danger">
              <strong>Агрономічне застереження:</strong> Розрахунки SIVAY мають інформаційний та рекомендаційний характер. Вони не є фінансовою або безумовною агрономічною гарантією врожаю.
            </div>
            <p>
              5.2. Реальний урожай та маржинальність залежать від багатьох факторів поза контролем Платформи (аномальні погодні умови, своєчасність агротехнічних операцій, якість насіння та ЗЗР, різкі коливання цін на ринку). Остаточне господарське рішення приймає безпосередньо Користувач.
            </p>
          </section>

          {/* Section 6 */}
          <section id="user-rules" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              6. Правила користування та обмеження
            </h2>
            <p className="mb-3">Користувачеві забороняється:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-muted">
              <li>Здійснювати спроби несанкціонованого втручання в роботу серверів чи баз даних SIVAY;</li>
              <li>Використовувати автоматизовані парсери, боти або скрейпери без письмового дозволу;</li>
              <li>Декомпілювати, розбирати чи копіювати алгоритмічну частину платформи;</li>
              <li>Порушувати чинні закони України, норми міжнародного права та права третіх осіб.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="liability" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              7. Обмеження відповідальності
            </h2>
            <p className="mb-3">
              7.1. Платформа надається за принципом <em>«як є» (as is)</em>. Ми докладаємо всіх зусиль для безперебійної та безпомилкової роботи сервісу, однак не гарантуємо абсолютної відсутності технічних перерв.
            </p>
            <p className="mb-3">
              7.2. SIVAY не несе відповідальності за втрату прибутку, недоотриманий урожай чи інші непрямі збитки, пов'язані з прийнятими господарськими рішеннями на основі рекомендацій платформи.
            </p>
            <p>
              7.3. Сторони звільняються від відповідальності за невиконання зобов'язань у разі настання обставин непереборної сили (форс-мажор: військові дії, збої глобальних мереж, стихійні лиха, санкції).
            </p>
          </section>

          {/* Section 8 */}
          <section id="changes" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              8. Зміни до умов та припинення дії
            </h2>
            <p className="mb-3">
              8.1. SIVAY має право періодично оновлювати ці Умови для відображення змін у законодавстві або запуску нових функцій. Оновлена редакція набирає чинності з моменту її публікації на цій сторінці.
            </p>
            <p>
              8.2. Ви можете припинити дію цих Умов у будь-який час, припинивши користування Платформою або надіславши запит на видалення свого облікового запису.
            </p>
          </section>

          {/* Section 9 */}
          <section id="contacts" className="scroll-mt-24 rounded-2xl border border-border-main bg-white p-6 shadow-sm md:rounded-[20px] md:p-8">
            <h2 className="m-0 mb-4 text-xl font-bold text-brand-text md:text-2xl">
              9. Застосовне право та контактна інформація
            </h2>
            <p className="mb-3">
              9.1. Ці Умови регулюються та тлумачаться відповідно до чинного матеріального права України. Усі спори, що не можуть бути врегульовані шляхом перемовин, підлягають розгляду у відповідних судах України.
            </p>
            <div className="mt-4 rounded-xl border border-border-soft bg-surface-alt p-4">
              <p className="m-0 font-bold text-brand-text">Команда підтримки SIVAY Platform:</p>
              <p className="m-0 mt-1 text-[14px] text-muted">
                Електронна пошта з правових питань: <a href="mailto:legal@sivay.com.ua" className="font-semibold text-brand-dark hover:underline">legal@sivay.com.ua</a>
              </p>
              <p className="m-0 mt-0.5 text-[14px] text-muted">
                Технічна підтримка користувачів: <a href="mailto:support@sivay.com.ua" className="font-semibold text-brand-dark hover:underline">support@sivay.com.ua</a>
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/" variant="secondary" arrow>
                На головну сторінку
              </Button>
              <Button href="/privacy">
                Переглянути Політику конфіденційності
              </Button>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}

