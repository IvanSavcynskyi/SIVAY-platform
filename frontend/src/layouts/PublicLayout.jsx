import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { NoticeProvider } from '../components/Notice/NoticeProvider';
import './PublicLayout.css';

export default function PublicLayout({ activeLink = 'home', children }) {
  return (
    <NoticeProvider>
      <div className="public-layout">
        <a className="skip-link" href="#main-content">
          Перейти до основного вмісту
        </a>
        <Header activeLink={activeLink} />
        <main id="main-content" className="public-layout__main">
          {children}
        </main>
        <Footer />
      </div>
    </NoticeProvider>
  );
}