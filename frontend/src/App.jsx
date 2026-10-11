import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home/Home';

export default function App() {
  return (
    <PublicLayout activeLink="home">
      <Home />
    </PublicLayout>
  );
}