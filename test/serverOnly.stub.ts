/**
 * Stands in for the `server-only` package under Vitest.
 *
 * `server-only` ships no real implementation — Next.js aliases it at build
 * time so that importing it from a Client Component fails the build. Vitest
 * has no such alias, so any test that transitively reaches a server module
 * (e.g. a component importing a Server Action) fails to resolve the import.
 * This empty module restores resolution without changing any behaviour;
 * tests still stub the server modules themselves.
 */

export {};
