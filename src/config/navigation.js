import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  Building2,
  MessageSquare,
  Shield,
  ScrollText,
  Settings,
  Timer,
  UserPlus,
  Trophy,
} from 'lucide-react'

const navigation = [
  {
    path:  '/dashboard',
    icon:  LayoutDashboard,
    label: 'Tableau de bord',
    roles: ['super_admin', 'comite'],
    dividerAfter: false,
  },
  {
    path:  '/dashboard/candidatures',
    icon:  FileText,
    label: 'Candidatures',
    roles: ['super_admin', 'comite'],
    dividerAfter: false,
  },
  {
    path:  '/dashboard/candidats',
    icon:  UserCheck,
    label: 'Candidats',
    roles: ['super_admin', 'comite'],
    dividerAfter: false,
  },
  {
    path:  '/dashboard/competition',
    icon:  Trophy,
    label: 'Concours',
    roles: ['super_admin', 'comite'],
    dividerAfter: false,
  },
  {
    path:  '/dashboard/invitations',
    icon:  UserPlus,
    label: 'Invitations',
    roles: ['super_admin', 'comite'],
    dividerAfter: false,
  },
  {
    path:  '/dashboard/comite',
    icon:  Shield,
    label: 'Membres du comité',
    roles: ['super_admin'],
    dividerAfter: false,
  },
  {
    path:  '/dashboard/partenaires',
    icon:  Building2,
    label: 'Partenaires',
    roles: ['super_admin', 'comite'],
    dividerAfter: false,
  },
  {
    path:  '/dashboard/forum',
    icon:  MessageSquare,
    label: 'Forum',
    roles: ['super_admin', 'comite'],
    dividerAfter: true,
  },

  // ── Section super_admin uniquement ──────────────────────────────────────
  {
    path:  '/dashboard/registration',
    icon:  Timer,
    label: 'Inscriptions',
    roles: ['super_admin'],
    dividerAfter: false,
    badge: 'Admin',
  },
  {
    path:  '/dashboard/comite/page',
    icon:  Settings,
    label: 'Page comité',
    roles: ['super_admin'],
    dividerAfter: false,
  },
  {
    path:  '/dashboard/logs',
    icon:  ScrollText,
    label: 'Journaux',
    roles: ['super_admin'],
    dividerAfter: false,
  },
]

export default navigation