import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

export function RootErrorBoundary() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Error inesperado'
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-5 sun:border-2">
      <h1 className="text-2xl font-semibold">Algo ha fallado</h1>
      <p className="mt-2 text-muted">{message}</p>
      <Link
        to="/"
        className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-copper-deep px-4 font-semibold text-white"
      >
        Volver al inicio
      </Link>
    </section>
  )
}
