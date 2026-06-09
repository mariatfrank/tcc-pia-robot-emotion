import { useEffect, useState } from "react";
import { infoApi } from "../../models/api";
import { PageBack } from "../components/PageBack";

const DEVS =
  "Equipe Piá Robot Emotion: André Luiz Olmedo e Maria Tereza Marchezan Frank";

export function AboutPage({ backTo }: { backTo: string }) {
  const [ver, setVer] = useState<string>("…");

  useEffect(() => {
    void infoApi
      .info()
      .then((i) => setVer(i.app?.version ?? "0.1.0"))
      .catch(() => setVer("0.1.0(offline)"));
  }, []);

  return (
    <div className="app-shell">
      <div className="card">
        <PageBack to={backTo} />
        <h1>Sobre o sistema</h1>
        <p>
          <strong>Versão:</strong> {ver}
        </p>
        <p>
          <strong>Desenvolvedores:</strong> {DEVS}
        </p>
        <p>
          O Piá Robot Emotion integra tablet, smartphone (olhos digitais) e este painel
          web com um backend central SpringBoot que registra sessões,
          pontuação e emoções, com armazenamento em banco de dados e mensagens
          em tempo real entre os componentes. Este projeto foi desenvolvido para o TCC 2 do curso 
          de Análise e Desenvolvimento de Sitemas da UFPR em 2026.
        </p>
      </div>
    </div>
  );
}
