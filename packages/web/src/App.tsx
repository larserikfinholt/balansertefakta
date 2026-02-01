import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { TopicPage } from './pages/TopicPage';
import { QuestionPage } from './pages/QuestionPage';
import { EvidencePage } from './pages/EvidencePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Layout } from './components/Layout';

export function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/topic/:slug" element={<TopicPage />} />
          <Route path="/question/:id" element={<QuestionPage />} />
          <Route path="/evidence/:id" element={<EvidencePage />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}
