import { useQuery } from '@apollo/client';
import { GET_QUESTION_STANCES } from '../lib/queries';

interface Props {
  questionId: string;
  show: boolean;
}

interface UserStance {
  id: string;
  descriptiveAssessment: string | null;
  normativePreference: string | null;
  user: {
    id: string;
    displayName: string;
  };
}

const styles = {
  container: {
    background: 'white',
    borderRadius: '8px',
    padding: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600' as const,
    color: '#1a1a2e',
    marginBottom: '1rem',
  },
  section: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.85rem',
    fontWeight: '500' as const,
    marginBottom: '0.5rem',
    color: '#666',
  },
  barContainer: {
    marginBottom: '0.5rem',
  },
  barLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    marginBottom: '0.25rem',
    color: '#333',
  },
  barTrack: {
    height: '8px',
    background: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  totalCount: {
    fontSize: '0.8rem',
    color: '#666',
    textAlign: 'center' as const,
    marginTop: '0.5rem',
  },
  hiddenMessage: {
    fontSize: '0.85rem',
    color: '#666',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    padding: '1rem',
  },
};

const descriptiveConfig: Record<string, { label: string; color: string }> = {
  LIKELY_TRUE: { label: 'Sannsynligvis sant', color: '#28a745' },
  POSSIBLY_TRUE: { label: 'Muligens sant', color: '#8bc34a' },
  UNCERTAIN: { label: 'Usikker', color: '#ffc107' },
  POSSIBLY_FALSE: { label: 'Muligens usant', color: '#ff9800' },
  LIKELY_FALSE: { label: 'Sannsynligvis usant', color: '#dc3545' },
};

const normativeConfig: Record<string, { label: string; color: string }> = {
  STRONGLY_SUPPORT: { label: 'Sterkt for', color: '#1565c0' },
  SUPPORT: { label: 'For', color: '#42a5f5' },
  NEUTRAL: { label: 'Noytral', color: '#9e9e9e' },
  OPPOSE: { label: 'Mot', color: '#ef5350' },
  STRONGLY_OPPOSE: { label: 'Sterkt mot', color: '#c62828' },
};

function DistributionBar({
  config,
  data,
  total,
}: {
  config: Record<string, { label: string; color: string }>;
  data: Record<string, number>;
  total: number;
}) {
  if (total === 0) {
    return <div style={styles.hiddenMessage}>Ingen vurderinger enna</div>;
  }

  return (
    <>
      {Object.entries(config).map(([key, { label, color }]) => {
        const count = data[key] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <div key={key} style={styles.barContainer}>
            <div style={styles.barLabel}>
              <span>{label}</span>
              <span>
                {count} ({percentage}%)
              </span>
            </div>
            <div style={styles.barTrack}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${percentage}%`,
                  background: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}

export function StanceDistribution({ questionId, show }: Props) {
  const { data, loading, error } = useQuery<{ questionStances: UserStance[] }>(GET_QUESTION_STANCES, {
    variables: { questionId },
    skip: !show,
  });

  if (!show) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Vurderingsfordeling</h3>
        <div style={styles.hiddenMessage}>Del din vurdering for å se hva andre mener.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Vurderingsfordeling</h3>
        <div style={styles.hiddenMessage}>Laster...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Vurderingsfordeling</h3>
        <div style={styles.hiddenMessage}>Kunne ikke laste vurderinger.</div>
      </div>
    );
  }

  const stances = data?.questionStances || [];

  // Count descriptive assessments
  const descriptiveCounts: Record<string, number> = {};
  const normativeCounts: Record<string, number> = {};
  let descriptiveTotal = 0;
  let normativeTotal = 0;

  stances.forEach((stance) => {
    if (stance.descriptiveAssessment) {
      descriptiveCounts[stance.descriptiveAssessment] = (descriptiveCounts[stance.descriptiveAssessment] || 0) + 1;
      descriptiveTotal++;
    }
    if (stance.normativePreference) {
      normativeCounts[stance.normativePreference] = (normativeCounts[stance.normativePreference] || 0) + 1;
      normativeTotal++;
    }
  });

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Vurderingsfordeling</h3>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Deskriptiv (hva folk tror)</div>
        <DistributionBar config={descriptiveConfig} data={descriptiveCounts} total={descriptiveTotal} />
        {descriptiveTotal > 0 && <div style={styles.totalCount}>{descriptiveTotal} vurderinger</div>}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Normativ (hva folk mener)</div>
        <DistributionBar config={normativeConfig} data={normativeCounts} total={normativeTotal} />
        {normativeTotal > 0 && <div style={styles.totalCount}>{normativeTotal} vurderinger</div>}
      </div>
    </div>
  );
}
