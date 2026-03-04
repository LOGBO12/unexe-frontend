import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'

import LoginPage           from '../pages/auth/LoginPage'
import RegisterPage        from '../pages/auth/RegisterPage'
import ForgotPasswordPage  from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage   from '../pages/auth/ResetPasswordPage'
import InvitationPage      from '../pages/auth/InvitationPage'
import CompleteProfilePage from '../pages/auth/CompleteProfilePage'

import MainLayout from '../layouts/MainLayout'

// Pages publiques
import HomePage              from '../pages/public/HomePage'
import CandidatsPublicPage   from '../pages/public/CandidatsPublicPage'
import PartenairesPublicPage from '../pages/public/PartenairesPublicPage'

// Pages admin
import DashboardPage        from '../pages/admin/DashboardPage'
import InvitationsPage      from '../pages/admin/InvitationsPage'
import CandidaturesPage     from '../pages/admin/CandidaturesPage'
import CandidatsAdminPage   from '../pages/admin/CandidatsPage'
import ComiteMembresPage    from '../pages/admin/ComiteMembresPage'
import ComitePageEditor     from '../pages/admin/ComitePageEditor'
import PartenairesAdminPage from '../pages/admin/PartenairesPage'
import LogsPage             from '../pages/admin/LogsPage'
import ForumPage            from '../pages/admin/ForumPage'
import ProfilePage          from '../pages/admin/ProfilePage'

// Pages candidat
import EspaceCandidatLayout from '../layouts/EspaceCandidatLayout'
import CandidatDashboard    from '../pages/candidat/CandidatDashboard'
import CandidatProfil       from '../pages/candidat/CandidatProfil'
import ForumCommunaute      from '../pages/candidat/ForumCommunaute'
import DeposerDossier       from '../pages/candidat/DeposerDossier'

// ─────────────────────────────────────────────────────────────────────────────

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user)   return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'candidat')    return <Navigate to="/espace-candidat" replace />
    if (user.role === 'comite')      return <Navigate to="/dashboard" replace />
    if (user.role === 'super_admin') return <Navigate to="/dashboard" replace />
    return <Navigate to="/login" replace />
  }
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user)   return children
  if (user.role === 'candidat') {
    if (!user.is_profile_complete) return <Navigate to="/complete-profile" replace />
    return <Navigate to="/espace-candidat" replace />
  }
  return <Navigate to="/dashboard" replace />
}

/**
 * Route forum : accessible uniquement aux candidats validés
 * Les non-validés sont redirigés vers le dashboard candidat
 */
function ValidatedCandidateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user)   return <Navigate to="/login" replace />
  const isValidated = user.candidate?.status === 'validated'
  if (!isValidated) return <Navigate to="/espace-candidat" replace />
  return children
}

export default function AppRouter() {
  const { loading } = useAuth()
  if (loading) return <LoadingSpinner />

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Pages publiques ─────────────────────────────────────────── */}
        <Route path="/"            element={<HomePage />} />
        <Route path="/candidats"   element={<CandidatsPublicPage />} />
        <Route path="/partenaires" element={<PartenairesPublicPage />} />
        <Route path="/communaute"  element={<Navigate to="/espace-candidat/forum" replace />} />
        <Route path="/comite"      element={<Navigate to="/" replace />} />

        {/* ── Auth ────────────────────────────────────────────────────── */}
        <Route path="/login"                 element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"              element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/invitation/:token"     element={<InvitationPage />} />

        <Route path="/complete-profile" element={
          <PrivateRoute roles={['candidat']}>
            <CompleteProfilePage />
          </PrivateRoute>
        } />

        {/* ── Espace Admin ────────────────────────────────────────────── */}
        <Route element={
          <PrivateRoute roles={['super_admin', 'comite']}>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route path="/dashboard"              element={<DashboardPage />} />
          <Route path="/dashboard/invitations"  element={<InvitationsPage />} />
          <Route path="/dashboard/candidatures" element={<CandidaturesPage />} />
          <Route path="/dashboard/candidats"    element={<CandidatsAdminPage />} />
          <Route path="/dashboard/comite"       element={<ComiteMembresPage />} />
          <Route path="/dashboard/partenaires"  element={<PartenairesAdminPage />} />
          <Route path="/dashboard/forum"        element={<ForumPage />} />
          <Route path="/profil"                 element={<ProfilePage />} />
          <Route path="/dashboard/comite/page"  element={
            <PrivateRoute roles={['super_admin']}>
              <ComitePageEditor />
            </PrivateRoute>
          } />
          <Route path="/dashboard/logs" element={
            <PrivateRoute roles={['super_admin']}>
              <LogsPage />
            </PrivateRoute>
          } />
        </Route>

        {/* ── Espace Candidat ─────────────────────────────────────────── */}
        <Route element={
          <PrivateRoute roles={['candidat']}>
            <EspaceCandidatLayout />
          </PrivateRoute>
        }>
          {/* Accessible à tous les candidats */}
          <Route path="/espace-candidat"         element={<CandidatDashboard />} />
          <Route path="/espace-candidat/dossier" element={<DeposerDossier />} />
          <Route path="/espace-candidat/profil"  element={<CandidatProfil />} />

          {/* Accessible aux candidats validés uniquement */}
          <Route path="/espace-candidat/forum" element={
            <ValidatedCandidateRoute>
              <ForumCommunaute />
            </ValidatedCandidateRoute>
          } />
        </Route>

        {/* ── Fallback ────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}