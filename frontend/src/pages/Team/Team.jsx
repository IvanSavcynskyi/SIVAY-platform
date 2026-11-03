import AppLink from '../../components/AppLink/AppLink';
import Icon from '../../components/Icon/Icon';

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Олександр Коваль',
    role: 'Співзасновник & CEO',
    bio: 'Понад 10 років досвіду управління в агробізнесі та запуску цифрових рішень. Відповідає за стратегічне бачення платформи SIVAY, партнерські програми з агрохолдингами та залучення інвестицій.',
    skills: ['Стратегія', 'AgriTech', 'Інвестиції', 'Партнерства'],
    email: 'o.koval@sivay.com.ua',
    linkedin: 'https://linkedin.com',
    github: null,
    photo: null,
  },
  {
    id: 2,
    name: 'Олена Шевченко',
    role: 'Технічний директор (CTO) & Lead Architect',
    bio: 'Архітектор розподілених систем та високоточних геосервісів. Курує команду розробки, масштабованість бекенду на базі FastAPI, просторові запити в PostGIS та надійність хмарної інфраструктури.',
    skills: ['System Design', 'Python', 'FastAPI', 'PostGIS', 'Cloud'],
    email: 'o.shevchenko@sivay.com.ua',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    photo: null,
  },
  {
    id: 3,
    name: 'Михайло Бондар',
    role: 'Головний агроном-експерт',
    bio: 'Кандидат с.-г. наук, експерт із точного землеробства та науково обґрунтованих сівозмін. Формує агрономічні алгоритми платформи, правила фітосанітарної безпеки та накопичення поживних речовин у ґрунті.',
    skills: ['Сівозміни', 'Агрохімія', 'Точне землеробство', 'Польові досліди'],
    email: 'm.bondar@sivay.com.ua',
    linkedin: 'https://linkedin.com',
    github: null,
    photo: null,
  },
  {
    id: 4,
    name: 'Ярослав Мельник',
    role: 'Провідний GIS-інженер',
    bio: 'Спеціаліст із просторового моделювання та супутникового моніторингу (Sentinel, Landsat). Забезпечує математичну точність векторизації, розрізання та об’єднання контурів полів на карті.',
    skills: ['PostGIS', 'QGIS', 'GeoJSON', 'Супутникові дані', 'NDVI'],
    email: 'ya.melnyk@sivay.com.ua',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    photo: null,
  },
  {
    id: 5,
    name: 'Дарина Кравчук',
    role: 'Senior Frontend Engineer & UI/UX',
    bio: 'Створює швидкі, зручні та доступні веб-інтерфейси для фермерів. Відповідає за інтерактивну картографію Google Maps, оптимізацію роботи на планшетах у польових умовах та дизайн-систему.',
    skills: ['React', 'Tailwind CSS', 'Google Maps API', 'UI/UX', 'Адаптивність'],
    email: 'd.kravchuk@sivay.com.ua',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    photo: null,
  },
  {
    id: 6,
    name: 'Богдан Савченко',
    role: 'Machine Learning Engineer',
    bio: 'Фахівець із моделювання врожайності, аналізу кореляцій ґрунтово-кліматичних зон та оцінки погодних ризиків. Навчає алгоритми персоналізованого підбору культур для кожного окремого поля.',
    skills: ['Machine Learning', 'Data Science', 'Прогнозування', 'Python', 'Аналітика'],
    email: 'b.savchenko@sivay.com.ua',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    photo: null,
  },
  {
    id: 7,
    name: 'Тетяна Мороз',
    role: 'Керівник впровадження та підтримки',
    bio: 'Супроводжує господарства від першого окресленого поля до збирання врожаю. Збирає живий зворотний зв’язок від агрономів, проводить навчальні сесії та допомагає з імпортом великих земельних банків.',
    skills: ['Клієнтський досвід', 'Онбординг', 'Агроконсалтинг', 'Підтримка 24/7'],
    email: 't.moroz@sivay.com.ua',
    linkedin: 'https://linkedin.com',
    github: null,
    photo: null,
  },
];

const VALUES = [
  {
    id: 'science',
    icon: 'sprout',
    title: 'Наукова обґрунтованість',
    description: 'Жодних здогадок. Кожна рекомендація спирається на перевірені агрономічні моделі сівозмін, дані про ґрунти та реальні польові досліди.',
  },
  {
    id: 'profit',
    icon: 'trending-up',
    title: 'Фокус на прибутку з гектара',
    description: 'Ми створюємо платформу для реального бізнесу. Наша мета — допомогти фермеру збільшити рентабельність та мінімізувати ризики пересівання.',
  },
  {
    id: 'privacy',
    icon: 'lock-keyhole',
    title: 'Сувора конфіденційність',
    description: 'Координати ваших ділянок, історія врожаїв та плани посіву є комерційною таємницею господарства. Дані зашифровані та не передаються стороннім.',
  },
  {
    id: 'simplicity',
    icon: 'map',
    title: 'Зручність у полі та в офісі',
    description: 'Складні геопросторові розрахунки подано у вигляді простих покрокових дій на карті, доступних із комп’ютера, планшета чи смартфона.',
  },
];

export default function Team() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pt-6 pb-16 md:px-8 md:pt-10 md:pb-24 xl:px-20">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Хлібні крихти" className="mb-4 flex items-center gap-2 text-[13px] font-medium text-muted">
        <AppLink href="/" className="transition-colors hover:text-brand-dark">
          Головна
        </AppLink>
        <Icon name="chevron-right" size={14} className="text-muted/60" />
        <span className="text-brand-text">Наша команда</span>
      </nav>

      {/* Header Banner */}
      <header className="mb-10 flex flex-col gap-3 rounded-2xl border border-border-main bg-gradient-to-br from-brand-tint via-white to-surface-panel p-6 shadow-sm md:mb-14 md:rounded-[24px] md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[12px] font-bold tracking-wider text-brand-dark uppercase">
            <Icon name="users" size={14} /> Люди за технологіями SIVAY
          </span>
          <span className="text-xs font-semibold text-muted">
            Команда експертів в Україні
          </span>
        </div>

        <h1 className="m-0 text-2xl font-bold leading-[1.15] text-brand-text md:text-4xl xl:text-[44px]">
          Наша команда
        </h1>

        <p className="m-0 max-w-[840px] text-[15px] leading-[1.6] text-muted md:text-[17px]">
          Ми об’єднали вчених-агрономів, розробників геоінформаційних систем та аналітиків даних,
          щоб створити платформу, яка робить українське землеробство точним, прибутковим та передбачуваним.
        </p>
      </header>

      {/* Team Cards Grid */}
      <section className="mb-14 md:mb-20" aria-labelledby="team-grid-heading">
        <h2 id="team-grid-heading" className="sr-only">
          Список учасників команди SIVAY
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TEAM_MEMBERS.map((member) => (
            <article
              key={member.id}
              className="group flex flex-col justify-between rounded-2xl border border-border-main bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand hover:shadow-card"
            >
              <div>
                {/* Avatar */}
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="relative">
                    <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border-2 border-brand-tint bg-brand-soft text-brand-dark shadow-sm transition-transform duration-200 group-hover:scale-105">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Icon name="user" size={38} className="text-brand-dark" />
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-brand text-[10px] font-bold text-brand-darkest shadow-sm">
                      #{member.id}
                    </span>
                  </div>
                </div>

                {/* Name & Role */}
                <h3 className="m-0 text-lg font-bold leading-snug text-brand-text group-hover:text-brand-dark">
                  {member.name}
                </h3>
                <p className="m-0 mt-1 text-[13px] font-semibold text-brand-dark">
                  {member.role}
                </p>

                {/* Bio */}
                <p className="m-0 mt-3.5 text-[13px] leading-[1.6] text-muted">
                  {member.bio}
                </p>

                {/* Skills Chips */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-surface-panel px-2 py-0.5 text-[11px] font-semibold text-muted"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Social & Contact Links */}
              <div className="mt-6 flex items-center justify-between border-t border-border-soft pt-4">
                <span className="text-[12px] font-semibold text-muted">Контакти:</span>
                <div className="flex items-center gap-2">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-border-main bg-white text-muted transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
                      title={`Написати на ${member.email}`}
                      aria-label={`Електронна пошта ${member.name}`}
                    >
                      <Icon name="mail" size={15} />
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-border-main bg-white text-muted transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
                      title="Профіль LinkedIn"
                      aria-label={`LinkedIn профіль ${member.name}`}
                    >
                      <Icon name="linkedin" size={15} />
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-border-main bg-white text-muted transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
                      title="Профіль GitHub"
                      aria-label={`GitHub профіль ${member.name}`}
                    >
                      <Icon name="github" size={15} />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Values & Principles Section */}
      <section className="mb-14 rounded-3xl border border-border-main bg-surface-panel p-6 md:mb-20 md:p-10 lg:p-12" aria-labelledby="values-heading">
        <div className="mb-8 max-w-[720px] md:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[12px] font-bold tracking-wider text-brand-dark uppercase">
            <Icon name="award" size={14} /> Наші стандарти
          </span>
          <h2 id="values-heading" className="m-0 mt-3 text-2xl font-bold leading-tight text-brand-text md:text-3xl">
            Принципи, на яких побудовано платформу SIVAY
          </h2>
          <p className="m-0 mt-2 text-[15px] leading-relaxed text-muted">
            Ми створюємо технології не заради моди, а для щоденної практичної користі кожного фермера.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {VALUES.map((val) => (
            <div
              key={val.id}
              className="flex flex-col rounded-2xl border border-border-main bg-white p-6 shadow-sm transition-shadow hover:shadow-card"
            >
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand-dark">
                <Icon name={val.icon} size={24} />
              </div>
              <h3 className="m-0 text-lg font-bold text-brand-text">{val.title}</h3>
              <p className="m-0 mt-2 text-[13px] leading-[1.6] text-muted">{val.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section
        className="relative overflow-hidden rounded-3xl border border-border-main bg-gradient-to-br from-brand-darkest via-brand-dark to-[#082E20] p-8 text-white shadow-card md:p-12 lg:p-16"
        aria-labelledby="cta-heading"
      >
        <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-[700px]">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wider text-brand-light uppercase backdrop-blur-sm">
              <Icon name="sprout" size={14} /> Розвиваємо агросектор разом
            </span>
            <h2 id="cta-heading" className="m-0 mt-3 text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl">
              Бажаєте долучитися до команди або маєте пропозицію щодо співпраці?
            </h2>
            <p className="m-0 mt-3 text-[15px] leading-relaxed text-brand-light/90 md:text-base">
              Ми завжди раді талановитим агрономам, інженерам геоінформатики та партнерам.
              Зв’яжіться з нами, щоб обговорити можливості спільних проектів.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AppLink
              href="/contacts"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-brand px-6 text-sm font-bold text-brand-darkest shadow-button transition-transform hover:scale-105 active:scale-95"
            >
              Зв’язатися з нами
            </AppLink>
            <AppLink
              href="/analysis/new"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Спробувати розрахунок
            </AppLink>
          </div>
        </div>
      </section>
    </div>
  );
}
