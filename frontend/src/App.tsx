import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Overview } from '@/pages/Overview';
import { Simulation } from '@/pages/Simulation';
import { Compare } from '@/pages/Compare';
import { Theory } from '@/pages/Theory';
import { Walkthrough } from '@/pages/Walkthrough';
import { RealWorld } from '@/pages/RealWorld';
import { Security } from '@/pages/Security';
import { About } from '@/pages/About';

const modules = [
  { path: '/', label: 'Learn', icon: '📚' },
  { path: '/simulate', label: 'Experiment', icon: '🔬' },
  { path: '/compare', label: 'Analyse', icon: '🔍' },
  { path: '/theory', label: 'Theory', icon: '📊' },
  { path: '/walkthrough', label: 'Walkthrough', icon: '👣' },
  { path: '/realworld', label: 'Apply', icon: '🌍' },
  { path: '/security', label: 'Review', icon: '🛡️' },
  { path: '/about', label: 'About', icon: 'ℹ️' },
];

export function App() {
  return (
    <Layout modules={modules}>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/simulate" element={<Simulation />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/theory" element={<Theory />} />
        <Route path="/walkthrough" element={<Walkthrough />} />
        <Route path="/realworld" element={<RealWorld />} />
        <Route path="/security" element={<Security />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}