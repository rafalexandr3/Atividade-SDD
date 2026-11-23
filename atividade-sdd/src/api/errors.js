export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function toApiError(error, { notFoundMessage } = {}) {
  if (error instanceof ApiError) return error
  if (!error.response) {
    return new ApiError('Não foi possível conectar ao servidor')
  }
  if (error.response.status === 404 && notFoundMessage) {
    return new ApiError(notFoundMessage, 404)
  }
  return new ApiError(
    'Não foi possível concluir a operação. Tente novamente.',
  )
}
