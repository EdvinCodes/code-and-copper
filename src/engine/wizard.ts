export type WizardLink = { to: string; label: string }

export type WizardQuestion = {
  id: string
  kind: 'question'
  question: string
  help?: string
  safety?: string
  options: { label: string; next: string }[]
}

export type WizardLeaf = {
  id: string
  kind: 'result'
  result: string
  actions: string[]
  measurements?: string[]
  links?: WizardLink[]
}

export type WizardNode = WizardQuestion | WizardLeaf

export function validateWizard(nodes: readonly WizardNode[], start: string): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  for (const node of nodes) {
    if (ids.has(node.id)) errors.push(`id repetido: ${node.id}`)
    ids.add(node.id)
  }
  if (!ids.has(start)) errors.push(`no existe el inicio ${start}`)
  const referenced = new Set<string>([start])
  for (const node of nodes) {
    if (node.kind === 'question') {
      for (const option of node.options) {
        if (!ids.has(option.next)) errors.push(`${node.id} apunta a ${option.next}, que no existe`)
        referenced.add(option.next)
      }
    } else if (node.actions.length === 0) {
      errors.push(`${node.id} no tiene acciones`)
    }
  }
  for (const node of nodes) {
    if (!referenced.has(node.id)) errors.push(`huérfano: ${node.id}`)
  }
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const state = new Map<string, 'visiting' | 'done'>()
  function walk(id: string) {
    const mark = state.get(id)
    if (mark === 'visiting') {
      errors.push(`ciclo en ${id}`)
      return
    }
    if (mark === 'done') return
    state.set(id, 'visiting')
    const node = byId.get(id)
    if (node?.kind === 'question') {
      for (const option of node.options) walk(option.next)
    }
    state.set(id, 'done')
  }
  if (ids.has(start)) walk(start)
  return errors
}
