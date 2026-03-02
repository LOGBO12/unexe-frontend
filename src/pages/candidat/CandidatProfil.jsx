import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { Save, KeyRound, Camera, CheckCircle, AlertCircle } from 'lucide-react'

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function Input({ error, ...props }) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all duration-200"
      style={{
        background: '#F7F7FC',
        border: `1.5px solid ${error ? 'rgba(232,17,45,0.4)' : 'rgba(42,42,224,0.1)'}`,
        color: '#0D0D1A',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(42,42,224,0.5)'}
      onBlur={e => e.target.style.borderColor = error ? 'rgba(232,17,45,0.4)' : 'rgba(42,42,224,0.1)'}
    />
  )
}

function Textarea({ error, ...props }) {
  return (
    <textarea
      {...props}
      className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all duration-200 resize-none"
      style={{
        background: '#F7F7FC',
        border: `1.5px solid ${error ? 'rgba(232,17,45,0.4)' : 'rgba(42,42,224,0.1)'}`,
        color: '#0D0D1A',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(42,42,224,0.5)'}
      onBlur={e => e.target.style.borderColor = error ? 'rgba(232,17,45,0.4)' : 'rgba(42,42,224,0.1)'}
    />
  )
}

export default function CandidatProfil() {
  const { user }  = useAuth()
  const candidate = user?.candidate
  const photo     = user?.avatar ? `/storage/${user.avatar}` : null

  const [tab, setTab]             = useState('profil') // profil | password
  const [saving, setSaving]       = useState(false)
  const [success, setSuccess]     = useState(null)
  const [error, setError]         = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const [form, setForm] = useState({
    name:  user?.name  || '',
    bio:   candidate?.bio   || '',
    phone: candidate?.phone || '',
  })
  const [avatar, setAvatar]     = useState(null)
  const [preview, setPreview]   = useState(photo)

  const [pwd, setPwd] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const flashSuccess = (msg) => {
    setSuccess(msg)
    setError(null)
    setTimeout(() => setSuccess(null), 4000)
  }

  const flashError = (msg) => {
    setError(msg)
    setSuccess(null)
    setTimeout(() => setError(null), 5000)
  }

  const handleSaveProfil = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFieldErrors({})

    const fd = new FormData()
    fd.append('name', form.name)
    if (form.bio)   fd.append('bio', form.bio)
    if (form.phone) fd.append('phone', form.phone)
    if (avatar)     fd.append('photo', avatar)

    try {
      await api.put('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      flashSuccess('Profil mis à jour avec succès !')
    } catch (err) {
      if (err.response?.status === 422) {
        setFieldErrors(err.response.data.errors || {})
      } else {
        flashError(err.response?.data?.message || 'Erreur lors de la mise à jour.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwd.password !== pwd.password_confirmation) {
      setFieldErrors({ password_confirmation: ['Les mots de passe ne correspondent pas.'] })
      return
    }
    setSaving(true)
    setFieldErrors({})
    try {
      await api.put('/admin/profile/password', pwd)
      flashSuccess('Mot de passe modifié avec succès !')
      setPwd({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      if (err.response?.status === 422) {
        setFieldErrors(err.response.data.errors || {})
      } else {
        flashError(err.response?.data?.message || 'Erreur.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-black" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
          Mon profil
        </h1>
        <p className="text-gray-400 text-sm mt-1">Gérez vos informations personnelles et votre mot de passe.</p>
      </div>

      {/* Alertes globales */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(0,200,100,0.08)', border: '1px solid rgba(77,200,150,0.3)' }}>
          <CheckCircle size={16} style={{ color: '#4DC896' }} />
          <span className="text-sm font-semibold" style={{ color: '#4DC896' }}>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(232,17,45,0.07)', border: '1px solid rgba(232,17,45,0.2)' }}>
          <AlertCircle size={16} style={{ color: '#E8112D' }} />
          <span className="text-sm font-semibold" style={{ color: '#E8112D' }}>{error}</span>
        </div>
      )}

      {/* Card principale */}
      <div className="bg-white rounded-3xl border overflow-hidden"
        style={{ borderColor: 'rgba(42,42,224,0.07)', boxShadow: '0 2px 16px rgba(42,42,224,0.05)' }}>

        {/* Avatar + infos rapides */}
        <div className="p-6 border-b flex items-center gap-5"
          style={{ borderColor: 'rgba(42,42,224,0.06)', background: 'linear-gradient(135deg, #F7F7FC 0%, #FFFFFF 100%)' }}>
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #2A2AE0, #A5A5FF)', boxShadow: '0 8px 24px rgba(42,42,224,0.25)' }}>
              {preview ? (
                <img src={preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl"
                  style={{ fontFamily: '"Playfair Display", serif' }}>
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            {/* Bouton upload */}
            <label
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-110"
              style={{ background: '#2A2AE0', boxShadow: '0 4px 12px rgba(42,42,224,0.4)' }}
            >
              <Camera size={13} className="text-white" />
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-black" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
              {user?.name}
            </h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(42,42,224,0.1)', color: '#2A2AE0' }}>
                {user?.candidate?.department?.slug || 'Candidat'}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,200,100,0.1)', color: '#4DC896' }}>
                ✓ Validé
              </span>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex border-b" style={{ borderColor: 'rgba(42,42,224,0.06)' }}>
          {[
            { key: 'profil',   label: '👤 Informations', icon: null },
            { key: 'password', label: '🔒 Mot de passe',  icon: null },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setFieldErrors({}); setSuccess(null); setError(null) }}
              className="flex-1 py-4 text-sm font-bold transition-all duration-200"
              style={{
                color: tab === t.key ? '#2A2AE0' : 'rgba(13,13,26,0.4)',
                borderBottom: tab === t.key ? '2px solid #2A2AE0' : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ONGLET PROFIL ─────────────────────────────────────────── */}
        {tab === 'profil' && (
          <form onSubmit={handleSaveProfil} className="p-6 space-y-5">
            <Field label="Nom complet" error={fieldErrors.name?.[0]}>
              <Input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                placeholder="Votre nom complet"
                error={fieldErrors.name?.[0]}
              />
            </Field>

            <Field label="Email">
              <Input
                type="email"
                value={user?.email}
                disabled
                style={{ background: '#F0F0F8', color: 'rgba(13,13,26,0.35)', cursor: 'not-allowed', border: '1.5px solid rgba(42,42,224,0.06)' }}
              />
              <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Département">
                <Input
                  type="text"
                  value={user?.candidate?.department?.name || '—'}
                  disabled
                  style={{ background: '#F0F0F8', color: 'rgba(13,13,26,0.35)', cursor: 'not-allowed', border: '1.5px solid rgba(42,42,224,0.06)' }}
                />
              </Field>
              <Field label="Année">
                <Input
                  type="text"
                  value={user?.candidate?.year === '1' ? '1ère année' : '2ème année'}
                  disabled
                  style={{ background: '#F0F0F8', color: 'rgba(13,13,26,0.35)', cursor: 'not-allowed', border: '1.5px solid rgba(42,42,224,0.06)' }}
                />
              </Field>
            </div>

            <Field label="Téléphone" error={fieldErrors.phone?.[0]}>
              <Input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+229 00 00 00 00"
                error={fieldErrors.phone?.[0]}
              />
            </Field>

            <Field label="Biographie (min. 50 caractères)" error={fieldErrors.bio?.[0]}>
              <Textarea
                rows={4}
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Parlez de vous, vos ambitions, vos projets..."
                error={fieldErrors.bio?.[0]}
              />
              <p className="text-xs text-gray-400 mt-1">{form.bio.length} / 500 caractères</p>
            </Field>

            {/* Photo */}
            <Field label="Photo de profil" error={fieldErrors.photo?.[0]}>
              <div
                className="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer hover:border-[#2A2AE0] transition-colors"
                style={{ borderColor: 'rgba(42,42,224,0.12)', borderStyle: 'dashed' }}
                onClick={() => document.getElementById('avatar-upload').click()}
              >
                {preview ? (
                  <img src={preview} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(42,42,224,0.07)' }}>
                    <Camera size={20} style={{ color: '#2A2AE0' }} />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    {avatar ? avatar.name : 'Cliquez pour changer la photo'}
                  </p>
                  <p className="text-xs text-gray-400">JPG, PNG · max 2 Mo</p>
                </div>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              </div>
            </Field>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-7 py-3 text-sm font-bold text-white rounded-2xl transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: '#2A2AE0', boxShadow: '0 6px 20px rgba(42,42,224,0.3)' }}
              >
                <Save size={15} />
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        )}

        {/* ── ONGLET MOT DE PASSE ────────────────────────────────────── */}
        {tab === 'password' && (
          <form onSubmit={handleChangePassword} className="p-6 space-y-5">
            <div className="p-4 rounded-2xl"
              style={{ background: 'rgba(42,42,224,0.04)', border: '1px solid rgba(42,42,224,0.1)' }}>
              <p className="text-xs text-gray-500 leading-relaxed">
                Choisissez un mot de passe fort d'au moins 8 caractères. Ne le partagez jamais.
              </p>
            </div>

            <Field label="Mot de passe actuel" error={fieldErrors.current_password?.[0]}>
              <Input
                type="password"
                value={pwd.current_password}
                onChange={e => setPwd(p => ({ ...p, current_password: e.target.value }))}
                required
                placeholder="••••••••"
                error={fieldErrors.current_password?.[0]}
              />
            </Field>

            <Field label="Nouveau mot de passe" error={fieldErrors.password?.[0]}>
              <Input
                type="password"
                value={pwd.password}
                onChange={e => setPwd(p => ({ ...p, password: e.target.value }))}
                required
                placeholder="Minimum 8 caractères"
                error={fieldErrors.password?.[0]}
              />
            </Field>

            <Field label="Confirmer le nouveau mot de passe" error={fieldErrors.password_confirmation?.[0]}>
              <Input
                type="password"
                value={pwd.password_confirmation}
                onChange={e => setPwd(p => ({ ...p, password_confirmation: e.target.value }))}
                required
                placeholder="••••••••"
                error={fieldErrors.password_confirmation?.[0]}
              />
            </Field>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-7 py-3 text-sm font-bold text-white rounded-2xl transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: '#2A2AE0', boxShadow: '0 6px 20px rgba(42,42,224,0.3)' }}
              >
                <KeyRound size={15} />
                {saving ? 'Modification...' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}