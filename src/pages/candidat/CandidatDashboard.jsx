import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import {
  Upload, CheckCircle, Clock, XCircle, FileText,
  GraduationCap, MessageSquare, User, ChevronRight,
  AlertTriangle, Sparkles, BookOpen
} from 'lucide-react'

// ─── Badge statut de candidature ─────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = {
    pending:   { label: 'En cours d\'examen', color: '#F0C040', bg: 'rgba(240,192,64,0.12)', icon: Clock },
    validated: { label: 'Validé',             color: '#4DC896', bg: 'rgba(77,200,150,0.12)',  icon: CheckCircle },
    rejected:  { label: 'Rejeté',             color: '#E8112D', bg: 'rgba(232,17,45,0.1)',   icon: XCircle },
  }
  const s   = cfg[status] || cfg.pending
  const Icon = s.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      <Icon size={12} />
      {s.label}
    </span>
  )
}

// ─── Card stat ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = '#2A2AE0', sub }) {
  return (
    <div
      className="bg-white rounded-2xl p-5 border"
      style={{ borderColor: 'rgba(42,42,224,0.07)', boxShadow: '0 2px 12px rgba(42,42,224,0.04)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12` }}
        >
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-black" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function CandidatDashboard() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const candidate = user?.candidate

  const [application, setApplication] = useState(null)
  const [loading, setLoading]         = useState(true)

  const year      = candidate?.year
  const yearLabel = year === '1' ? '1ère année' : year === '2' ? '2ème année' : '—'
  const dept      = candidate?.department?.name || 'INSTI Lokossa'
  const deptSlug  = candidate?.department?.slug || '—'

  useEffect(() => {
    api.get('/my-application')
      .then(res => setApplication(res.data.application))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ─── Aucun dossier soumis ─────────────────────────────────────────────────
  const noDossier = !loading && !application

  // ─── Dossier soumis mais en attente ──────────────────────────────────────
  const dossierPending = application?.status === 'pending'

  // ─── Dossier validé ───────────────────────────────────────────────────────
  const dossierValidated = application?.status === 'validated' || candidate?.status === 'validated'

  // ─── Dossier rejeté ───────────────────────────────────────────────────────
  const dossierRejected = application?.status === 'rejected'

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-black"
            style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}
          >
            Bonjour, {user?.name?.split(' ')[0]} 👋
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(42,42,224,0.1)', color: '#2A2AE0' }}
            >
              {deptSlug}
            </span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(240,192,64,0.1)', color: '#c79a00' }}
            >
              {yearLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          CAS 1 : Pas encore de dossier — CTA fort
      ══════════════════════════════════════════════ */}
      {noDossier && (
        <div
          className="relative overflow-hidden rounded-3xl p-8 md:p-10"
          style={{
            background: 'linear-gradient(135deg, #0D0D2B 0%, #1A1A6A 100%)',
            boxShadow: '0 20px 60px rgba(42,42,224,0.25)',
          }}
        >
          {/* Déco */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #2A2AE0, transparent)', filter: 'blur(40px)' }}
          />

          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <AlertTriangle size={11} />
              Action requise
            </div>

            <h2
              className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Déposez votre dossier<br />
              <span style={{ color: '#A5A5FF' }}>pour rejoindre UNEXE</span>
            </h2>
            <p className="text-white/50 mb-8 max-w-lg leading-relaxed">
              Pour participer au concours, vous devez soumettre votre dossier de candidature.
              {year === '1'
                ? ' En tant qu\'étudiant de 1ère année, vous devrez fournir 3 documents.'
                : ' En tant qu\'étudiant de 2ème année, vous devrez fournir 5 documents.'}
            </p>

            {/* Documents attendus — aperçu */}
            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              {year === '1' ? (
                <>
                  {[
                    { label: 'CV', desc: 'Curriculum Vitæ' },
                    { label: 'BAC', desc: 'Relevé de notes' },
                    { label: 'Préinscription', desc: 'Fiche 1ère année' },
                  ].map(d => (
                    <div key={d.label}
                      className="flex items-center gap-2.5 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <FileText size={14} style={{ color: '#A5A5FF' }} />
                      <div>
                        <p className="text-white text-xs font-bold">{d.label}</p>
                        <p className="text-white/40 text-[10px]">{d.desc}</p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { label: 'CV + BAC', desc: '2 documents' },
                    { label: 'Préinscriptions', desc: '1ère et 2ème année' },
                    { label: 'Validation 1A', desc: 'Fiche ou relevé' },
                  ].map(d => (
                    <div key={d.label}
                      className="flex items-center gap-2.5 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <FileText size={14} style={{ color: '#A5A5FF' }} />
                      <div>
                        <p className="text-white text-xs font-bold">{d.label}</p>
                        <p className="text-white/40 text-[10px]">{d.desc}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <button
              onClick={() => navigate('/espace-candidat/dossier')}
              className="group inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-black text-white transition-all hover:scale-105"
              style={{ background: '#2A2AE0', boxShadow: '0 8px 30px rgba(42,42,224,0.5)' }}
            >
              <Upload size={17} />
              Déposer mon dossier maintenant
              <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          CAS 2 : Dossier en attente
      ══════════════════════════════════════════════ */}
      {dossierPending && (
        <div
          className="rounded-3xl p-6 md:p-8 border"
          style={{
            background: 'rgba(240,192,64,0.04)',
            borderColor: 'rgba(240,192,64,0.2)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
              style={{ background: 'rgba(240,192,64,0.1)' }}
            >
              ⏳
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h3 className="font-black text-lg" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
                  Dossier en cours d'examen
                </h3>
                <StatusPill status="pending" />
              </div>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                Votre dossier a été transmis au comité UNEXE. Vous recevrez un email dès qu'une décision sera prise.
              </p>

              {/* Timeline */}
              <div className="space-y-3">
                {[
                  { done: true,  label: 'Dossier soumis',              date: application?.created_at },
                  { done: false, label: 'Examen par le comité',        date: null },
                  { done: false, label: 'Décision par email',          date: null },
                  { done: false, label: 'Accès complet à la plateforme', date: null },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: step.done ? 'rgba(77,200,150,0.15)' : 'rgba(42,42,224,0.07)',
                        border: `2px solid ${step.done ? '#4DC896' : 'rgba(42,42,224,0.15)'}`,
                      }}
                    >
                      {step.done && <CheckCircle size={12} style={{ color: '#4DC896' }} />}
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: step.done ? '#0D0D1A' : 'rgba(13,13,26,0.4)' }}
                    >
                      {step.label}
                    </span>
                    {step.date && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(step.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          CAS 3 : Dossier validé 🎉
      ══════════════════════════════════════════════ */}
      {dossierValidated && (
        <>
          {/* Bannière de félicitations */}
          <div
            className="relative overflow-hidden rounded-3xl p-6 md:p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(77,200,150,0.1) 0%, rgba(42,42,224,0.05) 100%)',
              border: '1px solid rgba(77,200,150,0.25)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎉</div>
              <div>
                <h3 className="font-black text-xl mb-1" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
                  Candidature validée !
                </h3>
                <p className="text-sm" style={{ color: 'rgba(13,13,26,0.55)' }}>
                  Bienvenue dans la compétition UNEXE. Votre profil est maintenant visible publiquement.
                </p>
              </div>
              <Sparkles size={24} style={{ color: '#4DC896', marginLeft: 'auto' }} className="flex-shrink-0" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={GraduationCap} label="Département" value={deptSlug} color="#2A2AE0" sub={dept} />
            <StatCard icon={BookOpen}      label="Niveau"       value={yearLabel} color="#F0C040" />
            <StatCard icon={User}          label="Statut"       value="Validé ✓" color="#4DC896" sub="Visible publiquement" />
          </div>

          {/* Accès rapide */}
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/espace-candidat/forum')}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border text-left transition-all hover:shadow-lg"
              style={{ borderColor: 'rgba(42,42,224,0.07)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(42,42,224,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(42,42,224,0.07)'}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(42,42,224,0.08)' }}
              >
                <MessageSquare size={22} style={{ color: '#2A2AE0' }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#0D0D1A' }}>Forum communauté</p>
                <p className="text-xs text-gray-400 mt-0.5">Échangez avec les autres candidats</p>
              </div>
              <ChevronRight
                size={16}
                className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                style={{ color: '#2A2AE0' }}
              />
            </button>

            <button
              onClick={() => navigate('/espace-candidat/profil')}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border text-left transition-all hover:shadow-lg"
              style={{ borderColor: 'rgba(42,42,224,0.07)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(42,42,224,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(42,42,224,0.07)'}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(77,200,150,0.08)' }}
              >
                <User size={22} style={{ color: '#4DC896' }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#0D0D1A' }}>Mon profil public</p>
                <p className="text-xs text-gray-400 mt-0.5">Gérer vos informations visibles</p>
              </div>
              <ChevronRight
                size={16}
                className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                style={{ color: '#2A2AE0' }}
              />
            </button>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════
          CAS 4 : Dossier rejeté
      ══════════════════════════════════════════════ */}
      {dossierRejected && (
        <div
          className="rounded-3xl p-6 md:p-8 border"
          style={{ background: 'rgba(232,17,45,0.03)', borderColor: 'rgba(232,17,45,0.15)' }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
              style={{ background: 'rgba(232,17,45,0.08)' }}
            >
              ❌
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h3 className="font-black text-lg" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
                  Candidature non retenue
                </h3>
                <StatusPill status="rejected" />
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Votre candidature n'a pas été retenue par le comité cette fois-ci.
              </p>
              {application?.review_note && (
                <div
                  className="p-4 rounded-2xl text-sm"
                  style={{ background: 'rgba(240,192,64,0.07)', border: '1px solid rgba(240,192,64,0.2)' }}
                >
                  <p className="text-xs font-bold mb-1" style={{ color: '#c79a00' }}>
                    Motif communiqué par le comité :
                  </p>
                  <p style={{ color: 'rgba(13,13,26,0.65)' }}>{application.review_note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Infos profil (toujours visible) */}
      <div
        className="bg-white rounded-2xl p-5 border"
        style={{ borderColor: 'rgba(42,42,224,0.07)' }}
      >
        <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-4">
          Mes informations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Nom',           value: user?.name },
            { label: 'Email',         value: user?.email },
            { label: 'Département',   value: candidate?.department?.name || '—' },
            { label: 'Année',         value: yearLabel },
            { label: 'Filière',       value: candidate?.filiere || application?.filiere || '—' },
            { label: 'Matricule',     value: candidate?.matricule || application?.matricule || '—' },
            { label: 'Téléphone',     value: candidate?.phone || application?.phone || '—' },
            { label: 'Statut dossier',value: application ? <StatusPill status={application.status} /> : 'Aucun dossier' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                {item.label}
              </p>
              <div className="font-semibold text-sm" style={{ color: '#0D0D1A' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}