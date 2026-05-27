import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./controllers/AuthContext";
import { ProtectedLayout } from "./controllers/ProtectedLayout";
import { ConnectionTestPage } from "./views/pages/ConnectionTestPage";
import { DashboardPage } from "./views/pages/DashboardPage";
import { DevicesManagePage } from "./views/pages/DevicesManagePage";
import { ForgotPasswordPage } from "./views/pages/ForgotPasswordPage";
import { LandingPage } from "./views/pages/LandingPage";
import { LoginPage } from "./views/pages/LoginPage";
import { ProfilePage } from "./views/pages/ProfilePage";
import { RegisterDevicePage } from "./views/pages/RegisterDevicePage";
import { RegisterPage } from "./views/pages/RegisterPage";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/perfil" element={<ProfilePage />} />
            <Route
              path="/app/dispositivos/celular"
              element={<RegisterDevicePage type="EYES_PHONE" />}
            />
            <Route
              path="/app/dispositivos/tablet"
              element={<RegisterDevicePage type="GAME_TABLET" />}
            />
            <Route path="/app/dispositivos" element={<DevicesManagePage />} />
            <Route path="/app/dispositivos/teste" element={<ConnectionTestPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
