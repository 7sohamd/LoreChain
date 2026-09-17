import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-4xl font-bold text-foreground mb-4">404 - Page Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The story or page you are looking for does not exist in this universe.
      </p>
      <Link
        href="/"
        className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
      >
        Return to Home
      </Link>
    </div>
  )
}
