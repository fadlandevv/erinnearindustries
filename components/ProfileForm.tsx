'use client'
import { useActionState } from 'react'
import { updateProfile, changePassword } from '@/lib/actions'
import PasswordInput from '@/components/PasswordInput'

function SuccessBanner({ msg }: { msg: string }) {
  return <div className="profile-success">{msg}</div>
}
function ErrorBanner({ msg }: { msg: string }) {
  return <div className="profile-error">{msg}</div>
}

export default function ProfileForm({ currentName }: { currentName: string }) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, {})
  const [passState, passAction, passPending] = useActionState(changePassword, {})

  return (
    <div className="profile-forms-grid">
      {/* Edit nama */}
      <div className="profile-form-card">
        <h2 className="profile-form-title">Edit Profil</h2>
        {profileState.success && <SuccessBanner msg="Nama berhasil diperbarui." />}
        {profileState.error && <ErrorBanner msg={profileState.error} />}
        <form action={profileAction} className="profile-form">
          <div className="profile-form-group">
            <label htmlFor="pf-name">Nama Lengkap</label>
            <input
              id="pf-name" name="name" type="text" required
              defaultValue={currentName} className="profile-input"
            />
          </div>
          <button type="submit" className="profile-save-btn" disabled={profilePending}>
            {profilePending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>

      {/* Ubah password */}
      <div className="profile-form-card">
        <h2 className="profile-form-title">Ubah Password</h2>
        {passState.success && <SuccessBanner msg="Password berhasil diubah." />}
        {passState.error && <ErrorBanner msg={passState.error} />}
        <form action={passAction} className="profile-form">
          <div className="profile-form-group">
            <label htmlFor="pf-old">Password Lama</label>
            <PasswordInput
              id="pf-old" name="oldPassword" required
              placeholder="••••••••" inputClassName="profile-input"
            />
          </div>
          <div className="profile-form-group">
            <label htmlFor="pf-new">Password Baru</label>
            <PasswordInput
              id="pf-new" name="newPassword" required
              placeholder="Minimal 6 karakter" inputClassName="profile-input"
            />
          </div>
          <button type="submit" className="profile-save-btn" disabled={passPending}>
            {passPending ? 'Menyimpan...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
