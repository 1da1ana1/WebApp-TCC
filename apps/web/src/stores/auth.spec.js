import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from './auth'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('logs in as student with valid mock credentials', async () => {
    const store = useAuthStore()

    const success = await store.login('aluno@unicamp.br', '123456')

    expect(success).toBe(true)
    expect(store.user).toMatchObject({
      email: 'aluno@unicamp.br',
      type: 'student',
    })
    expect(store.token).toBe('token-falso-student-123')
  })

  it('returns false and keeps state empty for invalid credentials', async () => {
    const store = useAuthStore()

    const success = await store.login('invalido@unicamp.br', 'senha-errada')

    expect(success).toBe(false)
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
  })

  it('clears user and token on logout', async () => {
    const store = useAuthStore()
    await store.login('prof@unicamp.br', '123456')

    store.logout()

    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
  })
})
