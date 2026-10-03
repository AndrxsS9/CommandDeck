export function LoadingState() {
  return (
    <div className="loading-state">
      <div className="loading-state__spinner" />
      <div>
        <div className="loading-state__text">Analizando intención y construyendo comando...</div>
        <div className="loading-state__subtext">Gemini está procesando la solicitud</div>
      </div>
    </div>
  );
}
