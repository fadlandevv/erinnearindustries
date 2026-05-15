'use client'
import { useState, useActionState, useTransition } from 'react'
import { createRoleAction, updateRoleAction, deleteRoleAction, createAdminAction, deleteAdminAction } from '@/lib/actions'
import { ALL_PERMISSIONS, PERMISSION_LABELS, type Permission, type Role, type AdminAccount } from '@/lib/rbac-types'

type Props = { roles: Role[]; admins: AdminAccount[] }

/* Inline checkbox row — used in both view and edit modes */
function InlinePermissions({
  selected, name, readOnly = false,
}: {
  selected: Permission[]
  name?: string
  readOnly?: boolean
}) {
  return (
    <div className="admin-permissions-grid">
      {ALL_PERMISSIONS.map(p => (
        <label
          key={p}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            fontSize: '0.8rem', cursor: readOnly ? 'default' : 'pointer',
            opacity: readOnly && !selected.includes(p) ? 0.35 : 1,
          }}
        >
          <input
            type="checkbox"
            name={name}
            value={p}
            defaultChecked={selected.includes(p)}
            disabled={readOnly}
            style={{ accentColor: '#f47c2f', width: 14, height: 14 }}
          />
          {PERMISSION_LABELS[p]}
        </label>
      ))}
    </div>
  )
}

function RoleRow({ role }: { role: Role }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, pending] = useActionState(updateRoleAction, {})
  const [deleting, startDelete] = useTransition()

  return (
    <>
      {/* Main row */}
      <tr>
        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{role.name}</span>
          {role.locked && (
            <span style={{
              marginLeft: '0.5rem', fontSize: '0.65rem', fontWeight: 600,
              background: '#f47c2f', color: '#fff', padding: '1px 6px', borderRadius: 99,
            }}>System</span>
          )}
        </td>
        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
          <InlinePermissions selected={role.permissions} readOnly />
        </td>
        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
          {!role.locked && (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className="btn-admin-secondary"
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
                onClick={() => setEditing(e => !e)}
              >
                {editing ? 'Tutup' : 'Edit'}
              </button>
              <button
                type="button"
                className="btn-admin-danger"
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
                disabled={deleting}
                onClick={() => {
                  if (!confirm(`Hapus role "${role.name}"?`)) return
                  startDelete(() => { deleteRoleAction(role.id); window.location.reload() })
                }}
              >
                Hapus
              </button>
            </div>
          )}
        </td>
      </tr>

      {/* Inline edit row */}
      {editing && (
        <tr>
          <td colSpan={3} style={{ padding: '0 1rem 1rem', background: 'var(--bg-muted,#f8f6f2)' }}>
            <form action={formAction} onSubmit={() => setTimeout(() => { setEditing(false); window.location.reload() }, 300)}>
              <input type="hidden" name="id" value={role.id} />
              {state.error && <div className="admin-error" style={{ marginBottom: '0.5rem' }}>{state.error}</div>}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <div className="admin-form-group" style={{ margin: 0, flex: '0 0 200px' }}>
                  <label>Nama Role</label>
                  <input className="admin-form-input" name="name" defaultValue={role.name} required />
                </div>
              </div>
              <div className="admin-form-group" style={{ marginBottom: '0.75rem' }}>
                <label>Akses Halaman</label>
                <InlinePermissions selected={role.permissions} name="permissions" />
              </div>
              <button type="submit" className="btn-admin-primary" disabled={pending} style={{ fontSize: '0.8rem' }}>
                {pending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </form>
          </td>
        </tr>
      )}
    </>
  )
}

export default function RolesClient({ roles, admins }: Props) {
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [createRoleState, createRoleFormAction, creatingRole] = useActionState(createRoleAction, {})
  const [createAdminState, createAdminFormAction, creatingAdmin] = useActionState(createAdminAction, {})
  const [deletingAdmin, startDeleteAdmin] = useTransition()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Roles ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Daftar Role</h2>
          <button
            type="button"
            className="btn-admin-primary"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', marginLeft: 'auto' }}
            onClick={() => setShowCreateRole(s => !s)}
          >
            {showCreateRole ? 'Tutup' : '+ Buat Role'}
          </button>
        </div>

        {/* Create role form */}
        {showCreateRole && (
          <div className="admin-form-card" style={{ marginBottom: '1rem', borderColor: '#f47c2f', borderWidth: 1.5 }}>
            <p className="admin-form-section-title" style={{ marginBottom: '0.75rem' }}>Role Baru</p>
            <form action={createRoleFormAction} onSubmit={() => setTimeout(() => { setShowCreateRole(false); window.location.reload() }, 300)}>
              {createRoleState.error && <div className="admin-error" style={{ marginBottom: '0.5rem' }}>{createRoleState.error}</div>}
              <div className="admin-form-group">
                <label>Nama Role</label>
                <input className="admin-form-input" name="name" placeholder="cth. Editor" required style={{ maxWidth: 280 }} />
              </div>
              <div className="admin-form-group">
                <label>Akses Halaman</label>
                <InlinePermissions selected={[]} name="permissions" />
              </div>
              <button type="submit" className="btn-admin-primary" disabled={creatingRole} style={{ fontSize: '0.8rem' }}>
                {creatingRole ? 'Membuat...' : 'Buat Role'}
              </button>
            </form>
          </div>
        )}

        {/* Roles table */}
        <div className="admin-form-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: 160 }}>Role</th>
                  <th>Akses Halaman</th>
                  <th style={{ width: 130 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => <RoleRow key={role.id} role={role} />)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Admin Accounts ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Akun Admin</h2>
          <button
            type="button"
            className="btn-admin-primary"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', marginLeft: 'auto' }}
            onClick={() => setShowCreateAdmin(s => !s)}
          >
            {showCreateAdmin ? 'Tutup' : '+ Tambah Admin'}
          </button>
        </div>

        {/* Create admin form */}
        {showCreateAdmin && (
          <div className="admin-form-card" style={{ marginBottom: '1rem', borderColor: '#f47c2f', borderWidth: 1.5 }}>
            <p className="admin-form-section-title" style={{ marginBottom: '0.75rem' }}>Admin Baru</p>
            <form action={createAdminFormAction} onSubmit={() => setTimeout(() => { setShowCreateAdmin(false); window.location.reload() }, 300)}>
              {createAdminState.error && <div className="admin-error" style={{ marginBottom: '0.5rem' }}>{createAdminState.error}</div>}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div className="admin-form-group" style={{ flex: '1 1 180px' }}>
                  <label>Username</label>
                  <input className="admin-form-input" name="username" placeholder="cth. editor01" required />
                </div>
                <div className="admin-form-group" style={{ flex: '1 1 180px' }}>
                  <label>Password</label>
                  <input className="admin-form-input" name="password" type="password" placeholder="Min. 6 karakter" required />
                </div>
                <div className="admin-form-group" style={{ flex: '1 1 160px' }}>
                  <label>Role</label>
                  <select className="admin-form-select" name="roleId" required>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-admin-primary" disabled={creatingAdmin} style={{ fontSize: '0.8rem' }}>
                {creatingAdmin ? 'Menambahkan...' : 'Tambah Admin'}
              </button>
            </form>
          </div>
        )}

        {/* Admin listing */}
        <div className="admin-form-card" style={{ padding: 0, overflow: 'hidden' }}>
          {admins.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '2rem' }}>Belum ada admin.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Dibuat</th>
                    <th style={{ width: 90 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => {
                    const role = roles.find(r => r.id === admin.roleId)
                    const isDefault = admin.id === 'default-superadmin'
                    return (
                      <tr key={admin.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: '#f47c2f', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                            }}>
                              {admin.username.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{admin.username}</span>
                          </div>
                        </td>
                        <td>
                          <span className="admin-badge" style={{ fontSize: '0.72rem' }}>
                            {role?.name ?? admin.roleId}
                          </span>
                        </td>
                        <td style={{ color: '#888', fontSize: '0.78rem' }}>
                          {new Date(admin.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          {!isDefault ? (
                            <button
                              type="button"
                              className="btn-admin-danger"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                              disabled={deletingAdmin}
                              onClick={() => {
                                if (!confirm(`Hapus admin "${admin.username}"?`)) return
                                startDeleteAdmin(() => { deleteAdminAction(admin.id); window.location.reload() })
                              }}
                            >
                              Hapus
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.68rem', color: '#bbb', fontStyle: 'italic' }}>default</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
