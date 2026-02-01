import { useQuery } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { GET_TOPIC } from '../lib/queries';

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
  title: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
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
  subtopicTitle: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
    color: '#1a1a2e',
  },
  questionList: {
    listStyle: 'none',
    padding: 0,
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
  const { data, loading, error } = useQuery<{ topic: Topic | null }>(GET_TOPIC, {
    variables: { slug },
  });

  if (loading) return <div style={styles.loading}>Laster tema...</div>;
  if (error) return <div style={styles.loading}>Feil: {error.message}</div>;
  if (!data?.topic) return <div style={styles.loading}>Tema ikke funnet</div>;

  const { topic } = data;

  return (
    <div>
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>Hjem</Link> / {topic.title}
      </div>
      
      <h1 style={styles.title}>{topic.title}</h1>
      {topic.description && <p style={styles.description}>{topic.description}</p>}

      {topic.subtopics.map((subtopic) => (
        <div key={subtopic.id} style={styles.subtopic}>
          <h2 style={styles.subtopicTitle}>{subtopic.title}</h2>
          {subtopic.description && <p style={styles.description}>{subtopic.description}</p>}
          
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
          
          {subtopic.questions.length === 0 && (
            <p style={styles.description}>Ingen spørsmål ennå</p>
          )}
        </div>
      ))}

      {topic.subtopics.length === 0 && (
        <p style={styles.description}>Ingen undertemaer ennå</p>
      )}
    </div>
  );
}
