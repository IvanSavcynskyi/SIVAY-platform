import { usePathname } from './router/navigation';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home/Home';
import NewAnalysis from './pages/NewAnalysis/NewAnalysis';
import Privacy from './pages/Privacy/Privacy';
import Terms from './pages/Terms/Terms';
import Contacts from './pages/Contacts/Contacts';
import NotFound from './pages/NotFound/NotFound';

const normalize = (pathname) => pathname.replace(/\/+$/, '') || '/';

export default function App() {
  const pathname = usePathname();
  const currentPath = normalize(pathname);

  if (currentPath === '/analysis/new') {
    return (
      <PublicLayout activeLink="analysis">
        <NewAnalysis />
      </PublicLayout>
    );
  }

  if (currentPath === '/') {
    return (
      <PublicLayout activeLink="home">
        <Home />
      </PublicLayout>
    );
  }

  if (currentPath === '/privacy') {
    return (
      <PublicLayout activeLink="none">
        <Privacy />
      </PublicLayout>
    );
  }

  if (currentPath === '/terms') {
    return (
      <PublicLayout activeLink="none">
        <Terms />
      </PublicLayout>
    );
  }

  if (currentPath === '/contacts') {
    return (
      <PublicLayout activeLink="none">
        <Contacts />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout activeLink="none">
      <NotFound />
    </PublicLayout>
  );
}
