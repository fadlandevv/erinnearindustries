'use client'
import { useState } from 'react'
import { SERVICE_ICONS } from '@/lib/serviceIcons'

export default function ServiceIconPicker({ defaultValue }: { defaultValue?: string }) {
  const defaultIcon = SERVICE_ICONS.find(i => i.svg === defaultValue) ?? SERVICE_ICONS[0]
  const [selected, setSelected] = useState(defaultIcon.key)

  return (
    <div>
      <input type="hidden" name="icon" value={SERVICE_ICONS.find(i => i.key === selected)?.svg ?? ''} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {SERVICE_ICONS.map(icon => (
          <button
            key={icon.key}
            type="button"
            title={icon.label}
            onClick={() => setSelected(icon.key)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, padding: 0,
              background: 'none', border: 'none', cursor: 'pointer',
              color: selected === icon.key ? '#0d0d0d' : '#bbb',
              transform: selected === icon.key ? 'scale(1.2)' : 'scale(1)',
              transition: 'color 0.15s, transform 0.15s',
            }}
            dangerouslySetInnerHTML={{ __html: icon.svg }}
          />
        ))}
      </div>
    </div>
  )
}
