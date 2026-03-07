import { useEffect, useState } from 'react'
import api from '../../api/axios'
import {
  Trophy, Star, TrendingUp, Crown, X,
  ChevronRight, RefreshCw, Lock, Loader2
} from 'lucide-react'

const STATUS_CONFIG = {
  pending:    { label: 'En attente',  color: '#F0C040', bg: 'rgba(240,192,64,0.1)' },
  continuing: { label: 'Qualifié ✓', color: '#4DC896', bg: 'rgba(77,200,150,0.1)' },
  eliminated: { label: 'Éliminé',    color: '#E8112D', bg: 'rgba(232,17,45,0.1)' },
  leader:     { label: 'Leader 🏆',  color: '#F0C040', bg: 'rgba(240,192,64,0.15)' },
}

function ScoreBar({ score }) {
  if (score === null || score === undefined) return null
  const pct = Math.min(100, (score / 20) * 100)
  const color = score >= 14 ? '#4DC896' : score >= 10 ? '#F0C040' : '#E8112D'
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-2xl font-black" style={{ color, fontFamily: '"Playfair Display", serif' }}>
          {score}<span className="text-sm font-normal text-gray-300">/20</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function MesResultats() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/my-scores')
      setData(res.data)
    } catch (e) {
      // Si 404 = pas encore de phases ou pas de candidature
      if (e.response?.status === 404) {
        setData(null)
      } else {
        setError(true)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin" style={{ color: '#2A2AE0' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
        <p className="text-gray-400">Impossible de charger vos résultats.</p>
      </div>
    )
  }

  // Pas encore de concours ou pas de notes
  if (!data || data.scores.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
            Mes Résultats
          </h1>
          <p className="text-gray-400 text-sm mt-1">Suivez votre progression dans le concours</p>
        </div>
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <Trophy size={48} className="mx-auto mb-4" style={{ color: 'rgba(42,42,224,0.15)' }} />
          <h3 className="text-lg font-bold text-gray-700 mb-2">Pas encore de résultats</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Le concours n'a pas encore démarré ou vos notes ne sont pas encore disponibles.
            Revenez plus tard !
          </p>
        </div>
      </div>
    )
  }

  const { candidate, scores, active_phase } = data
  const isEliminated = candidate?.is_visible === false
  const isLeader     = candidate?.is_leader

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
            Mes Résultats
          </h1>
          <p className="text-gray-400 text-sm mt-1">Votre progression dans le concours UNEXE</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Bannière statut global */}
      {isLeader && (
        <div
          className="relative overflow-hidden rounded-3xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #0D0D2B, #2A2AE0)' }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #F0C040 0%, transparent 70%)' }} />
          <Crown size={40} className="mx-auto mb-3 text-yellow-400" />
          <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
            🏆 Félicitations, vous êtes un Leader UNEXE !
          </h2>
          <p className="text-white/60 text-sm">
            Vous avez brillamment traversé toutes les phases du concours.
          </p>
        </div>
      )}

      {isEliminated && (
        <div
          className="rounded-3xl p-5 border flex items-start gap-4"
          style={{ background: 'rgba(232,17,45,0.04)', borderColor: 'rgba(232,17,45,0.15)' }}
        >
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'rgba(232,17,45,0.08)' }}>
            🔒
          </div>
          <div>
            <p className="font-bold text-gray-800">Votre parcours s'est arrêté à la phase {candidate.current_phase}</p>
            <p className="text-sm text-gray-400 mt-0.5">
              Vous avez été éliminé lors de cette phase. Votre profil n'est plus visible publiquement.
            </p>
          </div>
        </div>
      )}

      {!isEliminated && !isLeader && active_phase && (
        <div
          className="rounded-2xl p-4 border flex items-center gap-3"
          style={{ background: 'rgba(42,42,224,0.04)', borderColor: 'rgba(42,42,224,0.12)' }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
            style={{ background: '#2A2AE0' }}>
            {active_phase.phase_number}
          </div>
          <p className="text-sm text-gray-700 font-medium">
            Phase en cours : <strong>{active_phase.name}</strong>
          </p>
        </div>
      )}

      {/* Scores par phase */}
      <div className="space-y-4">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Résultats par phase</p>

        {scores.map((s, i) => {
          const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending
          const hasScore = s.score !== null && s.score !== undefined
          const isNotYet = !hasScore

          return (
            <div
              key={i}
              className="bg-white rounded-2xl border p-5 transition-all"
              style={{
                borderColor: isNotYet ? 'rgba(42,42,224,0.07)' : `${cfg.color}30`,
                boxShadow: isNotYet ? 'none' : `0 4px 20px ${cfg.color}10`,
              }}
            >
              {/* En-tête phase */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                    style={{ background: cfg.color }}
                  >
                    {s.status === 'leader' ? '🏆' : s.phase_number}
                  </span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{s.phase_name}</p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Classement */}
                {hasScore && s.rank && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Classement</p>
                    <p className="font-black text-lg" style={{ color: '#0D0D1A' }}>
                      #{s.rank}
                      <span className="text-xs font-normal text-gray-400">/{s.total_graded}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Note */}
              {hasScore ? (
                <>
                  <ScoreBar score={s.score} />
                  {s.comment && (
                    <div className="mt-3 p-3 rounded-xl text-xs text-gray-500 leading-relaxed"
                      style={{ background: 'rgba(42,42,224,0.04)', border: '1px solid rgba(42,42,224,0.07)' }}>
                      💬 <span className="italic">{s.comment}</span>
                    </div>
                  )}
                  {s.graded_at && (
                    <p className="text-[10px] text-gray-300 mt-2">
                      Noté le {new Date(s.graded_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  Note pas encore attribuée
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}