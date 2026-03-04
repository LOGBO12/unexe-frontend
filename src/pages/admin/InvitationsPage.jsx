import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Mail, Plus, Trash2, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

function Badge({ status }) {
  if (status === 'used')    return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">Utilisée</span>
  if (status === 'expired') return <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">Expirée</span>
  return <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">En attente</span>
}

function getStatus(inv) {
  if (inv.used_at) return 'used'
  if (new Date(inv.expires_at) < new Date()) return 'expired'
  return 'pending'
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [sending, setSending]         = useState(false)
  const [showForm, setShowForm]       = useState(false)
  const [success, setSuccess]         = useState(null)
  const [error, setError]             = useState(null)

  // ← year ajouté dans le state initial
  const [form, setForm] = useState({ email: '', role: 'comite', department_id: '', year: '' })

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/invitations'),
      api.get('/dashboard'),
    ]).then(([invRes]) => {
      setInvitations(invRes.data.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api.get('/public/candidates').then(res => {
      setDepartments(res.data.departments || [])
    }).catch(() => {})
  }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    setSuccess(null)

    try {
      await api.post('/invite', {
        email:         form.email,
        role:          form.role,
        department_id: form.role === 'candidat' ? form.department_id : undefined,
        year:          form.role === 'candidat' ? form.year : undefined, // ← AJOUT
      })
      setSuccess(`Invitation envoyée à ${form.email} !`)
      setForm({ email: '', role: 'comite', department_id: '', year: '' })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi.")
    } finally {
      setSending(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Annuler cette invitation ?')) return
    try {
      await api.delete(`/invitations/${id}`)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Gérer les invitations comité et candidats
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
          >
            <Plus size={16} />
            Nouvelle invitation
          </button>
        </div>
      </div>

      {/* Alertes */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <XCircle size={16} /> {error}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Mail size={18} className="text-red-600" />
            Envoyer une invitation
          </h2>

          <form onSubmit={handleSend} className="grid md:grid-cols-2 gap-4">

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                placeholder="exemple@email.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>

            {/* Rôle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value, department_id: '', year: '' })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white"
              >
                <option value="comite">🛡️ Membre du Comité</option>
                <option value="candidat">🏆 Candidat</option>
              </select>
            </div>

            {/* Département (si candidat) */}
            {form.role === 'candidat' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Département *
                </label>
                <select
                  value={form.department_id}
                  onChange={e => setForm({ ...form, department_id: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white"
                >
                  <option value="">Sélectionner un département</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* ← AJOUT : Année d'étude (si candidat) */}
            {form.role === 'candidat' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Année d'étude *
                </label>
                <select
                  value={form.year}
                  onChange={e => setForm({ ...form, year: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white"
                >
                  <option value="">Sélectionner l'année</option>
                  <option value="1">1ère année</option>
                  <option value="2">2ème année</option>
                </select>
              </div>
            )}

            {/* Info box */}
            <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              {form.role === 'comite'
                ? '🛡️ Le membre du comité recevra un email avec ses identifiants et aura accès au dashboard admin.'
                : '🏆 Le candidat recevra un email avec ses identifiants. Son département et son année seront pré-remplis dans son dossier.'
              }
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
              >
                {sending ? 'Envoi...' : "Envoyer l'invitation"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des invitations */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            Historique des invitations
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({invitations.length})
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Mail size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucune invitation envoyée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Rôle</th>
                  <th className="px-4 py-3 text-left">Département</th>
                  <th className="px-4 py-3 text-left">Année</th>{/* ← AJOUT colonne */}
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Envoyée par</th>
                  <th className="px-4 py-3 text-left">Expiration</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invitations.map(inv => {
                  const status = getStatus(inv)
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-medium text-gray-800">{inv.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full
                          ${inv.role === 'comite'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'}`}
                        >
                          {inv.role === 'comite' ? '🛡️ Comité' : '🏆 Candidat'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {inv.department?.name || '—'}
                      </td>
                      {/* ← AJOUT : afficher l'année via le candidate associé */}
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {inv.role === 'candidat' && inv.candidate?.year
                          ? (inv.candidate.year === '1' ? '1ère année' : '2ème année')
                          : '—'}
                      </td>
                      <td className="px-4 py-3"><Badge status={status} /></td>
                      <td className="px-4 py-3 text-gray-500">{inv.invited_by?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(inv.expires_at).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {status === 'pending' && (
                          <button
                            onClick={() => handleCancel(inv.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Annuler"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}