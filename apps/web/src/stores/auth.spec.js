import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

import api from '@/services/api'
import { useAuthStore } from './auth'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    api.post.mockReset()
  })

  it('logs in and normalizes typeUser to lowercase', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        access_token: 'jwt-token-abc',
        user: {
          id: 1,
          name: 'Yasmim Daiana',
          email: 'aluno@unicamp.br',
          typeUser: 'STUDENT',
        },
      },
    })

    const store = useAuthStore()
    const success = await store.login('aluno@unicamp.br', '123456')

    expect(success).toBe(true)
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'aluno@unicamp.br',
      password: '123456',
    })
    expect(store.token).toBe('jwt-token-abc')
    expect(store.user).toMatchObject({
      id: 1,
      email: 'aluno@unicamp.br',
      type: 'student',
    })
  })

  it('returns false and keeps state empty on 401', async () => {
    api.post.mockRejectedValueOnce({ response: { status: 401 } })

    const store = useAuthStore()
    const success = await store.login('invalido@unicamp.br', 'senha-errada')

    expect(success).toBe(false)
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
  })

  it('clears user and token on logout', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        access_token: 'jwt-token-xyz',
        user: {
          id: 2,
          name: 'Prof. Carlos',
          email: 'prof@unicamp.br',
          typeUser: 'TEACHER',
        },
      },
    })

    const store = useAuthStore()
    await store.login('prof@unicamp.br', '123456')

    store.logout()

    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
  })
})
