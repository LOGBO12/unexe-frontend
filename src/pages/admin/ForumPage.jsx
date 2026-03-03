import { useEffect, useState, useRef } from 'react'
import api from '../../api/axios'
import {
  MessageSquare, Plus, Send, X, Pin, Lock, Trash2,
  CheckCircle, Search, RefreshCw, Megaphone, Hash,
  CornerDownRight, ArrowDown, AlertCircle, Users, BarChart2
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ user, size = 32 }) {
  const photo = user?.avatar ? `/storage/${user.avatar}` : null
  const colors = ['#2A2AE0', '#008751', '#E8112D', '#8B5CF6', '#F0C040']
  const color = colors[(user?.id || 0) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28, overflow: 'hidden', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, ${color}88)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {photo
        ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: 'white', fontWeight: 900, fontSize: size * 0.38 }}>{user?.name?.charAt(0)?.toUpperCase()}</span>
      }
    </div>
  )
}

function RolePill({ role }) {
  const cfg = {
    super_admin: { label: '⚡ Admin', bg: '#FEE2E2', color: '#DC2626' },
    comite:      { label: '🛡️ Comité', bg: '#FEE2E2', color: '#DC2626' },
    candidat:    { label: 'Candidat', bg: '#EEF2FF', color: '#2A2AE0' },
  }
  const c = cfg[role] || cfg.candidat
  return <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20, background: c.bg, color: c.color, letterSpacing: '0.05em' }}>{c.label}</span>
}

function formatTime(raw) {
  if (!raw) return ''
  const d = new Date(raw)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'maintenant'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MsgBubble({ reply, onReplyTo, onDelete, onMarkOfficial }) {
  const [hover, setHover] = useState(false)
  const isOfficial = reply.is_official_response
  const isAdmin = reply.user?.role === 'super_admin' || reply.user?.role === 'comite'

  return (
    <div
      style={{ display: 'flex', gap: 8, padding: '4px 0', alignItems: 'flex-start' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Avatar user={reply.user} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{reply.user?.name}</span>
          <RolePill role={reply.user?.role} />
          {isOfficial && (
            <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20, background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', gap: 3 }}>
              <CheckCircle size={8} /> Officielle
            </span>
          )}
          <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 'auto' }}>{formatTime(reply.created_at_raw || reply.created_at)}</span>
        </div>

        {/* Bubble */}
        <div style={{
          display: 'inline-block', maxWidth: '85%', padding: '8px 12px', borderRadius: '4px 12px 12px 12px',
          background: isAdmin ? '#EEF2FF' : '#F9FAFB',
          border: `1px solid ${isOfficial ? 'rgba(5,150,105,0.2)' : isAdmin ? 'rgba(42,42,224,0.12)' : 'rgba(0,0,0,0.06)'}`,
          position: 'relative',
        }}>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#1F2937', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {reply.content}
          </p>
        </div>

        {/* Sub-replies */}
        {reply.children?.length > 0 && (
          <div style={{ marginTop: 4, paddingLeft: 12, borderLeft: '2px solid #EEF2FF' }}>
            {reply.children.map(c => (
              <div key={c.id} style={{ fontSize: 11, color: '#6B7280', padding: '2px 0', display: 'flex', gap: 4 }}>
                <span style={{ fontWeight: 700, color: '#374151' }}>{c.user?.name}:</span>
                <span>{c.content}</span>
              </div>
            ))}
          </div>
        )}

        {/* Hover actions */}
        {hover && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <ActionBtn label="Répondre" icon={<CornerDownRight size={11} />} onClick={() => onReplyTo(reply)} />
            <ActionBtn label={isOfficial ? '✓ Officielle' : 'Marquer officielle'} icon={<CheckCircle size={11} />} onClick={() => onMarkOfficial(reply.id)} active={isOfficial} />
            <ActionBtn label="Supprimer" icon={<Trash2 size={11} />} onClick={() => onDelete(reply.id)} danger />
          </div>
        )}
      </div>
    </div>
  )
}

function ActionBtn({ label, icon, onClick, danger, active }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6,
        border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600,
        background: active ? '#D1FAE5' : danger ? '#FEE2E2' : '#F3F4F6',
        color: active ? '#059669' : danger ? '#DC2626' : '#6B7280',
        transition: 'all 0.15s',
      }}
    >
      {icon} {label}
    </button>
  )
}

// ─── Channel Card ─────────────────────────────────────────────────────────────
function ChannelCard({ topic, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '10px 12px', textAlign: 'left', border: 'none', cursor: 'pointer',
        background: isActive ? '#EEF2FF' : 'transparent', borderRadius: 10, transition: 'all 0.12s',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F9FAFB' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: topic.type === 'announcement' ? '#FEE2E2' : '#EEF2FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {topic.type === 'announcement'
          ? <Megaphone size={15} color="#DC2626" />
          : <Hash size={15} color="#2A2AE0" />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#2A2AE0' : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
            {topic.title}
          </span>
          <span style={{ fontSize: 9, color: '#9CA3AF', flexShrink: 0 }}>{formatTime(topic.updated_at || topic.created_at)}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {topic.is_pinned && <Pin size={9} color="#F59E0B" fill="#F59E0B" />}
          {topic.is_closed && <Lock size={9} color="#9CA3AF" />}
          <span style={{ fontSize: 10, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {topic.replies_count} message{topic.replies_count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ForumPage() {
  const [topics, setTopics]           = useState([])
  const [stats, setStats]             = useState({})
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterType, setFilterType]   = useState('all')
  const [activeTopic, setActiveTopic] = useState(null)
  const [replies, setReplies]         = useState([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo]   = useState(null)
  const [sending, setSending]         = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm]         = useState({ title: '', content: '', type: 'announcement' })
  const [saving, setSaving]           = useState(false)
  const [formError, setFormError]     = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const pollRef = useRef(null)

  const loadTopics = async (f = { type: filterType, search }) => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (f.type !== 'all') p.append('type', f.type)
      if (f.search) p.append('search', f.search)
      const res = await api.get(`/forum/topics?${p}`)
      setTopics(res.data.topics?.data || [])
      setStats(res.data.stats || {})
    } catch {}
    finally { setLoading(false) }
  }

  const loadTopic = async (id) => {
    setLoadingReplies(true)
    try {
      const res = await api.get(`/forum/topics/${id}`)
      setActiveTopic(res.data.topic)
      setReplies(res.data.replies || [])
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {}
    finally { setLoadingReplies(false) }
  }

  useEffect(() => { loadTopics() }, [filterType])

  useEffect(() => {
    if (!activeTopic) return
    const poll = setInterval(async () => {
      const res = await api.get(`/forum/topics/${activeTopic.id}`).catch(() => null)
      if (res) setReplies(res.data.replies || [])
    }, 5000)
    return () => clearInterval(poll)
  }, [activeTopic?.id])

  const handleSelectTopic = (t) => {
    loadTopic(t.id)
    setReplyingTo(null)
    setReplyContent('')
  }

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!replyContent.trim() || sending) return
    setSending(true)
    try {
      await api.post(`/forum/topics/${activeTopic.id}/replies`, {
        content: replyContent, parent_id: replyingTo?.id || null,
      })
      setReplyContent('')
      setReplyingTo(null)
      await loadTopic(activeTopic.id)
      await loadTopics()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally { setSending(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const ep = newForm.type === 'announcement' ? '/forum/announcements' : '/forum/topics'
      const res = await api.post(ep, { title: newForm.title, content: newForm.content })
      setNewForm({ title: '', content: '', type: 'announcement' })
      setShowNewForm(false)
      await loadTopics()
      loadTopic(res.data.topic.id)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce message ?')) return
    await api.delete(`/forum/replies/${id}`)
    loadTopic(activeTopic.id)
  }

  const handleMarkOfficial = async (id) => {
    await api.put(`/forum/replies/${id}/official`)
    loadTopic(activeTopic.id)
  }

  const handlePin = async (id) => { await api.put(`/forum/topics/${id}/pin`); loadTopics(); if (activeTopic?.id === id) loadTopic(id) }
  const handleClose = async (id) => { await api.put(`/forum/topics/${id}/close`); loadTopics(); if (activeTopic?.id === id) loadTopic(id) }
  const handleDeleteTopic = async (id) => {
    if (!confirm('Supprimer ce canal et tous ses messages ?')) return
    await api.delete(`/forum/topics/${id}`)
    setActiveTopic(null)
    loadTopics()
  }

  const filteredTopics = topics.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))

  // Stats bar
  const statItems = [
    { label: 'Canaux', value: stats.total_topics, icon: <MessageSquare size={14} color="#2A2AE0" /> },
    { label: 'Annonces', value: stats.total_announcements, icon: <Megaphone size={14} color="#DC2626" /> },
    { label: 'Discussions', value: stats.total_discussions, icon: <Hash size={14} color="#008751" /> },
    { label: 'Messages', value: stats.total_replies, icon: <BarChart2 size={14} color="#8B5CF6" /> },
  ]

  return (
    <div style={{ fontFamily: '"DM Sans", system-ui, sans-serif', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Forum & Messagerie</h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>
            Gérer les échanges entre le comité et les candidats
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => loadTopics()} style={{ width: 36, height: 36, border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={15} color="#6B7280" />
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 36,
              background: '#DC2626', color: 'white', border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Nouveau canal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12 }}>
        {statItems.map(s => (
          <div key={s.label} style={{ flex: 1, background: 'white', border: '1px solid #F3F4F6', borderRadius: 12, padding: '12px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>{s.icon}<span style={{ fontSize: 11, color: '#6B7280' }}>{s.label}</span></div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{s.value ?? '—'}</span>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>

        {/* Sidebar */}
        <div style={{ width: 280, flexShrink: 0, background: 'white', border: '1px solid #F3F4F6', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '10px 10px 6px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadTopics()}
                placeholder="Rechercher..."
                style={{ width: '100%', padding: '7px 10px 7px 28px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, outline: 'none', background: '#F9FAFB', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {[{ key: 'all', label: 'Tous' }, { key: 'announcement', label: '📢' }, { key: 'discussion', label: '💬' }].map(f => (
                <button key={f.key} onClick={() => setFilterType(f.key)} style={{ flex: 1, padding: '4px 0', border: 'none', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: filterType === f.key ? '#DC2626' : '#F3F4F6', color: filterType === f.key ? 'white' : '#6B7280', transition: 'all 0.12s' }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px 8px' }}>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: 12 }}>
                  <div style={{ width: 38, height: 38, background: '#F3F4F6', borderRadius: 10 }} />
                  <div style={{ flex: 1 }}><div style={{ height: 10, background: '#F3F4F6', borderRadius: 4, marginBottom: 6, width: '70%' }} /><div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, width: '50%' }} /></div>
                </div>
              ))
            ) : filteredTopics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>
                <MessageSquare size={28} style={{ opacity: 0.3, margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontSize: 12 }}>Aucun canal</p>
              </div>
            ) : filteredTopics.map(t => (
              <ChannelCard key={t.id} topic={t} isActive={activeTopic?.id === t.id} onClick={() => handleSelectTopic(t)} />
            ))}
          </div>
        </div>

        {/* Chat */}
        <div style={{ flex: 1, background: 'white', border: '1px solid #F3F4F6', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', minWidth: 0 }}>
          {!activeTopic ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <MessageSquare size={28} color="#2A2AE0" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Sélectionnez un canal</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', maxWidth: 200 }}>Cliquez sur un canal dans la liste pour voir les échanges</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 10, background: '#FAFAFA' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: activeTopic.type === 'announcement' ? '#FEE2E2' : '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {activeTopic.type === 'announcement' ? <Megaphone size={16} color="#DC2626" /> : <Hash size={16} color="#2A2AE0" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{activeTopic.title}</span>
                    {activeTopic.is_pinned && <Pin size={11} color="#F59E0B" fill="#F59E0B" />}
                    {activeTopic.is_closed && <Lock size={11} color="#9CA3AF" />}
                  </div>
                  <span style={{ fontSize: 10, color: '#9CA3AF' }}>{replies.length} message{replies.length !== 1 ? 's' : ''} · créé par {activeTopic.author?.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <ToolBtn icon={<Pin size={13} />} active={activeTopic.is_pinned} title={activeTopic.is_pinned ? 'Désépingler' : 'Épingler'} onClick={() => handlePin(activeTopic.id)} />
                  <ToolBtn icon={<Lock size={13} />} active={activeTopic.is_closed} title={activeTopic.is_closed ? 'Rouvrir' : 'Fermer'} onClick={() => handleClose(activeTopic.id)} />
                  <ToolBtn icon={<Trash2 size={13} />} danger title="Supprimer le canal" onClick={() => handleDeleteTopic(activeTopic.id)} />
                </div>
              </div>

              {/* Topic description pinned */}
              {activeTopic.content && (
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6', background: activeTopic.type === 'announcement' ? '#FFF7F7' : '#FAFAFA', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Avatar user={activeTopic.author} size={24} />
                  <div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{activeTopic.author?.name}</span>
                      <RolePill role={activeTopic.author?.role} />
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{activeTopic.content}</p>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                {loadingReplies ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                    <div style={{ width: 20, height: 20, border: '2px solid #E5E7EB', borderTopColor: '#DC2626', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                ) : replies.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                    <p style={{ fontSize: 12 }}>Aucun message. Démarrez la conversation !</p>
                  </div>
                ) : (
                  replies.map(r => (
                    <MsgBubble key={r.id} reply={r} onReplyTo={r => { setReplyingTo(r); inputRef.current?.focus() }} onDelete={handleDelete} onMarkOfficial={handleMarkOfficial} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {!activeTopic.is_closed ? (
                <div style={{ padding: '10px 16px', borderTop: '1px solid #F3F4F6' }}>
                  {replyingTo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: '#EEF2FF', borderRadius: 8, marginBottom: 8, borderLeft: '3px solid #2A2AE0' }}>
                      <CornerDownRight size={11} color="#2A2AE0" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#2A2AE0' }}>{replyingTo.user?.name}</span>
                        <p style={{ margin: 0, fontSize: 11, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyingTo.content}</p>
                      </div>
                      <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={12} color="#9CA3AF" /></button>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'flex-end' }}>
                      <textarea
                        ref={inputRef}
                        value={replyContent}
                        onChange={e => {
                          setReplyContent(e.target.value)
                          e.target.style.height = 'auto'
                          e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                        }}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                        placeholder="Répondre en tant que comité... (Entrée pour envoyer)"
                        rows={1}
                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 100 }}
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!replyContent.trim() || sending}
                      style={{ width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer', background: replyContent.trim() ? '#DC2626' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s', flexShrink: 0 }}
                    >
                      <Send size={15} color={replyContent.trim() ? 'white' : '#9CA3AF'} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px 16px', borderTop: '1px solid #F3F4F6', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Lock size={12} color="#9CA3AF" />
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>Canal fermé aux nouveaux messages</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal nouveau canal */}
      {showNewForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Nouveau canal / Annonce</h2>
              <button onClick={() => setShowNewForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#9CA3AF" /></button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {formError && (
                <div style={{ display: 'flex', gap: 6, padding: '8px 12px', background: '#FEE2E2', borderRadius: 8 }}>
                  <AlertCircle size={14} color="#DC2626" />
                  <span style={{ fontSize: 12, color: '#DC2626' }}>{formError}</span>
                </div>
              )}

              {/* Type */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'announcement', label: '📢 Annonce', desc: 'Épinglée' },
                  { value: 'discussion', label: '💬 Discussion', desc: 'Ouverte' },
                ].map(t => (
                  <label key={t.value} style={{ flex: 1, cursor: 'pointer', borderRadius: 10, padding: '10px 12px', border: `2px solid ${newForm.type === t.value ? '#DC2626' : '#E5E7EB'}`, background: newForm.type === t.value ? '#FFF7F7' : 'transparent', transition: 'all 0.12s' }}>
                    <input type="radio" value={t.value} checked={newForm.type === t.value} onChange={e => setNewForm(f => ({ ...f, type: e.target.value }))} style={{ display: 'none' }} />
                    <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700 }}>{t.label}</p>
                    <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF' }}>{t.desc}</p>
                  </label>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 5 }}>Titre *</label>
                <input type="text" required minLength={5} value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre du canal ou de l'annonce..." style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 5 }}>Message *</label>
                <textarea required minLength={10} rows={4} value={newForm.content} onChange={e => setNewForm(f => ({ ...f, content: e.target.value }))} placeholder="Contenu de l'annonce ou description du sujet..." style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#DC2626', color: 'white', fontSize: 13, fontWeight: 700, opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Publication...' : 'Publier'}
                </button>
                <button type="button" onClick={() => setShowNewForm(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #E5E7EB', cursor: 'pointer', background: 'transparent', fontSize: 13, color: '#6B7280' }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function ToolBtn({ icon, active, danger, title, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
        background: active ? (danger ? '#FEE2E2' : '#EEF2FF') : '#F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? (danger ? '#DC2626' : '#2A2AE0') : '#9CA3AF',
        transition: 'all 0.12s',
      }}
    >
      {icon}
    </button>
  )
}