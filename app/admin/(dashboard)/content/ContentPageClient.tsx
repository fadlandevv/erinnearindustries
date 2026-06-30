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

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ flex: preview ? '0 0 420px' : '1', minWidth: 0 }}>
          <ContentEditor initialContent={content} />
        </div>

        {preview && (
          <div style={{
            flex: 1, minWidth: 0, position: 'sticky', top: '1.5rem',
            borderRadius: 16, overflow: 'hidden',
            border: '1px solid var(--border, #e8e4de)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            height: 'calc(100vh - 120px)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: '0.6rem 1rem', background: '#f8f7f5',
              borderBottom: '1px solid var(--border, #e8e4de)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.75rem', color: '#888',
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
              style={{ flex: 1, border: 'none', width: '100%' }}
              title="Website Preview"
            />
          </div>
        )}
      </div>
    </>
  )
}
