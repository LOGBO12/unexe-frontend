import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Auth
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import InvitationPage from '../pages/auth/InvitationPage'
import CompleteProfilePage from '../pages/auth/CompleteProfilePage'

// Layouts
import MainLayout from '../layouts/MainLayout'
import EspaceCandidatLayout from '../layouts/EspaceCandidatLayout'

// Public
import HomePage from '../pages/public/HomePage'
import CandidatsPublicPage from '../pages/public/CandidatsPublicPage'
import PartenairesPublicPage from '../pages/public/PartenairesPublicPage'

// Admin
import DashboardPage from '../pages/admin/DashboardPage'
import InvitationsPage from '../pages/admin/InvitationsPage'
import CandidaturesPage from '../pages/admin/CandidaturesPage'
import CandidatsAdminPage from '../pages/admin/CandidatsPage'
import ComiteMembresPage from '../pages/admin/ComiteMembresPage'
import ComitePageEditor from '../pages/admin/ComitePageEditor'
import PartenairesAdminPage from '../pages/admin/PartenairesPage'
import LogsPage from '../pages/admin/LogsPage'
import ForumPage from '../pages/admin/ForumPage'
import ProfilePage from '../pages/admin/ProfilePage'
import RegistrationSettingsPage from '../pages/admin/RegistrationSettingsPage'
import CompetitionPage from '../pages/admin/CompetitionPage'

// Candidat
import CandidatDashboard from '../pages/candidat/CandidatDashboard'
import CandidatProfil from '../pages/candidat/CandidatProfil'
import ForumCommunaute from '../pages/candidat/ForumCommunaute'
import DeposerDossier from '../pages/candidat/DeposerDossier'
import MesResultats from '../pages/candidat/MesResultats'

/* ───────────────────────────── */
/* Private Route */
/* ───────────────────────────── */

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    if (user.role === 'candidat') return <Navigate to="/espace-candidat" replace />
    return <Navigate to="/dashboard" replace />
  }

  return children
}

/* ───────────────────────────── */
/* Guest Route */
/* ───────────────────────────── */

function GuestRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (!user) return children

  if (user.role === 'candidat') {
    if (!user.is_profile_complete) {
      return <Navigate to="/complete-profile" replace />
    }
    return <Navigate to="/espace-candidat" replace />
  }

  return <Navigate to="/dashboard" replace />
}

/* ───────────────────────────── */
/* Candidate Validated Route */
/* ───────────────────────────── */

function ValidatedCandidateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (!user) return <Navigate to="/login" replace />

  if (user?.candidate?.status !== 'validated') {
    return <Navigate to="/espace-candidat" replace />
  }

  return children
}

/* ───────────────────────────── */
/* Router */
/* ───────────────────────────── */

export default function AppRouter() {
  const { loading } = useAuth()

  if (loading) return <LoadingSpinner />

  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/candidats" element={<CandidatsPublicPage />} />
        <Route path="/partenaires" element={<PartenairesPublicPage />} />

        <Route path="/communaute" element={<Navigate to="/espace-candidat/forum" replace />} />
        <Route path="/comite" element={<Navigate to="/" replace />} />

        {/* Auth */}
        <Route path="/login" element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }/>

        <Route path="/register" element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }/>

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/invitation/:token" element={<InvitationPage />} />

        <Route path="/complete-profile" element={
          <PrivateRoute roles={['candidat']}>
            <CompleteProfilePage />
          </PrivateRoute>
        }/>

        {/* Admin */}
        <Route path="/dashboard/*" element={
          <PrivateRoute roles={['super_admin','comite']}>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="invitations" element={<InvitationsPage />} />
          <Route path="candidatures" element={<CandidaturesPage />} />
          <Route path="candidats" element={<CandidatsAdminPage />} />
          <Route path="competition" element={<CompetitionPage />} />
          <Route path="comite" element={<ComiteMembresPage />} />
          <Route path="partenaires" element={<PartenairesAdminPage />} />
          <Route path="forum" element={<ForumPage />} />

          <Route path="registration" element={
            <PrivateRoute roles={['super_admin']}>
              <RegistrationSettingsPage />
            </PrivateRoute>
          }/>

          <Route path="comite/page" element={
            <PrivateRoute roles={['super_admin']}>
              <ComitePageEditor />
            </PrivateRoute>
          }/>

          <Route path="logs" element={
            <PrivateRoute roles={['super_admin']}>
              <LogsPage />
            </PrivateRoute>
          }/>

        </Route>

        <Route path="/profil" element={
          <PrivateRoute roles={['super_admin','comite']}>
            <ProfilePage />
          </PrivateRoute>
        }/>

        {/* Candidat */}
        <Route path="/espace-candidat/*" element={
          <PrivateRoute roles={['candidat']}>
            <EspaceCandidatLayout />
          </PrivateRoute>
        }>

          <Route index element={<CandidatDashboard />} />
          <Route path="dossier" element={<DeposerDossier />} />
          <Route path="profil" element={<CandidatProfil />} />

          <Route path="resultats" element={
            <ValidatedCandidateRoute>
              <MesResultats />
            </ValidatedCandidateRoute>
          }/>

          <Route path="forum" element={
            <ValidatedCandidateRoute>
              <ForumCommunaute />
            </ValidatedCandidateRoute>
          }/>

        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}