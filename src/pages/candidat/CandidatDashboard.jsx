import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import {
  GraduationCap, MessageSquare, User,
  ChevronRight, Star, CheckCircle, Clock,
  Megaphone, ArrowRight, BookOpen, Zap
} from 'lucide-react'

// ─── Mini composants ──────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div
      className="rounded-3xl p-5 border flex items-center gap-4"
      style={{ background: '#FFFFFF', borderColor: 'rgba(42,42,224,0.07)', boxShadow: '0 2px 12px rgba(42,42,224,0.04)' }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>{value}</p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}

function TopicRow({ topic, onClick }) {
  const isAnnouncement = topic.type === 'announcement'
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-200 text-left group"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: isAnnouncement ? 'rgba(232,17,45,0.08)' : 'rgba(42,42,224,0.08)',
          color: isAnnouncement ? '#E8112D' : '#2A2AE0',
        }}
      >
        {isAnnouncement ? <Megaphone size={16} /> : <MessageSquare size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {isAnnouncement && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(232,17,45,0.1)', color: '#E8112D' }}>
              Officiel
            </span>
          )}
          {topic.is_pinned && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(240,192,64,0.12)', color: '#F0C040' }}>
              📌 Épinglé
            </span>
          )}
        </div>
        <p className="font-semibold text-sm text-gray-800 truncate group-hover:text-[#2A2AE0] transition-colors">
          {topic.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {topic.author?.name} · {topic.replies_count} réponse{topic.replies_count !== 1 ? 's' : ''} · {topic.created_at}
        </p>
      </div>
      <ChevronRight size={14} className="text-gray-300 group-hover:text-[#2A2AE0] transition-colors mt-2 flex-shrink-0" />
    </button>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function CandidatDashboard() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [topics, setTopics]   = useState([])
  const [stats, setStats]     = useState({})
  const [loading, setLoading] = useState(true)

  const candidate = user?.candidate
  const dept      = candidate?.department?.name || '—'
  const slug      = candidate?.department?.slug || '—'
  const year      = candidate?.year === '1' ? '1ère année' : '2ème année'
  const photo     = user?.avatar ? `/storage/${user.avatar}` : null

  useEffect(() => {
    api.get('/forum/topics?per_page=5')
      .then(res => {
        setTopics(res.data.topics?.data || [])
        setStats(res.data.stats || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── HERO BIENVENUE ───────────────────────────────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden p-8"
        style={{ background: 'linear-gradient(135deg, #08081A 0%, #1A1A4B 60%, #2A2AE0 100%)' }}
      >
        {/* Motif hexagone */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='69' viewBox='0 0 60 69' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='30,2 58,17 58,52 30,67 2,52 2,17' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 69px',
        }} />
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A5A5FF 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2A2AE0, #A5A5FF)', boxShadow: '0 8px 32px rgba(42,42,224,0.4)' }}>
            {photo ? (
              <img src={photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl"
                style={{ fontFamily: '"Playfair Display", serif' }}>
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="text-white/40 text-sm font-medium mb-1">{greeting} 👋</p>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2"
              style={{ fontFamily: '"Playfair Display", serif' }}>
              {user?.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(42,42,224,0.3)', color: '#A5A5FF', border: '1px solid rgba(165,165,255,0.3)' }}>
                {slug} — {dept}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(240,192,64,0.2)', color: '#F0C040', border: '1px solid rgba(240,192,64,0.3)' }}>
                {year}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5"
                style={{ background: 'rgba(0,200,100,0.2)', color: '#4DC896', border: '1px solid rgba(77,200,150,0.3)' }}>
                <CheckCircle size={10} />
                Candidat validé
              </span>
            </div>
          </div>

          {/* CTA profil */}
          <button
            onClick={() => navigate('/espace-candidat/profil')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-2xl transition-all duration-200 hover:scale-105 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
          >
            <User size={15} />
            Mon profil
          </button>
        </div>
      </div>

      {/* ── STATS ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Topics actifs"
          value={stats.total_topics ?? '—'}
          icon={MessageSquare}
          color="#2A2AE0"
          bg="rgba(42,42,224,0.08)"
        />
        <StatCard
          label="Annonces"
          value={stats.total_announcements ?? '—'}
          icon={Megaphone}
          color="#E8112D"
          bg="rgba(232,17,45,0.08)"
        />
        <StatCard
          label="Discussions"
          value={stats.total_discussions ?? '—'}
          icon={BookOpen}
          color="#008751"
          bg="rgba(0,135,81,0.08)"
        />
        <StatCard
          label="Réponses"
          value={stats.total_replies ?? '—'}
          icon={Zap}
          color="#F0C040"
          bg="rgba(240,192,64,0.1)"
        />
      </div>

      {/* ── DEUX COLONNES ────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Derniers topics — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-3xl border overflow-hidden"
          style={{ borderColor: 'rgba(42,42,224,0.07)', boxShadow: '0 2px 12px rgba(42,42,224,0.04)' }}>

          <div className="px-6 py-4 flex items-center justify-between border-b"
            style={{ borderColor: 'rgba(42,42,224,0.06)' }}>
            <h2 className="font-black text-base" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
              Derniers échanges
            </h2>
            <button
              onClick={() => navigate('/espace-candidat/forum')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#2A2AE0] hover:underline"
            >
              Voir tout <ArrowRight size={12} />
            </button>
          </div>

          <div className="p-3">
            {loading ? (
              <div className="space-y-3 p-2">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topics.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun échange pour l'instant</p>
              </div>
            ) : (
              topics.map(t => (
                <TopicRow
                  key={t.id}
                  topic={t}
                  onClick={() => navigate('/espace-candidat/forum', { state: { topicId: t.id } })}
                />
              ))
            )}
          </div>
        </div>

        {/* Infos candidat — 1/3 */}
        <div className="space-y-4">

          {/* Carte statut */}
          <div className="bg-white rounded-3xl border p-5"
            style={{ borderColor: 'rgba(42,42,224,0.07)', boxShadow: '0 2px 12px rgba(42,42,224,0.04)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Star size={16} style={{ color: '#F0C040' }} fill="#F0C040" />
              <h3 className="font-black text-sm" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
                Mon statut
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Nom complet',    val: user?.name },
                { label: 'Département',   val: dept },
                { label: 'Filière',       val: candidate?.filiere || '—' },
                { label: 'Année',         val: year },
                { label: 'Matricule',     val: candidate?.matricule || '—' },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-gray-400 font-medium flex-shrink-0">{row.label}</span>
                  <span className="text-xs font-semibold text-gray-700 text-right truncate">{row.val}</span>
                </div>
              ))}
            </div>

            {/* Statut validé */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(42,42,224,0.07)' }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(0,200,100,0.07)', border: '1px solid rgba(77,200,150,0.2)' }}>
                <CheckCircle size={14} style={{ color: '#4DC896' }} />
                <span className="text-xs font-bold" style={{ color: '#4DC896' }}>Candidature validée</span>
              </div>
            </div>
          </div>

          {/* CTA Forum */}
          <button
            onClick={() => navigate('/espace-candidat/forum')}
            className="w-full rounded-3xl p-5 text-left transition-all duration-300 hover:scale-[1.02] group"
            style={{
              background: 'linear-gradient(135deg, #08081A 0%, #2A2AE0 100%)',
              boxShadow: '0 8px 30px rgba(42,42,224,0.2)',
            }}
          >
            <MessageSquare size={22} className="text-white/60 mb-3 group-hover:text-white transition-colors" />
            <p className="font-black text-white text-sm mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
              Rejoindre la communauté
            </p>
            <p className="text-white/40 text-xs leading-relaxed">
              Posez vos questions, échangez avec les autres candidats et le comité.
            </p>
            <div className="flex items-center gap-1 mt-3 text-[#A5A5FF] text-xs font-bold">
              Accéder au forum <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}