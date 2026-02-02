import { useState } from 'react';

export interface ScopeData {
  id: string;
  temporalScope: string | null;
  geographicScope: string | null;
  systemBoundary: string | null;
  assumptions: string | null;
}

interface Props {
  scope: ScopeData | null;
  onEdit?: () => void;
  showEditButton?: boolean;
}

const styles = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: '#e3f2fd',
    borderRadius: '4px',
    fontSize: '0.8rem',
    color: '#1565c0',
    cursor: 'pointer',
  },
  noBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '0.8rem',
    color: '#666',
    fontStyle: 'italic' as const,
  },
  editButton: {
    padding: '0.25rem 0.5rem',
    background: 'transparent',
    border: '1px solid #1565c0',
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: '#1565c0',
    cursor: 'pointer',
  },
  expandedContainer: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    background: '#f8f9fa',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  expandedRow: {
    display: 'flex',
    marginBottom: '0.25rem',
  },
  expandedLabel: {
    fontWeight: '500' as const,
    minWidth: '120px',
    color: '#666',
  },
  expandedValue: {
    color: '#333',
  },
};

const temporalLabels: Record<string, string> = {
  HISTORICAL: 'Historisk',
  RECENT: 'Nylig',
  CURRENT: 'Naatid',
  SHORT_TERM: 'Kort sikt',
  MEDIUM_TERM: 'Mellomlang sikt',
  LONG_TERM: 'Lang sikt',
  UNSPECIFIED: 'Uspesifisert',
};

const geographicLabels: Record<string, string> = {
  GLOBAL: 'Global',
  CONTINENTAL: 'Kontinental',
  NATIONAL: 'Nasjonal',
  REGIONAL: 'Regional',
  LOCAL: 'Lokal',
  UNSPECIFIED: 'Uspesifisert',
};

export function ScopeBadge({ scope, onEdit, showEditButton = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!scope) {
    return (
      <div style={styles.container}>
        <span style={styles.noBadge}>Omfang ikke definert</span>
        {showEditButton && onEdit && (
          <button style={styles.editButton} onClick={onEdit}>
            + Definer
          </button>
        )}
      </div>
    );
  }

  const temporalLabel = scope.temporalScope ? temporalLabels[scope.temporalScope] || scope.temporalScope : null;
  const geographicLabel = scope.geographicScope ? geographicLabels[scope.geographicScope] || scope.geographicScope : null;

  const hasDetails = scope.systemBoundary || scope.assumptions;

  return (
    <div>
      <div style={styles.container}>
        <span
          style={styles.badge}
          onClick={() => hasDetails && setExpanded(!expanded)}
          title={hasDetails ? 'Klikk for detaljer' : undefined}
        >
          {temporalLabel && <span>{temporalLabel}</span>}
          {temporalLabel && geographicLabel && <span>·</span>}
          {geographicLabel && <span>{geographicLabel}</span>}
          {hasDetails && <span style={{ marginLeft: '0.25rem' }}>{expanded ? '▲' : '▼'}</span>}
        </span>
        {showEditButton && onEdit && (
          <button style={styles.editButton} onClick={onEdit}>
            Rediger
          </button>
        )}
      </div>

      {expanded && hasDetails && (
        <div style={styles.expandedContainer}>
          {scope.systemBoundary && (
            <div style={styles.expandedRow}>
              <span style={styles.expandedLabel}>Systemgrense:</span>
              <span style={styles.expandedValue}>{scope.systemBoundary}</span>
            </div>
          )}
          {scope.assumptions && (
            <div style={styles.expandedRow}>
              <span style={styles.expandedLabel}>Forutsetninger:</span>
              <span style={styles.expandedValue}>{scope.assumptions}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
