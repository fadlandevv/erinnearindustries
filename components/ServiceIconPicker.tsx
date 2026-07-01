'use client'
import { useState } from 'react'
import { SERVICE_ICONS } from '@/lib/serviceIcons'

export default function ServiceIconPicker({ defaultValue }: { defaultValue?: string }) {
  const defaultIcon = SERVICE_ICONS.find(i => i.svg === defaultValue) ?? SERVICE_ICONS[0]
  const [selected, setSelected] = useState(defaultIcon.key)

  return (
    <div>
      <input type="hidden" name="icon" value={SERVICE_ICONS.find(i => i.key === selected)?.svg ?? ''} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
        {SERVICE_ICONS.map(icon => (
          <button
            key={icon.key}
            type="button"
            title={icon.label}
            onClick={() => setSelected(icon.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4, padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
              border: selected === icon.key ? '2px solid #0d0d0d' : '2px solid #e8e4de',
              background: selected === icon.key ? '#f0ede8' : '#fafaf9',
              transition: 'all 0.15s',
            }}
          >
            <span
              style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: selected === icon.key ? '#0d0d0d' : '#888' }}
              dangerouslySetInnerHTML={{ __html: icon.svg }}
            />
            <span style={{ fontSize: 9, color: selected === icon.key ? '#0d0d0d' : '#aaa', fontWeight: 500, lineHeight: 1 }}>
              {icon.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
