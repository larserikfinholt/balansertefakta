import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ARGUMENT, GET_QUESTION } from '../lib/queries';
import { useAuth } from '../context/AuthContext';

interface Props {
  claimId?: string;
  measureId?: string;
  argumentType: 'PRO' | 'CONTRA';
  questionId: string;
  onClose: () => void;
  onCreated?: (argumentId: string) => void;
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
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600' as const,
    margin: 0,
  },
  proTitle: {
    color: '#155724',
  },
  contraTitle: {
    color: '#721c24',
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
  textarea: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
    resize: 'vertical' as const,
    minHeight: '100px',
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
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  proButton: {
    background: '#28a745',
  },
  contraButton: {
    background: '#dc3545',
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

const strengthOptions = [
  { value: 'LOW', label: 'Svak' },
  { value: 'MEDIUM', label: 'Middels' },
  { value: 'HIGH', label: 'Sterk' },
];

export function CreateArgumentModal({
  claimId,
  measureId,
  argumentType,
  questionId,
  onClose,
  onCreated,
}: Props) {
  const { isAuthenticated, user } = useAuth();
  const [content, setContent] = useState('');
  const [strength, setStrength] = useState('MEDIUM');

  const [createArgument, { loading, error }] = useMutation(CREATE_ARGUMENT, {
    refetchQueries: [{ query: GET_QUESTION, variables: { id: questionId } }],
    onCompleted: (data) => {
      onCreated?.(data.createArgument.id);
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;

    createArgument({
      variables: {
        input: {
          claimId: claimId || null,
          measureId: measureId || null,
          content: content.trim(),
          argumentType,
          strength,
        },
      },
    });
  };

  const isPro = argumentType === 'PRO';
  const isVerified = user?.authLevel === 'VERIFIED' || user?.authLevel === 'STRONG_ID';

  if (!isAuthenticated || !isVerified) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <h2 style={{ ...styles.title, ...(isPro ? styles.proTitle : styles.contraTitle) }}>
              {isPro ? '✓ For-argument' : '✗ Mot-argument'}
            </h2>
            <button style={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div style={styles.loginPrompt}>
            Du må vaere logget inn med en verifisert konto for å legge til argumenter.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={{ ...styles.title, ...(isPro ? styles.proTitle : styles.contraTitle) }}>
            {isPro ? '✓ For-argument' : '✗ Mot-argument'}
          </h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Argument *</label>
          <textarea
            style={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isPro
                ? 'Hvorfor stotter dette pastanden/tiltaket?'
                : 'Hvorfor motarbeider dette pastanden/tiltaket?'
            }
          />
          <div style={styles.hint}>Vaer spesifikk og konkret</div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Styrke</label>
          <select style={styles.select} value={strength} onChange={(e) => setStrength(e.target.value)}>
            {strengthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div style={styles.hint}>Hvor overbevisende er dette argumentet?</div>
        </div>

        {error && <div style={styles.error}>Feil: {error.message}</div>}

        <div style={styles.actions}>
          <button style={styles.cancelButton} onClick={onClose}>
            Avbryt
          </button>
          <button
            style={{
              ...styles.saveButton,
              ...(isPro ? styles.proButton : styles.contraButton),
              ...(!content.trim() || loading ? styles.saveButtonDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
          >
            {loading ? 'Legger til...' : 'Legg til'}
          </button>
        </div>
      </div>
    </div>
  );
}
