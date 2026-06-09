import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./controllers/AuthContext";
import { ProtectedLayout } from "./controllers/ProtectedLayout";
import { AboutPage } from "./views/pages/AboutPage";
import { ConnectionTestPage } from "./views/pages/ConnectionTestPage";
import { DashboardPage } from "./views/pages/DashboardPage";
import { DevicesManagePage } from "./views/pages/DevicesManagePage";
import { EyesPage } from "./views/pages/EyesPage";
import { ForgotPasswordPage } from "./views/pages/ForgotPasswordPage";
import { GameSettingsPage } from "./views/pages/GameSettingsPage";
import { HistoryPage } from "./views/pages/HistoryPage";
import { LandingPage } from "./views/pages/LandingPage";
import { LiveScorePage } from "./views/pages/LiveScorePage";
import { LoginPage } from "./views/pages/LoginPage";
import { ManualEmotionPage } from "./views/pages/ManualEmotionPage";
import { ProfilePage } from "./views/pages/ProfilePage";
import { RegisterDevicePage } from "./views/pages/RegisterDevicePage";
import { RegisterPage } from "./views/pages/RegisterPage";
import { StartSessionPage } from "./views/pages/StartSessionPage";
import { TabletLayout } from "./views/layouts/TabletLayout";
import { TabletGamePage } from "./views/pages/TabletGamePage";
import { TabletHomePage } from "./views/pages/TabletHomePage";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
          <Route path="/olhos" element={<EyesPage />} />

          <Route path="/tablet" element={<TabletLayout />}>
            <Route index element={<TabletHomePage />} />
            <Route path="desconectado" element={<TabletHomePage disconnected />} />
            <Route path="jogo" element={<TabletGamePage />} />
            <Route path="historico" element={<HistoryPage backTo="/tablet" />} />
            <Route path="sobre" element={<AboutPage backTo="/tablet" />} />
          </Route>

          <Route element={<ProtectedLayout />}>
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/perfil" element={<ProfilePage />} />
            <Route path="/app/dispositivos/celular" element={<RegisterDevicePage type="EYES_PHONE" />} />
            <Route path="/app/dispositivos/tablet" element={<RegisterDevicePage type="GAME_TABLET" />} />
            <Route path="/app/dispositivos" element={<DevicesManagePage />} />
            <Route path="/app/dispositivos/teste" element={<ConnectionTestPage />} />
            <Route path="/app/partida/iniciar" element={<StartSessionPage />} />
            <Route path="/app/partida/monitor" element={<LiveScorePage />} />
            <Route path="/app/partida/monitor/:sessionId" element={<LiveScorePage />} />
            <Route path="/app/emocoes" element={<ManualEmotionPage />} />
            <Route path="/app/configuracao-jogo" element={<GameSettingsPage />} />
            <Route path="/app/historico" element={<HistoryPage backTo="/app" />} />
            <Route path="/app/sobre" element={<AboutPage backTo="/app" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
