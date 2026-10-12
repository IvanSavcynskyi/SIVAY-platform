import AppLink from '../AppLink/AppLink';
import Icon from '../Icon/Icon';
import { ABOUT_LINK, INFO_LINKS, NAV_LINKS } from '../../constants/siteLinks';
import './Footer.css';

const FOOTER_NAV_LINKS = NAV_LINKS.filter((link) => link.id !== 'profile');

const TEAM_MEMBERS = Array.from({ length: 7 }, (_, index) => ({
  id: index + 1,
  name: `Учасник ${index + 1}`,
  avatar: null,
}));

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__top">
          <section className="footer__brand" aria-label="Про SIVAY">
            <div className="footer__logo">
              <span className="footer__emblem">
                <Icon name="sprout" />
              </span>
              <span className="footer__brand-text">
                <span className="footer__brand-name">SIVAY</span>
              </span>
            </div>
            <p className="footer__description">
              Аналітика, яка допомагає фермерам приймати зважені рішення та підвищувати прибутковість
            </p>
          </section>

          <span className="footer__divider footer__divider--brand" aria-hidden="true" />

          <div className="footer__links">
            <nav className="footer__group footer__group--nav" aria-label="Навігація у футері">
              <h2 className="footer__heading">Навігація</h2>
              <ul className="footer__list">
                {FOOTER_NAV_LINKS.map((link) => (
                  <li key={link.id}>
                    <AppLink href={link.href} ready={link.ready} className="footer__link">
                      {link.label}
                    </AppLink>
                  </li>
                ))}
              </ul>
            </nav>

            <span className="footer__divider footer__divider--links" aria-hidden="true" />

            <div className="footer__group footer__group--info">
              <h2 className="footer__heading">Інформація</h2>
              <ul className="footer__list">
                {INFO_LINKS.map((link) => (
                  <li key={link.id}>
                    <AppLink href={link.href} ready={link.ready} className="footer__link">
                      {link.label}
                    </AppLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <span className="footer__divider footer__divider--team" aria-hidden="true" />

          <section className="footer__team" aria-labelledby="footer-team-title">
            <h2 id="footer-team-title" className="footer__heading">
              Наша команда
            </h2>
            <ul className="footer__avatars">
              {TEAM_MEMBERS.map((member) => (
                <li key={member.id} className="footer__avatar" title={member.name}>
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} />
                  ) : (
                    <>
                      <Icon name="user" />
                      <span className="sr-only">{member.name}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <AppLink
              href={ABOUT_LINK.href}
              ready={ABOUT_LINK.ready}
              className="footer__about"
              aria-label="Про нас: дізнатися більше про команду"
            >
              <Icon name="arrow-right" />
            </AppLink>
          </section>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">© 2026 SIVAY. Усі права захищені.</p>
        </div>
      </div>
    </footer>
  );
}