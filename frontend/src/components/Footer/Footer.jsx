import AppLink from '../AppLink/AppLink';
import Icon from '../Icon/Icon';
import { ABOUT_LINK, INFO_LINKS, NAV_LINKS } from '../../constants/siteLinks';

const FOOTER_NAV_LINKS = NAV_LINKS.filter((link) => link.id !== 'profile');

const TEAM_MEMBERS = Array.from({ length: 7 }, (_, index) => ({
  id: index + 1,
  name: `Учасник ${index + 1}`,
  avatar: null,
}));

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 pt-6 pb-3 md:gap-9 md:px-8 md:pt-12 md:pb-7 xl:px-20 xl:pt-14 xl:pb-8">
        <div className="flex flex-col gap-5 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-y-9 xl:flex-nowrap xl:gap-x-8">
          <section className="flex min-w-0 flex-col gap-2.5 md:flex-[0_0_320px] md:gap-4 xl:min-w-[240px] xl:flex-[0_1_340px]" aria-label="Про SIVAY">
            <div className="flex items-center gap-2.5 md:gap-3">
              <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-brand text-brand-darkest shadow-button md:h-11 md:w-11 md:rounded-xl">
                <Icon name="sprout" size={20} className="md:h-[26px] md:w-[26px]" />
              </span>
              <div className="flex flex-col md:gap-0.5">
                <span className="text-lg font-semibold leading-[1.2] tracking-[0.4px] text-brand-text md:text-[22px]">SIVAY</span>
              </div>
            </div>
            <p className="m-0 text-[13px] leading-[1.5] text-muted md:text-sm">
              Аналітика, яка допомагає фермерам приймати зважені рішення та підвищувати прибутковість
            </p>
          </section>

          <span className="hidden h-24 w-px shrink-0 self-center bg-[rgba(11,90,62,0.14)] md:block" aria-hidden="true" />

          <div className="order-3 flex items-start gap-4 md:order-none md:gap-6 xl:gap-8 min-[1440px]:gap-12">
            <nav className="flex min-w-0 flex-[0_0_120px] flex-col gap-2.5 md:flex-initial md:gap-3.5" aria-label="Навігація у футері">
              <h2 className="m-0 text-xs font-bold tracking-[0.8px] text-brand-dark uppercase md:text-[13px]">Навігація</h2>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0 md:gap-3.5">
                {FOOTER_NAV_LINKS.map((link) => (
                  <li key={link.id}>
                    <AppLink
                      href={link.href}
                      ready={link.ready}
                      className="text-sm font-medium leading-[1.3] text-brand-text no-underline hover:text-brand-dark hover:underline md:text-base"
                    >
                      {link.label}
                    </AppLink>
                  </li>
                ))}
              </ul>
            </nav>

            <span className="hidden h-24 w-px shrink-0 self-center bg-[rgba(11,90,62,0.14)] md:block" aria-hidden="true" />

            <div className="flex min-w-0 flex-1 flex-col gap-2.5 md:flex-initial md:gap-3.5">
              <h2 className="m-0 text-xs font-bold tracking-[0.8px] text-brand-dark uppercase md:text-[13px]">Інформація</h2>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0 md:gap-3.5">
                {INFO_LINKS.map((link) => (
                  <li key={link.id}>
                    <AppLink
                      href={link.href}
                      ready={link.ready}
                      className="text-sm font-medium leading-[1.3] text-brand-text no-underline hover:text-brand-dark hover:underline md:text-base"
                    >
                      {link.label}
                    </AppLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <span className="hidden h-24 w-px shrink-0 self-center bg-[rgba(11,90,62,0.14)] xl:block" aria-hidden="true" />

          <section
            className="order-2 flex flex-col gap-2.5 md:order-none md:grid md:flex-[1_0_100%] md:grid-cols-[auto_1fr] md:items-center md:gap-x-5 md:gap-y-2.5 md:rounded-2xl md:border md:border-border-soft md:bg-white md:p-4 md:px-5 xl:flex xl:flex-initial xl:flex-col xl:gap-3.5 xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0"
            aria-labelledby="footer-team-title"
          >
            <h2 id="footer-team-title" className="m-0 text-xs font-bold tracking-[0.8px] text-brand-dark uppercase md:row-span-2 md:text-[13px] xl:row-auto">
              Наша команда
            </h2>
            <ul className="m-0 grid list-none grid-cols-7 justify-between gap-2 p-0 md:col-start-2 md:grid-cols-[repeat(7,48px)] md:justify-self-end md:gap-3 xl:col-auto xl:grid-cols-[repeat(4,56px)] xl:justify-start">
              {TEAM_MEMBERS.map((member) => (
                <li
                  key={member.id}
                  className="grid aspect-square place-items-center overflow-hidden rounded-full border-2 border-white bg-brand-soft text-brand-dark"
                  title={member.name}
                >
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                  ) : (
                    <>
                      <Icon name="user" className="h-[45%] w-[45%]" />
                      <span className="sr-only">{member.name}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <AppLink
              href={ABOUT_LINK.href}
              ready={ABOUT_LINK.ready}
              className="grid h-8 w-8 place-items-center self-end rounded-full border border-[rgba(11,90,62,0.35)] text-brand-dark no-underline transition-colors hover:bg-brand-soft md:col-start-2 md:justify-self-end xl:col-auto xl:self-end"
              aria-label="Про нас: дізнатися більше про команду"
            >
              <Icon name="arrow-right" size={16} />
            </AppLink>
          </section>
        </div>

        <div className="border-t border-border-soft pt-2 md:pt-5">
          <p className="m-0 text-xs text-muted md:text-sm">© 2026 SIVAY. Усі права захищені.</p>
        </div>
      </div>
    </footer>
  );
}