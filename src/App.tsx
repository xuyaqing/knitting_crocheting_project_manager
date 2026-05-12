import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { Gallery } from './pages/Gallery';
import { YarnDetail } from './pages/YarnDetail';
import { ProjectDetail } from './pages/ProjectDetail';

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/yarn/:yarnId" element={<YarnDetail />} />
            <Route path="/project/:projectId" element={<ProjectDetail />} />
          </Routes>
        </Layout>
      </DataProvider>
    </BrowserRouter>
  );
}
