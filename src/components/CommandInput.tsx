import { FormEvent, forwardRef, useRef, useEffect, useImperativeHandle } from 'react';

export interface CommandInputHandle {
  focus: () => void;
}

interface CommandInputProps {
  intent: string;
  onIntentChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const CommandInput = forwardRef<CommandInputHandle, CommandInputProps>(
  function CommandInput(
    { intent, onIntentChange, onSubmit, loading, suggestions, onSuggestionClick },
    ref
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, []);

    useImperativeHandle(ref, () => ({
      focus() {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      },
    }));

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (intent.trim() && !loading) {
          onSubmit(e as unknown as FormEvent);
        }
      }
    }

    return (
      <section className="command-input-card">
        {/* Header */}
        <div className="command-input-card__header">
          <div className="command-input-card__title-group">
            <div className="command-input-card__icon">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="command-input-card__title">Traductor en Lenguaje Natural</h2>
          </div>
          <span className="command-input-card__model-badge">
            <span className="command-input-card__model-dot" />
            Asistente disponible
          </span>
        </div>

        {/* Textarea */}
        <form onSubmit={onSubmit}>
          <textarea
            ref={textareaRef}
            className="command-input-card__textarea"
            rows={2}
            value={intent}
            onChange={(e) => onIntentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe lo que quieres hacer en lenguaje natural..."
            aria-label="Describe tu intención"
          />

          {/* Footer */}
          <div className="command-input-card__footer">
            <div className="command-input-card__suggestions">
              <span className="command-input-card__suggestions-label">Sugerencias:</span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="command-input-card__suggestion-chip"
                  onClick={() => onSuggestionClick(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="btn-generate"
              disabled={loading || !intent.trim()}
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>{loading ? 'Generando…' : 'Generar comando'}</span>
            </button>
          </div>
        </form>
      </section>
    );
  }
);
