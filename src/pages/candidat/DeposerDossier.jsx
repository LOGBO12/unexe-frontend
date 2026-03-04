import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import {
  Upload, FileText, CheckCircle, AlertCircle,
  ChevronRight, GraduationCap, Loader2, X,
  FileBadge, FileCheck, FileSearch, FilePlus, BookOpen
} from 'lucide-react'

// ─── Config des documents par année ──────────────────────────────────────────
const DOCS_CONFIG = {
  '1': [
    { key: 'cv',                    label: 'Curriculum Vitæ',                                   description: 'Votre CV au format PDF',                                          icon: FileText,   required: true, accept: 'application/pdf', hint: 'PDF · max 2 Mo' },
    { key: 'releve_bac',            label: 'Relevé de notes du BAC',                            description: 'Votre relevé officiel de notes du Baccalauréat',                 icon: FileBadge,  required: true, accept: 'application/pdf', hint: 'PDF · max 2 Mo' },
    { key: 'fiche_preinscription_1',label: 'Fiche de préinscription 1ère année',                description: 'Fiche de préinscription officielle de 1ère année',               icon: FileCheck,  required: true, accept: 'application/pdf', hint: 'PDF · max 2 Mo' },
  ],
  '2': [
    { key: 'cv',                    label: 'Curriculum Vitæ',                                   description: 'Votre CV au format PDF',                                          icon: FileText,   required: true, accept: 'application/pdf', hint: 'PDF · max 2 Mo' },
    { key: 'releve_bac',            label: 'Relevé de notes du BAC',                            description: 'Votre relevé officiel de notes du Baccalauréat',                 icon: FileBadge,  required: true, accept: 'application/pdf', hint: 'PDF · max 2 Mo' },
    { key: 'fiche_preinscription_1',label: 'Fiche de préinscription 1ère année',                description: 'Fiche de préinscription officielle de 1ère année',               icon: FileCheck,  required: true, accept: 'application/pdf', hint: 'PDF · max 2 Mo' },
    { key: 'validation_1ere_annee', label: 'Fiche de validation 1ère année ou Relevé de notes 1ère année', description: 'Fiche de validation ou relevé de notes de votre 1ère année', icon: FileSearch, required: true, accept: 'application/pdf', hint: 'PDF · max 2 Mo' },
    { key: 'fiche_preinscription_2',label: 'Fiche de préinscription 2ème année',                description: 'Fiche de préinscription officielle de 2ème année',               icon: FilePlus,   required: true, accept: 'application/pdf', hint: 'PDF · max 2 Mo' },
  ],
}

// ─── Composant carte de document ─────────────────────────────────────────────
function DocCard({ doc, file, onFileChange, onRemove, error }) {
  const Icon = doc.icon
  const hasFile = !!file

  return (
    <div
      className="relative rounded-2xl border-2 transition-all duration-300 overflow-hidden"
      style={{
        borderColor: error ? 'rgba(232,17,45,0.4)' : hasFile ? 'rgba(42,42,224,0.4)' : 'rgba(42,42,224,0.1)',
        background: hasFile ? 'rgba(42,42,224,0.03)' : error ? 'rgba(232,17,45,0.02)' : '#FFFFFF',
      }}
    >
      {doc.required && (
        <div className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
          style={{ background: hasFile ? 'rgba(42,42,224,0.1)' : 'rgba(232,17,45,0.08)', color: hasFile ? '#2A2AE0' : '#E8112D' }}>
          {hasFile ? '✓ Ajouté' : 'Requis'}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{ background: hasFile ? 'rgba(42,42,224,0.1)' : 'rgba(42,42,224,0.05)' }}>
            {hasFile ? <CheckCircle size={22} style={{ color: '#2A2AE0' }} /> : <Icon size={22} style={{ color: hasFile ? '#2A2AE0' : 'rgba(42,42,224,0.4)' }} />}
          </div>
          <div className="flex-1 min-w-0 pr-16">
            <h4 className="font-bold text-sm leading-tight mb-1" style={{ color: '#0D0D1A' }}>{doc.label}</h4>
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(13,13,26,0.45)' }}>{doc.description}</p>
            {hasFile ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(42,42,224,0.06)' }}>
                <FileText size={13} style={{ color: '#2A2AE0' }} />
                <span className="text-xs font-semibold truncate flex-1" style={{ color: '#2A2AE0' }}>{file.name}</span>
                <span className="text-[10px]" style={{ color: 'rgba(42,42,224,0.5)' }}>{(file.size / 1024 / 1024).toFixed(1)} Mo</span>
                <button type="button" onClick={onRemove} className="ml-1 hover:text-red-500 transition-colors" style={{ color: 'rgba(42,42,224,0.4)' }}>
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all hover:scale-105"
                style={{ background: 'rgba(42,42,224,0.07)', color: '#2A2AE0', border: '1.5px solid rgba(42,42,224,0.15)' }}>
                <Upload size={13} />
                Choisir le fichier
                <input type="file" accept={doc.accept} onChange={onFileChange} className="hidden" />
              </label>
            )}
            {error && <p className="text-xs mt-2 font-medium" style={{ color: '#E8112D' }}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helper style champ ───────────────────────────────────────────────────────
const fieldStyle = (hasError) => ({
  background: '#F7F7FC',
  border: `1.5px solid ${hasError ? 'rgba(232,17,45,0.4)' : 'rgba(42,42,224,0.1)'}`,
  color: '#0D0D1A',
})
const onFocus = e => e.target.style.borderColor = 'rgba(42,42,224,0.5)'
const onBlur  = (hasError) => e => e.target.style.borderColor = hasError ? 'rgba(232,17,45,0.4)' : 'rgba(42,42,224,0.1)'

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function DeposerDossier() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const candidate = user?.candidate

  // Candidat invité = department_id et year déjà définis dans son profil candidate
  const prefilledDept = candidate?.department_id ? String(candidate.department_id) : ''
  const prefilledYear = candidate?.year          ? String(candidate.year)          : ''

  const [departments, setDepartments] = useState([])
  const [step, setStep]               = useState(1)
  const [files, setFiles]             = useState({})
  const [fileErrors, setFileErrors]   = useState({})
  const [submitting, setSubmitting]   = useState(false)
  const [globalError, setGlobalError] = useState(null)
  const [existingApp, setExistingApp] = useState(null)
  const [checkingApp, setCheckingApp] = useState(true)

  const [form, setForm] = useState({
    department_id:     prefilledDept,           // ← pré-rempli si invité, sinon ''
    year:              prefilledYear,           // ← pré-rempli si invité, sinon ''
    filiere:           candidate?.filiere   || '',
    matricule:         candidate?.matricule || '',
    phone:             candidate?.phone     || '',
    motivation_letter: '',
  })
  const [formErrors, setFormErrors] = useState({})

  const year         = form.year
  const docsRequired = DOCS_CONFIG[year] || []
  const yearLabel    = year === '1' ? '1ère année' : '2ème année'
  const docsProgress = docsRequired.filter(d => files[d.key]).length
  const docsTotal    = docsRequired.length

  // Charger la liste des départements seulement si le candidat n'en a pas déjà un
  useEffect(() => {
    if (!prefilledDept) {
      api.get('/public/candidates')
        .then(res => setDepartments(res.data.departments || []))
        .catch(() => {})
    }
  }, [])

  // Vérifier si une candidature existe déjà
  useEffect(() => {
    api.get('/my-application')
      .then(res => { if (res.data.application) setExistingApp(res.data.application) })
      .catch(() => {})
      .finally(() => setCheckingApp(false))
  }, [])

  // Réinitialiser les fichiers si l'année change
  useEffect(() => { setFiles({}); setFileErrors({}) }, [form.year])

  const handleFileChange = (key) => (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setFileErrors(prev => ({ ...prev, [key]: 'Fichier trop volumineux (max 2 Mo)' }))
      return
    }
    setFiles(prev => ({ ...prev, [key]: file }))
    setFileErrors(prev => { const u = { ...prev }; delete u[key]; return u })
  }

  const handleRemoveFile = (key) => () => {
    setFiles(prev => { const u = { ...prev }; delete u[key]; return u })
  }

  const validateStep1 = () => {
    const errors = {}
    if (!form.department_id)                         errors.department_id     = 'Le département est obligatoire.'
    if (!form.year)                                  errors.year              = "L'année d'étude est obligatoire."
    if (!form.filiere.trim())                        errors.filiere           = 'La filière est requise.'
    if (!form.matricule.trim())                      errors.matricule         = 'Le numéro de matricule est requis.'
    if (!form.phone.trim())                          errors.phone             = 'Le téléphone est requis.'
    if (form.motivation_letter.trim().length < 100)  errors.motivation_letter = 'La lettre de motivation doit faire au moins 100 caractères.'
    if (form.motivation_letter.trim().length > 2000) errors.motivation_letter = 'Maximum 2000 caractères.'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors = {}
    for (const doc of docsRequired) {
      if (doc.required && !files[doc.key]) errors[doc.key] = 'Ce document est obligatoire.'
    }
    setFileErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextStep = () => { if (step === 1 && validateStep1()) setStep(2) }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    setSubmitting(true)
    setGlobalError(null)
    try {
      const fd = new FormData()
      fd.append('department_id',     form.department_id)
      fd.append('filiere',           form.filiere)
      fd.append('year',              form.year)
      fd.append('matricule',         form.matricule)
      fd.append('phone',             form.phone)
      fd.append('motivation_letter', form.motivation_letter)
      for (const [key, file] of Object.entries(files)) {
        fd.append(`documents[${key}]`, file)
      }
      await api.post('/applications', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setStep(3)
    } catch (err) {
      const errs = err.response?.data?.errors
      if (errs) setGlobalError(Object.values(errs).flat().join(' — '))
      else setGlobalError(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  if (checkingApp) {
    return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin" style={{ color: '#2A2AE0' }} /></div>
  }

  // ─── Dossier déjà soumis ─────────────────────────────────────────────────
  if (existingApp || step === 3) {
    const app = existingApp || { status: 'pending' }
    const statusConfig = {
      pending:   { label: "En cours d'examen", color: '#F0C040', bg: 'rgba(240,192,64,0.1)',  icon: '⏳' },
      validated: { label: 'Validé ✓',           color: '#4DC896', bg: 'rgba(77,200,150,0.1)', icon: '✅' },
      rejected:  { label: 'Rejeté',             color: '#E8112D', bg: 'rgba(232,17,45,0.1)',  icon: '❌' },
    }
    const status = statusConfig[app.status] || statusConfig.pending
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl p-10 text-center border" style={{ borderColor: 'rgba(42,42,224,0.08)', background: '#FFFFFF', boxShadow: '0 4px 24px rgba(42,42,224,0.06)' }}>
          <div className="text-6xl mb-6">{status.icon}</div>
          <h2 className="text-2xl font-black mb-3" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
            {existingApp ? 'Dossier soumis' : 'Dossier envoyé !'}
          </h2>
          <p className="text-gray-400 mb-6">
            {existingApp ? 'Votre dossier de candidature a déjà été soumis.' : 'Votre dossier a été transmis au comité UNEXE avec succès.'}
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold mb-6" style={{ background: status.bg, color: status.color }}>
            Statut : {status.label}
          </div>
          {app.status === 'pending' && (
            <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: 'rgba(42,42,224,0.04)', border: '1px solid rgba(42,42,224,0.1)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#0D0D1A' }}>Que se passe-t-il ensuite ?</p>
              <ul className="space-y-2 mt-3">
                {['Le comité examine votre dossier', 'Vous recevrez un email de décision', 'Si validé, votre compte sera activé', 'Vos informations seront visibles publiquement'].map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(13,13,26,0.55)' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{ background: 'rgba(42,42,224,0.1)', color: '#2A2AE0' }}>{i + 1}</div>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {app.status === 'validated' && (
            <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(77,200,150,0.07)', border: '1px solid rgba(77,200,150,0.2)' }}>
              <p className="text-sm font-bold mb-1" style={{ color: '#4DC896' }}>🎉 Félicitations ! Votre candidature a été validée.</p>
              <p className="text-xs" style={{ color: 'rgba(13,13,26,0.5)' }}>Vous avez maintenant accès à votre espace candidat complet.</p>
            </div>
          )}
          {app.review_note && (
            <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: 'rgba(240,192,64,0.06)', border: '1px solid rgba(240,192,64,0.2)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#F0C040' }}>Note du comité :</p>
              <p className="text-sm" style={{ color: 'rgba(13,13,26,0.65)' }}>{app.review_note}</p>
            </div>
          )}
          <button onClick={() => navigate('/espace-candidat')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: '#2A2AE0', boxShadow: '0 6px 20px rgba(42,42,224,0.3)' }}>
            Retour au tableau de bord <ChevronRight size={15} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* En-tête */}
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3"
          style={{ background: 'rgba(42,42,224,0.08)', color: '#2A2AE0', border: '1px solid rgba(42,42,224,0.15)' }}>
          <GraduationCap size={13} />
          {prefilledYear ? yearLabel : 'Candidature'}
          {prefilledDept && candidate?.department?.name ? ` · ${candidate.department.name}` : ''}
        </div>
        <h1 className="text-2xl font-black" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
          Dépôt de dossier
        </h1>
        <p className="text-sm text-gray-400 mt-1">Complétez votre dossier de candidature UNEXE</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 p-4 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid rgba(42,42,224,0.07)' }}>
        {[{ n: 1, label: 'Informations' }, { n: 2, label: 'Documents' }].map((s, idx) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all"
                style={{ background: step >= s.n ? '#2A2AE0' : 'rgba(42,42,224,0.07)', color: step >= s.n ? '#FFFFFF' : 'rgba(42,42,224,0.4)' }}>
                {step > s.n ? <CheckCircle size={16} /> : s.n}
              </div>
              <span className="text-sm font-bold hidden sm:block" style={{ color: step >= s.n ? '#0D0D1A' : 'rgba(13,13,26,0.35)' }}>{s.label}</span>
            </div>
            {idx < 1 && <div className="flex-1 h-px mx-4" style={{ background: step > s.n ? '#2A2AE0' : 'rgba(42,42,224,0.1)' }} />}
          </div>
        ))}
      </div>

      {/* Alerte globale */}
      {globalError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(232,17,45,0.06)', border: '1px solid rgba(232,17,45,0.2)' }}>
          <AlertCircle size={16} style={{ color: '#E8112D' }} />
          <span className="text-sm font-semibold" style={{ color: '#E8112D' }}>{globalError}</span>
        </div>
      )}

      {/* ── ÉTAPE 1 : Informations ────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border p-6 md:p-8 space-y-5" style={{ borderColor: 'rgba(42,42,224,0.07)', boxShadow: '0 2px 16px rgba(42,42,224,0.05)' }}>
          <div className="grid md:grid-cols-2 gap-5">

            {/* ── Département ── */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Département *</label>
              {prefilledDept ? (
                /* Candidat invité : lecture seule */
                <>
                  <input type="text" value={candidate?.department?.name || `Département #${prefilledDept}`} disabled
                    className="w-full px-4 py-3 rounded-2xl text-sm font-medium"
                    style={{ background: '#F0F0F8', border: '1.5px solid rgba(42,42,224,0.06)', color: 'rgba(13,13,26,0.4)', cursor: 'not-allowed' }} />
                  <p className="text-[10px] text-gray-400 mt-1">Attribué par le comité</p>
                </>
              ) : (
                /* Candidat auto-inscrit : menu déroulant */
                <>
                  <select value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all bg-white"
                    style={fieldStyle(formErrors.department_id)} onFocus={onFocus} onBlur={onBlur(formErrors.department_id)}>
                    <option value="">-- Sélectionner votre département --</option>
                    {departments.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
                  </select>
                  {formErrors.department_id && <p className="text-xs mt-1 font-medium" style={{ color: '#E8112D' }}>{formErrors.department_id}</p>}
                </>
              )}
            </div>

            {/* ── Année d'étude ── */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Année d'étude *</label>
              {prefilledYear ? (
                /* Candidat invité : lecture seule */
                <>
                  <input type="text" value={prefilledYear === '1' ? '1ère année' : '2ème année'} disabled
                    className="w-full px-4 py-3 rounded-2xl text-sm font-medium"
                    style={{ background: '#F0F0F8', border: '1.5px solid rgba(42,42,224,0.06)', color: 'rgba(13,13,26,0.4)', cursor: 'not-allowed' }} />
                  <p className="text-[10px] text-gray-400 mt-1">Attribuée par le comité</p>
                </>
              ) : (
                /* Candidat auto-inscrit : menu déroulant */
                <>
                  <select value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all bg-white"
                    style={fieldStyle(formErrors.year)} onFocus={onFocus} onBlur={onBlur(formErrors.year)}>
                    <option value="">-- Sélectionner votre année --</option>
                    <option value="1">1ère année</option>
                    <option value="2">2ème année</option>
                  </select>
                  {formErrors.year && <p className="text-xs mt-1 font-medium" style={{ color: '#E8112D' }}>{formErrors.year}</p>}
                </>
              )}
            </div>

            {/* Filière */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Filière</label>
              <input type="text" value={form.filiere} onChange={e => setForm(f => ({ ...f, filiere: e.target.value }))}
                placeholder="Ex : Informatique et Réseaux"
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                style={fieldStyle(formErrors.filiere)} onFocus={onFocus} onBlur={onBlur(formErrors.filiere)} />
              {formErrors.filiere && <p className="text-xs mt-1 font-medium" style={{ color: '#E8112D' }}>{formErrors.filiere}</p>}
            </div>

            {/* Matricule */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Numéro de matricule</label>
              <input type="text" value={form.matricule} onChange={e => setForm(f => ({ ...f, matricule: e.target.value }))}
                placeholder="Ex : INSTI/2023/001"
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                style={fieldStyle(formErrors.matricule)} onFocus={onFocus} onBlur={onBlur(formErrors.matricule)} />
              {formErrors.matricule && <p className="text-xs mt-1 font-medium" style={{ color: '#E8112D' }}>{formErrors.matricule}</p>}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Numéro de téléphone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+229 00 00 00 00"
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                style={fieldStyle(formErrors.phone)} onFocus={onFocus} onBlur={onBlur(formErrors.phone)} />
              {formErrors.phone && <p className="text-xs mt-1 font-medium" style={{ color: '#E8112D' }}>{formErrors.phone}</p>}
            </div>
          </div>

          {/* Lettre de motivation */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
              Lettre de motivation
              <span className="ml-2 text-[10px] font-medium normal-case tracking-normal text-gray-400">(min. 100 · max. 2000 caractères)</span>
            </label>
            <textarea rows={6} value={form.motivation_letter}
              onChange={e => setForm(f => ({ ...f, motivation_letter: e.target.value }))}
              placeholder="Expliquez pourquoi vous souhaitez participer au concours UNEXE, vos motivations, vos objectifs académiques et professionnels..."
              className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all resize-none leading-relaxed"
              style={fieldStyle(formErrors.motivation_letter)} onFocus={onFocus} onBlur={onBlur(formErrors.motivation_letter)} />
            <div className="flex items-center justify-between mt-1.5">
              {formErrors.motivation_letter
                ? <p className="text-xs font-medium" style={{ color: '#E8112D' }}>{formErrors.motivation_letter}</p>
                : <span />}
              <span className="text-[11px] font-semibold" style={{
                color: form.motivation_letter.length < 100 ? '#E8112D' : form.motivation_letter.length > 1800 ? '#F0C040' : 'rgba(13,13,26,0.35)',
              }}>
                {form.motivation_letter.length} / 2000
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="button" onClick={handleNextStep}
              className="flex items-center gap-2 px-7 py-3 text-sm font-bold text-white rounded-2xl transition-all hover:scale-105"
              style={{ background: '#2A2AE0', boxShadow: '0 6px 20px rgba(42,42,224,0.3)' }}>
              Continuer vers les documents <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 : Documents ───────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(42,42,224,0.04)', border: '1px solid rgba(42,42,224,0.1)' }}>
            <BookOpen size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#2A2AE0' }} />
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: '#0D0D1A' }}>Documents requis pour la {yearLabel}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(13,13,26,0.5)' }}>
                {year === '1'
                  ? "En tant qu'étudiant de 1ère année, vous devez fournir 3 documents obligatoires."
                  : "En tant qu'étudiant de 2ème année, vous devez fournir 5 documents obligatoires incluant les pièces justificatives de votre 1ère année."}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl flex items-center gap-4" style={{ background: '#FFFFFF', border: '1px solid rgba(42,42,224,0.07)' }}>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold" style={{ color: '#0D0D1A' }}>Progression des documents</span>
                <span className="text-xs font-black" style={{ color: '#2A2AE0' }}>{docsProgress} / {docsTotal}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(42,42,224,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${docsTotal > 0 ? (docsProgress / docsTotal) * 100 : 0}%`, background: docsProgress === docsTotal ? '#4DC896' : '#2A2AE0' }} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {docsRequired.map(doc => (
              <DocCard key={doc.key} doc={doc} file={files[doc.key]}
                onFileChange={handleFileChange(doc.key)} onRemove={handleRemoveFile(doc.key)} error={fileErrors[doc.key]} />
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-2xl transition-all"
              style={{ color: 'rgba(13,13,26,0.55)', border: '1.5px solid rgba(42,42,224,0.12)', background: 'transparent' }}>
              ← Retour
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting || docsProgress < docsTotal}
              className="flex items-center gap-2 px-7 py-3 text-sm font-bold text-white rounded-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: '#2A2AE0', boxShadow: '0 6px 20px rgba(42,42,224,0.3)' }}>
              {submitting ? <><Loader2 size={15} className="animate-spin" /> Envoi en cours...</> : <><Upload size={15} /> Soumettre le dossier</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}