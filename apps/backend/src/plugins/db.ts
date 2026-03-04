import fp from 'fastify-plugin'
import { createDb } from '@repo/db/client'
import { resolvePostgresUrl } from '@repo/db/env'
import type { DbForAuthRoutes } from '../types/db'

declare module 'fastify' {
  export interface FastifyInstance {
    db: DbForAuthRoutes
    dbPool: unknown
  }
}

export default fp(async (fastify) => {
  const connectionString = resolvePostgresUrl()
  const { db, pool } = createDb(connectionString)

  fastify.decorate('db', db)
  fastify.decorate('dbPool', pool)

  fastify.addHook('onClose', async () => {
    await pool.end()
  })
}, { name: 'db' })
