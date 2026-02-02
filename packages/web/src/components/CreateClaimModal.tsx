import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_CLAIM, ADD_CLAIM_TO_QUESTION, GET_QUESTION } from '../lib/queries';
import { useAuth } from '../context/AuthContext';

interface Props {
  questionId: string;
  onClose: () => void;
  onCreated?: (claimId: string) => void;
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
    maxWidth: '550px',
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
  typeDescription: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '0.5rem',
    padding: '0.5rem',
    background: '#f8f9fa',
    borderRadius: '4px',
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

const claimTypes = [
  {
    value: 'EMPIRICAL',
    label: 'Empirisk',
    description: 'En pastand om fakta som kan verifiseres gjennom observasjon eller data.',
  },
  {
    value: 'CAUSAL',
    label: 'Kausal',
    description: 'En pastand om arsak-virkning-forhold mellom to fenomener.',
  },
  {
    value: 'PROGNOSTIC',
    label: 'Prognostisk',
    description: 'En pastand om fremtidige hendelser eller utfall.',
  },
  {
    value: 'NORMATIVE',
    label: 'Normativ',
    description: 'En pastand om hva som bor eller skal gjores (verdivurdering).',
  },
  {
    value: 'DEFINITIONAL',
    label: 'Definitorisk',
    description: 'En pastand om hva et begrep betyr eller hvordan noe skal klassifiseres.',
  },
];

export function CreateClaimModal({ questionId, onClose, onCreated }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [statement, setStatement] = useState('');
  const [context, setContext] = useState('');
  const [claimType, setClaimType] = useState('');

  const [createClaim, { loading: creating }] = useMutation(CREATE_CLAIM);
  const [addClaimToQuestion, { loading: linking, error }] = useMutation(ADD_CLAIM_TO_QUESTION, {
    refetchQueries: [{ query: GET_QUESTION, variables: { id: questionId } }],
    onCompleted: (data) => {
      onCreated?.(data.addClaimToQuestion.claim.id);
      onClose();
    },
  });

  const handleSubmit = async () => {
    if (!statement.trim() || !claimType) return;

    try {
      const { data } = await createClaim({
        variables: {
          input: {
            statement: statement.trim(),
            context: context.trim() || null,
            claimType,
          },
        },
      });

      await addClaimToQuestion({
        variables: {
          input: {
            questionId,
            claimId: data.createClaim.id,
          },
        },
      });
    } catch (e) {
      // Error is handled by the mutation
    }
  };

  const selectedType = claimTypes.find((t) => t.value === claimType);
  const isVerified = user?.authLevel === 'VERIFIED' || user?.authLevel === 'STRONG_ID';
  const loading = creating || linking;

  if (!isAuthenticated || !isVerified) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <h2 style={styles.title}>Legg til pastand</h2>
            <button style={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div style={styles.loginPrompt}>
            Du må vaere logget inn med en verifisert konto for å legge til pastander.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Legg til pastand</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Pastand *</label>
          <textarea
            style={styles.textarea}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Formuler en klar, falsifiserbar pastand..."
          />
          <div style={styles.hint}>En god pastand er spesifikk og kan motbevises</div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Type *</label>
          <select style={styles.select} value={claimType} onChange={(e) => setClaimType(e.target.value)}>
            <option value="">Velg type...</option>
            {claimTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {selectedType && <div style={styles.typeDescription}>{selectedType.description}</div>}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Kontekst</label>
          <textarea
            style={{ ...styles.textarea, minHeight: '60px' }}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Legg til kontekst eller presiseringer..."
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
              ...(!statement.trim() || !claimType || loading ? styles.saveButtonDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={!statement.trim() || !claimType || loading}
          >
            {loading ? 'Legger til...' : 'Legg til'}
          </button>
        </div>
      </div>
    </div>
  );
}
