import { useQuery } from '@apollo/client';
import { GET_SUMMARIES } from '../lib/queries';

interface Props {
  questionId: string;
  onCreateSummary?: () => void;
  showCreateButton?: boolean;
}

interface Summary {
  id: string;
  version: number;
  proPoints: any[];
  contraPoints: any[];
  dataDisagreements: string[];
  interpretationDisagreements: string[];
  valueDisagreements: string[];
  openQuestions: string[];
  status: string;
  createdAt: string;
  createdBy: {
    id: string;
    displayName: string;
  } | null;
}

const styles = {
  container: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '2px solid #e3f2fd',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600' as const,
    color: '#1a1a2e',
    margin: 0,
  },
  version: {
    fontSize: '0.8rem',
    color: '#666',
    background: '#f5f5f5',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  createButton: {
    padding: '0.5rem 1rem',
    background: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  twoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1rem',
  },
  column: {
    padding: '1rem',
    borderRadius: '4px',
  },
  proColumn: {
    background: '#e8f5e9',
  },
  contraColumn: {
    background: '#ffebee',
  },
  columnTitle: {
    fontWeight: '600' as const,
    fontSize: '0.9rem',
    marginBottom: '0.75rem',
    textTransform: 'uppercase' as const,
  },
  point: {
    padding: '0.5rem',
    background: 'white',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  section: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e0e0e0',
  },
  sectionTitle: {
    fontSize: '0.9rem',
    fontWeight: '500' as const,
    marginBottom: '0.5rem',
    color: '#333',
  },
  disagreementList: {
    listStyle: 'disc',
    paddingLeft: '1.25rem',
    margin: 0,
  },
  disagreementItem: {
    fontSize: '0.85rem',
    marginBottom: '0.25rem',
    color: '#555',
  },
  openQuestion: {
    padding: '0.5rem',
    background: '#fff3e0',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
    borderLeft: '3px solid #ff9800',
  },
  meta: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '1rem',
    textAlign: 'right' as const,
  },
  emptyState: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '0.9rem',
    padding: '2rem 1rem',
    fontStyle: 'italic' as const,
  },
  loading: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '0.9rem',
    padding: '1rem',
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function QuestionSummary({ questionId, onCreateSummary, showCreateButton = false }: Props) {
  const { data, loading, error } = useQuery<{ summaries: Summary[] }>(GET_SUMMARIES, {
    variables: { questionId },
  });

  if (loading) {
    return <div style={styles.loading}>Laster sammendrag...</div>;
  }

  if (error) {
    return null;
  }

  const summaries = data?.summaries || [];
  const latestSummary = summaries.length > 0 ? summaries[summaries.length - 1] : null;

  if (!latestSummary) {
    if (!showCreateButton) return null;

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Sammendrag</h2>
          {showCreateButton && onCreateSummary && (
            <button style={styles.createButton} onClick={onCreateSummary}>
              Skriv sammendrag
            </button>
          )}
        </div>
        <div style={styles.emptyState}>Ingen sammendrag skrevet enna.</div>
      </div>
    );
  }

  const proPoints = Array.isArray(latestSummary.proPoints) ? latestSummary.proPoints : [];
  const contraPoints = Array.isArray(latestSummary.contraPoints) ? latestSummary.contraPoints : [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Sammendrag</h2>
        <span style={styles.version}>Versjon {latestSummary.version}</span>
      </div>

      <div style={styles.twoColumns}>
        <div style={{ ...styles.column, ...styles.proColumn }}>
          <div style={styles.columnTitle}>✓ Hovedargumenter for</div>
          {proPoints.map((point, index) => (
            <div key={index} style={styles.point}>
              {typeof point === 'string' ? point : point.text || JSON.stringify(point)}
            </div>
          ))}
          {proPoints.length === 0 && <div style={styles.point}>Ingen punkter</div>}
        </div>

        <div style={{ ...styles.column, ...styles.contraColumn }}>
          <div style={styles.columnTitle}>✗ Hovedargumenter mot</div>
          {contraPoints.map((point, index) => (
            <div key={index} style={styles.point}>
              {typeof point === 'string' ? point : point.text || JSON.stringify(point)}
            </div>
          ))}
          {contraPoints.length === 0 && <div style={styles.point}>Ingen punkter</div>}
        </div>
      </div>

      {(latestSummary.dataDisagreements.length > 0 ||
        latestSummary.interpretationDisagreements.length > 0 ||
        latestSummary.valueDisagreements.length > 0) && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Hovedsaklige uenigheter</div>

          {latestSummary.dataDisagreements.length > 0 && (
            <>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>Datauenigheter:</div>
              <ul style={styles.disagreementList}>
                {latestSummary.dataDisagreements.map((d, i) => (
                  <li key={i} style={styles.disagreementItem}>
                    {d}
                  </li>
                ))}
              </ul>
            </>
          )}

          {latestSummary.interpretationDisagreements.length > 0 && (
            <>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>Tolkningsuenigheter:</div>
              <ul style={styles.disagreementList}>
                {latestSummary.interpretationDisagreements.map((d, i) => (
                  <li key={i} style={styles.disagreementItem}>
                    {d}
                  </li>
                ))}
              </ul>
            </>
          )}

          {latestSummary.valueDisagreements.length > 0 && (
            <>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>Verdiuenigheter:</div>
              <ul style={styles.disagreementList}>
                {latestSummary.valueDisagreements.map((d, i) => (
                  <li key={i} style={styles.disagreementItem}>
                    {d}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {latestSummary.openQuestions.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Apne sporsmal</div>
          {latestSummary.openQuestions.map((q, i) => (
            <div key={i} style={styles.openQuestion}>
              {q}
            </div>
          ))}
        </div>
      )}

      <div style={styles.meta}>
        Skrevet av {latestSummary.createdBy?.displayName || 'Ukjent'} · {formatDate(latestSummary.createdAt)}
      </div>
    </div>
  );
}
