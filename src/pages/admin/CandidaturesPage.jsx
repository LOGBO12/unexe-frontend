import { useEffect, useState } from 'react'
import api from '../../api/axios'
import {
  Search, Eye, CheckCircle, XCircle, Clock,
  RefreshCw, FileText, Download, ExternalLink,
  GraduationCap, BookOpen
} from 'lucide-react'

// ─── Labels des documents ─────────────────────────────────────────────────────
const DOC_LABELS = {
  cv:                     { label: 'CV',                     icon: '📄', color: '#2A2AE0' },
  releve_bac:             { label: 'Relevé BAC',             icon: '🎓', color: '#008751' },
  fiche_preinscription_1: { label: 'Préinscription 1A',      icon: '📋', color: '#F0C040' },
  validation_1ere_annee:  { label: 'Validation / Relevé 1A', icon: '✅', color: '#7C3AED' },
  fiche_preinscription_2: { label: 'Préinscription 2A',      icon: '📋', color: '#E8112D' },
  // Anciens noms (compatibilité)
  cv_path:                { label: 'CV',                     icon: '📄', color: '#2A2AE0' },
  notes:                  { label: 'Relevé de notes',        icon: '📊', color: '#008751' },
  photo:                  { label: 'Photo',                  icon: '🖼️', color: '#F0C040' },
}

function StatusBadge({ status }) {
  if (status === 'validated')
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-bold flex items-center gap-1 w-fit">
        <CheckCircle size={11} /> Validé
      </span>
    )
  if (status === 'rejected')
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold flex items-center gap-1 w-fit">
        <XCircle size={11} /> Rejeté
      </span>
    )
  return (
    <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold flex items-center gap-1 w-fit">
      <Clock size={11} /> En attente
    </span>
  )
}

// ─── Composant d'affichage des documents ──────────────────────────────────────
function DocumentsGrid({ documents, documentsUrls }) {
  const docs = documentsUrls || documents

  if (!docs || Object.keys(docs).length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">Aucun document joint.</p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {Object.entries(docs).map(([key, value]) => {
        const config = DOC_LABELS[key] || { label: key, icon: '📎', color: '#6B7280' }
        const url    = typeof value === 'object' ? value.url : `/storage/${value}`
        const label  = typeof value === 'object' ? value.label : config.label

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-md"
            style={{
              borderColor: `${config.color}25`,
              background: `${config.color}06`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background   = `${config.color}12`
              e.currentTarget.style.borderColor  = `${config.color}50`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background   = `${config.color}06`
              e.currentTarget.style.borderColor  = `${config.color}25`
            }}
          >
            <span className="text-lg flex-shrink-0">{config.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: config.color }}>
                {label}
              </p>
              <p className="text-[10px] text-gray-400">Cliquer pour ouvrir</p>
            </div>
            <ExternalLink
              size={13}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: config.color }}
            />
          </a>
        )
      })}
    </div>
  )
}

export default function CandidaturesPage() {
  const [data, setData]               = useState({ applications: { data: [] }, stats: {} })
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState(null)
  const [detailData, setDetailData]   = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [actionModal, setActionModal] = useState(null)
  const [reviewNote, setReviewNote]   = useState('')
  const [processing, setProcessing]   = useState(false)
  const [filters, setFilters]         = useState({ status: '', search: '' })

  const load = (f = filters) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (f.status) params.append('status', f.status)
    if (f.search) params.append('search', f.search)

    api.get(`/applications?${params}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Charger le détail avec les URLs des documents
  const openDetail = async (app) => {
    setSelected(app)
    setDetailData(null)
    setLoadingDetail(true)
    try {
      const res = await api.get(`/applications/${app.id}`)
      setDetailData(res.data)
    } catch (e) {
      setDetailData(app)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleValidate = async () => {
    setProcessing(true)
    try {
      await api.post(`/applications/${actionModal.app.id}/validate`, {
        review_note: reviewNote
      })
      setActionModal(null)
      setReviewNote('')
      setSelected(null)
      setDetailData(null)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!reviewNote.trim()) {
      alert('Le motif de rejet est obligatoire.')
      return
    }
    setProcessing(true)
    try {
      await api.post(`/applications/${actionModal.app.id}/reject`, {
        review_note: reviewNote
      })
      setActionModal(null)
      setReviewNote('')
      setSelected(null)
      setDetailData(null)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally {
      setProcessing(false)
    }
  }

  const apps  = data.applications?.data || []
  const stats = data.stats || {}

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatures</h1>
          <p className="text-gray-500 text-sm mt-0.5">Examiner et traiter les dossiers</p>
        </div>
        <button
          onClick={() => load()}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
        >
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',      value: stats.total,     key: '',          color: 'gray' },
          { label: 'En attente', value: stats.pending,   key: 'pending',   color: 'yellow' },
          { label: 'Validés',    value: stats.validated, key: 'validated', color: 'green' },
          { label: 'Rejetés',    value: stats.rejected,  key: 'rejected',  color: 'red' },
        ].map(s => (
          <div
            key={s.label}
            onClick={() => { setFilters(f => ({ ...f, status: s.key })); load({ ...filters, status: s.key }) }}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && load({ ...filters })}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <select
          value={filters.status}
          onChange={e => { const s = e.target.value; setFilters(f => ({ ...f, status: s })); load({ ...filters, status: s }) }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="validated">Validés</option>
          <option value="rejected">Rejetés</option>
        </select>
        <select
          value={filters.year || ''}
          onChange={e => { const y = e.target.value; setFilters(f => ({ ...f, year: y })); load({ ...filters, year: y }) }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white"
        >
          <option value="">Toutes les années</option>
          <option value="1">1ère année</option>
          <option value="2">2ème année</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun dossier trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Candidat</th>
                  <th className="px-4 py-3 text-left">Département</th>
                  <th className="px-4 py-3 text-left">Filière / Année</th>
                  <th className="px-4 py-3 text-left">Documents</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {apps.map(app => {
                  const docCount = app.documents ? Object.keys(app.documents).length : 0
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800">{app.user?.name}</p>
                        <p className="text-xs text-gray-400">{app.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{app.department?.name}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 text-xs font-medium">{app.filiere}</p>
                        <span
                          className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: app.year === '1' ? 'rgba(42,42,224,0.1)' : 'rgba(232,17,45,0.1)',
                            color: app.year === '1' ? '#2A2AE0' : '#E8112D',
                          }}
                        >
                          {app.year === '1' ? '1ère année' : '2ème année'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FileText size={12} />
                          {docCount} doc{docCount > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(app.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetail(app)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Voir le dossier complet"
                          >
                            <Eye size={15} />
                          </button>
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => { setActionModal({ type: 'validate', app }); setReviewNote('') }}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Valider"
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button
                                onClick={() => { setActionModal({ type: 'reject', app }); setReviewNote('') }}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Rejeter"
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal détail dossier ─────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <BookOpen size={17} className="text-blue-600" />
                Dossier de candidature
              </h3>
              <button
                onClick={() => { setSelected(null); setDetailData(null) }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="p-6 space-y-5">

                {/* Infos générales */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                    Informations générales
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Nom',        value: (detailData || selected).user?.name },
                      { label: 'Email',      value: (detailData || selected).user?.email },
                      { label: 'Département',value: (detailData || selected).department?.name },
                      { label: 'Filière',    value: (detailData || selected).filiere },
                      {
                        label: 'Année',
                        value: (detailData || selected).year === '1' ? '1ère année' : '2ème année'
                      },
                      { label: 'Matricule',  value: (detailData || selected).matricule || '—' },
                      { label: 'Téléphone',  value: (detailData || selected).phone || '—' },
                      {
                        label: 'Statut',
                        value: <StatusBadge status={(detailData || selected).status} />
                      },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                        <div className="font-medium text-gray-800 text-sm">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lettre de motivation */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    Lettre de motivation
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed max-h-40 overflow-y-auto">
                    {(detailData || selected).motivation_letter}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                    Documents soumis · {Object.keys((detailData || selected).documents || {}).length} fichier(s)
                  </p>
                  <DocumentsGrid
                    documents={(detailData || selected).documents}
                    documentsUrls={(detailData || selected).documents_urls}
                  />
                </div>

                {/* Note du comité */}
                {(detailData || selected).review_note && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                      Note du comité
                    </p>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm text-gray-700">
                      {(detailData || selected).review_note}
                    </div>
                  </div>
                )}

                {/* Actions si en attente */}
                {(detailData || selected).status === 'pending' && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setActionModal({ type: 'validate', app: detailData || selected })
                        setSelected(null)
                        setDetailData(null)
                        setReviewNote('')
                      }}
                      className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition"
                    >
                      ✓ Valider la candidature
                    </button>
                    <button
                      onClick={() => {
                        setActionModal({ type: 'reject', app: detailData || selected })
                        setSelected(null)
                        setDetailData(null)
                        setReviewNote('')
                      }}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition"
                    >
                      ✕ Rejeter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal validation / rejet ─────────────────────────────────── */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">
              {actionModal.type === 'validate' ? '✅ Valider la candidature' : '❌ Rejeter la candidature'}
            </h3>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{actionModal.app.user?.name}</span>
                {' · '}
                <span className="text-gray-400">{actionModal.app.department?.name}</span>
                {' · '}
                <span className="text-gray-400">
                  {actionModal.app.year === '1' ? '1ère année' : '2ème année'}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {actionModal.type === 'reject' ? 'Motif du rejet *' : 'Note pour le candidat (optionnelle)'}
              </label>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                rows={3}
                placeholder={
                  actionModal.type === 'reject'
                    ? 'Expliquer le motif du rejet au candidat...'
                    : 'Félicitations, message de bienvenue...'
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
              />
            </div>

            {actionModal.type === 'validate' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
                ℹ️ Le candidat recevra un email de validation et aura accès à son espace complet.
                Son profil sera affiché publiquement.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={actionModal.type === 'validate' ? handleValidate : handleReject}
                disabled={processing}
                className={`flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition disabled:opacity-50
                  ${actionModal.type === 'validate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {processing
                  ? 'Traitement...'
                  : actionModal.type === 'validate'
                  ? 'Confirmer la validation'
                  : 'Confirmer le rejet'}
              </button>
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}