import { useState } from 'react';

export interface Disagreement {
  id: string;
  description: string;
  disagreementType: string;
  createdAt: string;
  createdBy: {
    id: string;
    displayName: string;
  } | null;
}

interface Props {
  disagreements: Disagreement[];
  onAddDisagreement?: () => void;
  showAddButton?: boolean;
}

const styles = {
  container: {
    background: 'white',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600' as const,
    color: '#1a1a2e',
    margin: 0,
  },
  addButton: {
    padding: '0.35rem 0.75rem',
    background: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  emptyState: {
    color: '#666',
    fontSize: '0.9rem',
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    padding: '1rem',
  },
  typeSection: {
    marginBottom: '1rem',
  },
  typeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    cursor: 'pointer',
  },
  typeBadge: {
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500' as const,
  },
  typeCount: {
    fontSize: '0.8rem',
    color: '#666',
  },
  disagreementItem: {
    padding: '0.75rem',
    background: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
  },
  description: {
    marginBottom: '0.25rem',
    color: '#333',
  },
  meta: {
    fontSize: '0.75rem',
    color: '#666',
  },
};

const typeConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  DATA: { label: 'Datauenighet', color: '#0d47a1', bgColor: '#e3f2fd' },
  INTERPRETATION: { label: 'Tolkningsuenighet', color: '#4a148c', bgColor: '#f3e5f5' },
  VALUES_OR_RISK: { label: 'Verdi/risiko-uenighet', color: '#b71c1c', bgColor: '#ffebee' },
  DEFINITIONS: { label: 'Definisjonsuenighet', color: '#e65100', bgColor: '#fff3e0' },
  SCOPE: { label: 'Omfangsuenighet', color: '#1b5e20', bgColor: '#e8f5e9' },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function DisagreementList({ disagreements, onAddDisagreement, showAddButton = false }: Props) {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(Object.keys(typeConfig)));

  // Group disagreements by type
  const grouped = disagreements.reduce(
    (acc, d) => {
      const type = d.disagreementType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(d);
      return acc;
    },
    {} as Record<string, Disagreement[]>
  );

  const toggleType = (type: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const hasDisagreements = disagreements.length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Uenighetsanalyse</h3>
        {showAddButton && onAddDisagreement && (
          <button style={styles.addButton} onClick={onAddDisagreement}>
            + Legg til
          </button>
        )}
      </div>

      {!hasDisagreements ? (
        <div style={styles.emptyState}>Ingen uenighetsakse identifisert enna.</div>
      ) : (
        Object.entries(typeConfig).map(([type, config]) => {
          const items = grouped[type] || [];
          if (items.length === 0) return null;

          const isExpanded = expandedTypes.has(type);

          return (
            <div key={type} style={styles.typeSection}>
              <div style={styles.typeHeader} onClick={() => toggleType(type)}>
                <span
                  style={{
                    ...styles.typeBadge,
                    color: config.color,
                    background: config.bgColor,
                  }}
                >
                  {config.label}
                </span>
                <span style={styles.typeCount}>({items.length})</span>
                <span style={{ fontSize: '0.75rem', color: '#666' }}>{isExpanded ? '▼' : '▶'}</span>
              </div>

              {isExpanded &&
                items.map((d) => (
                  <div key={d.id} style={styles.disagreementItem}>
                    <div style={styles.description}>{d.description}</div>
                    <div style={styles.meta}>
                      {d.createdBy?.displayName || 'Ukjent'} · {formatDate(d.createdAt)}
                    </div>
                  </div>
                ))}
            </div>
          );
        })
      )}
    </div>
  );
}
