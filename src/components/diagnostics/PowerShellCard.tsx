import { Terminal } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

export function PowerShellCard() {
  const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bl_create_container_items`

  const script = `$URL = "${edgeFunctionUrl}"
$access_token = Read-Host -Prompt "Cole o access_token aqui"
$access_token = $access_token.Trim()
# Remove "Bearer " prefix if present (case-insensitive)
$access_token = $access_token -replace "^(?i)bearer\\s*", ""
# Remove invalid characters (keep only alphanumeric, -, _, .)
$access_token = $access_token -replace "[^a-zA-Z0-9\\-\\._]", ""

if (($access_token -split "\\.").Count -ne 3) {
    Write-Host "Erro: Token inválido (deve ter 3 partes)." -ForegroundColor Red
} else {
    Write-Host "URL definida: $URL" -ForegroundColor Green
    Write-Host "Token limpo: $access_token" -ForegroundColor Green
}`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-slate-700" />
          PowerShell: preparar JWT e URL
        </CardTitle>
        <CardDescription>
          Defina a URL da Edge Function e limpe o access token antes de testar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <pre className="bg-slate-900 text-slate-50 p-4 rounded-md font-mono text-xs overflow-x-auto whitespace-pre-wrap break-words">
            {script}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
