import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MarketsPage from './pages/MarketsPage';
import SurveillancePage from './pages/SurveillancePage';
import RiskPage from './pages/RiskPage';
import RegulatoryPage from './pages/RegulatoryPage';
import ArchitecturePage from './pages/ArchitecturePage';
import PipelinePage from './pages/PipelinePage';
import OdiDbtWizardPage from './pages/OdiDbtWizardPage';
import ActivationLivePage from './pages/ActivationLivePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/surveillance" element={<SurveillancePage />} />
          <Route path="/risk" element={<RiskPage />} />
          <Route path="/regulatory" element={<RegulatoryPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/activations-live" element={<ActivationLivePage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/dbt-wizard" element={<OdiDbtWizardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
