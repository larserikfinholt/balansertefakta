import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { GET_TOPIC } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { CreateSubtopicModal } from '../components/CreateSubtopicModal';
import { CreateQuestionModal } from '../components/CreateQuestionModal';

const styles = {
  breadcrumb: {
    marginBottom: '1rem',
    color: '#666',
    fontSize: '0.9rem',
  },
  breadcrumbLink: {
    color: '#1a1a2e',
    textDecoration: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '2rem',
    margin: 0,
  },
  addButton: {
    padding: '0.5rem 1rem',
    background: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  description: {
    marginBottom: '2rem',
    color: '#666',
  },
  subtopic: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  subtopicHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  subtopicTitle: {
    fontSize: '1.25rem',
    margin: 0,
    color: '#1a1a2e',
  },
  smallButton: {
    padding: '0.35rem 0.75rem',
    background: 'transparent',
    color: '#1a1a2e',
    border: '1px solid #1a1a2e',
    borderRadius: '4px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  questionList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  questionItem: {
    padding: '0.75rem 0',
    borderBottom: '1px solid #eee',
  },
  questionLink: {
    textDecoration: 'none',
    color: '#333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    marginLeft: '0.5rem',
  },
  balanced: {
    background: '#d4edda',
    color: '#155724',
  },
  unbalanced: {
    background: '#fff3cd',
    color: '#856404',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
  },
  emptyState: {
    color: '#666',
    fontSize: '0.9rem',
    fontStyle: 'italic' as const,
  },
};

interface Question {
  id: string;
  title: string;
  slug: string;
  status: string;
  isBalanced: boolean;
}

interface Subtopic {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  questions: Question[];
}

interface Topic {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  subtopics: Subtopic[];
}

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuth();
  const [showSubtopicModal, setShowSubtopicModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState<string | null>(null);

  const { data, loading, error } = useQuery<{ topic: Topic | null }>(GET_TOPIC, {
    variables: { slug },
  });

  if (loading) return <div style={styles.loading}>Laster tema...</div>;
  if (error) return <div style={styles.loading}>Feil: {error.message}</div>;
  if (!data?.topic) return <div style={styles.loading}>Tema ikke funnet</div>;

  const { topic } = data;
  const isVerified = user?.authLevel === 'VERIFIED' || user?.authLevel === 'STRONG_ID';

  return (
    <div>
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>
          Hjem
        </Link>{' '}
        / {topic.title}
      </div>

      <div style={styles.header}>
        <h1 style={styles.title}>{topic.title}</h1>
        {isAuthenticated && isVerified && (
          <button style={styles.addButton} onClick={() => setShowSubtopicModal(true)}>
            + Opprett undertema
          </button>
        )}
      </div>
      {topic.description && <p style={styles.description}>{topic.description}</p>}

      {topic.subtopics.map((subtopic) => (
        <div key={subtopic.id} style={styles.subtopic}>
          <div style={styles.subtopicHeader}>
            <h2 style={styles.subtopicTitle}>{subtopic.title}</h2>
            {isAuthenticated && isVerified && (
              <button style={styles.smallButton} onClick={() => setShowQuestionModal(subtopic.id)}>
                + Sporsmal
              </button>
            )}
          </div>
          {subtopic.description && <p style={{ ...styles.description, marginBottom: '1rem' }}>{subtopic.description}</p>}

          <ul style={styles.questionList}>
            {subtopic.questions.map((question) => (
              <li key={question.id} style={styles.questionItem}>
                <Link to={`/question/${question.id}`} style={styles.questionLink}>
                  <span>{question.title}</span>
                  <span>
                    <span style={{ ...styles.badge, ...(question.isBalanced ? styles.balanced : styles.unbalanced) }}>
                      {question.isBalanced ? '⚖️ Balansert' : '⚠️ Trenger motposisjon'}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {subtopic.questions.length === 0 && <p style={styles.emptyState}>Ingen sporsmal enna</p>}
        </div>
      ))}

      {topic.subtopics.length === 0 && <p style={styles.description}>Ingen undertemaer enna</p>}

      {showSubtopicModal && (
        <CreateSubtopicModal
          topicId={topic.id}
          topicSlug={topic.slug}
          onClose={() => setShowSubtopicModal(false)}
        />
      )}

      {showQuestionModal && (
        <CreateQuestionModal
          subtopicId={showQuestionModal}
          topicSlug={topic.slug}
          onClose={() => setShowQuestionModal(null)}
        />
      )}
    </div>
  );
}
