import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export function MobileFallback() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Manana</h1>
          <p className="text-sm text-muted-foreground">Mobile Experience</p>
        </div>

        {/* Status */}
        <div className="bg-card border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Authentication:</span>
              <span className={user ? "text-green-600" : "text-red-600"}>
                {user ? "Signed In" : "Not Signed In"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Platform:</span>
              <span>Mobile</span>
            </div>
            <div className="flex justify-between">
              <span>User Agent:</span>
              <span className="text-xs break-all">
                {typeof window !== 'undefined' ? window.navigator.userAgent.slice(0, 30) + '...' : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {user ? (
            <>
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Welcome!</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Email: {user.email}
                </p>
                <Button onClick={signOut} variant="outline" className="w-full">
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Please Sign In</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You need to be signed in to use the app.
              </p>
              <Button 
                onClick={() => window.location.href = '/auth'} 
                className="w-full"
              >
                Go to Sign In
              </Button>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="bg-muted/50 border rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-sm">Debug Info</h3>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>Local Storage: {typeof window !== 'undefined' && 'localStorage' in window ? 'Available' : 'Not Available'}</div>
            <div>Session Storage: {typeof window !== 'undefined' && 'sessionStorage' in window ? 'Available' : 'Not Available'}</div>
            <div>Cookies: {typeof document !== 'undefined' && document.cookie ? 'Available' : 'Not Available'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}