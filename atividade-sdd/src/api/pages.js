import client from './client'

export class PagesError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'PagesError'
    this.status = status
  }
}

function toPagesError(error) {
  if (error instanceof PagesError) return error
  if (!error.response) {
    return new PagesError('Não foi possível conectar ao servidor')
  }
  if (error.response.status === 404) {
    return new PagesError('Página não encontrada', 404)
  }
  return new PagesError(
    'Não foi possível concluir a operação. Tente novamente.',
  )
}

export async function listByUser(userId) {
  try {
    const { data } = await client.get('/pages', { params: { userId } })
    return Array.isArray(data) ? data : []
  } catch (error) {
    throw toPagesError(error)
  }
}

export async function getById(id) {
  try {
    const { data } = await client.get(`/pages/${id}`)
    return data
  } catch (error) {
    throw toPagesError(error)
  }
}

export async function createNote({ userId, title, content }) {
  try {
    const { data } = await client.post('/pages', {
      userId,
      title,
      type: 'note',
      content,
    })
    return data
  } catch (error) {
    throw toPagesError(error)
  }
}

export async function updateNote(id, { title, content }) {
  try {
    const { data } = await client.patch(`/pages/${id}`, { title, content })
    return data
  } catch (error) {
    throw toPagesError(error)
  }
}

export async function createChecklist({ userId, title, items }) {
  try {
    const { data } = await client.post('/pages', {
      userId,
      title,
      type: 'checklist',
      items,
    })
    return data
  } catch (error) {
    throw toPagesError(error)
  }
}

export async function updateChecklist(id, { title, items }) {
  try {
    const { data } = await client.patch(`/pages/${id}`, { title, items })
    return data
  } catch (error) {
    throw toPagesError(error)
  }
}

export async function remove(id) {
  try {
    await client.delete(`/pages/${id}`)
  } catch (error) {
    throw toPagesError(error)
  }
}
