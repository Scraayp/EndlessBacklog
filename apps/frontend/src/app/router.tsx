import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./RequireAuth.js";
import { AppShell } from "../components/layout/AppShell.js";
import { LoginPage } from "../features/auth/pages/LoginPage.js";
import { RegisterPage } from "../features/auth/pages/RegisterPage.js";
import { VerifyEmailPage } from "../features/auth/pages/VerifyEmailPage.js";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage.js";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage.js";
import { TwoFactorChallengePage } from "../features/auth/pages/TwoFactorChallengePage.js";
import { OAuthCallbackPage } from "../features/auth/pages/OAuthCallbackPage.js";
import { WorkspaceListPage } from "../features/workspaces/pages/WorkspaceListPage.js";
import { WorkspaceDashboardPage } from "../features/workspaces/pages/WorkspaceDashboardPage.js";
import { WorkspaceSettingsPage } from "../features/workspaces/pages/WorkspaceSettingsPage.js";
import { BoardViewPage } from "../features/boards/pages/BoardViewPage.js";
import { CardModal } from "../features/boards/components/CardModal/CardModal.js";
import { BoardDetailsPanel } from "../features/boards/components/BoardDetailsPanel.js";
import { NotificationsPage } from "../pages/NotificationsPage.js";
import { ProfileSettingsPage } from "../pages/ProfileSettingsPage.js";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/2fa-challenge", element: <TwoFactorChallengePage /> },
  { path: "/auth/oauth-callback", element: <OAuthCallbackPage /> },

  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/workspaces" replace /> },
          { path: "workspaces", element: <WorkspaceListPage /> },
          { path: "workspaces/:workspaceId", element: <WorkspaceDashboardPage /> },
          { path: "workspaces/:workspaceId/settings", element: <WorkspaceSettingsPage /> },
          {
            path: "boards/:boardId",
            element: <BoardViewPage />,
            children: [
              { path: "cards/:cardId", element: <CardModal /> },
              { path: "details", element: <BoardDetailsPanel /> },
            ],
          },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "settings/profile", element: <ProfileSettingsPage /> },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/workspaces" replace /> },
]);
