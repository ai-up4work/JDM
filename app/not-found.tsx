import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="mb-8">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Sorry, the page you are looking for doesn't exist. It might have been
          moved or deleted.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Back to Home
          </Button>
        </Link>
        <Link href="/category/women">
          <Button variant="outline">Browse Products</Button>
        </Link>
      </div>

      {/* Helpful suggestions */}
      <div className="mt-16 bg-secondary rounded-lg p-8">
        <h3 className="text-xl font-bold mb-4">Need help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/category/women" className="hover:text-primary transition-colors">
            <p className="font-semibold mb-2">Browse Categories</p>
            <p className="text-sm text-muted-foreground">Explore our latest collections</p>
          </Link>
          <Link href="/help" className="hover:text-primary transition-colors">
            <p className="font-semibold mb-2">Help Center</p>
            <p className="text-sm text-muted-foreground">Find answers to common questions</p>
          </Link>
          <Link href="/sellers" className="hover:text-primary transition-colors">
            <p className="font-semibold mb-2">Discover Sellers</p>
            <p className="text-sm text-muted-foreground">Visit our amazing stores</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
