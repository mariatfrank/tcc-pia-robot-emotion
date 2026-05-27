import { useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../controllers/AuthContext";
import { happyOlharVideo } from "../../models/emotionOlharModel";

export function LandingPage() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = happyOlharVideo();

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    void el.play().catch(() => undefined);
  }, [src]);

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="app-shell landing-page-shell">
      <div className="card landing-card">
        <header className="landing-nav">
          <nav className="landing-nav-btns" aria-label="Acesso à conta">
            <Link
              className="landing-nav-link landing-nav-link--outline"
              to="/cadastro"
            >
              Cadastro
            </Link>
            <Link className="landing-nav-link landing-nav-link--solid" to="/login">
              Login
            </Link>
          </nav>
        </header>

        <div className="landing-split">
          <section className="landing-col landing-col--copy">
            <h1 className="landing-headline">Piá Robot Emotion</h1>
            <p className="landing-accent-line">
              Partidas e expressões em tempo real
            </p>
            <p className="landing-lede">
              Gerencie sessões, dispositivos e partidas a
              partir de um painel único: tudo sincronizado com as emoções do robô!
            </p>
          </section>

          <section
            className="landing-col landing-col--visual"
            aria-label="Pré-visualização dos olhos (alegria)"
          >
            <div className="landing-bubbles" aria-hidden />
            <div className="landing-eyes-stage">
              <div className="landing-eyes-rotate">
                <video
                  ref={videoRef}
                  className="landing-eyes-video"
                  src={src}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
