import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TopicPage } from './pages/TopicPage';
import { QuestionPage } from './pages/QuestionPage';
import { Layout } from './components/Layout';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/topic/:slug" element={<TopicPage />} />
        <Route path="/question/:id" element={<QuestionPage />} />
      </Routes>
    </Layout>
  );
}
