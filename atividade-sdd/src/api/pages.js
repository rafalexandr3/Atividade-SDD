import client from './client'
import { toApiError } from './errors'

function toPagesError(error) {
  return toApiError(error, { notFoundMessage: 'Página não encontrada' })
}

export async function listByUser(userId) {
  try {
    const { data } = await client.get('/pages', { params: { userId } })
    if (!Array.isArray(data)) return []
    return data.filter((page) => String(page.userId) === String(userId))
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
