import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { Gallery } from './pages/Gallery';
import { YarnDetail } from './pages/YarnDetail';
import { ProjectDetail } from './pages/ProjectDetail';
import { GaugeCalculator } from './pages/GaugeCalculator';

export default function App() {
  return (
    <HashRouter>
      <DataProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/yarn/:yarnId" element={<YarnDetail />} />
            <Route path="/project/:projectId" element={<ProjectDetail />} />
            <Route path="/calculator" element={<GaugeCalculator />} />
          </Routes>
        </Layout>
      </DataProvider>
    </HashRouter>
  );
}
