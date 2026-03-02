import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, MessageSquare, User, LogOut,
  Menu, X, ChevronRight, Bell, GraduationCap
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/espace-candidat',        icon: LayoutDashboard, label: 'Tableau de bord' },
  { path: '/espace-candidat/forum',  icon: MessageSquare,   label: 'Communauté'     },
  { path: '/espace-candidat/profil', icon: User,            label: 'Mon profil'      },
]

export default function EspaceCandidatLayout() {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  const dept  = user?.candidate?.department?.name || 'INSTI Lokossa'
  const slug  = user?.candidate?.department?.slug || '—'
  const year  = user?.candidate?.year === '1' ? '1ère année' : user?.candidate?.year === '2' ? '2ème année' : '—'
  const photo = user?.avatar ? `/storage/${user.avatar}` : null

  const isActive = (path) => location.pathname === path

  // Fermer le sidebar sur redimensionnement si en desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen flex w-full" style={{ background: '#F0F0F8', fontFamily: '"DM Sans", sans-serif' }}>

      {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out
          lg:fixed lg:left-0 lg:top-0 lg:h-full
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ 
          width: '280px', 
          background: '#08081A', 
          borderRight: '1px solid rgba(255,255,255,0.05)',
          boxShadow: open ? '4px 0 20px rgba(0,0,0,0.3)' : 'none'
        }}
      >
        {/* Logo */}
        <div className="px-6 py-6 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <img
            src="/unexe-logo.jpeg"
            alt="UNEXE"
            className="w-9 h-9 object-contain rounded-xl"
            onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML += '<div style="width:36px;height:36px;background:#2A2AE0;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:16px">U</div>' }}
          />
          <div>
            <p className="font-black text-white text-base leading-none" style={{ fontFamily: '"Playfair Display", serif' }}>UNEXE</p>
            <p className="text-[10px] text-white/30 tracking-widest uppercase mt-0.5">Candidat</p>
          </div>
          <button className="ml-auto lg:hidden text-white/40 hover:text-white" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Profil compact */}
        <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #2A2AE0, #1A1A8B)' }}>
                {photo ? (
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-lg">
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#08081A]" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-bold truncate leading-tight">{user?.name}</p>
              <p className="text-white/30 text-[10px] mt-0.5 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Badges dept + année */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full"
              style={{ background: 'rgba(42,42,224,0.2)', color: '#A5A5FF' }}>
              {slug}
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full"
              style={{ background: 'rgba(240,192,64,0.15)', color: '#F0C040' }}>
              {year}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: active ? 'rgba(42,42,224,0.18)' : 'transparent',
                  color:      active ? '#A5A5FF' : 'rgba(255,255,255,0.45)',
                  border:     active ? '1px solid rgba(42,42,224,0.3)' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {active && <ChevronRight size={13} className="ml-auto" style={{ color: '#A5A5FF' }} />}
              </button>
            )
          })}
        </nav>

        {/* Déconnexion */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 text-white/30 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={17} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── CONTENU PRINCIPAL ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[280px]">
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 h-16"
          style={{
            background: 'rgba(240,240,248,0.97)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(42,42,224,0.08)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-white hover:text-gray-800 transition"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            
            {/* Breadcrumb - visible seulement sur desktop quand sidebar est ouvert */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400 font-medium">
              <span
                className="cursor-pointer hover:text-[#2A2AE0] transition"
                onClick={() => navigate('/espace-candidat')}
              >
                Espace Candidat
              </span>
              {location.pathname !== '/espace-candidat' && (
                <>
                  <ChevronRight size={13} />
                  <span className="text-gray-700">
                    {NAV_ITEMS.find(n => n.path === location.pathname)?.label || ''}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bell (cosmétique) */}
            <div className="relative">
              <button className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white transition">
                <Bell size={18} />
              </button>
            </div>
            
            {/* Avatar avec nom sur desktop */}
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <span className="text-sm text-gray-600 font-medium">{user?.name}</span>
            </div>
            
            <button
              onClick={() => navigate('/espace-candidat/profil')}
              className="w-9 h-9 rounded-xl overflow-hidden hover:ring-2 hover:ring-[#2A2AE0] transition flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2A2AE0, #1A1A8B)' }}
            >
              {photo ? (
                <img src={photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-black text-sm">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Styles additionnels pour le responsive */}
      <style jsx>{`
        @media (min-width: 1024px) {
          aside {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  )
}