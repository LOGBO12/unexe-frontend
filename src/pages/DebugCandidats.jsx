import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function DebugCandidats() {
  const [result, setResult] = useState(null)

  useEffect(() => {
    Promise.allSettled([
      api.get('/public/candidates'),
      api.get('/public/candidats'),
    ]).then(([r1, r2]) => {
      setResult({
        '/public/candidates': r1.status === 'fulfilled' ? r1.value.data : `ERREUR ${r1.reason?.response?.status}`,
        '/public/candidats':  r2.status === 'fulfilled' ? r2.value.data : `ERREUR ${r2.reason?.response?.status}`,
      })
    })
  }, [])

  return (
    <div style={{ padding: 24, background: '#0D0D1A', minHeight: '100vh', color: 'white', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#F0C040', fontSize: 20, marginBottom: 16 }}>🔍 DIAGNOSTIC CANDIDATS</h1>
      {!result && <p style={{ color: '#888' }}>Chargement...</p>}
      {result && Object.entries(result).map(([route, data]) => (
        <div key={route} style={{ marginBottom: 24, background: '#1a1a2e', padding: 16, borderRadius: 12 }}>
          <h2 style={{ color: '#A5A5FF', fontSize: 14, marginBottom: 8 }}>Route : {route}</h2>
          {typeof data === 'string' && data.startsWith('ERREUR') ? (
            <p style={{ color: '#E8112D' }}>{data}</p>
          ) : (
            <>
              <p style={{ color: '#4DC896', fontSize: 12, marginBottom: 8 }}>
                ✅ Type retourné : <strong>{Array.isArray(data) ? `tableau de ${data.length}` : typeof data}</strong>
              </p>
              {/* Si objet, afficher les clés */}
              {!Array.isArray(data) && typeof data === 'object' && (
                <p style={{ color: '#F0C040', fontSize: 12, marginBottom: 8 }}>
                  Clés : {Object.keys(data).join(', ')}
                </p>
              )}
              {/* Vérifier candidates */}
              {data?.candidates && (
                <p style={{ color: '#4DC896', fontSize: 12, marginBottom: 8 }}>
                  data.candidates type : {Array.isArray(data.candidates) ? `tableau de ${data.candidates.length}` : typeof data.candidates}
                  {typeof data.candidates === 'object' && !Array.isArray(data.candidates) && (
                    <span> — Clés (départements) : {Object.keys(data.candidates).join(', ')}</span>
                  )}
                </p>
              )}
              {/* Vérifier candidats */}
              {data?.candidats && (
                <p style={{ color: '#4DC896', fontSize: 12, marginBottom: 8 }}>
                  data.candidats type : {Array.isArray(data.candidats) ? `tableau de ${data.candidats.length}` : typeof data.candidats}
                </p>
              )}
              <details>
                <summary style={{ cursor: 'pointer', color: '#888', fontSize: 12 }}>Voir JSON brut</summary>
                <pre style={{ fontSize: 10, color: '#ccc', overflow: 'auto', maxHeight: 300, marginTop: 8 }}>
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>
      ))}
    </div>
  )
}