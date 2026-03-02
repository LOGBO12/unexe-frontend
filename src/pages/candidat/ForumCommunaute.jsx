import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import {
  MessageSquare, Plus, Send, X, ChevronLeft,
  Megaphone, MessageCircle, Pin, Lock,
  CornerDownRight, CheckCircle, Search,
  RefreshCw, AlertCircle
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ user, size = 8 }) {
  const photo = user?.avatar_url || (user?.avatar ? `/storage/${user.avatar}` : null)
  const s     = `w-${size} h-${size}`
  return (
    <div className={`${s} rounded-xl overflow-hidden flex-shrink-0`}
      style={{ background: 'linear-gradient(135deg, #2A2AE0, #A5A5FF)', minWidth: size === 8 ? 32 : 28, minHeight: size === 8 ? 32 : 28 }}>
      {photo ? (
        <img src={photo} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white font-black text-xs">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      )}
    </div>
  )
}

function RoleBadge({ role }) {
  if (role === 'super_admin' || role === 'comite') {
    return (
      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(232,17,45,0.1)', color: '#E8112D' }}>
        {role === 'super_admin' ? '⚡ Admin' : '🛡️ Comité'}
      </span>
    )
  }
  return (
    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(42,42,224,0.08)', color: '#2A2AE0' }}>
      Candidat
    </span>
  )
}

// ─── Composant Reply ──────────────────────────────────────────────────────────
function ReplyItem({ reply, onReplyTo, currentUserId, isComite, onDelete, onMarkOfficial }) {
  return (
    <div className="group">
      <div
        className={`p-4 rounded-2xl transition-all duration-200 ${reply.is_official_response ? 'ring-1' : ''}`}
        style={{
          background: reply.is_official_response ? 'rgba(42,42,224,0.04)' : '#FAFAFA',
          border: `1px solid ${reply.is_official_response ? 'rgba(42,42,224,0.15)' : 'rgba(42,42,224,0.05)'}`,
          ...(reply.is_official_response && { ringColor: 'rgba(42,42,224,0.2)' })
        }}
      >
        <div className="flex items-start gap-3">
          <Avatar user={reply.user} size={8} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-sm font-bold" style={{ color: '#0D0D1A' }}>{reply.user?.name}</span>
              <RoleBadge role={reply.user?.role} />
              {reply.is_official_response && (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(42,42,224,0.12)', color: '#2A2AE0' }}>
                  <CheckCircle size={9} /> Réponse officielle
                </span>
              )}
              <span className="text-[10px] text-gray-400 ml-auto">{reply.created_at}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{reply.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onReplyTo(reply)}
                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-[#2A2AE0] transition-colors"
              >
                <CornerDownRight size={11} /> Répondre
              </button>
              {(isComite || currentUserId === reply.user?.id) && (
                <button
                  onClick={() => onDelete(reply.id)}
                  className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors"
                >
                  Supprimer
                </button>
              )}
              {isComite && (
                <button
                  onClick={() => onMarkOfficial(reply.id)}
                  className="text-[10px] font-bold text-gray-400 hover:text-[#2A2AE0] transition-colors"
                >
                  {reply.is_official_response ? '✓ Officielle' : 'Marquer officielle'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sous-réponses */}
      {reply.children?.length > 0 && (
        <div className="ml-10 mt-2 space-y-2">
          {reply.children.map(child => (
            <div key={child.id}
              className="p-3 rounded-xl flex gap-3"
              style={{ background: 'rgba(42,42,224,0.03)', border: '1px solid rgba(42,42,224,0.06)' }}>
              <div className="w-1 flex-shrink-0 rounded-full self-stretch" style={{ background: '#2A2AE020' }} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar user={child.user} size={6} />
                  <span className="text-xs font-bold" style={{ color: '#0D0D1A' }}>{child.user?.name}</span>
                  <RoleBadge role={child.user?.role} />
                  <span className="text-[10px] text-gray-400 ml-auto">{child.created_at}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{child.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Composant TopicCard ──────────────────────────────────────────────────────
function TopicCard({ topic, isActive, onClick }) {
  const isAnnouncement = topic.type === 'announcement'
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 group"
      style={{
        background: isActive ? 'rgba(42,42,224,0.1)' : 'transparent',
        border: `1px solid ${isActive ? 'rgba(42,42,224,0.25)' : 'transparent'}`,
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(42,42,224,0.04)' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: isAnnouncement ? 'rgba(232,17,45,0.1)' : 'rgba(42,42,224,0.08)',
          color: isAnnouncement ? '#E8112D' : '#2A2AE0',
        }}
      >
        {isAnnouncement ? <Megaphone size={14} /> : <MessageCircle size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          {topic.is_pinned && <Pin size={9} style={{ color: '#F0C040' }} fill="#F0C040" />}
          {topic.is_closed && <Lock size={9} style={{ color: '#9CA3AF' }} />}
          {isAnnouncement && (
            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(232,17,45,0.1)', color: '#E8112D' }}>
              Officiel
            </span>
          )}
        </div>
        <p className={`text-xs font-semibold leading-snug truncate ${isActive ? 'text-[#2A2AE0]' : 'text-gray-700'}`}>
          {topic.title}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {topic.replies_count} rép. · {topic.created_at}
        </p>
      </div>
    </button>
  )
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function ForumCommunaute() {
  const { user }   = useAuth()
  const location   = useLocation()
  const isComite   = user?.role === 'super_admin' || user?.role === 'comite'
  const repliesRef = useRef(null)

  // Liste topics
  const [topics, setTopics]           = useState([])
  const [statsGlobal, setStatsGlobal] = useState({})
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [search, setSearch]           = useState('')
  const [filterType, setFilterType]   = useState('all') // all | announcement | discussion

  // Topic sélectionné
  const [activeTopic, setActiveTopic]   = useState(null)
  const [replies, setReplies]           = useState([])
  const [loadingReplies, setLoadingReplies] = useState(false)

  // Nouveau topic
  const [showNewTopic, setShowNewTopic] = useState(false)
  const [newTopic, setNewTopic]         = useState({ title: '', content: '' })
  const [savingTopic, setSavingTopic]   = useState(false)
  const [topicError, setTopicError]     = useState(null)

  // Réponse
  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo]     = useState(null) // reply parent
  const [sendingReply, setSendingReply] = useState(false)
  const [replyError, setReplyError]     = useState(null)

  // Mobile — vue liste ou détail
  const [mobileView, setMobileView] = useState('list') // list | detail

  // Charger topics
  const loadTopics = async () => {
    setLoadingTopics(true)
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.append('type', filterType)
      if (search) params.append('search', search)
      const res = await api.get(`/forum/topics?${params}`)
      setTopics(res.data.topics?.data || [])
      setStatsGlobal(res.data.stats || {})
    } catch {
      // silent
    } finally {
      setLoadingTopics(false)
    }
  }

  // Charger détail topic
  const loadTopic = async (id) => {
    setLoadingReplies(true)
    try {
      const res = await api.get(`/forum/topics/${id}`)
      setActiveTopic(res.data.topic)
      setReplies(res.data.replies || [])
      setMobileView('detail')
      setTimeout(() => repliesRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100)
    } catch {
      // silent
    } finally {
      setLoadingReplies(false)
    }
  }

  useEffect(() => { loadTopics() }, [filterType])

  // Ouvrir un topic depuis le dashboard
  useEffect(() => {
    const topicId = location.state?.topicId
    if (topicId) loadTopic(topicId)
  }, [location.state])

  const handleSearch = (e) => {
    e.preventDefault()
    loadTopics()
  }

  const handleSelectTopic = (topic) => {
    loadTopic(topic.id)
    setReplyingTo(null)
    setReplyContent('')
  }

  // Créer topic
  const handleCreateTopic = async (e) => {
    e.preventDefault()
    setSavingTopic(true)
    setTopicError(null)
    try {
      const endpoint = isComite ? '/forum/announcements' : '/forum/topics'
      const res = await api.post(endpoint, newTopic)
      setNewTopic({ title: '', content: '' })
      setShowNewTopic(false)
      await loadTopics()
      loadTopic(res.data.topic.id)
    } catch (err) {
      setTopicError(err.response?.data?.message || 'Erreur lors de la création.')
    } finally {
      setSavingTopic(false)
    }
  }

  // Envoyer réponse
  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    setSendingReply(true)
    setReplyError(null)
    try {
      await api.post(`/forum/topics/${activeTopic.id}/replies`, {
        content:   replyContent,
        parent_id: replyingTo?.id || null,
      })
      setReplyContent('')
      setReplyingTo(null)
      await loadTopic(activeTopic.id)
      setTimeout(() => repliesRef.current?.scrollTo({ top: repliesRef.current.scrollHeight, behavior: 'smooth' }), 100)
    } catch (err) {
      setReplyError(err.response?.data?.message || 'Erreur.')
    } finally {
      setSendingReply(false)
    }
  }

  // Supprimer reply
  const handleDeleteReply = async (replyId) => {
    if (!confirm('Supprimer cette réponse ?')) return
    await api.delete(`/forum/replies/${replyId}`)
    await loadTopic(activeTopic.id)
  }

  // Marquer officielle
  const handleMarkOfficial = async (replyId) => {
    await api.put(`/forum/replies/${replyId}/official`)
    await loadTopic(activeTopic.id)
  }

  // Supprimer topic
  const handleDeleteTopic = async (id) => {
    if (!confirm('Supprimer ce topic et toutes ses réponses ?')) return
    await api.delete(`/forum/topics/${id}`)
    setActiveTopic(null)
    setMobileView('list')
    loadTopics()
  }

  // Pin / close (comité)
  const handlePin  = async (id) => { await api.put(`/forum/topics/${id}/pin`);  loadTopics(); if (activeTopic?.id === id) loadTopic(id) }
  const handleClose = async (id) => { await api.put(`/forum/topics/${id}/close`); loadTopics(); if (activeTopic?.id === id) loadTopic(id) }

  const filteredTopics = topics.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
            Communauté
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {statsGlobal.total_topics ?? '—'} sujets · {statsGlobal.total_replies ?? '—'} réponses
          </p>
        </div>
        <button
          onClick={() => setShowNewTopic(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-2xl transition-all hover:scale-105"
          style={{ background: '#2A2AE0', boxShadow: '0 6px 20px rgba(42,42,224,0.3)' }}
        >
          <Plus size={16} />
          {isComite ? 'Nouvelle annonce' : 'Nouvelle discussion'}
        </button>
      </div>

      {/* Modal nouveau topic */}
      {showNewTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            style={{ border: '1px solid rgba(42,42,224,0.1)' }}>
            <div className="px-6 py-5 border-b flex items-center justify-between"
              style={{ borderColor: 'rgba(42,42,224,0.07)' }}>
              <h2 className="font-black text-lg" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
                {isComite ? '📢 Nouvelle annonce' : '💬 Nouvelle discussion'}
              </h2>
              <button onClick={() => setShowNewTopic(false)} className="text-gray-400 hover:text-gray-700 transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTopic} className="p-6 space-y-4">
              {topicError && (
                <div className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(232,17,45,0.07)', border: '1px solid rgba(232,17,45,0.2)' }}>
                  <AlertCircle size={14} style={{ color: '#E8112D' }} />
                  <span className="text-xs text-red-600">{topicError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Titre</label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={e => setNewTopic(t => ({ ...t, title: e.target.value }))}
                  required
                  minLength={5}
                  placeholder="Sujet de la discussion..."
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                  style={{
                    background: '#F7F7FC',
                    border: '1.5px solid rgba(42,42,224,0.1)',
                    color: '#0D0D1A',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(42,42,224,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(42,42,224,0.1)'}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Contenu</label>
                <textarea
                  value={newTopic.content}
                  onChange={e => setNewTopic(t => ({ ...t, content: e.target.value }))}
                  required
                  minLength={10}
                  rows={5}
                  placeholder="Décrivez votre question ou sujet..."
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all resize-none leading-relaxed"
                  style={{
                    background: '#F7F7FC',
                    border: '1.5px solid rgba(42,42,224,0.1)',
                    color: '#0D0D1A',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(42,42,224,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(42,42,224,0.1)'}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={savingTopic}
                  className="flex-1 py-3 text-sm font-bold text-white rounded-2xl disabled:opacity-50 transition-all hover:scale-[1.02]"
                  style={{ background: '#2A2AE0', boxShadow: '0 6px 16px rgba(42,42,224,0.3)' }}
                >
                  {savingTopic ? 'Publication...' : 'Publier'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTopic(false)}
                  className="px-5 py-3 text-sm font-semibold rounded-2xl transition-colors"
                  style={{ background: '#F0F0F8', color: 'rgba(13,13,26,0.5)' }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Layout principal — 2 colonnes */}
      <div className="flex gap-5" style={{ height: 'calc(100vh - 220px)', minHeight: 400 }}>

        {/* ── COLONNE GAUCHE : liste ──────────────────────────────── */}
        <div
          className={`flex flex-col bg-white rounded-3xl border overflow-hidden ${
            mobileView === 'detail' ? 'hidden lg:flex' : 'flex'
          } lg:flex`}
          style={{
            width: 300,
            minWidth: 300,
            borderColor: 'rgba(42,42,224,0.07)',
            boxShadow: '0 2px 12px rgba(42,42,224,0.04)',
          }}
        >
          {/* Recherche + filtres */}
          <div className="px-4 py-4 border-b space-y-3" style={{ borderColor: 'rgba(42,42,224,0.06)' }}>
            <form onSubmit={handleSearch} className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs font-medium outline-none"
                style={{
                  background: '#F7F7FC',
                  border: '1.5px solid rgba(42,42,224,0.08)',
                  color: '#0D0D1A',
                }}
              />
            </form>
            <div className="flex gap-1.5">
              {[
                { key: 'all',          label: 'Tous' },
                { key: 'announcement', label: '📢' },
                { key: 'discussion',   label: '💬' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  className="flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  style={{
                    background: filterType === f.key ? '#2A2AE0' : 'rgba(42,42,224,0.05)',
                    color: filterType === f.key ? '#FFFFFF' : 'rgba(13,13,26,0.5)',
                  }}
                >
                  {f.label}
                </button>
              ))}
              <button
                onClick={loadTopics}
                className="p-1.5 rounded-xl transition hover:bg-gray-100"
                title="Rafraîchir"
              >
                <RefreshCw size={12} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {loadingTopics ? (
              <div className="space-y-2 p-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex gap-2 animate-pulse p-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">Aucun sujet</p>
              </div>
            ) : (
              filteredTopics.map(t => (
                <TopicCard
                  key={t.id}
                  topic={t}
                  isActive={activeTopic?.id === t.id}
                  onClick={() => handleSelectTopic(t)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── COLONNE DROITE : détail ─────────────────────────────── */}
        <div
          className={`flex-1 flex flex-col bg-white rounded-3xl border overflow-hidden ${
            mobileView === 'list' ? 'hidden lg:flex' : 'flex'
          } lg:flex`}
          style={{ borderColor: 'rgba(42,42,224,0.07)', boxShadow: '0 2px 12px rgba(42,42,224,0.04)', minWidth: 0 }}
        >
          {!activeTopic ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-4"
                  style={{ background: 'rgba(42,42,224,0.06)' }}>
                  <MessageSquare size={32} style={{ color: '#2A2AE0' }} />
                </div>
                <p className="font-black text-lg text-gray-700 mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Sélectionnez un sujet
                </p>
                <p className="text-sm text-gray-400 max-w-xs">
                  Choisissez un sujet dans la liste pour lire les échanges et participer.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header topic */}
              <div className="px-6 py-4 border-b"
                style={{ borderColor: 'rgba(42,42,224,0.07)', background: activeTopic.type === 'announcement' ? 'rgba(232,17,45,0.02)' : '#FAFAFA' }}>
                <div className="flex items-start gap-3">

                  {/* Retour mobile */}
                  <button
                    className="lg:hidden p-1.5 rounded-xl hover:bg-gray-100 transition flex-shrink-0 mt-0.5"
                    onClick={() => setMobileView('list')}
                  >
                    <ChevronLeft size={18} className="text-gray-500" />
                  </button>

                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {activeTopic.type === 'announcement' && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(232,17,45,0.1)', color: '#E8112D' }}>
                          <Megaphone size={9} /> Annonce officielle
                        </span>
                      )}
                      {activeTopic.is_pinned && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(240,192,64,0.12)', color: '#F0C040' }}>
                          <Pin size={9} fill="currentColor" /> Épinglé
                        </span>
                      )}
                      {activeTopic.is_closed && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(156,163,175,0.12)', color: '#9CA3AF' }}>
                          <Lock size={9} /> Fermé
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-black leading-tight"
                      style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
                      {activeTopic.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Avatar user={activeTopic.author} size={5} />
                      <span className="text-xs text-gray-500 font-medium">{activeTopic.author?.name}</span>
                      <RoleBadge role={activeTopic.author?.role} />
                      <span className="text-xs text-gray-400">· {activeTopic.created_at}</span>
                    </div>
                  </div>

                  {/* Actions comité */}
                  {isComite && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handlePin(activeTopic.id)}
                        className="p-1.5 rounded-xl transition hover:bg-gray-100"
                        title={activeTopic.is_pinned ? 'Désépingler' : 'Épingler'}
                        style={{ color: activeTopic.is_pinned ? '#F0C040' : '#9CA3AF' }}
                      >
                        <Pin size={15} fill={activeTopic.is_pinned ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => handleClose(activeTopic.id)}
                        className="p-1.5 rounded-xl transition hover:bg-gray-100"
                        title={activeTopic.is_closed ? 'Rouvrir' : 'Fermer'}
                        style={{ color: activeTopic.is_closed ? '#2A2AE0' : '#9CA3AF' }}
                      >
                        <Lock size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(activeTopic.id)}
                        className="p-1.5 rounded-xl transition hover:bg-red-50 text-red-400"
                        title="Supprimer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contenu du topic */}
                <div className="mt-4 p-4 rounded-2xl"
                  style={{ background: activeTopic.type === 'announcement' ? 'rgba(232,17,45,0.04)' : 'rgba(42,42,224,0.03)', border: `1px solid ${activeTopic.type === 'announcement' ? 'rgba(232,17,45,0.1)' : 'rgba(42,42,224,0.07)'}` }}>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {activeTopic.content}
                  </p>
                </div>
              </div>

              {/* Replies */}
              <div ref={repliesRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {loadingReplies ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex-shrink-0" />
                        <div className="flex-1 space-y-2 p-3 bg-gray-50 rounded-2xl">
                          <div className="h-3 bg-gray-100 rounded w-1/3" />
                          <div className="h-3 bg-gray-100 rounded w-full" />
                          <div className="h-3 bg-gray-100 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : replies.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageCircle size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">Aucune réponse encore. Soyez le premier !</p>
                  </div>
                ) : (
                  replies.map(reply => (
                    <ReplyItem
                      key={reply.id}
                      reply={reply}
                      onReplyTo={(r) => { setReplyingTo(r); document.getElementById('reply-input')?.focus() }}
                      currentUserId={user?.id}
                      isComite={isComite}
                      onDelete={handleDeleteReply}
                      onMarkOfficial={handleMarkOfficial}
                    />
                  ))
                )}
              </div>

              {/* Zone de réponse */}
              {!activeTopic.is_closed ? (
                <div className="px-6 py-4 border-t" style={{ borderColor: 'rgba(42,42,224,0.07)' }}>
                  {/* Réponse à ... */}
                  {replyingTo && (
                    <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(42,42,224,0.06)', border: '1px solid rgba(42,42,224,0.12)' }}>
                      <CornerDownRight size={12} style={{ color: '#2A2AE0' }} />
                      <span className="text-xs text-gray-500">Réponse à <strong>{replyingTo.user?.name}</strong></span>
                      <button onClick={() => setReplyingTo(null)} className="ml-auto text-gray-400 hover:text-gray-700">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  {replyError && (
                    <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(232,17,45,0.07)' }}>
                      <AlertCircle size={12} style={{ color: '#E8112D' }} />
                      <span className="text-xs text-red-600">{replyError}</span>
                    </div>
                  )}
                  <form onSubmit={handleSendReply} className="flex items-end gap-3">
                    <Avatar user={user} size={8} />
                    <div className="flex-1 relative">
                      <textarea
                        id="reply-input"
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(e) }
                        }}
                        placeholder="Écrivez votre réponse... (Entrée pour envoyer)"
                        rows={2}
                        className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all resize-none leading-relaxed pr-12"
                        style={{
                          background: '#F7F7FC',
                          border: '1.5px solid rgba(42,42,224,0.1)',
                          color: '#0D0D1A',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(42,42,224,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(42,42,224,0.1)'}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sendingReply || !replyContent.trim()}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all hover:scale-105"
                      style={{ background: '#2A2AE0', boxShadow: '0 4px 12px rgba(42,42,224,0.3)' }}
                    >
                      <Send size={16} className="text-white" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="px-6 py-4 border-t text-center"
                  style={{ borderColor: 'rgba(42,42,224,0.07)' }}>
                  <div className="inline-flex items-center gap-2 text-xs text-gray-400 font-medium">
                    <Lock size={12} />
                    Ce topic est fermé aux nouvelles réponses
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}