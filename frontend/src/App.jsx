import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home/Home';
import NewAnalysis from './pages/NewAnalysis/NewAnalysis';

const normalize = (pathname) => pathname.replace(/\/+$/, '') || '/';

export default function App() {
  if (normalize(window.location.pathname) === '/analysis/new') {
    return (
      <PublicLayout activeLink="analysis">
        <NewAnalysis />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout activeLink="home">
      <Home />
    </PublicLayout>
  );
}
