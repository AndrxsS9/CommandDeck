interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <div className="error-state__header">
        <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>Error en la generación</span>
      </div>
      <p className="error-state__message">{message}</p>
      <div className="error-state__actions">
        <button className="btn-secondary" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    </div>
  );
}
