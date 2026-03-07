import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Navbar from '../../components/public/Navbar'
import Footer from '../../components/public/Footer'
import { Search, GraduationCap, Users, Award, BookOpen, Star, Trophy, Crown, ChevronRight } from 'lucide-react'

const DEPT_CONFIG = {
  GEI: { label: 'Génie Électrique et Informatique', color: '#2A2AE0', bg: 'rgba(42,42,224,0.08)' },
  GC:  { label: 'Génie Civil',                      color: '#008751', bg: 'rgba(0,135,81,0.08)' },
  GMP: { label: 'Génie Mécanique et Production',    color: '#F0C040', bg: 'rgba(240,192,64,0.1)' },
  GE:  { label: 'Génie Énergétique',                color: '#E8112D', bg: 'rgba(232,17,45,0.08)' },
  MS:  { label: 'Maintenance de Systèmes',           color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
}

function getDeptConfig(candidate) {
  if (candidate.department_slug && DEPT_CONFIG[candidate.department_slug]) {
    return DEPT_CONFIG[candidate.department_slug]
  }
  const found = Object.values(DEPT_CONFIG).find(d =>
    d.label.toLowerCase() === candidate.department?.toLowerCase()
  )
  return found || { label: candidate.department || 'Département', color: '#2A2AE0', bg: 'rgba(42,42,224,0.08)' }
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

// ─── Carte Candidat enrichie ──────────────────────────────────────────────────
function CandidateCard({ candidate }) {
  const dept       = getDeptConfig(candidate)
  const slug       = candidate.department_slug || 'GEI'
  const isLeader   = candidate.is_leader
  const phase      = candidate.current_phase || 1

  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden border transition-all duration-300 relative"
      style={{
        borderColor: isLeader ? 'rgba(240,192,64,0.4)' : 'rgba(42,42,224,0.08)',
        boxShadow: isLeader
          ? '0 8px 32px rgba(240,192,64,0.2)'
          : '0 2px 16px rgba(42,42,224,0.05)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = isLeader ? 'rgba(240,192,64,0.7)' : dept.color + '40'
        e.currentTarget.style.boxShadow = isLeader
          ? '0 20px 48px rgba(240,192,64,0.25)'
          : `0 20px 48px ${dept.color}18`
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isLeader ? 'rgba(240,192,64,0.4)' : 'rgba(42,42,224,0.08)'
        e.currentTarget.style.boxShadow = isLeader
          ? '0 8px 32px rgba(240,192,64,0.2)'
          : '0 2px 16px rgba(42,42,224,0.05)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Bandeau doré Leader */}
      {isLeader && (
        <div
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center gap-2 py-1.5 text-[10px] font-black uppercase tracking-widest"
          style={{ background: 'linear-gradient(90deg, #F0C040, #FFD700, #F0C040)', color: '#08081A' }}
        >
          <Crown size={11} />
          Champion UNEXE
          <Crown size={11} />
        </div>
      )}

      {/* Photo */}
      <div
        className="relative overflow-hidden"
        style={{ height: isLeader ? '240px' : '224px', background: isLeader ? 'linear-gradient(135deg, #F0C040 0%, #FFD700 100%)' : dept.bg, marginTop: isLeader ? '28px' : '0' }}
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
              style={{ fontFamily: '"Playfair Display", serif', color: isLeader ? '#08081A' : dept.color }}
            >
              {candidate.name?.charAt(0)}
            </span>
          </div>
        )}

        {/* Badge département */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
          style={{ background: isLeader ? '#08081A' : dept.color, color: isLeader ? '#F0C040' : 'white' }}
        >
          {slug}
        </div>

        {/* Badge année */}
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold"
          style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}
        >
          {candidate.year === '1' ? '1ère année' : '2ème année'}
        </div>

        {/* Badge phase (si > 1 et pas leader) */}
        {!isLeader && phase > 1 && (
          <div
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1"
            style={{ background: 'rgba(42,42,224,0.85)', color: 'white', backdropFilter: 'blur(8px)' }}
          >
            <Trophy size={9} />
            Phase {phase}
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
        <p className="text-xs font-semibold mb-3" style={{ color: isLeader ? '#D4A800' : dept.color }}>
          {dept.label}
        </p>
        {candidate.filiere && (
          <p className="text-xs text-gray-400 mb-2 font-medium">{candidate.filiere}</p>
        )}
        {candidate.bio && (
          <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: 'rgba(13,13,26,0.5)' }}>
            {candidate.bio}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(42,42,224,0.07)' }}>
          <div className="flex items-center gap-1.5">
            <GraduationCap size={13} style={{ color: dept.color }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(13,13,26,0.4)' }}>
              INSTI Lokossa
            </span>
          </div>
          {isLeader ? (
            <div className="flex items-center gap-1">
              <Crown size={12} style={{ color: '#F0C040' }} fill="#F0C040" />
              <span className="text-[10px] font-black" style={{ color: '#D4A800' }}>Champion</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Star size={12} style={{ color: '#F0C040' }} fill="#F0C040" />
              <span className="text-[10px] font-bold" style={{ color: '#F0C040' }}>
                {phase > 1 ? `Phase ${phase}` : 'Validé'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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

// ─── Bannière Champion si un leader existe ────────────────────────────────────
function LeaderBanner({ leaders }) {
  if (!leaders || leaders.length === 0) return null
  return (
    <div
      className="mb-12 rounded-3xl overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #08081A 0%, #1A1500 50%, #08081A 100%)', border: '1px solid rgba(240,192,64,0.3)' }}
    >
      {/* Reflet doré */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, #F0C040 0%, transparent 60%)'
      }} />
      <div className="relative z-10 px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy size={24} style={{ color: '#F0C040' }} />
          <h3 className="font-black text-xl text-white" style={{ fontFamily: '"Playfair Display", serif' }}>
            Champion{leaders.length > 1 ? 's' : ''} UNEXE
          </h3>
          <Trophy size={24} style={{ color: '#F0C040' }} />
        </div>
        <div className="flex flex-wrap gap-6">
          {leaders.map(leader => (
            <div key={leader.id} className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2" style={{ borderColor: '#F0C040' }}>
                {leader.photo_url
                  ? <img src={leader.photo_url} alt={leader.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl font-black" style={{ background: '#F0C040', color: '#08081A' }}>{leader.name?.charAt(0)}</div>
                }
              </div>
              <div>
                <p className="font-black text-white text-lg" style={{ fontFamily: '"Playfair Display", serif' }}>{leader.name}</p>
                <p className="text-xs font-semibold" style={{ color: '#F0C040' }}>{leader.department}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function CandidatsPublicPage() {
  const navigate = useNavigate()
  const [grouped, setGrouped]       = useState({})
  const [allList, setAllList]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)
  const [search, setSearch]         = useState('')
  const [activeDept, setActiveDept] = useState('TOUS')
  const [activeYear, setActiveYear] = useState('TOUS')

  useEffect(() => {
    window.scrollTo(0, 0)
    api.get('/public/candidates')
      .then(res => {
        const groupedData = res.data.candidates || {}
        setGrouped(groupedData)
        setAllList(Object.values(groupedData).flat())
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const leaders        = allList.filter(c => c.is_leader)
  const highestPhase   = Math.max(...allList.map(c => c.current_phase || 1), 1)

  const filtered = allList.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase())
    const matchDept   = activeDept === 'TOUS' || c.department_slug === activeDept || c.department === activeDept
    const matchYear   = activeYear === 'TOUS' || c.year === activeYear
    return matchSearch && matchDept && matchYear
  })

  // Leaders en premier, puis tri par phase décroissante
  const sortedFiltered = [...filtered].sort((a, b) => {
    if (a.is_leader && !b.is_leader) return -1
    if (!a.is_leader && b.is_leader) return 1
    return (b.current_phase || 1) - (a.current_phase || 1)
  })

  const filteredGrouped = sortedFiltered.reduce((acc, c) => {
    const key = c.department || 'Autre'
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  const availableDepts = Object.keys(grouped)
  const totalCount     = allList.length

  return (
    <div className="min-h-screen" style={{ background: '#F7F7FC', fontFamily: '"DM Sans", "Segoe UI", sans-serif' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden pt-32 pb-20 px-6"
        style={{ background: 'linear-gradient(135deg, #08081A 0%, #0D0D2B 55%, #1A1A6A 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='92' viewBox='0 0 80 92' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='40,3 77,23 77,69 40,89 3,69 3,23' fill='none' stroke='%232A2AE0' stroke-width='1.5'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 92px',
        }} />
        <div className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #2A2AE0 0%, transparent 70%)', filter: 'blur(100px)' }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <Tag light>Nos Candidats</Tag>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Les talents de<br />
            <span style={{ color: '#A5A5FF' }}>l'INSTI Lokossa</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl leading-relaxed mb-8">
            Découvrez les candidats UNEXE sélectionnés parmi les meilleurs étudiants.
          </p>

          <div className="flex flex-wrap gap-6">
            {[
              { icon: Users,    val: totalCount || '—', label: 'Candidats en lice' },
              { icon: BookOpen, val: availableDepts.length || '—', label: 'Départements' },
              { icon: Trophy,   val: highestPhase > 1 ? `Phase ${highestPhase}` : '—', label: 'Phase actuelle' },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(42,42,224,0.25)', color: '#A5A5FF' }}>
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

      {/* ── FILTRES ── */}
      <section className="sticky top-20 z-30 px-6 py-4 border-b"
        style={{ background: 'rgba(247,247,252,0.97)', backdropFilter: 'blur(16px)', borderColor: 'rgba(42,42,224,0.1)' }}>
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(42,42,224,0.4)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un candidat..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
              style={{ background: '#FFFFFF', border: '1.5px solid rgba(42,42,224,0.12)', color: '#0D0D1A' }}
              onFocus={e => e.target.style.borderColor = 'rgba(42,42,224,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(42,42,224,0.12)'}
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveDept('TOUS')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: activeDept === 'TOUS' ? '#2A2AE0' : 'rgba(42,42,224,0.05)',
                  color: activeDept === 'TOUS' ? '#FFFFFF' : 'rgba(13,13,26,0.55)',
                  border: `1.5px solid ${activeDept === 'TOUS' ? '#2A2AE0' : 'rgba(42,42,224,0.1)'}`,
                }}
              >
                Tous
              </button>
              {availableDepts.map(deptName => {
                const slug = Object.entries(DEPT_CONFIG).find(([, v]) =>
                  v.label.toLowerCase() === deptName.toLowerCase()
                )?.[0] || deptName
                const conf    = DEPT_CONFIG[slug] || { color: '#2A2AE0' }
                const isActive = activeDept === deptName
                return (
                  <button key={deptName} onClick={() => setActiveDept(deptName)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: isActive ? conf.color : 'rgba(42,42,224,0.05)',
                      color: isActive ? '#FFFFFF' : 'rgba(13,13,26,0.55)',
                      border: `1.5px solid ${isActive ? conf.color : 'rgba(42,42,224,0.1)'}`,
                    }}
                  >
                    {slug}
                  </button>
                )
              })}
            </div>

            <div className="w-px h-5 bg-gray-200" />

            <div className="flex flex-wrap gap-1.5">
              {[
                { val: 'TOUS', label: 'Toutes années' },
                { val: '1',    label: '1ère année' },
                { val: '2',    label: '2ème année' },
              ].map(y => (
                <button key={y.val} onClick={() => setActiveYear(y.val)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: activeYear === y.val ? '#0D0D1A' : 'rgba(42,42,224,0.05)',
                    color: activeYear === y.val ? '#FFFFFF' : 'rgba(13,13,26,0.55)',
                    border: `1.5px solid ${activeYear === y.val ? '#0D0D1A' : 'rgba(42,42,224,0.1)'}`,
                  }}
                >
                  {y.label}
                </button>
              ))}
            </div>

            <p className="ml-auto text-xs font-semibold" style={{ color: 'rgba(13,13,26,0.35)' }}>
              {filtered.length} candidat{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </section>

      {/* ── CONTENU ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">

        {loading && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-lg font-bold" style={{ color: '#0D0D1A' }}>Impossible de charger les candidats</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Bannière champion si leader */}
            <LeaderBanner leaders={leaders} />

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-5"
                  style={{ background: 'rgba(42,42,224,0.07)' }}>
                  <Search size={32} style={{ color: '#2A2AE0' }} />
                </div>
                <p className="text-lg font-bold mb-1" style={{ color: '#0D0D1A' }}>
                  {allList.length === 0 ? 'Aucun candidat pour le moment' : 'Aucun résultat'}
                </p>
                <p className="text-sm" style={{ color: 'rgba(13,13,26,0.4)' }}>
                  {allList.length === 0
                    ? 'Les candidatures sont en cours de traitement.'
                    : 'Modifiez vos filtres pour voir plus de résultats.'}
                </p>
                {(search || activeDept !== 'TOUS' || activeYear !== 'TOUS') && (
                  <button
                    onClick={() => { setSearch(''); setActiveDept('TOUS'); setActiveYear('TOUS') }}
                    className="mt-4 px-5 py-2.5 text-sm font-bold text-white rounded-xl"
                    style={{ background: '#2A2AE0' }}
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-14">
                {Object.entries(filteredGrouped).map(([deptName, candidates]) => {
                  const slug = Object.entries(DEPT_CONFIG).find(([, v]) =>
                    v.label.toLowerCase() === deptName.toLowerCase()
                  )?.[0] || ''
                  const conf = DEPT_CONFIG[slug] || { color: '#2A2AE0' }

                  return (
                    <div key={deptName}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-8 w-1.5 rounded-full" style={{ background: conf.color }} />
                        <div>
                          <span className="font-black text-xl"
                            style={{ fontFamily: '"Playfair Display", serif', color: conf.color }}>
                            {slug || deptName}
                          </span>
                          <span className="text-sm ml-3 font-medium" style={{ color: 'rgba(13,13,26,0.4)' }}>
                            {deptName} · {candidates.length} candidat{candidates.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {candidates.map(c => <CandidateCard key={c.id} candidate={c} />)}
                      </div>
                    </div>
                  )
                })}
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