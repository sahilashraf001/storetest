
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center px-4">
      <AlertTriangle className="w-20 h-20 text-destructive mb-6" />
      <h1 className="text-5xl font-bold text-primary mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Oops! The page you are looking for does not exist or may have been moved.
      </p>
      <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
        <Link href={ROUTES.HOME}>Go Back Home</Link>
      </Button>
    </div>
  )
}
