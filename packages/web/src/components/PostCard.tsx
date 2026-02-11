import { useState } from 'react';
import { ArgumentComment, type ArgumentData } from './ArgumentComment';

const claimTypeLabels: Record<string, string> = {
  EMPIRICAL: 'Empirisk',
  CAUSAL: 'Kausal',
  PROGNOSTIC: 'Prognostisk',
  NORMATIVE: 'Normativ',
  DEFINITIONAL: 'Definitorisk',
};

const claimTypeColors: Record<string, { bg: string; color: string }> = {
  EMPIRICAL: { bg: '#e3f2fd', color: '#1565c0' },
  CAUSAL: { bg: '#f3e5f5', color: '#7b1fa2' },
  PROGNOSTIC: { bg: '#fff3e0', color: '#e65100' },
  NORMATIVE: { bg: '#e8f5e9', color: '#2e7d32' },
  DEFINITIONAL: { bg: '#fce4ec', color: '#c62828' },
};

interface CreatedBy {
  id: string;
  displayName: string;
}

interface Claim {
  id: string;
  statement: string;
  claimType: string;
  status: string;
  isBalanced: boolean;
  proArgumentCount: number;
  contraArgumentCount: number;
  createdBy: CreatedBy | null;
  arguments: ArgumentData[];
}

type ArgumentFilter = 'ALL' | 'PRO' | 'CONTRA';

interface Props {
  claim: Claim;
  questionId: string;
  isAuthenticated: boolean;
  isVerified: boolean;
  canPublishPro: boolean;
  canPublishContra: boolean;
  proPublish: { requiredOpposingValidations: number; opposingValidationsCount: number } | null;
  contraPublish: { requiredOpposingValidations: number; opposingValidationsCount: number } | null;
  unvalidatedIds: Set<string>;
  justValidated: Set<string>;
  validating: boolean;
  isMobile: boolean;
  onAcknowledge: (argumentId: string) => void;
  onAddArgument: (claimId: string, type: 'PRO' | 'CONTRA') => void;
  onAddCounterposition: (argumentId: string, argumentContent: string) => void;
}

const getStyles = (isMobile: boolean) => ({
  card: {
    background: 'white',
    borderRadius: '12px',
    marginBottom: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
    overflow: 'hidden' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: isMobile ? '0.85rem 0.85rem 0.5rem' : '1rem 1rem 0.75rem',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#e3f2fd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '600' as const,
    color: '#1565c0',
    flexShrink: 0,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontWeight: '600' as const,
    fontSize: '0.95rem',
    color: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  claimTypeBadge: {
    fontSize: '0.7rem',
    fontWeight: '500' as const,
    padding: '0.1rem 0.45rem',
    borderRadius: '10px',
  },
  body: {
    padding: isMobile ? '0 0.85rem 0.75rem' : '0 1rem 0.75rem',
    fontSize: '1rem',
    lineHeight: '1.5',
    color: '#1a1a2e',
  },
  engagement: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '0.5rem 1rem',
    borderTop: '1px solid #e8e8e8',
    borderBottom: '1px solid #e8e8e8',
    fontSize: '0.85rem',
    color: '#666',
  },
  engagementItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  commentSection: {
    padding: isMobile ? '0.75rem 0.85rem' : '0.75rem 1rem',
  },
  filterRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  filterButton: {
    padding: '0.3rem 0.75rem',
    borderRadius: '16px',
    border: '1px solid #ddd',
    background: 'white',
    fontSize: '0.8rem',
    cursor: 'pointer',
    color: '#666',
  },
  filterActive: {
    background: '#1a1a2e',
    color: 'white',
    border: '1px solid #1a1a2e',
  },
  addArgRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #f0f0f0',
  },
  addArgButton: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: '20px',
    border: 'none',
    fontSize: '0.82rem',
    cursor: 'pointer',
    fontWeight: '500' as const,
  },
  addProButton: {
    background: '#e8f5e9',
    color: '#2e7d32',
  },
  addContraButton: {
    background: '#ffebee',
    color: '#c62828',
  },
  lockedHint: {
    fontSize: '0.7rem',
    color: '#999',
    textAlign: 'center' as const,
    marginTop: '0.25rem',
  },
  emptyComments: {
    fontSize: '0.85rem',
    color: '#999',
    fontStyle: 'italic' as const,
    padding: '0.5rem 0',
  },
});

export function PostCard({
  claim,
  questionId,
  isAuthenticated,
  isVerified,
  canPublishPro,
  canPublishContra,
  proPublish,
  contraPublish,
  unvalidatedIds,
  justValidated,
  validating,
  isMobile,
  onAcknowledge,
  onAddArgument,
  onAddCounterposition,
}: Props) {
  const [filter, setFilter] = useState<ArgumentFilter>('ALL');
  const styles = getStyles(isMobile);

  const initial = claim.createdBy?.displayName?.charAt(0)?.toUpperCase() || '?';
  const typeColor = claimTypeColors[claim.claimType] || { bg: '#f5f5f5', color: '#666' };

  // Sort arguments chronologically (interleaved)
  const sortedArgs = [...claim.arguments].sort((a, b) => {
    if (a.createdAt && b.createdAt) return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return 0;
  });

  const filteredArgs = sortedArgs.filter((arg) => {
    if (filter === 'ALL') return true;
    return arg.argumentType === filter;
  });

  const totalEvidence = claim.arguments.reduce((sum, arg) => sum + arg.evidenceLinks.length, 0);

  const proRemaining = proPublish
    ? (proPublish.requiredOpposingValidations ?? 2) - (proPublish.opposingValidationsCount ?? 0)
    : 0;
  const contraRemaining = contraPublish
    ? (contraPublish.requiredOpposingValidations ?? 2) - (contraPublish.opposingValidationsCount ?? 0)
    : 0;

  return (
    <div style={styles.card}>
      {/* Post header */}
      <div style={styles.header}>
        <div style={styles.avatar}>{initial}</div>
        <div style={styles.authorInfo}>
          <div style={styles.authorName}>
            {claim.createdBy?.displayName || 'Anonym'}
            <span style={{ ...styles.claimTypeBadge, background: typeColor.bg, color: typeColor.color }}>
              {claimTypeLabels[claim.claimType] || claim.claimType}
            </span>
          </div>
        </div>
        <span style={{ fontSize: '1.1rem' }}>
          {claim.isBalanced ? '⚖️' : '⚠️'}
        </span>
      </div>

      {/* Post body */}
      <div style={styles.body}>{claim.statement}</div>

      {/* Engagement bar */}
      <div style={styles.engagement}>
        <div style={styles.engagementItem}>
          <span style={{ color: '#4caf50' }}>▲</span>
          <span>{claim.proArgumentCount} for</span>
        </div>
        <div style={styles.engagementItem}>
          <span style={{ color: '#ef5350' }}>▼</span>
          <span>{claim.contraArgumentCount} mot</span>
        </div>
        {totalEvidence > 0 && (
          <div style={styles.engagementItem}>
            <span>📄</span>
            <span>{totalEvidence} {totalEvidence === 1 ? 'kilde' : 'kilder'}</span>
          </div>
        )}
      </div>

      {/* Comment section */}
      <div style={styles.commentSection}>
        {/* Filter tabs */}
        {claim.arguments.length > 0 && (
          <div style={styles.filterRow}>
            {(['ALL', 'PRO', 'CONTRA'] as ArgumentFilter[]).map((f) => {
              const label = f === 'ALL' ? 'Alle' : f === 'PRO' ? 'For' : 'Mot';
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  style={{ ...styles.filterButton, ...(isActive ? styles.filterActive : {}) }}
                  onClick={() => setFilter(f)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Arguments */}
        {filteredArgs.length === 0 && claim.arguments.length === 0 && (
          <div style={styles.emptyComments}>Ingen argumenter enna — vær den forste!</div>
        )}
        {filteredArgs.length === 0 && claim.arguments.length > 0 && (
          <div style={styles.emptyComments}>Ingen {filter === 'PRO' ? 'for' : 'mot'}-argumenter enna</div>
        )}

        {filteredArgs.map((arg) => (
          <ArgumentComment
            key={arg.id}
            argument={arg}
            questionId={questionId}
            isAuthenticated={isAuthenticated}
            isVerified={isVerified}
            canAcknowledge={isAuthenticated && isVerified && unvalidatedIds.has(arg.id) && !justValidated.has(arg.id)}
            justAcknowledged={justValidated.has(arg.id)}
            validating={validating}
            onAcknowledge={onAcknowledge}
            onAddCounterposition={onAddCounterposition}
          />
        ))}

        {/* Add argument buttons */}
        {isAuthenticated && isVerified && (
          <div style={styles.addArgRow}>
            {canPublishPro ? (
              <button
                style={{ ...styles.addArgButton, ...styles.addProButton }}
                onClick={() => onAddArgument(claim.id, 'PRO')}
              >
                + For-argument
              </button>
            ) : (
              <div style={{ flex: 1, textAlign: 'center' as const }}>
                <button
                  style={{ ...styles.addArgButton, ...styles.addProButton, opacity: 0.5, cursor: 'default' }}
                  disabled
                >
                  + For-argument
                </button>
                {proRemaining > 0 && (
                  <div style={styles.lockedHint}>
                    Anerkjenn {proRemaining} mot-arg.
                  </div>
                )}
              </div>
            )}
            {canPublishContra ? (
              <button
                style={{ ...styles.addArgButton, ...styles.addContraButton }}
                onClick={() => onAddArgument(claim.id, 'CONTRA')}
              >
                + Mot-argument
              </button>
            ) : (
              <div style={{ flex: 1, textAlign: 'center' as const }}>
                <button
                  style={{ ...styles.addArgButton, ...styles.addContraButton, opacity: 0.5, cursor: 'default' }}
                  disabled
                >
                  + Mot-argument
                </button>
                {contraRemaining > 0 && (
                  <div style={styles.lockedHint}>
                    Anerkjenn {contraRemaining} for-arg.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
