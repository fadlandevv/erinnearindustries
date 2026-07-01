'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ContentData, ShowcaseItem } from '@/lib/data'
import ContentEditor from './ContentEditor'
import ContentPreview from './ContentPreview'

export default function ContentPageClient({ content, showcase }: { content: ContentData; showcase: ShowcaseItem[] }) {
  const router = useRouter()
  const [preview, setPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState<ContentData>(content)
  const [previewShowcase, setPreviewShowcase] = useState<ShowcaseItem[]>(showcase)
  const [activeTab, setActiveTab] = useState('home-hero')
  const [isDirty, setIsDirty] = useState(false)
  const [modal, setModal] = useState<{ href: string } | null>(null)
  const isInitial = useRef(true)

  const handleContentChange = useCallback((c: ContentData, s: ShowcaseItem[], tab: string) => {
    setPreviewContent(c)
    setPreviewShowcase(s)
    setActiveTab(tab)
    if (isInitial.current) { isInitial.current = false; return }
    setIsDirty(true)
  }, [])

  const handleSaved = useCallback(() => {
    setIsDirty(false)
  }, [])

  // Block browser-level navigation (back, refresh, tab close)
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Intercept in-app link clicks when dirty
  useEffect(() => {
    if (!isDirty) return
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http')) return
      e.preventDefault()
      e.stopPropagation()
      setModal({ href })
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [isDirty])

  function confirmLeave() {
    if (!modal) return
    setIsDirty(false)
    setModal(null)
    router.push(modal.href)
  }

  return (
    <>
      {/* Unsaved changes modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '32px',
            maxWidth: 400, width: '90%', boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
            animation: 'slideUp 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: '#0d0d0d' }}>
              Perubahan belum disimpan
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 24px', lineHeight: 1.6 }}>
              Kamu memiliki perubahan yang belum disimpan. Apakah kamu yakin ingin meninggalkan halaman ini?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => setModal(null)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Tetap di sini
              </button>
              <button
                type="button"
                className="btn-admin-danger"
                onClick={confirmLeave}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Tinggalkan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Management Content</h1>
          <p className="admin-page-subtitle">Manage titles, descriptions, and text across all pages</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isDirty && (
            <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
              Unsaved changes
            </span>
          )}
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
      </div>

      <div style={{ display: 'flex', gap: preview ? '1.5rem' : 0, alignItems: 'stretch', height: 'calc(100vh - 140px)', transition: 'gap 0.4s cubic-bezier(0.4,0,0.2,1)' }}>

        <div style={{ flex: preview ? '0 0 420px' : '1', minWidth: 0, transition: 'flex 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
          <ContentEditor
            initialContent={content}
            initialShowcase={showcase}
            onContentChange={handleContentChange}
            onSaved={handleSaved}
          />
        </div>

        <div style={{
          flex: preview ? '1' : '0 0 0px', minWidth: 0, overflow: 'hidden',
          opacity: preview ? 1 : 0, borderRadius: 16,
          border: preview ? '1px solid var(--border, #e8e4de)' : 'none',
          boxShadow: preview ? '0 4px 24px rgba(0,0,0,0.08)' : 'none',
          display: 'flex', flexDirection: 'column',
          transition: 'flex 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease, box-shadow 0.3s ease',
        }}>
          <div style={{
            padding: '0.6rem 1rem', background: '#f8f7f5',
            borderBottom: '1px solid var(--border, #e8e4de)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.75rem', color: '#888', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28ca41' }} />
            </div>
            <span style={{ flex: 1, textAlign: 'center' }}>
              Live Preview — {activeTab === 'home-hero' ? 'Homepage' : activeTab === 'products' ? 'Products' : activeTab === 'services' ? 'Services' : 'Contact'}
            </span>
          </div>
          <ContentPreview content={previewContent} showcase={previewShowcase} tab={activeTab} />
        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </>
  )
}
