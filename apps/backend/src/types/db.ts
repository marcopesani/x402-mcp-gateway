/**
 * Minimal db surface used by auth routes (passkey, siwx).
 * Return types and method params are intentionally loose (any) so test mocks
 * can implement this, BrevetDb remains assignable, and routes can use the
 * fluent chain without re-typing Drizzle generics.
 */
export interface DbForAuthRoutes {
  transaction<T>(callback: (tx: unknown) => Promise<T>): Promise<T>
  select(...args: any[]): any
  update(table?: any): any
  insert(table?: any): any
}
