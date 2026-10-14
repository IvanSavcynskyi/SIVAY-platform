import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { AuthModalProvider } from '../components/AuthModal/AuthModalProvider';
import { NoticeProvider } from '../components/Notice/NoticeProvider';

export default function PublicLayout({ activeLink = 'home', children }) {
  return (
    <NoticeProvider>
      <AuthModalProvider>
        <div className="flex min-h-screen min-h-dvh flex-col">
          <a
            className="absolute top-2 left-2 z-[2000] -translate-y-[200%] rounded-[10px] bg-brand-dark px-4 py-2.5 font-semibold text-white no-underline transition-transform focus:translate-y-0"
            href="#main-content"
          >
            Перейти до основного вмісту
          </a>
          <Header activeLink={activeLink} />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </AuthModalProvider>
    </NoticeProvider>
  );
}