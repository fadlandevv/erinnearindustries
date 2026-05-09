'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Message = { role: 'user' | 'assistant'; content: string }

type FeaturedProduct = { id: string; title: string; price: string; image: string; bg: string }
type FeaturedService = { id: string; icon: string; title: string; tag: string | null }

const SUGGESTIONS = [
  'Apa saja produk yang tersedia?',
  'Layanan apa yang ditawarkan?',
  'Bagaimana cara memesan?',
  'Hubungi tim Erinnear',
]

export default function ChatBot({
  featuredProducts = [],
  featuredServices = [],
}: {
  featuredProducts?: FeaturedProduct[]
  featuredServices?: FeaturedService[]
}) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [overFooter, setOverFooter] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    const observer = new IntersectionObserver(
      ([entry]) => setOverFooter(entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })

      if (!res.ok || !res.body) throw new Error()

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: assistantText },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Maaf, terjadi kesalahan. Coba lagi ya.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        className={`chatbot-fab${open ? ' chatbot-fab--open' : ''}${overFooter ? ' chatbot-fab--light' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Buka chat"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">EI</div>
              <div>
                <div className="chatbot-header-name">Erinnear Assistant</div>
                <div className="chatbot-header-status">
                  <span className="chatbot-status-dot" />
                  Online
                </div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Tutup">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <div className="chatbot-welcome-icon">👋</div>
                <p className="chatbot-welcome-title">Halo! Ada yang bisa kami bantu?</p>
                <div className="chatbot-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="chatbot-suggestion" onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>

                {featuredProducts.length > 0 && (
                  <div className="chatbot-featured">
                    <div className="chatbot-featured-header">
                      <span>Produk Unggulan</span>
                      <Link href="/product" className="chatbot-featured-link">Lihat semua →</Link>
                    </div>
                    <div className="chatbot-featured-list">
                      {featuredProducts.map((p) => (
                        <Link key={p.id} href={`/product/${p.id}`} className="chatbot-product-card">
                          <div
                            className="chatbot-product-img"
                            style={{ background: p.image ? undefined : p.bg || '#f0ece6' }}
                          >
                            {p.image && (
                              <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                          </div>
                          <div className="chatbot-product-info">
                            <span className="chatbot-product-name">{p.title}</span>
                            <span className="chatbot-product-price">{p.price}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {featuredServices.length > 0 && (
                  <div className="chatbot-featured">
                    <div className="chatbot-featured-header">
                      <span>Layanan Kami</span>
                      <Link href="/service" className="chatbot-featured-link">Lihat semua →</Link>
                    </div>
                    <div className="chatbot-service-list">
                      {featuredServices.map((s) => (
                        <Link key={s.id} href={`/service/${s.id}`} className="chatbot-service-item">
                          <span className="chatbot-service-icon">{s.icon}</span>
                          <span className="chatbot-service-name">{s.title}</span>
                          {s.tag && <span className="chatbot-service-tag">{s.tag}</span>}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg--${m.role}`}>
                <div className="chatbot-bubble">{m.content}</div>
              </div>
            ))}

            {loading && messages[messages.length - 1]?.role === 'user' && (
              <div className="chatbot-msg chatbot-msg--assistant">
                <div className="chatbot-bubble chatbot-bubble--typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-wrap">
            <input
              ref={inputRef}
              className="chatbot-input"
              placeholder="Ketik pesan..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className="chatbot-send"
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              aria-label="Kirim"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
