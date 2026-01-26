import { ShieldAlert } from 'lucide-react'
import { User, Session } from '@supabase/supabase-js'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AuthValidationCardProps {
  user: User | null
  session: Session | null
}

export function AuthValidationCard({ user, session }: AuthValidationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-blue-500" />
          Frontend Authentication Validation
        </CardTitle>
        <CardDescription>
          Verification of JWT injection in outgoing API requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 border p-3 rounded-md bg-slate-50">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              User Identity
            </span>
            <div className="font-mono text-sm truncate">
              {user?.email || 'No User'}
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              {user?.id}
            </div>
          </div>
          <div className="space-y-2 border p-3 rounded-md bg-slate-50">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Token Claims
            </span>
            <div className="flex gap-2">
              <Badge variant={session ? 'default' : 'destructive'}>
                {session ? 'Active Session' : 'No Session'}
              </Badge>
              <Badge variant="outline">{session?.token_type || 'N/A'}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase text-muted-foreground">
            Authorization Header Preview
          </span>
          <code className="block w-full p-3 bg-slate-900 text-slate-50 rounded-md font-mono text-xs break-all">
            Authorization: Bearer {session?.access_token?.substring(0, 20)}...
            {session?.access_token?.substring(session.access_token.length - 10)}
          </code>
          <p className="text-xs text-muted-foreground mt-1">
            * This header is automatically injected by the Supabase Client in
            all requests.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
