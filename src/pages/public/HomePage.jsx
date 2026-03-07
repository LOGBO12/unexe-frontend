import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import Navbar from '../../components/public/Navbar'
import Footer from '../../components/public/Footer'
import { useRegistrationStatus } from '../../hooks/useRegistrationStatus'
import {
  ChevronRight, Award, Users, BookOpen, Globe, ArrowRight, Target, Zap,
  Trophy, Cpu, Home, Sparkles, GraduationCap, Building2, Medal, Star,
  ExternalLink, Clock, Lock, AlertTriangle, Crown
} from 'lucide-react'

// ─── Composants utilitaires ───────────────────────────────────────────────────
function Tag({ children, light = false }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-5"
      style={
        light
          ? { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.2)' }
          : { background: 'rgba(42,42,224,0.09)', color: '#2A2AE0', border: '1px solid rgba(42,42,224,0.2)' }
      }
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: light ? 'rgba(255,255,255,0.7)' : '#2A2AE0' }} />
      {children}
    </span>
  )
}

function Title({ children, light = false, className = '' }) {
  return (
    <h2
      className={`text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-5 ${className}`}
      style={{ fontFamily: '"Playfair Display", Georgia, serif', color: light ? '#FFFFFF' : '#0D0D1A' }}
    >
      {children}
    </h2>
  )
}

function Divider() {
  return <div className="w-full border-t" style={{ borderColor: 'rgba(42,42,224,0.08)' }} />
}

function StatCard({ value, label, icon: Icon, color = '#2A2AE0' }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-[#2A2AE0] to-transparent opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500" />
      <div className="relative p-6 rounded-2xl border border-gray-100 group-hover:border-[#2A2AE0]/20 transition-all duration-300 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
        <p className="text-3xl md:text-4xl font-black text-[#0D0D1A] mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>{value}</p>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</p>
      </div>
    </div>
  )
}

function PartnerLogoCard({ partner }) {
  const logoUrl = partner.logo_url || (partner.logo ? `/storage/${partner.logo}` : null)
  return (
    <div
      className="group relative flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 cursor-default"
      style={{ width: '200px', height: '160px', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', flexShrink: 0 }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(240,192,64,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.25)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {logoUrl ? (
        <img src={logoUrl} alt={partner.name} className="object-contain transition-all duration-300"
          style={{ maxWidth: '140px', maxHeight: '80px', filter: 'opacity(0.6)' }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'opacity(1)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'opacity(0.6)' }}
          onError={e => { e.target.style.display = 'none'; const fb = e.target.nextElementSibling; if (fb) fb.style.display = 'flex' }}
        />
      ) : null}
      <div style={{ display: logoUrl ? 'none' : 'flex', width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', fontFamily: '"Playfair Display", serif', fontSize: '28px', fontWeight: 900, color: 'rgba(255,255,255,0.5)' }}>
        {partner.name?.charAt(0)}
      </div>
      <p className="absolute bottom-3 text-center px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] font-bold uppercase tracking-widest truncate w-full" style={{ color: '#F0C040' }}>
        {partner.name}
      </p>
      {partner.website && (
        <a href={partner.website} target="_blank" rel="noopener noreferrer" className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <ExternalLink size={12} style={{ color: 'rgba(240,192,64,0.8)' }} />
        </a>
      )}
    </div>
  )
}

function CountUnit({ value, label, urgent }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{
          background: urgent ? 'rgba(232,17,45,0.15)' : 'rgba(255,255,255,0.08)',
          border: `1.5px solid ${urgent ? 'rgba(232,17,45,0.35)' : 'rgba(255,255,255,0.15)'}`,
          backdropFilter: 'blur(12px)',
          boxShadow: urgent ? '0 0 20px rgba(232,17,45,0.2)' : '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <div className="absolute left-0 right-0 top-1/2 -translate-y-px h-px"
          style={{ background: urgent ? 'rgba(232,17,45,0.2)' : 'rgba(255,255,255,0.08)' }} />
        <span
          className="relative z-10 text-2xl sm:text-3xl font-black tabular-nums leading-none"
          style={{
            color: urgent ? '#ff6b6b' : 'white',
            fontFamily: '"Playfair Display", serif',
            textShadow: urgent ? '0 0 20px rgba(232,17,45,0.5)' : '0 2px 12px rgba(0,0,0,0.4)',
          }}
        >
          {String(value ?? 0).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.18em] mt-2"
        style={{ color: urgent ? 'rgba(255,107,107,0.6)' : 'rgba(255,255,255,0.3)' }}>
        {label}
      </span>
    </div>
  )
}

function HeroCountdown({ user }) {
  const navigate = useNavigate()
  const { isOpen, deadline, formatted, closedMessage, loaded } = useRegistrationStatus()

  if (!loaded) return (
    <div className="flex gap-3">
      {[0,1,2,3].map(i => (
        <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl animate-pulse"
          style={{ background: 'rgba(255,255,255,0.05)' }} />
      ))}
    </div>
  )

  const { days, hours, minutes, seconds } = formatted
  const hasDeadline = isOpen && !!deadline
  const isUrgent    = hasDeadline && days === 0 && hours < 24

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl border"
          style={{ background: 'rgba(232,17,45,0.08)', borderColor: 'rgba(232,17,45,0.25)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2.5">
            <Lock size={18} style={{ color: '#E8112D' }} />
            <span className="text-base font-black uppercase tracking-wider" style={{ color: '#E8112D' }}>
              Inscriptions fermées
            </span>
          </div>
          {closedMessage && (
            <p className="text-sm text-center max-w-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {closedMessage}
            </p>
          )}
        </div>
        <button
          onClick={() => document.querySelector('#comite')?.scrollIntoView({ behavior: 'smooth' })}
          className="group flex items-center gap-2 px-8 py-4 font-bold text-sm text-white rounded-full transition-all duration-300 hover:scale-105"
          style={{ background: '#2A2AE0', boxShadow: '0 10px 40px rgba(42,42,224,0.4)' }}
        >
          Découvrir le projet
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    )
  }

  if (hasDeadline) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider"
          style={{
            background: isUrgent ? 'rgba(232,17,45,0.12)' : 'rgba(240,192,64,0.1)',
            border: `1px solid ${isUrgent ? 'rgba(232,17,45,0.3)' : 'rgba(240,192,64,0.25)'}`,
            color: isUrgent ? '#ff6b6b' : '#F0C040',
          }}
        >
          {isUrgent
            ? <><AlertTriangle size={12} /> Clôture imminente des inscriptions</>
            : <><Clock size={12} /> Les inscriptions ferment dans</>
          }
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {[
            { value: days,    label: 'Jours' },
            { value: hours,   label: 'Heures' },
            { value: minutes, label: 'Min' },
            { value: seconds, label: 'Sec' },
          ].map((unit, i, arr) => (
            <div key={unit.label} className="flex items-center gap-2 sm:gap-3">
              <CountUnit value={unit.value} label={unit.label} urgent={isUrgent} />
              {i < arr.length - 1 && (
                <span className="text-2xl font-black mb-6 tabular-nums"
                  style={{ color: isUrgent ? 'rgba(232,17,45,0.3)' : 'rgba(255,255,255,0.2)' }}>:</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Clôture le{' '}
          <span style={{ color: isUrgent ? '#ff6b6b' : 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
            {new Date(deadline).toLocaleDateString('fr-FR', {
              weekday: 'long', day: '2-digit', month: 'long',
              year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-center mt-1">
          <button onClick={() => navigate('/register')}
            className="group flex items-center gap-2 px-8 py-4 font-bold text-sm text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{ background: '#2A2AE0', boxShadow: '0 10px 40px rgba(42,42,224,0.5)' }}>
            S'inscrire maintenant
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => document.querySelector('#comite')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 font-bold text-sm text-white/70 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:text-white hover:bg-white/10">
            Découvrir le projet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm mb-4 sm:mb-0 sm:hidden"
        style={{ background: 'rgba(77,200,150,0.12)', border: '1px solid rgba(77,200,150,0.25)', color: '#4DC896' }}>
        <span className="relative flex w-2 h-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#4DC896' }} />
          <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: '#4DC896' }} />
        </span>
        Inscriptions ouvertes
      </div>
      <button onClick={() => document.querySelector('#comite')?.scrollIntoView({ behavior: 'smooth' })}
        className="group flex items-center gap-2 px-8 py-4 font-bold text-sm text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        style={{ background: '#2A2AE0', boxShadow: '0 10px 40px rgba(42,42,224,0.5)' }}>
        Découvrir le projet
        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
      {user ? (
        <button onClick={() => navigate(user.role === 'candidat' ? '/espace-candidat' : '/dashboard')}
          className="px-8 py-4 font-bold text-sm text-white/80 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:text-white hover:bg-white/10">
          Mon espace →
        </button>
      ) : (
        <button onClick={() => navigate('/register')}
          className="group flex items-center gap-2 px-8 py-4 font-bold text-sm text-white/80 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:text-white hover:bg-white/10">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#4DC896' }} />
            <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: '#4DC896' }} />
          </span>
          Rejoindre le concours
        </button>
      )}
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isOpen, loaded } = useRegistrationStatus()
  const [visible, setVisible]         = useState(false)
  const [committeeData, setCommitteeData] = useState(null)
  const [partners, setPartners]       = useState([])
  const [leaders, setLeaders]         = useState([])   // ← ICI dans le composant

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    api.get('/public/committee')
      .then(res => setCommitteeData({ page: res.data.page ?? null, members: res.data.members ?? [] }))
      .catch(() => {})
    api.get('/public/partners')
      .then(res => setPartners(res.data || []))
      .catch(() => {})
    // ← Fetch leaders ICI dans le composant
    api.get('/public/candidates')
      .then(res => {
        const all = Object.values(res.data.candidates || {}).flat()
        setLeaders(all.filter(c => c.is_leader))
      })
      .catch(() => {})
  }, [])

  const { page, members } = committeeData || {}

  const fade = (delay) => ({
    opacity: 0,
    animation: visible ? `unexeFadeUp 0.7s ease forwards ${delay}s` : 'none',
  })

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF', fontFamily: '"DM Sans", "Segoe UI", sans-serif' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#08081A] via-[#0D0D2B] to-[#1A1A4B]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="absolute top-20 left-10 w-[500px] h-[500px] rounded-full bg-[#2A2AE0] opacity-20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full bg-[#F0C040] opacity-10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 py-24">
          <div style={fade(0.1)} className="flex justify-center mb-8">
            <div className="relative">
              <img src="/unexe-logo.jpeg" alt="UNEXE Logo" className="w-28 h-28 object-contain drop-shadow-2xl"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML += '<div class="w-28 h-28 bg-[#2A2AE0] rounded-2xl flex items-center justify-center text-white text-4xl font-black">U</div>'
                }}
              />
              <div className="absolute -inset-4 bg-[#2A2AE0] opacity-20 blur-2xl rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <div style={fade(0.2)}><Tag light>INSTI Lokossa · Bénin</Tag></div>
          <div style={fade(0.35)}>
            <h1 className="font-black leading-none tracking-tight mb-4"
              style={{
                fontSize: 'clamp(4rem, 15vw, 9rem)',
                fontFamily: '"Playfair Display", Georgia, serif',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #B8B8FF 50%, #FFFFFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              UNEXE
            </h1>
          </div>
          <div style={fade(0.5)} className="mb-4">
            <p className="text-lg font-light uppercase tracking-[0.3em] text-white/50">University Excellence Elite</p>
          </div>
          <div style={fade(0.6)} className="mb-10">
            <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
              Le concours d'excellence académique qui révèle et récompense les meilleurs étudiants de l'INSTI Lokossa.
            </p>
          </div>
          <div style={fade(0.75)}>
            <HeroCountdown user={user} />
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="text-[8px] tracking-[0.3em] uppercase text-white/20">SCROLL</span>
              <div className="w-px h-12 bg-gradient-to-b from-[#2A2AE0] to-transparent animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Tag>EN CHIFFRES</Tag>
            <Title>L'excellence en <span className="text-[#2A2AE0]">chiffres</span></Title>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard value="5" label="Départements" icon={Building2} color="#2A2AE0" />
            <StatCard value="2" label="Niveaux d'étude" icon={GraduationCap} color="#F0C040" />
            <StatCard value="3" label="Phases du concours" icon={Zap} color="#E8112D" />
            <StatCard value="1" label="Champion par édition" icon={Medal} color="#008751" />
          </div>
        </div>
      </section>

      {/* ── COMITÉ ── */}
      <section id="comite" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <Tag>LE COMITÉ</Tag>
              <Title>L'équipe qui donne <br /><span className="text-[#2A2AE0]">vie au concours</span></Title>
              <p className="text-gray-500 text-lg leading-relaxed">
                {page?.project_description || "UNEXE est porté par des étudiants passionnés de l'INSTI Lokossa, engagés pour valoriser l'excellence académique au Bénin."}
              </p>
            </div>
            {page?.vision && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#2A2AE0] to-[#F0C040] rounded-3xl blur opacity-30" />
                <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                  <Target className="w-8 h-8 text-[#2A2AE0] mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">NOTRE VISION</p>
                  <p className="text-gray-700 text-lg leading-relaxed">{page.vision}</p>
                </div>
              </div>
            )}
          </div>
          {page?.objectives?.length > 0 && (
            <div className="mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-center text-gray-400 mb-8">NOS OBJECTIFS</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {page.objectives.map((obj, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-[#2A2AE0]/10 flex items-center justify-center text-[#2A2AE0] font-black mb-4">{i + 1}</div>
                    <p className="text-gray-600 leading-relaxed">{obj}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {page?.team_photo_url && (
            <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
              <img src={page.team_photo_url} alt="Photo d'ensemble du comité UNEXE"
                className="w-full object-cover" style={{ maxHeight: '420px' }}
                onError={e => { e.target.style.display = 'none' }} />
            </div>
          )}
          {members?.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-center text-gray-400 mb-8">MEMBRES FONDATEURS</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {members.map(member => (
                  <div key={member.id} className="group">
                    <div className="relative mb-4 rounded-2xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-[#2A2AE0] to-[#1A1A8B]">
                      {member.photo_url
                        ? <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center"><span className="text-6xl font-black text-white/30">{member.name?.charAt(0)}</span></div>
                      }
                    </div>
                    <h3 className="font-bold text-lg text-[#0D0D1A] mb-1">{member.name}</h3>
                    <p className="text-[#2A2AE0] text-sm font-semibold mb-2">{member.position}</p>
                    {member.bio && <p className="text-gray-500 text-sm line-clamp-2">{member.bio}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Divider />

      {/* ── CANDIDATS ── */}
      <section id="candidats" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {leaders.length > 0 ? (
            /* Champion(s) révélé(s) */
            <div>
              <div className="text-center mb-12">
                <Tag>RÉSULTATS FINAUX</Tag>
                <Title>
                  Le{leaders.length > 1 ? 's' : ''} champion{leaders.length > 1 ? 's' : ''} <br />
                  <span className="text-[#D4A800]">UNEXE {new Date().getFullYear()}</span>
                </Title>
              </div>
              <div className="flex flex-wrap justify-center gap-8 mb-10">
                {leaders.map(leader => (
                  <div key={leader.id} className="relative rounded-3xl overflow-hidden text-center"
                    style={{ width: '260px', background: 'linear-gradient(135deg, #08081A, #1A1500)', border: '2px solid rgba(240,192,64,0.4)', boxShadow: '0 20px 60px rgba(240,192,64,0.15)' }}>
                    <div className="flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest"
                      style={{ background: 'linear-gradient(90deg, #F0C040, #FFD700)', color: '#08081A' }}>
                      <Crown size={11} /> Champion UNEXE <Crown size={11} />
                    </div>
                    <div className="p-6">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4 border-2" style={{ borderColor: '#F0C040' }}>
                        {leader.photo_url
                          ? <img src={leader.photo_url} alt={leader.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ background: '#F0C040', color: '#08081A' }}>{leader.name?.charAt(0)}</div>
                        }
                      </div>
                      <h3 className="font-black text-white text-xl mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>{leader.name}</h3>
                      <p className="text-xs font-semibold" style={{ color: '#F0C040' }}>{leader.department}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button onClick={() => navigate('/candidats')}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-[#2A2AE0] text-white font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-lg">
                  Voir tous les candidats <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            /* Affichage normal */
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Tag>NOS CANDIDATS</Tag>
                <Title>Les meilleurs <br /><span className="text-[#2A2AE0]">étudiants en licence prof</span></Title>
                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                  Découvrez les candidats UNEXE sélectionnés parmi les meilleurs étudiants des 5 départements de l'INSTI Lokossa.
                </p>
                <button onClick={() => navigate('/candidats')}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-[#2A2AE0] text-white font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Voir tous les candidats
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { code: 'GEI', name: 'Génie Électrique & Informatique', color: '#2A2AE0', icon: Cpu },
                  { code: 'GC',  name: 'Génie Civil',                     color: '#008751', icon: Home },
                  { code: 'GMP', name: 'Génie Mécanique et Production',   color: '#F0C040', icon: Zap },
                  { code: 'GE',  name: 'Génie Energétique',               color: '#E8112D', icon: Target },
                  { code: 'MS',  name: 'Maintenance des Systèmes',        color: '#9333EA', icon: Cpu },
                ].map(dept => {
                  const Icon = dept.icon
                  return (
                    <div key={dept.code} className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-[#2A2AE0]/20 transition-all cursor-default">
                      <Icon className="w-8 h-8 mb-3" style={{ color: dept.color }} />
                      <p className="text-2xl font-black mb-1" style={{ fontFamily: '"Playfair Display", serif', color: dept.color }}>{dept.code}</p>
                      <p className="text-xs text-gray-400">{dept.name}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── PARTENAIRES ── */}
      <section id="partenaires" className="py-24 overflow-hidden" style={{ background: '#0D0D1A' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full border"
              style={{ borderColor: 'rgba(240,192,64,0.2)', background: 'rgba(240,192,64,0.05)' }}>
              <Star size={12} style={{ color: '#F0C040' }} fill="#F0C040" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: '#F0C040' }}>Ils nous font confiance</span>
            </div>
            <h2 className="font-black text-white mb-4"
              style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}>
              Nos partenaires
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Des institutions et entreprises engagées pour valoriser l'excellence académique au Bénin.
            </p>
          </div>
          {partners.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-5 mb-14">
              {partners.sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99)).map(partner => (
                <PartnerLogoCard key={partner.id} partner={partner} />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-5 mb-14">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-2xl border flex items-center justify-center"
                  style={{ width:'200px', height:'160px', borderColor:'rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>
                  <Star size={22} style={{ color:'rgba(255,255,255,0.08)' }} />
                </div>
              ))}
            </div>
          )}
          <div className="relative mb-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 text-[10px] font-black uppercase tracking-[0.2em]"
                style={{ background: '#0D0D1A', color: 'rgba(255,255,255,0.2)' }}>
                UNEXE · INSTI Lokossa
              </span>
            </div>
          </div>
          <div className="text-center">
            <button onClick={() => navigate('/partenaires')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105"
              style={{ border: '2px solid rgba(240,192,64,0.3)', color: '#F0C040' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F0C040'; e.currentTarget.style.color = '#0D0D1A'; e.currentTarget.style.borderColor = '#F0C040' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#F0C040'; e.currentTarget.style.borderColor = 'rgba(240,192,64,0.3)' }}>
              Voir tous nos partenaires <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── À PROPOS ── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Tag>À PROPOS</Tag>
            <Title>Un concours conçu pour <br /><span className="text-[#2A2AE0]">élever les ambitions</span></Title>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: 'La mission',    text: "Identifier et valoriser les étudiants les plus méritants de l'INSTI Lokossa à travers un processus rigoureux et équitable." },
              { icon: Award,    title: 'Le processus',  text: 'Trois phases distinctes : candidature, sélection par le comité, et compétition finale devant jury.' },
              { icon: Globe,    title: 'La récompense', text: 'Reconnaissance institutionnelle, visibilité auprès des partenaires et intégration dans la communauté UNEXE.' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="group p-8 rounded-2xl border border-gray-100 hover:border-[#2A2AE0]/20 hover:shadow-xl transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#2A2AE0]/10 flex items-center justify-center text-[#2A2AE0] mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0D0D1A] mb-2">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      {!user && loaded && isOpen && (
        <section className="py-24 bg-gradient-to-r from-[#2A2AE0] to-[#1A1A8B]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Sparkles className="w-12 h-12 text-white/30 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Prêt à prouver votre excellence ?
            </h2>
            <p className="text-white/60 text-lg mb-10">Inscrivez-vous dès maintenant pour participer au concours UNEXE.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/register')}
                className="px-8 py-4 bg-white text-[#2A2AE0] font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group">
                S'inscrire maintenant
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate('/login')}
                className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300">
                Se connecter
              </button>
            </div>
          </div>
        </section>
      )}

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes unexeFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}