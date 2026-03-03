import { useEffect, useState, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import {
  Send, X, ChevronLeft, Megaphone, MessageCircle, Pin, Lock,
  CornerDownRight, CheckCircle, Search, RefreshCw, AlertCircle,
  Plus, Smile, Paperclip, MoreVertical, ArrowDown, Hash,
  Bell, BellOff, Trash2, Flag
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ user, size = 36 }) {
  const photo = user?.avatar_url || (user?.avatar ? `/storage/${user.avatar}` : null)
  const initials = user?.name?.charAt(0)?.toUpperCase()
  const colors = ['#2A2AE0', '#008751', '#E8112D', '#F0C040', '#8B5CF6']
  const color = colors[(user?.id || 0) % colors.length]

  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.3,
        overflow: 'hidden', flexShrink: 0,
        background: `linear-gradient(135deg, ${color}, ${color}99)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {photo ? (
        <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ color: 'white', fontWeight: 900, fontSize: size * 0.4 }}>{initials}</span>
      )}
    </div>
  )
}

function RolePill({ role }) {
  const config = {
    super_admin: { label: '⚡ Admin', bg: 'rgba(232,17,45,0.12)', color: '#E8112D' },
    comite:      { label: '🛡️ Comité', bg: 'rgba(232,17,45,0.1)', color: '#E8112D' },
    candidat:    { label: 'Candidat', bg: 'rgba(42,42,224,0.08)', color: '#2A2AE0' },
  }
  const c = config[role] || config.candidat
  return (
    <span style={{
      fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
      padding: '2px 6px', borderRadius: 20, background: c.bg, color: c.color,
    }}>
      {c.label}
    </span>
  )
}

// Format time
function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'À l\'instant'
  if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ reply, currentUser, isComite, onReplyTo, onDelete, onMarkOfficial }) {
  const isOwn = reply.user?.id === currentUser?.id
  const isOfficial = reply.is_official_response
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        gap: 8, marginBottom: 4,
        alignItems: 'flex-end',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && <Avatar user={reply.user} size={28} />}

      <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
        {/* Sender name */}
        {!isOwn && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, paddingLeft: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0D0D1A' }}>{reply.user?.name}</span>
            <RolePill role={reply.user?.role} />
          </div>
        )}

        {/* Reply reference */}
        {reply.parent_id && reply.parent_preview && (
          <div style={{
            background: 'rgba(42,42,224,0.06)', borderLeft: '3px solid #2A2AE0',
            padding: '4px 8px', borderRadius: '8px 8px 0 0', fontSize: 11,
            color: '#666', maxWidth: '100%', marginBottom: 0,
          }}>
            <span style={{ fontWeight: 700, color: '#2A2AE0' }}>{reply.parent_preview?.user}</span>
            <br />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {reply.parent_preview?.content}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div style={{
          background: isOwn
            ? 'linear-gradient(135deg, #2A2AE0, #1A1A8B)'
            : isOfficial
              ? 'linear-gradient(135deg, rgba(0,135,81,0.12), rgba(0,135,81,0.06))'
              : '#F0F0F8',
          color: isOwn ? '#fff' : '#0D0D1A',
          padding: '8px 12px',
          borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          border: isOfficial && !isOwn ? '1px solid rgba(0,135,81,0.3)' : 'none',
          position: 'relative',
          boxShadow: isOwn ? '0 2px 8px rgba(42,42,224,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {isOfficial && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              marginBottom: 4, fontSize: 9, fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: '#008751',
            }}>
              <CheckCircle size={9} /> Réponse officielle
            </div>
          )}
          <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {reply.content}
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, justifyContent: 'flex-end',
          }}>
            <span style={{ fontSize: 10, opacity: isOwn ? 0.7 : 0.45 }}>{formatTime(reply.created_at_raw || reply.created_at)}</span>
          </div>
        </div>

        {/* Children replies */}
        {reply.children?.length > 0 && (
          <div style={{ marginTop: 4, paddingLeft: 8, borderLeft: '2px solid rgba(42,42,224,0.15)', marginLeft: 4 }}>
            {reply.children.map(child => (
              <div key={child.id} style={{ fontSize: 11, color: '#666', padding: '2px 0' }}>
                <strong style={{ color: '#0D0D1A' }}>{child.user?.name}:</strong> {child.content}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 2,
          opacity: showActions ? 1 : 0, transition: 'opacity 0.15s',
          alignSelf: 'center',
        }}>
          <ActionBtn icon={<CornerDownRight size={12} />} title="Répondre" onClick={() => onReplyTo(reply)} />
          {(isComite || currentUser?.id === reply.user?.id) && (
            <ActionBtn icon={<Trash2 size={12} />} title="Supprimer" onClick={() => onDelete(reply.id)} danger />
          )}
          {isComite && (
            <ActionBtn
              icon={<CheckCircle size={12} />}
              title={reply.is_official_response ? 'Retirer officielle' : 'Marquer officielle'}
              onClick={() => onMarkOfficial(reply.id)}
              active={reply.is_official_response}
            />
          )}
        </div>
      )}
    </div>
  )
}

function ActionBtn({ icon, title, onClick, danger, active }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 24, height: 24, borderRadius: 6, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(0,135,81,0.12)' : danger ? 'rgba(232,17,45,0.08)' : 'rgba(42,42,224,0.08)',
        color: active ? '#008751' : danger ? '#E8112D' : '#2A2AE0',
        transition: 'all 0.15s',
      }}
    >
      {icon}
    </button>
  )
}

// ─── Channel / Topic Card in Sidebar ─────────────────────────────────────────
function ChannelCard({ topic, isActive, onClick, currentUserId }) {
  const isAnnouncement = topic.type === 'announcement'
  const hasUnread = false // à implémenter avec état local

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '10px 12px', textAlign: 'left',
        background: isActive ? 'rgba(42,42,224,0.1)' : 'transparent',
        border: 'none', borderRadius: 12, cursor: 'pointer',
        transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10,
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(42,42,224,0.05)' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: isAnnouncement ? 'rgba(232,17,45,0.1)' : 'rgba(42,42,224,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isAnnouncement
          ? <Megaphone size={16} color="#E8112D" />
          : <Hash size={16} color="#2A2AE0" />
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: isActive ? '#2A2AE0' : '#0D0D1A',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130,
          }}>
            {topic.title}
          </span>
          <span style={{ fontSize: 9, color: '#9CA3AF', flexShrink: 0 }}>
            {formatTime(topic.updated_at || topic.created_at)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {topic.is_pinned && <Pin size={9} color="#F0C040" fill="#F0C040" />}
          {topic.is_closed && <Lock size={9} color="#9CA3AF" />}
          <span style={{
            fontSize: 10, color: '#9CA3AF',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {topic.replies_count} message{topic.replies_count !== 1 ? 's' : ''}
          </span>
          {hasUnread && (
            <div style={{
              marginLeft: 'auto', width: 16, height: 16, borderRadius: 8,
              background: '#2A2AE0', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 9, color: 'white', fontWeight: 900 }}>!</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Date Separator ───────────────────────────────────────────────────────────
function DateSeparator({ date }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(42,42,224,0.1)' }} />
      <span style={{
        fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase',
        letterSpacing: '0.08em', background: '#fff', padding: '2px 8px',
        borderRadius: 20, border: '1px solid rgba(42,42,224,0.1)',
      }}>
        {date}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(42,42,224,0.1)' }} />
    </div>
  )
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function ForumCommunaute() {
  const { user } = useAuth()
  const location = useLocation()
  const isComite = user?.role === 'super_admin' || user?.role === 'comite'
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const pollRef = useRef(null)

  const [topics, setTopics] = useState([])
  const [statsGlobal, setStatsGlobal] = useState({})
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  const [activeTopic, setActiveTopic] = useState(null)
  const [replies, setReplies] = useState([])
  const [loadingReplies, setLoadingReplies] = useState(false)

  const [showNewTopic, setShowNewTopic] = useState(false)
  const [newTopic, setNewTopic] = useState({ title: '', content: '', type: isComite ? 'announcement' : 'discussion' })
  const [savingTopic, setSavingTopic] = useState(false)
  const [topicError, setTopicError] = useState(null)

  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [sendingReply, setSendingReply] = useState(false)

  const [mobileView, setMobileView] = useState('list')
  const [showScrollBottom, setShowScrollBottom] = useState(false)

  // Auto-poll toutes les 5 secondes pour nouveau messages
  const loadRepliesSilent = useCallback(async (id) => {
    if (!id) return
    try {
      const res = await api.get(`/forum/topics/${id}`)
      setReplies(res.data.replies || [])
    } catch {}
  }, [])

  const loadTopics = async () => {
    setLoadingTopics(true)
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.append('type', filterType)
      if (search) params.append('search', search)
      const res = await api.get(`/forum/topics?${params}`)
      setTopics(res.data.topics?.data || [])
      setStatsGlobal(res.data.stats || {})
    } catch {}
    finally { setLoadingTopics(false) }
  }

  const loadTopic = async (id) => {
    setLoadingReplies(true)
    try {
      const res = await api.get(`/forum/topics/${id}`)
      setActiveTopic(res.data.topic)
      setReplies(res.data.replies || [])
      setMobileView('detail')
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {}
    finally { setLoadingReplies(false) }
  }

  useEffect(() => { loadTopics() }, [filterType])

  useEffect(() => {
    const topicId = location.state?.topicId
    if (topicId) loadTopic(topicId)
  }, [location.state])

  // Auto-poll
  useEffect(() => {
    if (!activeTopic) return
    pollRef.current = setInterval(() => loadRepliesSilent(activeTopic.id), 5000)
    return () => clearInterval(pollRef.current)
  }, [activeTopic?.id, loadRepliesSilent])

  // Scroll to bottom when new messages
  useEffect(() => {
    if (replies.length > 0) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [replies.length])

  const handleCreateTopic = async (e) => {
    e.preventDefault()
    setSavingTopic(true)
    setTopicError(null)
    try {
      const endpoint = (isComite && newTopic.type === 'announcement') ? '/forum/announcements' : '/forum/topics'
      const res = await api.post(endpoint, { title: newTopic.title, content: newTopic.content })
      setNewTopic({ title: '', content: '', type: isComite ? 'announcement' : 'discussion' })
      setShowNewTopic(false)
      await loadTopics()
      loadTopic(res.data.topic.id)
    } catch (err) {
      setTopicError(err.response?.data?.message || 'Erreur lors de la création.')
    } finally { setSavingTopic(false) }
  }

  const handleSendReply = async (e) => {
    e?.preventDefault()
    if (!replyContent.trim() || sendingReply) return
    setSendingReply(true)
    try {
      await api.post(`/forum/topics/${activeTopic.id}/replies`, {
        content: replyContent,
        parent_id: replyingTo?.id || null,
      })
      setReplyContent('')
      setReplyingTo(null)
      await loadTopic(activeTopic.id)
      await loadTopics()
    } catch {}
    finally { setSendingReply(false) }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendReply()
    }
  }

  const handleDeleteReply = async (replyId) => {
    if (!confirm('Supprimer ce message ?')) return
    await api.delete(`/forum/replies/${replyId}`)
    await loadTopic(activeTopic.id)
  }

  const handleMarkOfficial = async (replyId) => {
    await api.put(`/forum/replies/${replyId}/official`)
    await loadTopic(activeTopic.id)
  }

  const handleDeleteTopic = async (id) => {
    if (!confirm('Supprimer ce canal et tous ses messages ?')) return
    await api.delete(`/forum/topics/${id}`)
    setActiveTopic(null)
    setMobileView('list')
    loadTopics()
  }

  const handlePin = async (id) => {
    await api.put(`/forum/topics/${id}/pin`)
    loadTopics()
    if (activeTopic?.id === id) loadTopic(id)
  }

  const handleClose = async (id) => {
    await api.put(`/forum/topics/${id}/close`)
    loadTopics()
    if (activeTopic?.id === id) loadTopic(id)
  }

  const filteredTopics = topics.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  )

  // Group replies by date
  const groupedReplies = replies.reduce((acc, reply) => {
    const date = reply.created_at_raw
      ? new Date(reply.created_at_raw).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      : 'Aujourd\'hui'
    if (!acc[date]) acc[date] = []
    acc[date].push(reply)
    return acc
  }, {})

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0D0D1A', fontFamily: '"Playfair Display", serif', margin: 0 }}>
            Communauté
          </h1>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>
            {statsGlobal.total_topics ?? 0} canaux · {statsGlobal.total_replies ?? 0} messages
          </p>
        </div>
        <button
          onClick={() => setShowNewTopic(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            background: '#2A2AE0', color: 'white', border: 'none', borderRadius: 12,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(42,42,224,0.3)',
          }}
        >
          <Plus size={14} />
          {isComite ? 'Nouvelle annonce' : 'Nouveau sujet'}
        </button>
      </div>

      {/* Main Layout */}
      <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>

        {/* ── SIDEBAR GAUCHE ─────────────────────────────────────────── */}
        <div
          style={{
            width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
            background: 'white', borderRadius: 20,
            border: '1px solid rgba(42,42,224,0.08)',
            boxShadow: '0 2px 12px rgba(42,42,224,0.04)',
            overflow: 'hidden',
          }}
          className={mobileView === 'detail' ? 'hidden lg:flex' : ''}
        >
          {/* Search */}
          <div style={{ padding: '12px 12px 8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadTopics()}
                placeholder="Rechercher..."
                style={{
                  width: '100%', padding: '7px 10px 7px 30px',
                  border: '1.5px solid rgba(42,42,224,0.1)', borderRadius: 10,
                  fontSize: 12, outline: 'none', background: '#F7F7FC',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {[
                { key: 'all', label: 'Tous' },
                { key: 'announcement', label: '📢 Annonces' },
                { key: 'discussion', label: '💬 Discussions' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  style={{
                    flex: 1, padding: '4px 0', borderRadius: 8, border: 'none',
                    fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    background: filterType === f.key ? '#2A2AE0' : 'rgba(42,42,224,0.06)',
                    color: filterType === f.key ? 'white' : 'rgba(13,13,26,0.5)',
                    transition: 'all 0.15s',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topics List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 8px' }}>
            {loadingTopics ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: 12, animation: 'pulse 1.5s infinite' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F0F0F8' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 10, background: '#F0F0F8', borderRadius: 4, marginBottom: 6, width: '70%' }} />
                    <div style={{ height: 8, background: '#F0F0F8', borderRadius: 4, width: '50%' }} />
                  </div>
                </div>
              ))
            ) : filteredTopics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>
                <MessageCircle size={28} style={{ opacity: 0.3, margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontSize: 12 }}>Aucun canal</p>
              </div>
            ) : (
              filteredTopics.map(t => (
                <ChannelCard
                  key={t.id}
                  topic={t}
                  isActive={activeTopic?.id === t.id}
                  onClick={() => loadTopic(t.id)}
                  currentUserId={user?.id}
                />
              ))
            )}
          </div>
        </div>

        {/* ── ZONE DE MESSAGES ───────────────────────────────────────── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          background: 'white', borderRadius: 20,
          border: '1px solid rgba(42,42,224,0.08)',
          boxShadow: '0 2px 12px rgba(42,42,224,0.04)',
          overflow: 'hidden', minWidth: 0,
        }}>
          {!activeTopic ? (
            // Empty state
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 24, margin: '0 auto 16px',
                  background: 'rgba(42,42,224,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MessageCircle size={36} color="#2A2AE0" />
                </div>
                <p style={{ fontSize: 18, fontWeight: 900, color: '#0D0D1A', fontFamily: '"Playfair Display", serif', margin: '0 0 6px' }}>
                  Choisissez un canal
                </p>
                <p style={{ fontSize: 12, color: '#9CA3AF', maxWidth: 220 }}>
                  Sélectionnez un canal dans la liste pour lire les échanges et participer.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid rgba(42,42,224,0.07)',
                display: 'flex', alignItems: 'center', gap: 12,
                background: activeTopic.type === 'announcement' ? 'rgba(232,17,45,0.02)' : '#FAFAFA',
              }}>
                {/* Mobile back */}
                <button
                  onClick={() => setMobileView('list')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', padding: 4 }}
                  className="lg:hidden"
                >
                  <ChevronLeft size={18} color="#9CA3AF" />
                </button>

                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: activeTopic.type === 'announcement' ? 'rgba(232,17,45,0.1)' : 'rgba(42,42,224,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {activeTopic.type === 'announcement'
                    ? <Megaphone size={18} color="#E8112D" />
                    : <Hash size={18} color="#2A2AE0" />
                  }
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 900, color: '#0D0D1A', margin: 0, fontFamily: '"Playfair Display", serif' }}>
                      {activeTopic.title}
                    </h2>
                    {activeTopic.is_pinned && <Pin size={11} color="#F0C040" fill="#F0C040" />}
                    {activeTopic.is_closed && <Lock size={11} color="#9CA3AF" />}
                  </div>
                  <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>
                    {replies.length} message{replies.length !== 1 ? 's' : ''} · par {activeTopic.author?.name}
                  </p>
                </div>

                {/* Comité actions */}
                {isComite && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => handlePin(activeTopic.id)}
                      title={activeTopic.is_pinned ? 'Désépingler' : 'Épingler'}
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: activeTopic.is_pinned ? 'rgba(240,192,64,0.15)' : 'rgba(42,42,224,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Pin size={13} color={activeTopic.is_pinned ? '#F0C040' : '#9CA3AF'} fill={activeTopic.is_pinned ? '#F0C040' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleClose(activeTopic.id)}
                      title={activeTopic.is_closed ? 'Rouvrir' : 'Fermer'}
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: activeTopic.is_closed ? 'rgba(42,42,224,0.12)' : 'rgba(42,42,224,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Lock size={13} color={activeTopic.is_closed ? '#2A2AE0' : '#9CA3AF'} />
                    </button>
                    <button
                      onClick={() => handleDeleteTopic(activeTopic.id)}
                      title="Supprimer"
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: 'rgba(232,17,45,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={13} color="#E8112D" />
                    </button>
                  </div>
                )}
              </div>

              {/* Topic description (premier message fixe) */}
              {activeTopic.content && (
                <div style={{
                  padding: '12px 16px', background: activeTopic.type === 'announcement' ? 'rgba(232,17,45,0.03)' : 'rgba(42,42,224,0.02)',
                  borderBottom: '1px solid rgba(42,42,224,0.06)',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <Avatar user={activeTopic.author} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{activeTopic.author?.name}</span>
                      <RolePill role={activeTopic.author?.role} />
                      {activeTopic.type === 'announcement' && (
                        <span style={{
                          fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
                          padding: '2px 6px', borderRadius: 20, background: 'rgba(232,17,45,0.12)', color: '#E8112D',
                        }}>
                          📢 Annonce officielle
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {activeTopic.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div
                style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}
                onScroll={e => setShowScrollBottom(e.target.scrollTop < e.target.scrollHeight - e.target.clientHeight - 100)}
              >
                {loadingReplies ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      border: '3px solid rgba(42,42,224,0.2)', borderTopColor: '#2A2AE0',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  </div>
                ) : replies.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <p style={{ fontSize: 12, color: '#9CA3AF' }}>Aucun message encore. Soyez le premier à répondre !</p>
                  </div>
                ) : (
                  Object.entries(groupedReplies).map(([date, dateReplies]) => (
                    <div key={date}>
                      <DateSeparator date={date} />
                      {dateReplies.map(reply => (
                        <MessageBubble
                          key={reply.id}
                          reply={reply}
                          currentUser={user}
                          isComite={isComite}
                          onReplyTo={r => { setReplyingTo(r); textareaRef.current?.focus() }}
                          onDelete={handleDeleteReply}
                          onMarkOfficial={handleMarkOfficial}
                        />
                      ))}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              {showScrollBottom && (
                <button
                  onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    position: 'absolute', right: 24, bottom: 100, width: 36, height: 36,
                    borderRadius: '50%', background: '#2A2AE0', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(42,42,224,0.3)',
                  }}
                >
                  <ArrowDown size={16} color="white" />
                </button>
              )}

              {/* Input Zone */}
              {!activeTopic.is_closed ? (
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(42,42,224,0.07)' }}>
                  {/* Reply preview */}
                  {replyingTo && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                      padding: '6px 10px', borderRadius: 10,
                      background: 'rgba(42,42,224,0.06)', borderLeft: '3px solid #2A2AE0',
                    }}>
                      <CornerDownRight size={12} color="#2A2AE0" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#2A2AE0' }}>{replyingTo.user?.name}</span>
                        <p style={{ fontSize: 11, color: '#666', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {replyingTo.content}
                        </p>
                      </div>
                      <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={12} color="#9CA3AF" />
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                    <Avatar user={user} size={32} />
                    <div style={{
                      flex: 1, display: 'flex', alignItems: 'flex-end',
                      background: '#F7F7FC', borderRadius: 16,
                      border: '1.5px solid rgba(42,42,224,0.12)',
                      padding: '6px 12px',
                    }}>
                      <textarea
                        ref={textareaRef}
                        value={replyContent}
                        onChange={e => {
                          setReplyContent(e.target.value)
                          e.target.style.height = 'auto'
                          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Écrire un message... (Entrée pour envoyer)"
                        rows={1}
                        style={{
                          flex: 1, border: 'none', background: 'transparent',
                          fontSize: 13, outline: 'none', resize: 'none',
                          fontFamily: '"DM Sans", sans-serif', lineHeight: 1.5,
                          maxHeight: 120, overflowY: 'auto',
                        }}
                      />
                    </div>
                    <button
                      onClick={handleSendReply}
                      disabled={!replyContent.trim() || sendingReply}
                      style={{
                        width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: replyContent.trim() ? '#2A2AE0' : 'rgba(42,42,224,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', flexShrink: 0,
                        boxShadow: replyContent.trim() ? '0 4px 12px rgba(42,42,224,0.3)' : 'none',
                      }}
                    >
                      <Send size={16} color="white" />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '12px 16px', borderTop: '1px solid rgba(42,42,224,0.07)',
                  textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <Lock size={13} color="#9CA3AF" />
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>Ce canal est fermé aux nouveaux messages</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal nouveau topic/annonce */}
      {showNewTopic && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: 'white', borderRadius: 24, width: '100%', maxWidth: 520,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            border: '1px solid rgba(42,42,224,0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid rgba(42,42,224,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, fontFamily: '"Playfair Display", serif' }}>
                {isComite ? '📢 Nouveau canal / Annonce' : '💬 Nouvelle discussion'}
              </h2>
              <button onClick={() => setShowNewTopic(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#9CA3AF" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} style={{ padding: 20 }}>
              {topicError && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  borderRadius: 10, background: 'rgba(232,17,45,0.07)', marginBottom: 12,
                }}>
                  <AlertCircle size={14} color="#E8112D" />
                  <span style={{ fontSize: 12, color: '#E8112D' }}>{topicError}</span>
                </div>
              )}

              {/* Type selector (comité only) */}
              {isComite && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {[
                    { value: 'announcement', label: '📢 Annonce officielle', desc: 'Épinglée automatiquement' },
                    { value: 'discussion', label: '💬 Discussion ouverte', desc: 'Ouvert à tous' },
                  ].map(t => (
                    <label
                      key={t.value}
                      style={{
                        flex: 1, cursor: 'pointer', borderRadius: 12, padding: 12,
                        border: `2px solid ${newTopic.type === t.value ? '#2A2AE0' : 'rgba(42,42,224,0.12)'}`,
                        background: newTopic.type === t.value ? 'rgba(42,42,224,0.06)' : 'transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input type="radio" name="type" value={t.value} checked={newTopic.type === t.value}
                        onChange={e => setNewTopic(n => ({ ...n, type: e.target.value }))} style={{ display: 'none' }} />
                      <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 2px' }}>{t.label}</p>
                      <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>{t.desc}</p>
                    </label>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 6 }}>
                  Titre *
                </label>
                <input
                  type="text" required minLength={5}
                  value={newTopic.title}
                  onChange={e => setNewTopic(n => ({ ...n, title: e.target.value }))}
                  placeholder="Donnez un titre à ce canal..."
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 12,
                    border: '1.5px solid rgba(42,42,224,0.12)', fontSize: 13, outline: 'none',
                    background: '#F7F7FC', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 6 }}>
                  Description / Premier message *
                </label>
                <textarea
                  required minLength={10} rows={4}
                  value={newTopic.content}
                  onChange={e => setNewTopic(n => ({ ...n, content: e.target.value }))}
                  placeholder="Décrivez le sujet, posez votre question..."
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 12,
                    border: '1.5px solid rgba(42,42,224,0.12)', fontSize: 13, outline: 'none',
                    background: '#F7F7FC', resize: 'none', boxSizing: 'border-box',
                    fontFamily: '"DM Sans", sans-serif',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit" disabled={savingTopic}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: '#2A2AE0', color: 'white', fontSize: 13, fontWeight: 700,
                    opacity: savingTopic ? 0.6 : 1,
                  }}
                >
                  {savingTopic ? 'Publication...' : 'Publier'}
                </button>
                <button
                  type="button" onClick={() => setShowNewTopic(false)}
                  style={{
                    padding: '10px 20px', borderRadius: 12,
                    border: '1.5px solid rgba(42,42,224,0.15)', cursor: 'pointer',
                    background: 'transparent', fontSize: 13, fontWeight: 600, color: '#9CA3AF',
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
      `}</style>
    </div>
  )
}