import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CHALLENGE_SOURCE, GET_QUESTION } from '../lib/queries';

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600' as const,
    marginBottom: '1rem',
    color: '#1a1a2e',
  },
  loginPrompt: {
    textAlign: 'center' as const,
    padding: '1rem 0',
  },
  loginLink: {
    color: '#0066cc',
    fontWeight: '500' as const,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontWeight: '500' as const,
    fontSize: '0.9rem',
    color: '#333',
  },
  select: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '0.9rem',
  },
  textarea: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '0.9rem',
    minHeight: '100px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    background: 'white',
    color: '#333',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  submitButton: {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: 'none',
    background: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500' as const,
  },
  submitButtonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  error: {
    color: '#dc3545',
    fontSize: '0.85rem',
    padding: '0.5rem',
    background: '#f8d7da',
    borderRadius: '4px',
  },
  success: {
    color: '#155724',
    fontSize: '0.85rem',
    padding: '0.5rem',
    background: '#d4edda',
    borderRadius: '4px',
  },
  hint: {
    fontSize: '0.8rem',
    color: '#666',
    fontStyle: 'italic',
  },
};

// Challenge type options with Norwegian labels
const challengeTypes = [
  { value: 'MISQUOTE', label: 'Feilsitering', description: 'Kilden sier ikke det som paastaas' },
  { value: 'CHERRY_PICKING', label: 'Selektiv bruk', description: 'Viktig kontekst er utelatt' },
  { value: 'OUT_OF_CONTEXT', label: 'Tatt ut av kontekst', description: 'Sitatet betyr noe annet i kontekst' },
  { value: 'OUTDATED', label: 'Utdatert', description: 'Kilden er ikke lenger relevant' },
  { value: 'METHODOLOGY', label: 'Metodefeil', description: 'Studien har metodiske problemer' },
  { value: 'CONFLICT_OF_INTEREST', label: 'Interessekonflikt', description: 'Kilden har skjulte interesser' },
  { value: 'RELEVANCE', label: 'Ikke relevant', description: 'Kilden svarer ikke paa paastanden' },
];

interface ChallengeSourceModalProps {
  evidenceLinkId: string;
  onClose: () => void;
}

export function ChallengeSourceModal({ evidenceLinkId, onClose }: ChallengeSourceModalProps) {
  const { isAuthenticated } = useAuth();
  const [challengeType, setChallengeType] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  const [challengeSource, { loading, error }] = useMutation(CHALLENGE_SOURCE, {
    refetchQueries: [GET_QUESTION],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeType || !description.trim()) return;

    try {
      await challengeSource({
        variables: {
          input: {
            evidenceLinkId,
            challengeType,
            description: description.trim(),
          },
        },
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      // Error is handled by the mutation error state
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const selectedType = challengeTypes.find((t) => t.value === challengeType);
  const canSubmit = challengeType && description.trim().length > 10;

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Bestrid kilde</h2>

        {!isAuthenticated ? (
          <div style={styles.loginPrompt}>
            <p>Du ma vare logget inn for a bestride kilder.</p>
            <p>
              <Link to="/login" style={styles.loginLink}>
                Logg inn
              </Link>{' '}
              eller{' '}
              <Link to="/register" style={styles.loginLink}>
                registrer deg
              </Link>
            </p>
            <div style={styles.buttons}>
              <button style={styles.cancelButton} onClick={onClose}>
                Lukk
              </button>
            </div>
          </div>
        ) : success ? (
          <div style={styles.success}>
            Utfordringen din er registrert. Den vil bli vurdert av moderatorer.
          </div>
        ) : (
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Type utfordring</label>
              <select
                style={styles.select}
                value={challengeType}
                onChange={(e) => setChallengeType(e.target.value)}
                required
              >
                <option value="">Velg type...</option>
                {challengeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {selectedType && (
                <span style={styles.hint}>{selectedType.description}</span>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Beskriv problemet</label>
              <textarea
                style={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Forklar hvorfor denne kilden er problematisk..."
                required
                minLength={10}
              />
              <span style={styles.hint}>
                Minst 10 tegn. Vær spesifikk og saklig.
              </span>
            </div>

            {error && (
              <div style={styles.error}>
                Feil ved innsending: {error.message}
              </div>
            )}

            <div style={styles.buttons}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={onClose}
                disabled={loading}
              >
                Avbryt
              </button>
              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  ...(!canSubmit || loading ? styles.submitButtonDisabled : {}),
                }}
                disabled={!canSubmit || loading}
              >
                {loading ? 'Sender...' : 'Send utfordring'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
