import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            Welcome to Manana
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered fashion design platform - Next.js migration in progress
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
                Sign In
              </Button>
            </Link>
            <Link href="/market">
              <Button variant="outline" size="lg">
                Browse Market
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Unified login with email/password and magic links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Try Login →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Profile Management</CardTitle>
              <CardDescription>
                Full profile editing with Supabase integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile">
                <Button variant="outline" className="w-full">
                  View Profile →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Market Browse</CardTitle>
              <CardDescription>
                Browse designs (public access)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/market">
                <Button variant="outline" className="w-full">
                  Browse Market →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            🚧 This is the Next.js version running on port 3100
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Original React app still runs on the default port
          </p>
        </div>
      </div>
    </div>
  );
}