import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_USER_STANCE, SET_USER_STANCE, GET_QUESTION } from '../lib/queries';
import { useAuth } from '../context/AuthContext';

interface Props {
  questionId: string;
  onStanceSubmitted?: () => void;
}

interface UserStance {
  id: string;
  descriptiveAssessment: string | null;
  normativePreference: string | null;
  justifications: string[];
  note: string | null;
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
  loginPrompt: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '0.9rem',
    padding: '1rem',
  },
  twoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
  },
  column: {
    padding: '0.75rem',
    background: '#f8f9fa',
    borderRadius: '4px',
  },
  columnTitle: {
    fontSize: '0.85rem',
    fontWeight: '500' as const,
    marginBottom: '0.75rem',
    color: '#333',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  radioInput: {
    margin: 0,
  },
  section: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.85rem',
    fontWeight: '500' as const,
    marginBottom: '0.5rem',
    color: '#333',
  },
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.85rem',
    resize: 'vertical' as const,
    minHeight: '60px',
    fontFamily: 'inherit',
  },
  submitButton: {
    width: '100%',
    padding: '0.75rem',
    background: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  submitButtonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  savedBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    background: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    fontSize: '0.75rem',
    marginLeft: '0.5rem',
  },
  error: {
    color: '#dc3545',
    fontSize: '0.8rem',
    marginTop: '0.5rem',
  },
};

const descriptiveOptions = [
  { value: 'LIKELY_TRUE', label: 'Sannsynligvis sant' },
  { value: 'POSSIBLY_TRUE', label: 'Muligens sant' },
  { value: 'UNCERTAIN', label: 'Usikker' },
  { value: 'POSSIBLY_FALSE', label: 'Muligens usant' },
  { value: 'LIKELY_FALSE', label: 'Sannsynligvis usant' },
];

const normativeOptions = [
  { value: 'STRONGLY_SUPPORT', label: 'Sterkt for' },
  { value: 'SUPPORT', label: 'For' },
  { value: 'NEUTRAL', label: 'Noytral' },
  { value: 'OPPOSE', label: 'Mot' },
  { value: 'STRONGLY_OPPOSE', label: 'Sterkt mot' },
];

const justificationOptions = [
  { value: 'DATA_BASED', label: 'Basert på data' },
  { value: 'VALUE_BASED', label: 'Basert på verdier' },
  { value: 'RISK_BASED', label: 'Basert på risiko' },
];

export function UserStancePanel({ questionId, onStanceSubmitted }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [descriptive, setDescriptive] = useState<string | null>(null);
  const [normative, setNormative] = useState<string | null>(null);
  const [justifications, setJustifications] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const { data: stanceData, loading: stanceLoading } = useQuery<{ userStance: UserStance | null }>(GET_USER_STANCE, {
    variables: { questionId },
    skip: !isAuthenticated,
    onCompleted: (data) => {
      if (data.userStance) {
        setDescriptive(data.userStance.descriptiveAssessment);
        setNormative(data.userStance.normativePreference);
        setJustifications(data.userStance.justifications || []);
        setNote(data.userStance.note || '');
        setSaved(true);
      }
    },
  });

  const [setUserStance, { loading: saving, error }] = useMutation(SET_USER_STANCE, {
    refetchQueries: [{ query: GET_QUESTION, variables: { id: questionId } }],
    onCompleted: () => {
      setSaved(true);
      onStanceSubmitted?.();
    },
  });

  const handleJustificationToggle = (value: string) => {
    setJustifications((prev) => (prev.includes(value) ? prev.filter((j) => j !== value) : [...prev, value]));
  };

  const handleSubmit = () => {
    if (!descriptive && !normative) return;

    setUserStance({
      variables: {
        input: {
          questionId,
          descriptiveAssessment: descriptive,
          normativePreference: normative,
          justifications,
          note: note || null,
        },
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Din vurdering</h3>
        <div style={styles.loginPrompt}>Logg inn for å dele din vurdering av dette sporsmalet.</div>
      </div>
    );
  }

  if (stanceLoading) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Din vurdering</h3>
        <div style={styles.loginPrompt}>Laster...</div>
      </div>
    );
  }

  const hasChanges =
    descriptive !== stanceData?.userStance?.descriptiveAssessment ||
    normative !== stanceData?.userStance?.normativePreference ||
    JSON.stringify(justifications) !== JSON.stringify(stanceData?.userStance?.justifications || []) ||
    note !== (stanceData?.userStance?.note || '');

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>
        Din vurdering
        {saved && !hasChanges && <span style={styles.savedBadge}>Lagret</span>}
      </h3>

      <div style={styles.twoColumns}>
        <div style={styles.column}>
          <div style={styles.columnTitle}>Hva tror du? (deskriptivt)</div>
          <div style={styles.radioGroup}>
            {descriptiveOptions.map((opt) => (
              <label key={opt.value} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="descriptive"
                  value={opt.value}
                  checked={descriptive === opt.value}
                  onChange={() => setDescriptive(opt.value)}
                  style={styles.radioInput}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div style={styles.column}>
          <div style={styles.columnTitle}>Hva mener du? (normativt)</div>
          <div style={styles.radioGroup}>
            {normativeOptions.map((opt) => (
              <label key={opt.value} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="normative"
                  value={opt.value}
                  checked={normative === opt.value}
                  onChange={() => setNormative(opt.value)}
                  style={styles.radioInput}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Begrunnelse (valgfritt)</div>
        <div style={styles.checkboxGroup}>
          {justificationOptions.map((opt) => (
            <label key={opt.value} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={justifications.includes(opt.value)}
                onChange={() => handleJustificationToggle(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Kommentar (valgfritt)</div>
        <textarea
          style={styles.textarea}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Forklar din vurdering..."
        />
      </div>

      <button
        style={{
          ...styles.submitButton,
          ...((!descriptive && !normative) || saving ? styles.submitButtonDisabled : {}),
        }}
        onClick={handleSubmit}
        disabled={(!descriptive && !normative) || saving}
      >
        {saving ? 'Lagrer...' : saved && !hasChanges ? 'Lagret' : 'Lagre vurdering'}
      </button>

      {error && <div style={styles.error}>Feil: {error.message}</div>}
    </div>
  );
}
