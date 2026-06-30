'use client'
import { useState } from 'react'
import type { ContentData } from '@/lib/data'
import ContentEditor from './ContentEditor'

export default function ContentPageClient({ content }: { content: ContentData }) {
  const [preview, setPreview] = useState(false)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Page Content</h1>
          <p className="admin-page-subtitle">Edit banner text, titles, and descriptions for each page</p>
        </div>
        <button
          type="button"
          className={preview ? 'btn-admin-primary' : 'btn-admin-secondary'}
          onClick={() => setPreview(p => !p)}
        >
          {preview ? '✕ Close Preview' : '↗ Preview Website'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: preview ? '1.5rem' : 0, alignItems: 'stretch', minHeight: 'calc(100vh - 140px)', transition: 'gap 0.4s cubic-bezier(0.4,0,0.2,1)' }}>

        {/* Editor */}
        <div style={{
          flex: preview ? '0 0 420px' : '1',
          minWidth: 0,
          transition: 'flex 0.4s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <ContentEditor initialContent={content} />
        </div>

        {/* Preview panel — always rendered, animates in/out */}
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
            src="http://localhost:3000"
            style={{ flex: 1, border: 'none', width: '100%', minWidth: 0 }}
            title="Website Preview"
          />
        </div>

      </div>
    </>
  )
}
