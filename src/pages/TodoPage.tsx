import { useState } from 'react'
import Page from '../components/Page'
import Card from '../components/Card'

type TodoItem = { id: string; text: string; done: boolean }

export default function TodoPage() {
  const [items, setItems] = useState<TodoItem[]>([])
  const [text, setText] = useState('')

  const add = () => {
    const value = text.trim()
    if (!value) return
    setItems((prev) => [{ id: crypto.randomUUID(), text: value, done: false }, ...prev])
    setText('')
  }

  const toggle = (id: string) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)))
  const remove = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id))

  return (
    <Page id="todo">
      <h2 className="text-2xl mb-4">Att göra</h2>
      <Card className="p-4">
        <div className="flex gap-3 mb-3">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Lägg till en uppgift..." onKeyDown={(e) => { if (e.key === 'Enter') add() }} className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50" />
          <button onClick={add} className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20">Lägg till</button>
        </div>
        <ul className="grid gap-2 list-none p-0 m-0">
          {items.length === 0 && <li className="text-white/60">Inga uppgifter ännu.</li>}
          {items.map((it) => (
            <li key={it.id} className={`flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2 ${it.done ? 'opacity-70' : ''}`}>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={it.done} onChange={() => toggle(it.id)} />
                <span className={`${it.done ? 'line-through' : ''}`}>{it.text}</span>
              </label>
              <button className="text-slate-300 hover:text-white" onClick={() => remove(it.id)}>Ta bort</button>
            </li>
          ))}
        </ul>
      </Card>
    </Page>
  )
}
