import { useEffect, useState } from 'react'
import api from '../../api/axios'
import {
  Trophy, Plus, Play, CheckCheck, Star, Users,
  ChevronRight, RefreshCw, Award, Target, AlertTriangle,
  Loader2, Check, X, Crown, Shield, BarChart2, Lock
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// ─── Constantes ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: 'En attente',  color: '#F0C040', bg: 'rgba(240,192,64,0.1)',  icon: Loader2 },
  continuing: { label: 'Continue',    color: '#4DC896', bg: 'rgba(77,200,150,0.1)',  icon: ChevronRight },
  eliminated: { label: 'Éliminé',     color: '#E8112D', bg: 'rgba(232,17,45,0.1)',   icon: X },
  leader:     { label: 'Leader 🏆',   color: '#F0C040', bg: 'rgba(240,192,64,0.15)', icon: Crown },
}

const PHASE_STATUS = {
  pending:   { label: 'En attente', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
  active:    { label: 'Active',     color: '#4DC896', bg: 'rgba(77,200,150,0.1)' },
  completed: { label: 'Terminée',   color: '#2A2AE0', bg: 'rgba(42,42,224,0.1)' },
}

// ─── Badge statut ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

// ─── Modal de notation ────────────────────────────────────────────────────────
function GradeModal({ candidate, phase, onClose, onSaved }) {
  const [score, setScore]     = useState(candidate.score ?? '')
  const [status, setStatus]   = useState(candidate.status === 'pending' ? '' : candidate.status)
  const [comment, setComment] = useState(candidate.comment ?? '')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)

  const isFinalPhase = phase?.is_final

  const handleSave = async () => {
    if (score === '' || !status) {
      setError('Veuillez entrer une note et une décision.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await api.post(`/competition/scores/${candidate.score_id}`, {
        score:   parseFloat(score),
        status,
        comment,
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la notation.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* En-tête */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1a1a2e, #2A2AE0)' }}>
            {candidate.photo_url
              ? <img src={candidate.photo_url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-white font-black text-xl">
                  {candidate.name?.charAt(0)}
                </div>
            }
          </div>
          <div>
            <p className="font-bold text-gray-900">{candidate.name}</p>
            <p className="text-xs text-gray-400">{candidate.department} · {candidate.year === '1' ? '1ère' : '2ème'} année</p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              ❌ {error}
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Note (sur 20)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={score}
                onChange={e => setScore(e.target.value)}
                placeholder="Ex: 14.5"
                className="w-full px-4 py-3 text-2xl font-black text-center border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg font-bold">/20</span>
            </div>
            {score !== '' && (
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (parseFloat(score) / 20) * 100)}%`,
                    background: parseFloat(score) >= 14 ? '#4DC896'
                              : parseFloat(score) >= 10 ? '#F0C040'
                              : '#E8112D',
                  }}
                />
              </div>
            )}
          </div>

          {/* Décision */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Décision *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {!isFinalPhase && (
                <>
                  <button
                    onClick={() => setStatus('continuing')}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all"
                    style={{
                      borderColor: status === 'continuing' ? '#4DC896' : '#E5E7EB',
                      background:  status === 'continuing' ? 'rgba(77,200,150,0.1)' : 'white',
                      color:       status === 'continuing' ? '#4DC896' : '#6B7280',
                    }}
                  >
                    <ChevronRight size={16} />
                    Continue
                  </button>
                  <button
                    onClick={() => setStatus('eliminated')}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all"
                    style={{
                      borderColor: status === 'eliminated' ? '#E8112D' : '#E5E7EB',
                      background:  status === 'eliminated' ? 'rgba(232,17,45,0.08)' : 'white',
                      color:       status === 'eliminated' ? '#E8112D' : '#6B7280',
                    }}
                  >
                    <X size={16} />
                    Éliminé
                  </button>
                </>
              )}
              {isFinalPhase && (
                <>
                  <button
                    onClick={() => setStatus('leader')}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all"
                    style={{
                      borderColor: status === 'leader' ? '#F0C040' : '#E5E7EB',
                      background:  status === 'leader' ? 'rgba(240,192,64,0.12)' : 'white',
                      color:       status === 'leader' ? '#c79a00' : '#6B7280',
                    }}
                  >
                    <Crown size={16} />
                    Leader 🏆
                  </button>
                  <button
                    onClick={() => setStatus('eliminated')}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all"
                    style={{
                      borderColor: status === 'eliminated' ? '#E8112D' : '#E5E7EB',
                      background:  status === 'eliminated' ? 'rgba(232,17,45,0.08)' : 'white',
                      color:       status === 'eliminated' ? '#E8112D' : '#6B7280',
                    }}
                  >
                    <X size={16} />
                    Éliminé
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Commentaire */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Commentaire (facultatif)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={2}
              placeholder="Remarques du jury..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !status || score === ''}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Enregistrement...' : 'Enregistrer la note'}
            </button>
            <button onClick={onClose} className="px-5 py-3 border border-gray-200 text-gray-500 font-medium rounded-xl text-sm hover:bg-gray-50 transition">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal configuration du concours ─────────────────────────────────────────
function SetupModal({ onClose, onSetup }) {
  const [totalPhases, setTotalPhases] = useState(3)
  const [phases, setPhases] = useState([
    { name: 'Phase 1 — Défense de thème',      description: 'Présentation du thème par département' },
    { name: 'Phase 2 — Projet + Synthèse EN', description: 'Présentation de projet et synthèse en anglais' },
    { name: 'Phase 3 — Finale',                description: 'Grande finale et proclamation du vainqueur' },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  const updateTotal = (n) => {
    const num = parseInt(n) || 1
    setTotalPhases(num)
    const current = [...phases]
    while (current.length < num) current.push({ name: `Phase ${current.length + 1}`, description: '' })
    setPhases(current.slice(0, num))
  }

  const handleSetup = async () => {
    setSaving(true)
    setError(null)
    try {
      await api.post('/competition/setup', { total_phases: totalPhases, phases })
      onSetup()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la configuration.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="font-bold text-gray-900">Configurer le concours</h2>
            <p className="text-xs text-gray-400 mt-0.5">Définissez le nombre de phases et leurs noms</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">❌ {error}</div>
          )}

          {/* Nombre de phases */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Nombre total de phases
            </label>
            <div className="flex gap-3 flex-wrap">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => updateTotal(n)}
                  className="w-12 h-12 rounded-xl font-black text-lg border-2 transition-all"
                  style={{
                    borderColor: totalPhases === n ? '#2A2AE0' : '#E5E7EB',
                    background:  totalPhases === n ? 'rgba(42,42,224,0.1)' : 'white',
                    color:       totalPhases === n ? '#2A2AE0' : '#6B7280',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Noms des phases */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
              Définir chaque phase
            </label>
            {phases.map((phase, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: i === phases.length - 1 ? '#F0C040' : '#2A2AE0' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    {i === phases.length - 1 ? '🏆 Phase finale' : `Phase ${i + 1}`}
                  </span>
                </div>
                <input
                  type="text"
                  value={phase.name}
                  onChange={e => {
                    const updated = [...phases]
                    updated[i] = { ...updated[i], name: e.target.value }
                    setPhases(updated)
                  }}
                  placeholder={`Nom de la phase ${i + 1}`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={phase.description}
                  onChange={e => {
                    const updated = [...phases]
                    updated[i] = { ...updated[i], description: e.target.value }
                    setPhases(updated)
                  }}
                  placeholder="Description (facultatif)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSetup}
              disabled={saving}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Trophy size={16} />}
              {saving ? 'Configuration...' : 'Lancer le concours'}
            </button>
            <button onClick={onClose} className="px-5 py-3 border border-gray-200 text-gray-500 font-medium rounded-xl text-sm hover:bg-gray-50 transition">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function CompetitionPage() {
  const { user } = useAuth()
  const [data, setData]               = useState({ phases: [], has_phases: false, active_phase: null })
  const [loading, setLoading]         = useState(true)
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [phaseData, setPhaseData]     = useState(null)
  const [loadingPhase, setLoadingPhase] = useState(false)
  const [gradeModal, setGradeModal]   = useState(null)
  const [setupModal, setSetupModal]   = useState(false)
  const [activating, setActivating]   = useState(false)
  const [completing, setCompleting]   = useState(false)
  const [error, setError]             = useState(null)
  const [success, setSuccess]         = useState(null)

  const isSuperAdmin = user?.role === 'super_admin'

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/competition/phases')
      setData(res.data)
      // Auto-sélectionner la phase active si aucune sélection
      if (!selectedPhase && res.data.active_phase) {
        setSelectedPhase(res.data.active_phase)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadPhase = async (phase) => {
    setSelectedPhase(phase)
    setPhaseData(null)
    setLoadingPhase(true)
    try {
      const res = await api.get(`/competition/phases/${phase.id}/candidates`)
      setPhaseData(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPhase(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (selectedPhase) loadPhase(selectedPhase)
  }, [selectedPhase?.id])

  const handleActivate = async () => {
    if (!selectedPhase) return
    setActivating(true)
    setError(null)
    try {
      await api.put(`/competition/phases/${selectedPhase.id}/activate`)
      setSuccess(`Phase ${selectedPhase.phase_number} activée !`)
      await load()
      loadPhase({ ...selectedPhase, status: 'active' })
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur')
    } finally {
      setActivating(false)
    }
  }

  const handleComplete = async () => {
    if (!selectedPhase) return
    if (!confirm(`Clôturer la phase ${selectedPhase.phase_number} ? Cette action est irréversible.`)) return
    setCompleting(true)
    setError(null)
    try {
      await api.put(`/competition/phases/${selectedPhase.id}/complete`)
      setSuccess(`Phase ${selectedPhase.phase_number} clôturée.`)
      await load()
      loadPhase({ ...selectedPhase, status: 'completed' })
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur')
    } finally {
      setCompleting(false)
    }
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy size={24} className="text-yellow-500" />
            Gestion du Concours
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Phases, notation et classement des candidats
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          {isSuperAdmin && !data.has_phases && (
            <button
              onClick={() => setSetupModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition"
            >
              <Plus size={16} />
              Configurer le concours
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
          <Check size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* État initial : pas encore configuré */}
      {!loading && !data.has_phases && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
          <Trophy size={48} className="mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">Aucune phase configurée</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            {isSuperAdmin
              ? 'Commencez par configurer les phases du concours. Vous pourrez ensuite noter les candidats.'
              : 'Le super admin doit d\'abord configurer les phases du concours.'
            }
          </p>
          {isSuperAdmin && (
            <button
              onClick={() => setSetupModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
            >
              <Trophy size={16} />
              Configurer le concours
            </button>
          )}
        </div>
      )}

      {/* Phases configurées */}
      {!loading && data.has_phases && (
        <div className="grid lg:grid-cols-4 gap-6">

          {/* Sidebar : liste des phases */}
          <div className="lg:col-span-1 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Phases</p>
            {data.phases.map(phase => {
              const pCfg = PHASE_STATUS[phase.status] || PHASE_STATUS.pending
              const isSelected = selectedPhase?.id === phase.id
              return (
                <button
                  key={phase.id}
                  onClick={() => loadPhase(phase)}
                  className="w-full text-left p-4 rounded-2xl border-2 transition-all"
                  style={{
                    borderColor: isSelected ? '#2A2AE0' : 'rgba(42,42,224,0.08)',
                    background:  isSelected ? 'rgba(42,42,224,0.06)' : 'white',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white"
                      style={{ background: phase.is_final ? '#F0C040' : '#2A2AE0' }}
                    >
                      {phase.is_final ? '🏆' : phase.phase_number}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: pCfg.bg, color: pCfg.color }}
                    >
                      {pCfg.label}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{phase.name}</p>
                  {phase.scored_count > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {phase.scored_count} noté{phase.scored_count > 1 ? 's' : ''}
                    </p>
                  )}
                </button>
              )
            })}
          </div>

          {/* Contenu de la phase sélectionnée */}
          <div className="lg:col-span-3">
            {!selectedPhase ? (
              <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-gray-200">
                <p className="text-gray-400">Sélectionnez une phase</p>
              </div>
            ) : loadingPhase ? (
              <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-gray-200">
                <Loader2 size={28} className="animate-spin text-blue-500" />
              </div>
            ) : phaseData ? (
              <div className="space-y-4">
                {/* En-tête phase */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{phaseData.phase.name}</h2>
                      {phaseData.phase.description && (
                        <p className="text-sm text-gray-400 mt-1">{phaseData.phase.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {/* Activer */}
                      {isSuperAdmin && phaseData.phase.status === 'pending' && (
                        <button
                          onClick={handleActivate}
                          disabled={activating}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition"
                        >
                          {activating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                          Démarrer
                        </button>
                      )}
                      {/* Clôturer */}
                      {isSuperAdmin && phaseData.phase.status === 'active' && (
                        <button
                          onClick={handleComplete}
                          disabled={completing || phaseData.stats.pending > 0}
                          title={phaseData.stats.pending > 0 ? `${phaseData.stats.pending} candidat(s) non notés` : ''}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition"
                        >
                          {completing ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                          Clôturer
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {[
                      { label: 'Total',      value: phaseData.stats.total,      color: 'gray' },
                      { label: 'En attente', value: phaseData.stats.pending,    color: 'yellow' },
                      { label: 'Continue',   value: phaseData.stats.continuing, color: 'green' },
                      { label: 'Éliminés',   value: phaseData.stats.eliminated, color: 'red' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-xl font-black text-gray-900">{s.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Alerte si phase non active */}
                  {phaseData.phase.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700 flex items-center gap-2">
                      <AlertTriangle size={14} />
                      Cette phase n'est pas encore démarrée.
                      {isSuperAdmin ? ' Cliquez sur "Démarrer" pour l\'activer.' : ' Attendez que le super admin l\'active.'}
                    </div>
                  )}
                  {phaseData.phase.status === 'completed' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 flex items-center gap-2">
                      <CheckCheck size={14} />
                      Cette phase est terminée. Les résultats sont définitifs.
                    </div>
                  )}
                </div>

                {/* Liste des candidats */}
                {phaseData.scores.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <Users size={32} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400 text-sm">
                      {phaseData.phase.status === 'pending'
                        ? 'Activez la phase pour voir les candidats éligibles.'
                        : 'Aucun candidat dans cette phase.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">
                        Candidats · {phaseData.scores.length}
                      </h3>
                      {phaseData.stats.avg_score && (
                        <span className="text-xs text-gray-400">
                          Moy. : <strong className="text-gray-700">{phaseData.stats.avg_score?.toFixed(2)}/20</strong>
                        </span>
                      )}
                    </div>

                    <div className="divide-y divide-gray-50">
                      {phaseData.scores.map((c, idx) => (
                        <div key={c.score_id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                          {/* Rang */}
                          <span className="w-7 text-center text-sm font-black text-gray-300">
                            {c.score !== null ? `#${idx + 1}` : '—'}
                          </span>

                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #1a1a2e, #2A2AE0)' }}>
                            {c.photo_url
                              ? <img src={c.photo_url} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-white font-black text-sm">
                                  {c.name?.charAt(0)}
                                </div>
                            }
                          </div>

                          {/* Infos */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                              {c.is_leader && <Crown size={14} className="text-yellow-500" />}
                            </div>
                            <p className="text-xs text-gray-400">
                              {c.department_slug} · {c.year === '1' ? '1ère' : '2ème'} année
                            </p>
                          </div>

                          {/* Note */}
                          <div className="text-center">
                            {c.score !== null ? (
                              <span className="text-lg font-black"
                                style={{
                                  color: c.score >= 14 ? '#4DC896'
                                       : c.score >= 10 ? '#F0C040'
                                       : '#E8112D'
                                }}>
                                {c.score}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-300">—/20</span>
                            )}
                          </div>

                          {/* Statut */}
                          <div className="hidden sm:block">
                            <StatusBadge status={c.status} />
                          </div>

                          {/* Bouton noter */}
                          {phaseData.phase.status === 'active' && (
                            <button
                              onClick={() => setGradeModal(c)}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all"
                              style={{
                                borderColor: c.status === 'pending' ? '#2A2AE0' : '#E5E7EB',
                                color:       c.status === 'pending' ? '#2A2AE0' : '#9CA3AF',
                                background:  c.status === 'pending' ? 'rgba(42,42,224,0.07)' : 'white',
                              }}
                            >
                              {c.status === 'pending' ? 'Noter' : 'Modifier'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modals */}
      {setupModal && (
        <SetupModal
          onClose={() => setSetupModal(false)}
          onSetup={() => { load(); setSuccess('Concours configuré avec succès !') }}
        />
      )}
      {gradeModal && selectedPhase && phaseData && (
        <GradeModal
          candidate={gradeModal}
          phase={phaseData.phase}
          onClose={() => setGradeModal(null)}
          onSaved={() => {
            setSuccess('Note enregistrée.')
            loadPhase(selectedPhase)
          }}
        />
      )}
    </div>
  )
}