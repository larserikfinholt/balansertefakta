import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SET_SCOPE, GET_QUESTION } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import type { ScopeData } from './ScopeBadge';

interface Props {
  questionId?: string;
  claimId?: string;
  argumentId?: string;
  currentScope: ScopeData | null;
  onClose: () => void;
  onSaved?: () => void;
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
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
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#666',
    padding: '0.25rem',
  },
  field: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '500' as const,
    marginBottom: '0.5rem',
    color: '#333',
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
    background: 'white',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
    resize: 'vertical' as const,
    minHeight: '80px',
    fontFamily: 'inherit',
  },
  hint: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '0.25rem',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  cancelButton: {
    flex: 1,
    padding: '0.75rem',
    background: '#f5f5f5',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  saveButton: {
    flex: 1,
    padding: '0.75rem',
    background: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  saveButtonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  error: {
    color: '#dc3545',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
  },
  loginPrompt: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '0.9rem',
    padding: '2rem 1rem',
  },
};

const temporalOptions = [
  { value: '', label: 'Velg tidsomfang...' },
  { value: 'HISTORICAL', label: 'Historisk' },
  { value: 'RECENT', label: 'Nylig' },
  { value: 'CURRENT', label: 'Naatid' },
  { value: 'SHORT_TERM', label: 'Kort sikt' },
  { value: 'MEDIUM_TERM', label: 'Mellomlang sikt' },
  { value: 'LONG_TERM', label: 'Lang sikt' },
  { value: 'UNSPECIFIED', label: 'Uspesifisert' },
];

const geographicOptions = [
  { value: '', label: 'Velg geografisk omfang...' },
  { value: 'GLOBAL', label: 'Global' },
  { value: 'CONTINENTAL', label: 'Kontinental' },
  { value: 'NATIONAL', label: 'Nasjonal' },
  { value: 'REGIONAL', label: 'Regional' },
  { value: 'LOCAL', label: 'Lokal' },
  { value: 'UNSPECIFIED', label: 'Uspesifisert' },
];

export function ScopeEditor({ questionId, claimId, argumentId, currentScope, onClose, onSaved }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [temporalScope, setTemporalScope] = useState(currentScope?.temporalScope || '');
  const [geographicScope, setGeographicScope] = useState(currentScope?.geographicScope || '');
  const [systemBoundary, setSystemBoundary] = useState(currentScope?.systemBoundary || '');
  const [assumptions, setAssumptions] = useState(currentScope?.assumptions || '');

  const [setScope, { loading, error }] = useMutation(SET_SCOPE, {
    refetchQueries: questionId ? [{ query: GET_QUESTION, variables: { id: questionId } }] : [],
    onCompleted: () => {
      onSaved?.();
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!systemBoundary.trim()) return;

    setScope({
      variables: {
        input: {
          questionId: questionId || null,
          claimId: claimId || null,
          argumentId: argumentId || null,
          temporalScope: temporalScope || null,
          geographicScope: geographicScope || null,
          systemBoundary: systemBoundary.trim(),
          assumptions: assumptions.trim() || null,
        },
      },
    });
  };

  const isVerified = user?.authLevel === 'VERIFIED' || user?.authLevel === 'STRONG_ID';

  if (!isAuthenticated || !isVerified) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <h2 style={styles.title}>Definer omfang</h2>
            <button style={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div style={styles.loginPrompt}>
            Du må vaere logget inn med en verifisert konto for å redigere omfang.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Definer omfang</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Tidsomfang</label>
          <select style={styles.select} value={temporalScope} onChange={(e) => setTemporalScope(e.target.value)}>
            {temporalOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Geografisk omfang</label>
          <select style={styles.select} value={geographicScope} onChange={(e) => setGeographicScope(e.target.value)}>
            {geographicOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Systemgrense *</label>
          <input
            type="text"
            style={styles.input}
            value={systemBoundary}
            onChange={(e) => setSystemBoundary(e.target.value)}
            placeholder="f.eks. 'Norsk okonomi', 'Global matproduksjon'"
          />
          <div style={styles.hint}>Beskriv hva som er inkludert/ekskludert i analysen</div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Forutsetninger</label>
          <textarea
            style={styles.textarea}
            value={assumptions}
            onChange={(e) => setAssumptions(e.target.value)}
            placeholder="Hvilke forutsetninger gjelder for dette omfanget?"
          />
        </div>

        {error && <div style={styles.error}>Feil: {error.message}</div>}

        <div style={styles.actions}>
          <button style={styles.cancelButton} onClick={onClose}>
            Avbryt
          </button>
          <button
            style={{
              ...styles.saveButton,
              ...(!systemBoundary.trim() || loading ? styles.saveButtonDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={!systemBoundary.trim() || loading}
          >
            {loading ? 'Lagrer...' : 'Lagre'}
          </button>
        </div>
      </div>
    </div>
  );
}
