type PasswordToggleProps = {
  visible: boolean;
  onToggle: () => void;
};

export function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  return (
    <button
      type="button"
      className="password-toggle"
      onClick={onToggle}
      aria-label={visible ? "Ocultar senha" : "Exibir senha"}
      title={visible ? "Ocultar senha" : "Exibir senha"}
    >
      {visible ? (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M3 3l18 18" />
          <path d="M10.7 10.7a2 2 0 0 0 2.6 2.6" />
          <path d="M9.9 4.2A10.4 10.4 0 0 1 12 4c5 0 8.5 4.2 10 8a13.5 13.5 0 0 1-3.1 4.5" />
          <path d="M6.6 6.6A13.6 13.6 0 0 0 2 12c1.5 3.8 5 8 10 8 1.5 0 2.8-.4 4-1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}
