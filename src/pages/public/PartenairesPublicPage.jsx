import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Navbar from '../../components/public/Navbar'
import Footer from '../../components/public/Footer'
import { ExternalLink, Mail, Phone, Globe, Star, Award, Zap, Heart } from 'lucide-react'

// ─── Config des niveaux de partenariat ───────────────────────────────────────
const TIER_CONFIG = {
  or:       { label: 'Partenaire Or',      color: '#F0C040', bg: 'rgba(240,192,64,0.08)',  border: 'rgba(240,192,64,0.3)',  icon: Star,  size: 'large'  },
  argent:   { label: 'Partenaire Argent',  color: '#9CA3AF', bg: 'rgba(156,163,175,0.07)', border: 'rgba(156,163,175,0.25)', icon: Award, size: 'medium' },
  bronze:   { label: 'Partenaire Bronze',  color: '#CD7F32', bg: 'rgba(205,127,50,0.07)',  border: 'rgba(205,127,50,0.25)', icon: Zap,   size: 'small'  },
  soutien:  { label: 'Partenaire Soutien', color: '#2A2AE0', bg: 'rgba(42,42,224,0.06)',   border: 'rgba(42,42,224,0.2)',   icon: Heart, size: 'small'  },
}

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

// ─── Carte partenaire ─────────────────────────────────────────────────────────
function PartnerCard({ partner, size = 'medium' }) {
  const tier = TIER_CONFIG[partner.tier] || TIER_CONFIG.soutien
  const isLarge  = size === 'large'
  const isMedium = size === 'medium'

  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden border transition-all duration-400 flex flex-col"
      style={{
        borderColor: tier.border,
        boxShadow: `0 4px 20px ${tier.color}10`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 20px 50px ${tier.color}25`
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.borderColor = tier.color + '60'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 4px 20px ${tier.color}10`
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = tier.border
      }}
    >
      {/* Bande colorée tier */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${tier.color}, ${tier.color}80)` }} />

      {/* Logo */}
      <div
        className="flex items-center justify-center p-8"
        style={{
          minHeight: isLarge ? '180px' : isMedium ? '140px' : '110px',
          background: tier.bg,
        }}
      >
        {partner.logo_url ? (
          <img
            src={partner.logo_url}
            alt={partner.name}
            className="max-h-20 max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            style={{ filter: 'none' }}
          />
        ) : (
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl font-black"
              style={{ background: tier.color + '20', color: tier.color, fontFamily: '"Playfair Display", serif' }}
            >
              {partner.name?.charAt(0)}
            </div>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Badge tier */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: tier.color }} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: tier.color }}>
            {tier.label}
          </span>
        </div>

        <h3
          className="font-bold text-base mb-2"
          style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}
        >
          {partner.name}
        </h3>

        {partner.description && (
          <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: 'rgba(13,13,26,0.5)' }}>
            {partner.description}
          </p>
        )}

        {/* Liens */}
        {(partner.website || partner.email) && (
          <div className="flex flex-wrap gap-2 pt-3 border-t mt-auto" style={{ borderColor: `${tier.color}20` }}>
            {partner.website && (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}
              >
                <Globe size={11} />
                Site web
                <ExternalLink size={10} />
              </a>
            )}
            {partner.email && (
              <a
                href={`mailto:${partner.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{ background: 'rgba(42,42,224,0.06)', color: '#2A2AE0', border: '1px solid rgba(42,42,224,0.15)' }}
              >
                <Mail size={11} />
                Contact
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PartnerSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border animate-pulse" style={{ borderColor: 'rgba(42,42,224,0.08)' }}>
      <div className="h-1.5 bg-gray-100" />
      <div className="h-36 bg-gray-50" />
      <div className="p-5 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-5 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function PartenairesPublicPage() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    api.get('/public/partenaires')
      .then(res => setPartners(res.data?.partenaires || res.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // Grouper par tier
  const grouped = partners.reduce((acc, p) => {
    const t = p.tier || 'soutien'
    if (!acc[t]) acc[t] = []
    acc[t].push(p)
    return acc
  }, {})

  const tierOrder = ['or', 'argent', 'bronze', 'soutien']
  const hasData   = !loading && !error && partners.length > 0

  return (
    <div className="min-h-screen" style={{ background: '#F7F7FC', fontFamily: '"DM Sans", "Segoe UI", sans-serif' }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-32 pb-20 px-6"
        style={{ background: 'linear-gradient(135deg, #08081A 0%, #0D0D2B 55%, #1A1A6A 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='92' viewBox='0 0 80 92' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='40,3 77,23 77,69 40,89 3,69 3,23' fill='none' stroke='%232A2AE0' stroke-width='1.5'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 92px',
          }}
        />
        <div
          className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #F0C040 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #2A2AE0 0%, transparent 70%)', filter: 'blur(80px)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <Tag light>Partenaires</Tag>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Ils croient en<br />
            <span style={{ color: '#F0C040' }}>l'excellence</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl leading-relaxed">
            UNEXE est porté par des partenaires engagés dans la promotion du capital humain et de l'excellence académique au Bénin.
          </p>
        </div>
      </section>

      {/* ── TIERS D'EXPLICATION ──────────────────────────────────────────── */}
      <section className="py-14 px-6 border-b" style={{ background: '#FFFFFF', borderColor: 'rgba(42,42,224,0.07)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-center mb-8" style={{ color: 'rgba(13,13,26,0.3)' }}>
            Niveaux de partenariat
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tierOrder.map(t => {
              const conf = TIER_CONFIG[t]
              const Icon = conf.icon
              const count = grouped[t]?.length || 0
              return (
                <div
                  key={t}
                  className="rounded-2xl p-5 border text-center transition-all duration-200"
                  style={{ background: conf.bg, borderColor: conf.border }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: conf.color + '20', color: conf.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <p className="font-black text-sm mb-1" style={{ color: conf.color }}>{conf.label}</p>
                  <p className="text-xs" style={{ color: 'rgba(13,13,26,0.4)' }}>
                    {count > 0 ? `${count} partenaire${count > 1 ? 's' : ''}` : 'Places disponibles'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CONTENU PRINCIPAL ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">

        {/* Loading */}
        {loading && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <PartnerSkeleton key={i} />)}
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-lg font-bold" style={{ color: '#0D0D1A' }}>Impossible de charger les partenaires</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(13,13,26,0.4)' }}>Vérifiez votre connexion et réessayez.</p>
          </div>
        )}

        {/* Aucun partenaire */}
        {!loading && !error && partners.length === 0 && (
          <div className="text-center py-20">
            <div
              className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-5"
              style={{ background: 'rgba(240,192,64,0.1)' }}
            >
              <Star size={32} style={{ color: '#F0C040' }} />
            </div>
            <p className="text-lg font-bold mb-2" style={{ color: '#0D0D1A' }}>Aucun partenaire pour le moment</p>
            <p className="text-sm" style={{ color: 'rgba(13,13,26,0.4)' }}>
              Nous sommes à la recherche de partenaires engagés. Rejoignez l'aventure UNEXE !
            </p>
          </div>
        )}

        {/* Partenaires groupés par tier */}
        {hasData && (
          <div className="space-y-16">
            {tierOrder.map(tier => {
              if (!grouped[tier]?.length) return null
              const conf = TIER_CONFIG[tier]
              const Icon = conf.icon
              return (
                <div key={tier}>
                  {/* En-tête du tier */}
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: conf.color + '15', color: conf.color }}
                    >
                      <Icon size={22} />
                    </div>
                    <div className="flex-1">
                      <h2
                        className="text-2xl font-black leading-none mb-1"
                        style={{ fontFamily: '"Playfair Display", serif', color: conf.color }}
                      >
                        {conf.label}s
                      </h2>
                      <p className="text-xs" style={{ color: 'rgba(13,13,26,0.35)' }}>
                        {grouped[tier].length} partenaire{grouped[tier].length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex-1 h-px ml-4" style={{ background: `linear-gradient(90deg, ${conf.color}30, transparent)` }} />
                  </div>

                  {/* Grille selon le tier */}
                  <div className={`grid gap-5 ${
                    tier === 'or'
                      ? 'sm:grid-cols-2 md:grid-cols-3'
                      : tier === 'argent'
                      ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                      : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  }`}>
                    {grouped[tier].map(p => (
                      <PartnerCard key={p.id} partner={p} size={conf.size} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── SECTION DEVENIR PARTENAIRE ───────────────────────────────────── */}
      <section
        className="py-20 px-6"
        style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A1A4A 100%)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Tag light>Rejoindre l'aventure</Tag>
              <h2
                className="text-3xl md:text-4xl font-black text-white mb-4"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Devenez partenaire<br />
                <span style={{ color: '#F0C040' }}>UNEXE</span>
              </h2>
              <p className="text-white/50 leading-relaxed">
                Soutenez l'excellence académique à l'INSTI Lokossa et bénéficiez d'une visibilité auprès des meilleurs étudiants et futurs talents du Bénin.
              </p>
            </div>
            <div
              className="rounded-3xl p-8 border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(240,192,64,0.2)' }}
            >
              <h3 className="text-white font-bold text-lg mb-6">Nous contacter</h3>
              <div className="space-y-4">
                <a
                  href="mailto:contact@unexe.bj"
                  className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(42,42,224,0.15)', color: '#A5A5FF' }}
                  >
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-0.5">Email</p>
                    <p className="text-sm font-semibold group-hover:text-white transition-colors">contact@unexe.bj</p>
                  </div>
                </a>
                <a
                  href="tel:+22900000000"
                  className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,135,81,0.15)', color: '#4DC896' }}
                  >
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-0.5">Téléphone</p>
                    <p className="text-sm font-semibold group-hover:text-white transition-colors">+229 00 00 00 00</p>
                  </div>
                </a>
                <a
                  href="https://unexe.bj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(240,192,64,0.15)', color: '#F0C040' }}
                  >
                    <Globe size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-0.5">Site web</p>
                    <p className="text-sm font-semibold group-hover:text-white transition-colors">unexe.bj</p>
                  </div>
                </a>
              </div>
              <a
                href="mailto:contact@unexe.bj"
                className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-white rounded-2xl transition-all duration-200 hover:scale-105"
                style={{ background: '#F0C040', color: '#0D0D1A' }}
              >
                Devenir partenaire →
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  )
}