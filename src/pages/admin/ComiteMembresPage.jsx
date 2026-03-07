import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Plus, Trash2, RefreshCw, Shield, Users, Crown } from 'lucide-react'

export default function ComiteMembresPage() {
  const [members, setMembers]         = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState(null)
  const [success, setSuccess]         = useState(null)

  const [form, setForm] = useState({
    user_id: '', position: '', bio: '', display_order: 0
  })
  const [photo, setPhoto] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/committee/members')
      .then(res => setMembers(res.data))
      .finally(() => setLoading(false))
  }

  const loadAvailableUsers = () => {
    api.get('/committee/available-users')
      .then(res => setAvailableUsers(res.data))
      .catch(() => {})
  }

  useEffect(() => {
    load()
    loadAvailableUsers()
  }, [])

  const handleOpenForm = () => {
    loadAvailableUsers() // Rafraîchir la liste à chaque ouverture
    setShowForm(true)
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.user_id) {
      setError('Veuillez sélectionner un membre.')
      return
    }
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
      loadAvailableUsers()
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Retirer ce membre du comité ?')) return
    try {
      await api.delete(`/committee/members/${id}`)
      load()
      loadAvailableUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    }
  }

  // Utilisateur sélectionné dans le select
  const selectedUser = availableUsers.find(u => String(u.id) === String(form.user_id))

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membres du Comité</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Gérer l'équipe visible sur la page publique
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button
            onClick={handleOpenForm}
            disabled={availableUsers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
            title={availableUsers.length === 0 ? 'Tous les membres du comité ont déjà été ajoutés' : ''}
          >
            <Plus size={16} />
            Ajouter un membre
          </button>
        </div>
      </div>

      {/* Info : nb membres disponibles */}
      {availableUsers.length === 0 && !loading && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm flex items-center gap-2">
          <Users size={16} />
          Tous les membres comité (comité + super admin) ont déjà été ajoutés, ou aucun compte comité n'existe.
        </div>
      )}
      {availableUsers.length > 0 && !showForm && (
        <div className="p-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl text-xs flex items-center gap-2">
          <Users size={14} />
          {availableUsers.length} personne{availableUsers.length > 1 ? 's' : ''} disponible{availableUsers.length > 1 ? 's' : ''} à ajouter
          (rôles : comité &amp; super admin)
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ❌ {error}
        </div>
      )}

      {/* Formulaire ajout */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ajouter un membre au comité</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">

            {/* Select utilisateur */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Membre à ajouter *
              </label>
              {availableUsers.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
                  Aucun utilisateur disponible. Invitez d'abord des membres comité.
                </div>
              ) : (
                <>
                  <select
                    value={form.user_id}
                    onChange={e => setForm({ ...form, user_id: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
                  >
                    <option value="">-- Sélectionner un membre --</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.email}
                        {u.role === 'super_admin' ? ' 👑 Super Admin' : ' 🛡️ Comité'}
                      </option>
                    ))}
                  </select>

                  {/* Preview utilisateur sélectionné */}
                  {selectedUser && (
                    <div className="mt-2 flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #2A2AE0, #1A1A8B)' }}
                      >
                        {selectedUser.avatar
                          ? <img src={`/storage/${selectedUser.avatar}`} className="w-full h-full object-cover rounded-full" alt="" />
                          : selectedUser.name?.charAt(0)
                        }
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{selectedUser.name}</p>
                        <p className="text-xs text-gray-500">{selectedUser.email}</p>
                      </div>
                      <span className={`ml-auto text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                        selectedUser.role === 'super_admin'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {selectedUser.role === 'super_admin' ? '👑 Super Admin' : '🛡️ Comité'}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poste / Position *</label>
              <input
                type="text"
                value={form.position}
                onChange={e => setForm({ ...form, position: e.target.value })}
                required
                placeholder="Ex: Président, Secrétaire Général..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Ordre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
              <input
                type="number"
                value={form.display_order}
                onChange={e => setForm({ ...form, display_order: e.target.value })}
                min={0}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                rows={3}
                placeholder="Courte biographie (facultatif)..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
              />
            </div>

            {/* Photo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo <span className="text-gray-400 font-normal">(facultatif — sinon l'avatar du compte sera utilisé)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setPhoto(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
              />
              {photo && (
                <p className="text-xs text-blue-600 mt-1">📎 {photo.name}</p>
              )}
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving || !form.user_id}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
              >
                {saving ? 'Ajout en cours...' : 'Ajouter au comité'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(null) }}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste membres */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
              <div className="h-40 bg-gray-100 overflow-hidden relative">
                {member.photo ? (
                  <img src={`/storage/${member.photo}`} alt={member.user?.name} className="w-full h-full object-cover" />
                ) : member.user?.avatar ? (
                  <img src={`/storage/${member.user.avatar}`} alt={member.user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#2A2AE0]">
                    <span className="text-3xl font-bold text-white">{member.user?.name?.charAt(0)}</span>
                  </div>
                )}
                {/* Badge rôle */}
                {member.user?.role === 'super_admin' && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-red-600 text-white">
                    <Crown size={9} /> Super Admin
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900">{member.user?.name}</p>
                <p className="text-xs text-blue-600 font-medium">{member.position}</p>
                {member.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{member.bio}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">Ordre : {member.display_order}</span>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Retirer du comité"
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