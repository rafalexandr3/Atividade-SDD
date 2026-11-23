export function isPageOwnedBy(page, userId) {
  return Boolean(page) && String(page.userId) === String(userId)
}

export function isPageOfType(page, type) {
  return Boolean(page) && page.type === type
}
