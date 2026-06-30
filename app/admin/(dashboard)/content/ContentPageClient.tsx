'use client'
import { useState, useRef, useCallback } from 'react'
import type { ContentData, ShowcaseItem } from '@/lib/data'
import ContentEditor from './ContentEditor'

export default function ContentPageClient({ content, showcase }: { content: ContentData; showcase: ShowcaseItem[] }) {
  const [preview, setPreview] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleSaved = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = window.location.origin
    }
  }, [])

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Management Content</h1>
          <p className="admin-page-subtitle">Manage titles, descriptions, and text across all pages</p>
        </div>
        <button
          type="button"
          className="btn-admin-secondary"
          onClick={() => setPreview(p => !p)}
          style={{ gap: '6px' }}
        >
          {preview ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Close Preview
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7C2 7 4 3 7 3C10 3 12 7 12 7C12 7 10 11 7 11C4 11 2 7 2 7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="7" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.6"/></svg>
              Preview Page
            </>
          )}
        </button>
      </div>

      <div style={{ display: 'flex', gap: preview ? '1.5rem' : 0, alignItems: 'stretch', height: 'calc(100vh - 140px)', transition: 'gap 0.4s cubic-bezier(0.4,0,0.2,1)' }}>

        {/* Editor */}
        <div style={{
          flex: preview ? '0 0 420px' : '1',
          minWidth: 0,
          transition: 'flex 0.4s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <ContentEditor initialContent={content} initialShowcase={showcase} onSaved={handleSaved} />
        </div>

        {/* Preview panel */}
        <div style={{
          flex: preview ? '1' : '0 0 0px',
          minWidth: 0,
          overflow: 'hidden',
          opacity: preview ? 1 : 0,
          borderRadius: 16,
          border: preview ? '1px solid var(--border, #e8e4de)' : 'none',
          boxShadow: preview ? '0 4px 24px rgba(0,0,0,0.08)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          transition: 'flex 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease, box-shadow 0.3s ease',
        }}>
          <div style={{
            padding: '0.6rem 1rem', background: '#f8f7f5',
            borderBottom: '1px solid var(--border, #e8e4de)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.75rem', color: '#888', flexShrink: 0,
            whiteSpace: 'nowrap', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28ca41' }} />
            </div>
            <span style={{ flex: 1, textAlign: 'center' }}>localhost:3000</span>
          </div>
          <iframe
            ref={iframeRef}
            src={typeof window !== 'undefined' ? window.location.origin : ''}
            style={{ flex: 1, border: 'none', width: '100%', minWidth: 0 }}
            title="Website Preview"
          />
        </div>

      </div>
    </>
  )
}
