import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Plus, Trash2, RefreshCw, Shield } from 'lucide-react'

export default function ComiteMembresPage() {
  const [members, setMembers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(null)

  const [form, setForm] = useState({
    user_id: '', position: '', bio: '', display_order: 0
  })
  const [photo, setPhoto]     = useState(null)
  const [users, setUsers]     = useState([])

  const load = () => {
    setLoading(true)
    api.get('/committee/members')
      .then(res => setMembers(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // Charger les utilisateurs comité sans entrée dans committee_members
    api.get('/dashboard').then(res => {}).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const fd = new FormData()
    fd.append('user_id', form.user_id)
    fd.append('position', form.position)
    if (form.bio) fd.append('bio', form.bio)
    if (photo) fd.append('photo', photo)
    fd.append('display_order', form.display_order)

    try {
      await api.post('/committee/members', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Membre ajouté avec succès.')
      setShowForm(false)
      setForm({ user_id: '', position: '', bio: '', display_order: 0 })
      setPhoto(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Retirer ce membre du comité ?')) return
    try {
      await api.delete(`/committee/members/${id}`)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    }
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membres du Comité</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gérer l'équipe visible sur la page publique</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
          >
            <Plus size={16} />
            Ajouter un membre
          </button>
        </div>
      </div>

      {success && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
      {error   && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {/* Formulaire ajout */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ajouter un membre</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Utilisateur (comité)
              </label>
              <input
                type="number"
                value={form.user_id}
                onChange={e => setForm({ ...form, user_id: e.target.value })}
                required
                placeholder="ID de l'utilisateur"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poste / Position</label>
              <input
                type="text"
                value={form.position}
                onChange={e => setForm({ ...form, position: e.target.value })}
                required
                placeholder="Ex: Président, Secrétaire..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                rows={3}
                placeholder="Courte biographie..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setPhoto(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
              <input
                type="number"
                value={form.display_order}
                onChange={e => setForm({ ...form, display_order: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition">
                {saving ? 'Ajout...' : 'Ajouter'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste membres */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
          <Shield size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun membre dans le comité</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.map(member => (
            <div key={member.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="h-40 bg-gray-100 overflow-hidden">
                {member.photo ? (
                  <img src={`/storage/${member.photo}`} alt={member.user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-red-900">
                    <span className="text-3xl font-bold text-white">{member.user?.name?.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900">{member.user?.name}</p>
                <p className="text-xs text-red-600 font-medium">{member.position}</p>
                {member.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{member.bio}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">Ordre : {member.display_order}</span>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}