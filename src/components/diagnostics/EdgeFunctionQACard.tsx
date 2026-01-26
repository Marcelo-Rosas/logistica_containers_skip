import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QAResult } from '@/services/diagnostics'

interface EdgeFunctionQACardProps {
  loading: boolean
  results: QAResult[]
  onRunTests: () => void
}

export function EdgeFunctionQACard({
  loading,
  results,
  onRunTests,
}: EdgeFunctionQACardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Edge Function QA Suite</span>
          <Button onClick={onRunTests} disabled={loading}>
            {loading ? 'Running Tests...' : 'Run QA Tests'}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardTitle>
        <CardDescription>
          Target: <code>bl_create_container_items</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
            Click "Run QA Tests" to execute the test suite.
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((res) => (
              <div
                key={res.test_id}
                className="border rounded-lg overflow-hidden"
              >
                <div className="bg-slate-50 p-3 px-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {res.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <span className="font-bold text-sm">{res.test_id}</span>
                      <span className="mx-2 text-muted-foreground">|</span>
                      <span className="text-sm font-medium">
                        {res.description}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={res.passed ? 'outline' : 'destructive'}
                    className={
                      res.passed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ''
                    }
                  >
                    Status: {res.status}
                  </Badge>
                </div>

                <div className="p-4 grid gap-4 text-xs font-mono">
                  <div>
                    <span className="font-semibold text-muted-foreground mb-1 block">
                      Response Headers (CORS)
                    </span>
                    <pre className="bg-slate-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(res.headers, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground mb-1 block">
                      Response Body
                    </span>
                    <pre className="bg-slate-900 text-green-400 p-2 rounded overflow-x-auto max-h-40">
                      {JSON.stringify(res.body, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
