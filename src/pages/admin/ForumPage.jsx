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

  const [topics, setTopics] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  const [activeTopic, setActiveTopic] = useState(null)
  const [replies, setReplies] = useState([])
  const [loadingReplies, setLoadingReplies] = useState(false)

  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)

  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  /* ---------------- MOBILE DETECTION ---------------- */

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /* ---------------- LOAD TOPICS ---------------- */

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

    finally {
      setLoading(false)
    }
  }

  /* ---------------- LOAD TOPIC ---------------- */

  const loadTopic = async (id) => {

    setLoadingReplies(true)

    try {

      const res = await api.get(`/forum/topics/${id}`)

      setActiveTopic(res.data.topic)
      setReplies(res.data.replies || [])

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

    } catch {}

    finally {
      setLoadingReplies(false)
    }
  }

  useEffect(() => {
    loadTopics()
  }, [filterType])

  /* ---------------- POLLING ---------------- */

  useEffect(() => {

    if (!activeTopic) return

    const poll = setInterval(async () => {

      const res = await api
        .get(`/forum/topics/${activeTopic.id}`)
        .catch(() => null)

      if (res) setReplies(res.data.replies || [])

    }, 5000)

    return () => clearInterval(poll)

  }, [activeTopic?.id])

  /* ---------------- SEND MESSAGE ---------------- */

  const handleSend = async (e) => {

    e?.preventDefault()

    if (!replyContent.trim() || sending) return

    setSending(true)

    try {

      await api.post(`/forum/topics/${activeTopic.id}/replies`, {
        content: replyContent,
        parent_id: replyingTo?.id || null
      })

      setReplyContent('')
      setReplyingTo(null)

      await loadTopic(activeTopic.id)
      await loadTopics()

    } catch (err) {

      alert(err.response?.data?.message || 'Erreur')

    } finally {

      setSending(false)

    }
  }

  /* ---------------- FILTERED TOPICS ---------------- */

  const filteredTopics = topics.filter(
    t =>
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase())
  )

  /* ---------------- STATS ---------------- */

  const statItems = [
    { label: 'Canaux', value: stats.total_topics },
    { label: 'Annonces', value: stats.total_announcements },
    { label: 'Discussions', value: stats.total_discussions },
    { label: 'Messages', value: stats.total_replies }
  ]

  return (

    <div
      style={{
        fontFamily: '"DM Sans", system-ui',
        height: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >

      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 10
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>
            Forum & Messagerie
          </h1>

          <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>
            Échanges entre comité et candidats
          </p>
        </div>
      </div>

      {/* STATS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr 1fr'
            : 'repeat(4,1fr)',
          gap: 12
        }}
      >
        {statItems.map(s => (
          <div
            key={s.label}
            style={{
              background: 'white',
              border: '1px solid #eee',
              borderRadius: 12,
              padding: 12
            }}
          >
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              {s.label}
            </div>

            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {s.value ?? '—'}
            </div>
          </div>
        ))}
      </div>

      {/* MAIN */}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 12,
          minHeight: 0
        }}
      >

        {/* SIDEBAR */}

        {(!isMobile || !activeTopic) && (

          <div
            style={{
              width: isMobile ? '100%' : 280,
              background: 'white',
              border: '1px solid #eee',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >

            <div style={{ padding: 12 }}>

              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                style={{
                  width: '100%',
                  padding: 8,
                  borderRadius: 8,
                  border: '1px solid #ddd'
                }}
              />

            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>

              {filteredTopics.map(t => (
                <ChannelCard
                  key={t.id}
                  topic={t}
                  isActive={activeTopic?.id === t.id}
                  onClick={() => loadTopic(t.id)}
                />
              ))}

            </div>

          </div>

        )}

        {/* CHAT */}

        {(!isMobile || activeTopic) && (

          <div
            style={{
              flex: 1,
              background: 'white',
              border: '1px solid #eee',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0
            }}
          >

            {/* CHAT HEADER */}

            <div
              style={{
                padding: 12,
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >

              {isMobile && (

                <button
                  onClick={() => setActiveTopic(null)}
                  style={{
                    border: 'none',
                    background: '#eee',
                    borderRadius: 6,
                    padding: 6,
                    cursor: 'pointer'
                  }}
                >
                  ←
                </button>

              )}

              <div style={{ fontWeight: 700 }}>
                {activeTopic?.title}
              </div>

            </div>

            {/* MESSAGES */}

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 12
              }}
            >

              {replies.map(r => (

                <MsgBubble
                  key={r.id}
                  reply={r}
                  onReplyTo={setReplyingTo}
                />

              ))}

              <div ref={messagesEndRef} />

            </div>

            {/* INPUT */}

            {!activeTopic?.is_closed && (

              <div
                style={{
                  borderTop: '1px solid #eee',
                  padding: 10
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    gap: 8
                  }}
                >

                  <textarea
                    ref={inputRef}
                    value={replyContent}
                    onChange={e =>
                      setReplyContent(e.target.value)
                    }
                    placeholder="Votre message..."
                    style={{
                      flex: 1,
                      resize: 'none',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      padding: 8
                    }}
                  />

                  <button
                    onClick={handleSend}
                    style={{
                      background: '#DC2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '0 14px',
                      cursor: 'pointer'
                    }}
                  >
                    Envoyer
                  </button>

                </div>

              </div>

            )}

          </div>

        )}

      </div>

    </div>
  )
}