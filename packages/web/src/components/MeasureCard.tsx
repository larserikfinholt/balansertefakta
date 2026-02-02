import { EvidenceSection, type EvidenceLinkWithArtifact } from './EvidenceSection';

interface Counterposition {
  id: string;
  content: string;
}

interface Argument {
  id: string;
  content: string;
  argumentType: 'PRO' | 'CONTRA';
  strength: string;
  counterpositions: Counterposition[];
  evidenceLinks: EvidenceLinkWithArtifact[];
}

interface Measure {
  id: string;
  title: string;
  description: string | null;
  rationale: string | null;
  status: string;
  isBalanced: boolean;
  proArgumentCount: number;
  contraArgumentCount: number;
  arguments: Argument[];
}

interface Props {
  measure: Measure;
  questionId: string;
  onAddArgument?: (measureId: string, type: 'PRO' | 'CONTRA') => void;
}

const styles = {
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '500' as const,
    marginBottom: '0.5rem',
    color: '#1a1a2e',
  },
  description: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  rationale: {
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic' as const,
    padding: '0.5rem',
    background: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '0.5rem',
  },
  stats: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
    color: '#666',
  },
  balanced: {
    background: '#d4edda',
    color: '#155724',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
  },
  unbalanced: {
    background: '#fff3cd',
    color: '#856404',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
  },
  argumentsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  argumentsColumn: {
    padding: '1rem',
    borderRadius: '4px',
  },
  proColumn: {
    background: '#e8f5e9',
  },
  contraColumn: {
    background: '#ffebee',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  columnTitle: {
    fontWeight: '600' as const,
    fontSize: '0.9rem',
    textTransform: 'uppercase' as const,
  },
  addButton: {
    padding: '0.2rem 0.5rem',
    background: 'transparent',
    border: '1px solid currentColor',
    borderRadius: '4px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    opacity: 0.7,
  },
  argument: {
    padding: '0.75rem',
    background: 'white',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  argumentContent: {
    marginBottom: '0.25rem',
  },
  strengthIndicator: {
    display: 'inline-flex',
    gap: '2px',
    marginLeft: '0.5rem',
    verticalAlign: 'middle',
  },
  strengthBar: {
    width: '4px',
    height: '12px',
    borderRadius: '2px',
  },
  counterposition: {
    marginTop: '0.5rem',
    paddingLeft: '1rem',
    borderLeft: '2px solid #ccc',
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic' as const,
  },
  emptyState: {
    padding: '0.75rem',
    background: 'white',
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic' as const,
  },
};

function StrengthIndicator({ strength }: { strength: string }) {
  const levels = strength === 'HIGH' ? 3 : strength === 'MEDIUM' ? 2 : 1;
  const color = strength === 'HIGH' ? '#28a745' : strength === 'MEDIUM' ? '#ffc107' : '#6c757d';

  return (
    <span style={styles.strengthIndicator} title={`Styrke: ${strength === 'HIGH' ? 'Sterk' : strength === 'MEDIUM' ? 'Middels' : 'Svak'}`}>
      {[1, 2, 3].map((level) => (
        <span
          key={level}
          style={{
            ...styles.strengthBar,
            background: level <= levels ? color : '#e0e0e0',
          }}
        />
      ))}
    </span>
  );
}

export function MeasureCard({ measure, questionId, onAddArgument }: Props) {
  const proArguments = measure.arguments.filter((a) => a.argumentType === 'PRO');
  const contraArguments = measure.arguments.filter((a) => a.argumentType === 'CONTRA');

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>{measure.title}</div>
        {measure.description && <div style={styles.description}>{measure.description}</div>}
        {measure.rationale && (
          <div style={styles.rationale}>
            <strong>Begrunnelse:</strong> {measure.rationale}
          </div>
        )}
        <div style={styles.stats}>
          <span>Pro: {measure.proArgumentCount}</span>
          <span>Contra: {measure.contraArgumentCount}</span>
          <span style={measure.isBalanced ? styles.balanced : styles.unbalanced}>
            {measure.isBalanced ? '⚖️' : '⚠️'}
          </span>
        </div>
      </div>

      <div style={styles.argumentsContainer}>
        <div style={{ ...styles.argumentsColumn, ...styles.proColumn }}>
          <div style={styles.columnHeader}>
            <span style={styles.columnTitle}>✓ For tiltaket</span>
            {onAddArgument && (
              <button
                style={{ ...styles.addButton, color: '#155724' }}
                onClick={() => onAddArgument(measure.id, 'PRO')}
              >
                + Legg til
              </button>
            )}
          </div>
          {proArguments.map((arg) => (
            <div key={arg.id} style={styles.argument}>
              <div style={styles.argumentContent}>
                {arg.content}
                <StrengthIndicator strength={arg.strength} />
              </div>
              {arg.counterpositions.map((cp) => (
                <div key={cp.id} style={styles.counterposition}>
                  Motposisjon: {cp.content}
                </div>
              ))}
              <EvidenceSection evidenceLinks={arg.evidenceLinks} argumentId={arg.id} questionId={questionId} />
            </div>
          ))}
          {proArguments.length === 0 && <div style={styles.emptyState}>Ingen for-argumenter enna</div>}
        </div>

        <div style={{ ...styles.argumentsColumn, ...styles.contraColumn }}>
          <div style={styles.columnHeader}>
            <span style={styles.columnTitle}>✗ Mot tiltaket</span>
            {onAddArgument && (
              <button
                style={{ ...styles.addButton, color: '#721c24' }}
                onClick={() => onAddArgument(measure.id, 'CONTRA')}
              >
                + Legg til
              </button>
            )}
          </div>
          {contraArguments.map((arg) => (
            <div key={arg.id} style={styles.argument}>
              <div style={styles.argumentContent}>
                {arg.content}
                <StrengthIndicator strength={arg.strength} />
              </div>
              {arg.counterpositions.map((cp) => (
                <div key={cp.id} style={styles.counterposition}>
                  Motposisjon: {cp.content}
                </div>
              ))}
              <EvidenceSection evidenceLinks={arg.evidenceLinks} argumentId={arg.id} questionId={questionId} />
            </div>
          ))}
          {contraArguments.length === 0 && <div style={styles.emptyState}>Ingen mot-argumenter enna</div>}
        </div>
      </div>
    </div>
  );
}
