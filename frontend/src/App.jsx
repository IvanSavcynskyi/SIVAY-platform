import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home/Home';
import NewAnalysis from './pages/NewAnalysis/NewAnalysis';

// The project has no router yet, so a tiny path check is enough for two pages.
// Production hosting must serve index.html for unknown paths (SPA fallback) so /analysis/new can be opened directly.
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
