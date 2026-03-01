import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import Navbar from '../../components/public/Navbar'
import Footer from '../../components/public/Footer'
import { ChevronRight, Award, Users, BookOpen, Globe, ArrowRight, Target, Zap, Trophy, Cpu, Home, BarChart3, Sparkles, GraduationCap, Building2, Medal, Star } from 'lucide-react'

// ─── Section Tag ──────────────────────────────────────────────────────────────
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

// ─── Section Title ────────────────────────────────────────────────────────────
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

// ─── Cobalt Divider ───────────────────────────────────────────────────────────
function Divider() {
  return <div className="w-full border-t" style={{ borderColor: 'rgba(42,42,224,0.08)' }} />
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
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

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [committeeData, setCommitteeData] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    api.get('/public/committee')
      .then(res => setCommitteeData(res.data))
      .catch(() => {})
  }, [])

  const { page, members } = committeeData || {}

  const fade = (delay) => ({
    opacity: 0,
    animation: visible ? `unexeFadeUp 0.7s ease forwards ${delay}s` : 'none',
  })

  return (
    <div
      className="min-h-screen"
      style={{ background: '#FFFFFF', fontFamily: '"DM Sans", "Segoe UI", sans-serif' }}
    >
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Nouveau design moderne
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#08081A] via-[#0D0D2B] to-[#1A1A4B]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Orbes lumineux */}
        <div className="absolute top-20 left-10 w-[500px] h-[500px] rounded-full bg-[#2A2AE0] opacity-20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full bg-[#F0C040] opacity-10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Contenu */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 py-24">
          {/* Logo avec image */}
          <div style={fade(0.1)} className="flex justify-center mb-8">
            <div className="relative">
              {/* ICI TU METTRAS LE CHEMIN DE TON LOGO */}
              <img 
                src="/unexe-logo.jpeg" 
                alt="UNEXE Logo" 
                className="w-28 h-28 object-contain drop-shadow-2xl"
                onError={(e) => {
                  // Fallback si l'image n'existe pas
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML += '<div class="w-28 h-28 bg-[#2A2AE0] rounded-2xl flex items-center justify-center text-white text-4xl font-black">U</div>';
                }}
              />
              <div className="absolute -inset-4 bg-[#2A2AE0] opacity-20 blur-2xl rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* Badge */}
          <div style={fade(0.2)}>
            <Tag light>INSTI Lokossa · Bénin</Tag>
          </div>

          {/* Titre principal */}
          <div style={fade(0.35)}>
            <h1
              className="font-black leading-none tracking-tight mb-4"
              style={{
                fontSize: 'clamp(4rem, 15vw, 9rem)',
                fontFamily: '"Playfair Display", Georgia, serif',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #B8B8FF 50%, #FFFFFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              UNEXE
            </h1>
          </div>

          {/* Sous-titre */}
          <div style={fade(0.5)} className="mb-4">
            <p className="text-lg font-light uppercase tracking-[0.3em] text-white/50">
              University Excellence Elite
            </p>
          </div>

          {/* Description */}
          <div style={fade(0.6)} className="mb-12">
            <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
              Le concours d'excellence académique qui révèle et récompense les meilleurs étudiants de l'INSTI Lokossa.
            </p>
          </div>

          {/* CTA */}
          <div style={fade(0.75)} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => { const el = document.querySelector('#comite'); if(el) el.scrollIntoView({ behavior: 'smooth' }) }}
              className="group flex items-center gap-2 px-8 py-4 font-bold text-sm text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ background: '#2A2AE0', boxShadow: '0 10px 40px rgba(42,42,224,0.5)' }}
            >
              Découvrir le projet
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            {user ? (
              <button
                onClick={() => navigate(user.role === 'candidat' ? '/espace-candidat' : '/dashboard')}
                className="px-8 py-4 font-bold text-sm text-white/80 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:text-white hover:bg-white/10"
              >
                Mon espace →
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 font-bold text-sm text-white/80 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:text-white hover:bg-white/10"
              >
                Rejoindre le concours
              </button>
            )}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="text-[8px] tracking-[0.3em] uppercase text-white/20">SCROLL</span>
              <div className="w-px h-12 bg-gradient-to-b from-[#2A2AE0] to-transparent animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="stats" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Tag>EN CHIFFRES</Tag>
            <Title>
              L'excellence en <span className="text-[#2A2AE0]">chiffres</span>
            </Title>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard value="5" label="Départements" icon={Building2} color="#2A2AE0" />
            <StatCard value="2" label="Niveaux d'étude" icon={GraduationCap} color="#F0C040" />
            <StatCard value="3" label="Phases du concours" icon={Zap} color="#E8112D" />
            <StatCard value="1" label="Champion par édition" icon={Medal} color="#008751" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION COMITÉ
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="comite" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* En-tête */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <Tag>LE COMITÉ</Tag>
              <Title>
                L'équipe qui donne <br />
                <span className="text-[#2A2AE0]">vie au concours</span>
              </Title>
              <p className="text-gray-500 text-lg leading-relaxed">
                {page?.project_description || 'UNEXE est porté par des étudiants passionnés de l\'INSTI Lokossa, engagés pour valoriser l\'excellence académique au Bénin.'}
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

          {/* Objectifs */}
          {page?.objectives?.length > 0 && (
            <div className="mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-center text-gray-400 mb-8">NOS OBJECTIFS</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {page.objectives.map((obj, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-[#2A2AE0]/10 flex items-center justify-center text-[#2A2AE0] font-black mb-4">
                      {i + 1}
                    </div>
                    <p className="text-gray-600 leading-relaxed">{obj}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Membres */}
          {members?.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-center text-gray-400 mb-8">MEMBRES FONDATEURS</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {members.map(member => (
                  <div key={member.id} className="group">
                    <div className="relative mb-4 rounded-2xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-[#2A2AE0] to-[#1A1A8B]">
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl font-black text-white/30">{member.name?.charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION CANDIDATS
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="candidats" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Tag>NOS CANDIDATS</Tag>
              <Title>
                Les meilleurs <br />
                <span className="text-[#2A2AE0]">étudiants en licence prof</span>
              </Title>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Découvrez les candidats UNEXE sélectionnés parmi les meilleurs étudiants des 5 départements de l'INSTI Lokossa.
              </p>
              <button
                onClick={() => navigate('/candidats')}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-[#2A2AE0] text-white font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Voir tous les candidats
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { code: 'GEI', name: 'Génie Électrique & Informatique', color: '#2A2AE0', icon: Cpu },
                { code: 'GC', name: 'Génie Civil', color: '#008751', icon: Home },
                { code: 'GMP', name: 'Génie Mécanique et Production', color: '#F0C040', icon: Zap },
                { code: 'GE', name: 'Génie Energétique', color: '#E8112D', icon: Target },
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
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION PARTENAIRES
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="partenaires" className="py-24 bg-[#0D0D1A]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Tag light>PARTENAIRES</Tag>
          <Title light>
            Ils soutiennent <br />
            <span className="text-[#F0C040]">l'excellence</span>
          </Title>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12">
            UNEXE est rendu possible grâce au soutien de partenaires engagés dans la promotion de l'excellence académique.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-video rounded-xl border border-gray-800 bg-white/5 backdrop-blur-sm flex items-center justify-center hover:border-[#F0C040]/30 transition-all group">
                <Star className="w-8 h-8 text-gray-600 group-hover:text-[#F0C040] transition-colors" />
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/partenaires')}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#F0C040]/30 text-[#F0C040] font-bold rounded-full hover:bg-[#F0C040] hover:text-[#0D0D1A] transition-all"
          >
            Voir nos partenaires
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION À PROPOS
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Tag>À PROPOS</Tag>
            <Title>
              Un concours conçu pour <br />
              <span className="text-[#2A2AE0]">élever les ambitions</span>
            </Title>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: 'La mission', text: 'Identifier et valoriser les étudiants les plus méritants de l\'INSTI Lokossa à travers un processus rigoureux et équitable.' },
              { icon: Award, title: 'Le processus', text: 'Trois phases distinctes : candidature, sélection par le comité, et compétition finale devant jury.' },
              { icon: Globe, title: 'La récompense', text: 'Reconnaissance institutionnelle, visibilité auprès des partenaires et intégration dans la communauté UNEXE.' },
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

      {/* ══════════════════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════════════════ */}
      {!user && (
        <section className="py-24 bg-gradient-to-r from-[#2A2AE0] to-[#1A1A8B]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Sparkles className="w-12 h-12 text-white/30 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Prêt à prouver votre excellence ?
            </h2>
            <p className="text-white/60 text-lg mb-10">
              Inscrivez-vous dès maintenant pour participer au concours UNEXE.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-white text-[#2A2AE0] font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group"
              >
                S'inscrire maintenant
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300"
              >
                Se connecter
              </button>
            </div>
          </div>
        </section>
      )}

      <Footer />

      {/* Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes unexeFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}