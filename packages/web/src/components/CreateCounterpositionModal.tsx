import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_COUNTERPOSITION, GET_QUESTION } from '../lib/queries';
import { useAuth } from '../context/AuthContext';

interface Props {
  argumentId: string;
  argumentContent: string;
  questionId: string;
  onClose: () => void;
  onCreated?: (counterpositionId: string) => void;
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
  contextBox: {
    padding: '0.75rem',
    background: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '1.5rem',
    borderLeft: '3px solid #666',
  },
  contextLabel: {
    fontSize: '0.75rem',
    color: '#666',
    marginBottom: '0.25rem',
  },
  contextText: {
    fontSize: '0.9rem',
    color: '#333',
  },
  description: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '1rem',
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
  textarea: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
    resize: 'vertical' as const,
    minHeight: '120px',
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
    background: '#6c757d',
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

export function CreateCounterpositionModal({
  argumentId,
  argumentContent,
  questionId,
  onClose,
  onCreated,
}: Props) {
  const { isAuthenticated, user } = useAuth();
  const [content, setContent] = useState('');

  const [createCounterposition, { loading, error }] = useMutation(CREATE_COUNTERPOSITION, {
    refetchQueries: [{ query: GET_QUESTION, variables: { id: questionId } }],
    onCompleted: (data) => {
      onCreated?.(data.createCounterposition.id);
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;

    createCounterposition({
      variables: {
        input: {
          argumentId,
          content: content.trim(),
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
            <h2 style={styles.title}>Legg til motposisjon</h2>
            <button style={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div style={styles.loginPrompt}>
            Du må vaere logget inn med en verifisert konto for å legge til motposisjoner.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Legg til motposisjon</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.contextBox}>
          <div style={styles.contextLabel}>Argument:</div>
          <div style={styles.contextText}>{argumentContent}</div>
        </div>

        <p style={styles.description}>
          En motposisjon er det beste mulige svaret på argumentet (steelmanning). Hva ville en fornuftig
          person si som svar på dette?
        </p>

        <div style={styles.field}>
          <label style={styles.label}>Motposisjon *</label>
          <textarea
            style={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Skriv det beste mulige svaret på dette argumentet..."
          />
          <div style={styles.hint}>
            Forsok å gi det sterkeste mulige motargumentet, selv om du er enig i det opprinnelige
            argumentet
          </div>
        </div>

        {error && <div style={styles.error}>Feil: {error.message}</div>}

        <div style={styles.actions}>
          <button style={styles.cancelButton} onClick={onClose}>
            Avbryt
          </button>
          <button
            style={{
              ...styles.saveButton,
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
