interface MaturityChecklistData {
  hasScope: boolean;
  hasDisagreementAxis: boolean;
  hasProArguments: boolean;
  hasContraArguments: boolean;
  hasSupportingEvidence: boolean;
  hasChallengingEvidence: boolean;
  completenessScore: number;
}

interface Props {
  checklist: MaturityChecklistData;
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
    fontSize: '0.9rem',
    fontWeight: '600' as const,
    color: '#1a1a2e',
    margin: 0,
  },
  score: {
    fontSize: '0.85rem',
    color: '#666',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#e0e0e0',
    borderRadius: '4px',
    marginBottom: '0.75rem',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  checklistItems: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
  },
  checkmark: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    flexShrink: 0,
  },
  checked: {
    background: '#d4edda',
    color: '#155724',
  },
  unchecked: {
    background: '#f8d7da',
    color: '#721c24',
  },
  label: {
    color: '#333',
  },
};

const checklistLabels: Record<keyof Omit<MaturityChecklistData, 'completenessScore'>, string> = {
  hasScope: 'Omfang definert',
  hasDisagreementAxis: 'Uenighetsakse identifisert',
  hasProArguments: 'For-argumenter',
  hasContraArguments: 'Mot-argumenter',
  hasSupportingEvidence: 'Stottende evidens',
  hasChallengingEvidence: 'Motstridende evidens',
};

function getProgressColor(score: number): string {
  const percentage = (score / 6) * 100;
  if (percentage >= 80) return '#28a745';
  if (percentage >= 50) return '#ffc107';
  return '#dc3545';
}

export function MaturityChecklist({ checklist }: Props) {
  const percentage = Math.round((checklist.completenessScore / 6) * 100);
  const progressColor = getProgressColor(checklist.completenessScore);

  const items: Array<{ key: keyof Omit<MaturityChecklistData, 'completenessScore'>; checked: boolean }> = [
    { key: 'hasScope', checked: checklist.hasScope },
    { key: 'hasDisagreementAxis', checked: checklist.hasDisagreementAxis },
    { key: 'hasProArguments', checked: checklist.hasProArguments },
    { key: 'hasContraArguments', checked: checklist.hasContraArguments },
    { key: 'hasSupportingEvidence', checked: checklist.hasSupportingEvidence },
    { key: 'hasChallengingEvidence', checked: checklist.hasChallengingEvidence },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Modenhet</h3>
        <span style={styles.score}>{checklist.completenessScore}/6 ({percentage}%)</span>
      </div>

      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${percentage}%`,
            background: progressColor,
          }}
        />
      </div>

      <div style={styles.checklistItems}>
        {items.map(({ key, checked }) => (
          <div key={key} style={styles.item}>
            <span
              style={{
                ...styles.checkmark,
                ...(checked ? styles.checked : styles.unchecked),
              }}
            >
              {checked ? '✓' : '✗'}
            </span>
            <span style={styles.label}>{checklistLabels[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
