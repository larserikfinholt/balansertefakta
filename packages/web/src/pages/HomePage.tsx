import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_TOPICS } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { CreateTopicModal } from '../components/CreateTopicModal';

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
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
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  description: {
    marginBottom: '2rem',
    color: '#666',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardTitle: {
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
    color: '#1a1a2e',
  },
  cardDescription: {
    color: '#666',
    fontSize: '0.9rem',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '3rem',
    background: 'white',
    borderRadius: '8px',
  },
};

interface Topic {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  subtopics: { id: string; title: string; slug: string }[];
}

export function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data, loading, error } = useQuery<{ topics: Topic[] }>(GET_TOPICS);

  if (loading) return <div style={styles.loading}>Laster temaer...</div>;
  if (error) return <div style={styles.loading}>Feil: {error.message}</div>;

  const topics = data?.topics ?? [];
  const isVerified = user?.authLevel === 'VERIFIED' || user?.authLevel === 'STRONG_ID';

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Temaer</h1>
        {isAuthenticated && isVerified && (
          <button style={styles.addButton} onClick={() => setShowCreateModal(true)}>
            + Opprett tema
          </button>
        )}
      </div>
      <p style={styles.description}>
        Utforsk komplekse samfunnstemaer med balanserte perspektiver og sporbare kilder.
      </p>

      {topics.length === 0 ? (
        <div style={styles.empty}>
          <h2>Ingen temaer enna</h2>
          <p>Opprett det forste temaet for å komme i gang.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {topics.map((topic) => (
            <Link key={topic.id} to={`/topic/${topic.slug}`} style={styles.card}>
              <h2 style={styles.cardTitle}>{topic.title}</h2>
              {topic.description && <p style={styles.cardDescription}>{topic.description}</p>}
              <p style={styles.cardDescription}>{topic.subtopics.length} undertema(er)</p>
            </Link>
          ))}
        </div>
      )}

      {showCreateModal && <CreateTopicModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
