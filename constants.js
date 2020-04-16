export const STATUSES = {
  'AVAILABLE': 'AVAILABLE',
  'NOT AVAILABLE': 'NOT AVAILABLE',
  'EXPIRED': 'EXPIRED',
}

export const defaultBook = {
  name: null,
  author: null,
  publishedDate: null,
  status: STATUSES.AVAILABLE,
  grantedUser: null,
  grantedDate: null,
  returnDate: null,
}