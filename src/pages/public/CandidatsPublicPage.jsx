import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Navbar from '../../components/public/Navbar'
import Footer from '../../components/public/Footer'
import { Search, Filter, GraduationCap, ChevronRight, Users, Award, MapPin, Star, BookOpen } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DEPT_CONFIG = {
  GEI:  { label: 'Génie Électrique & Informatique', color: '#2A2AE0', bg: 'rgba(42,42,224,0.08)' },
  GC:   { label: 'Génie Civil',                     color: '#008751', bg: 'rgba(0,135,81,0.08)' },
  GMP:  { label: 'Génie Mécanique et Production',   color: '#F0C040', bg: 'rgba(240,192,64,0.1)' },
  GE:   { label: 'Génie Énergétique',               color: '#E8112D', bg: 'rgba(232,17,45,0.08)' },
  GT:   { label: 'Génie Thermique',                 color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
  TOUS: { label: 'Tous les départements',           color: '#2A2AE0', bg: 'rgba(42,42,224,0.06)' },
}

const NIVEAU_CONFIG = {
  L1: 'Licence 1',
  L2: 'Licence 2',
  L3: 'Licence 3',
  M1: 'Master 1',
  M2: 'Master 2',
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

// ─── Carte Candidat ───────────────────────────────────────────────────────────
function CandidateCard({ candidate }) {
  const dept = DEPT_CONFIG[candidate.department] || DEPT_CONFIG.GEI

  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden border transition-all duration-400"
      style={{
        borderColor: 'rgba(42,42,224,0.08)',
        boxShadow: '0 2px 16px rgba(42,42,224,0.05)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = dept.color + '40'
        e.currentTarget.style.boxShadow = `0 20px 48px ${dept.color}18`
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(42,42,224,0.08)'
        e.currentTarget.style.boxShadow = '0 2px 16px rgba(42,42,224,0.05)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Photo */}
      <div
        className="relative h-56 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${dept.color}20 0%, ${dept.color}40 100%)` }}
      >
        {candidate.photo_url ? (
          <img
            src={candidate.photo_url}
            alt={candidate.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-7xl font-black opacity-20"
              style={{ fontFamily: '"Playfair Display", serif', color: dept.color }}
            >
              {candidate.name?.charAt(0)}
            </span>
          </div>
        )}

        {/* Badge département */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
          style={{ background: dept.color, color: 'white' }}
        >
          {candidate.department || 'N/A'}
        </div>

        {/* Badge niveau */}
        {candidate.niveau && (
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}
          >
            {candidate.niveau}
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="p-5">
        <h3
          className="font-bold text-lg mb-1 leading-tight"
          style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}
        >
          {candidate.name}
        </h3>
        <p className="text-xs font-semibold mb-3" style={{ color: dept.color }}>
          {dept.label}
        </p>
        {candidate.bio && (
          <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: 'rgba(13,13,26,0.5)' }}>
            {candidate.bio}
          </p>
        )}

        {/* Footer carte */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(42,42,224,0.07)' }}>
          <div className="flex items-center gap-1.5">
            <GraduationCap size={13} style={{ color: dept.color }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(13,13,26,0.4)' }}>
              {NIVEAU_CONFIG[candidate.niveau] || candidate.niveau || 'INSTI Lokossa'}
            </span>
          </div>
          {candidate.is_validated && (
            <div className="flex items-center gap-1">
              <Star size={12} style={{ color: '#F0C040' }} fill="#F0C040" />
              <span className="text-[10px] font-bold" style={{ color: '#F0C040' }}>Validé</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border animate-pulse" style={{ borderColor: 'rgba(42,42,224,0.06)' }}>
      <div className="h-56 bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function CandidatsPublicPage() {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeDept, setActiveDept] = useState('TOUS')
  const [activeNiveau, setActiveNiveau] = useState('TOUS')

  useEffect(() => {
    window.scrollTo(0, 0)
    api.get('/public/candidats')
      .then(res => setCandidates(res.data?.candidats || res.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // Filtrage
  const filtered = candidates.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase())
    const matchDept   = activeDept === 'TOUS' || c.department === activeDept
    const matchNiveau = activeNiveau === 'TOUS' || c.niveau === activeNiveau
    return matchSearch && matchDept && matchNiveau
  })

  const depts   = ['TOUS', ...Object.keys(DEPT_CONFIG).filter(k => k !== 'TOUS')]
  const niveaux = ['TOUS', ...Object.keys(NIVEAU_CONFIG)]

  return (
    <div className="min-h-screen" style={{ background: '#F7F7FC', fontFamily: '"DM Sans", "Segoe UI", sans-serif' }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-32 pb-20 px-6"
        style={{ background: 'linear-gradient(135deg, #08081A 0%, #0D0D2B 55%, #1A1A6A 100%)' }}
      >
        {/* Hexagones de fond */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='92' viewBox='0 0 80 92' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='40,3 77,23 77,69 40,89 3,69 3,23' fill='none' stroke='%232A2AE0' stroke-width='1.5'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 92px',
          }}
        />
        <div
          className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #2A2AE0 0%, transparent 70%)', filter: 'blur(100px)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <Tag light>Nos Candidats</Tag>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Les talents de<br />
            <span style={{ color: '#A5A5FF' }}>l'INSTI Lokossa</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl leading-relaxed mb-8">
            Découvrez les candidats UNEXE sélectionnés parmi les meilleurs étudiants des 5 départements.
          </p>

          {/* Stats rapides */}
          <div className="flex flex-wrap gap-6">
            {[
              { icon: Users,     val: candidates.length || '—', label: 'Candidats' },
              { icon: BookOpen,  val: '5',                      label: 'Départements' },
              { icon: Award,     val: '2',                      label: "Niveaux d'étude" },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(42,42,224,0.25)', color: '#A5A5FF' }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-white font-black text-xl leading-none">{s.val}</p>
                    <p className="text-white/35 text-xs">{s.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FILTRES ──────────────────────────────────────────────────────── */}
      <section className="sticky top-20 z-30 px-6 py-4 border-b" style={{ background: 'rgba(247,247,252,0.97)', backdropFilter: 'blur(16px)', borderColor: 'rgba(42,42,224,0.1)' }}>
        <div className="max-w-6xl mx-auto space-y-3">

          {/* Barre de recherche */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(42,42,224,0.4)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un candidat..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all duration-200"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(42,42,224,0.12)',
                color: '#0D0D1A',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(42,42,224,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(42,42,224,0.12)'}
            />
          </div>

          {/* Filtres département + niveau */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Départements */}
            <div className="flex flex-wrap gap-1.5">
              {depts.map(d => {
                const conf = DEPT_CONFIG[d]
                const isActive = activeDept === d
                return (
                  <button
                    key={d}
                    onClick={() => setActiveDept(d)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
                    style={{
                      background: isActive ? conf.color : 'rgba(42,42,224,0.05)',
                      color:      isActive ? '#FFFFFF'   : 'rgba(13,13,26,0.55)',
                      border:     `1.5px solid ${isActive ? conf.color : 'rgba(42,42,224,0.1)'}`,
                    }}
                  >
                    {d === 'TOUS' ? 'Tous' : d}
                  </button>
                )
              })}
            </div>

            {/* Séparateur */}
            <div className="w-px h-5 bg-gray-200" />

            {/* Niveaux */}
            <div className="flex flex-wrap gap-1.5">
              {niveaux.map(n => {
                const isActive = activeNiveau === n
                return (
                  <button
                    key={n}
                    onClick={() => setActiveNiveau(n)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
                    style={{
                      background: isActive ? '#0D0D1A' : 'rgba(42,42,224,0.05)',
                      color:      isActive ? '#FFFFFF' : 'rgba(13,13,26,0.55)',
                      border:     `1.5px solid ${isActive ? '#0D0D1A' : 'rgba(42,42,224,0.1)'}`,
                    }}
                  >
                    {n === 'TOUS' ? 'Tous niveaux' : n}
                  </button>
                )
              })}
            </div>

            {/* Compteur résultats */}
            <p className="ml-auto text-xs font-semibold" style={{ color: 'rgba(13,13,26,0.35)' }}>
              {filtered.length} candidat{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </section>

      {/* ── GRILLE CANDIDATS ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {/* Loading */}
        {loading && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-lg font-bold" style={{ color: '#0D0D1A' }}>Impossible de charger les candidats</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(13,13,26,0.4)' }}>Vérifiez votre connexion et réessayez.</p>
          </div>
        )}

        {/* Aucun résultat */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <div
              className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-5"
              style={{ background: 'rgba(42,42,224,0.07)' }}
            >
              <Search size={32} style={{ color: '#2A2AE0' }} />
            </div>
            <p className="text-lg font-bold mb-1" style={{ color: '#0D0D1A' }}>Aucun candidat trouvé</p>
            <p className="text-sm" style={{ color: 'rgba(13,13,26,0.4)' }}>
              {candidates.length === 0
                ? 'Les candidatures sont en cours de traitement.'
                : 'Modifiez vos filtres pour voir plus de résultats.'}
            </p>
            {(search || activeDept !== 'TOUS' || activeNiveau !== 'TOUS') && (
              <button
                onClick={() => { setSearch(''); setActiveDept('TOUS'); setActiveNiveau('TOUS') }}
                className="mt-4 px-5 py-2.5 text-sm font-bold text-white rounded-xl"
                style={{ background: '#2A2AE0' }}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {/* Grille */}
        {!loading && !error && filtered.length > 0 && (
          <>
            {/* Groupement par département si "TOUS" */}
            {activeDept === 'TOUS' ? (
              <div className="space-y-14">
                {Object.entries(
                  filtered.reduce((acc, c) => {
                    const d = c.department || 'Autre'
                    if (!acc[d]) acc[d] = []
                    acc[d].push(c)
                    return acc
                  }, {})
                ).map(([dept, list]) => {
                  const conf = DEPT_CONFIG[dept] || { label: dept, color: '#2A2AE0', bg: 'rgba(42,42,224,0.08)' }
                  return (
                    <div key={dept}>
                      {/* Titre département */}
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className="h-8 w-1.5 rounded-full"
                          style={{ background: conf.color }}
                        />
                        <div>
                          <span
                            className="font-black text-xl"
                            style={{ fontFamily: '"Playfair Display", serif', color: conf.color }}
                          >
                            {dept}
                          </span>
                          <span className="text-sm ml-3 font-medium" style={{ color: 'rgba(13,13,26,0.4)' }}>
                            {conf.label} · {list.length} candidat{list.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {list.map(c => <CandidateCard key={c.id} candidate={c} />)}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filtered.map(c => <CandidateCard key={c.id} candidate={c} />)}
              </div>
            )}
          </>
        )}
      </section>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  )
}