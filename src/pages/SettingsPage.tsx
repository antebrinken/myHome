import { FormEvent, useState } from 'react'
import Page from '../components/Page'
import Card from '../components/Card'
import { supabase } from '@/modules/supabase/client'
import { useSupabaseSession } from '@/components/SupabaseAuthGate'

const settingsOptions = [
  { id: 'notifications', label: 'Notifications', description: 'Get email updates about important account activity.' },
  { id: 'analytics', label: 'Usage analytics', description: 'Allow anonymous usage analytics to help improve the experience.' },
  { id: 'beta', label: 'Beta features', description: 'Opt in to upcoming experimental features.' },
]

export default function SettingsPage() {
  const session = useSupabaseSession()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordMessage(null)
    setPasswordError(null)

    if (newPassword.trim().length < 8) {
      setPasswordError('Lösenordet måste vara minst 8 tecken.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Lösenorden matchar inte.')
      return
    }

    setIsUpdatingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setIsUpdatingPassword(false)

    if (error) {
      setPasswordError(error.message)
      return
    }
    setPasswordMessage('Ditt lösenord har uppdaterats.')
    setNewPassword('')
    setConfirmPassword('')
  }

  async function handleDeleteAccount() {
    setDeleteMessage(null)
    setDeleteError(null)

    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Skriv DELETE (med stora bokstäver) för att bekräfta.')
      return
    }
    const token = session?.access_token
    if (!token) {
      setDeleteError('Kunde inte hitta en giltig inloggning. Logga in igen och försök på nytt.')
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error ?? 'Misslyckades med att ta bort kontot.')
      }

      setDeleteMessage('Ditt konto har tagits bort. Du loggas ut.')
      await supabase.auth.signOut()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Ett oväntat fel inträffade.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Page id="settings">
      <h2 className="mb-4 text-2xl font-semibold">Settings</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-lg font-semibold">Preferences</h3>
          <div className="space-y-4">
            {settingsOptions.map((option) => (
              <label key={option.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm hover:bg-white/10">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent" />
                <span>
                  <span className="block font-medium text-white">{option.label}</span>
                  <span className="text-white/70">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-lg font-semibold">Change password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-white/60">Nytt lösenord</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="Minst 8 tecken"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60">Bekräfta nytt lösenord</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="Bekräfta lösenord"
                required
              />
            </label>
            {passwordError && <p className="text-xs text-red-400">{passwordError}</p>}
            {passwordMessage && <p className="text-xs text-emerald-400">{passwordMessage}</p>}
            <button
              type="submit"
              className="w-full rounded-md border border-indigo-400/40 bg-indigo-500/20 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-indigo-100 hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? 'Uppdaterar...' : 'Uppdatera lösenord'}
            </button>
          </form>
        </Card>

        <Card className="p-5 lg:col-span-2 border-red-500/40">
          <h3 className="mb-3 text-lg font-semibold text-red-300">Ta bort konto</h3>
          <p className="mb-4 text-sm text-white/70">
            Den här åtgärden är permanent och går inte att ångra. All data kopplad till ditt konto tas bort.
          </p>
          <div className="space-y-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-white/60">Skriv DELETE för att bekräfta</span>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(event) => setDeleteConfirmText(event.target.value)}
                className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-white focus:border-red-300 focus:outline-none focus:ring-1 focus:ring-red-400"
              />
            </label>
            {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
            {deleteMessage && <p className="text-xs text-emerald-400">{deleteMessage}</p>}
            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-md border border-red-400/50 bg-red-500/20 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-red-100 hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Tar bort...' : 'Ta bort konto'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </Page>
  )
}
