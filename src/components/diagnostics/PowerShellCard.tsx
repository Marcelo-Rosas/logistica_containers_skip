import { Terminal } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

export function PowerShellCard() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/bl_create_container_items`

  const script = `$base = "${supabaseUrl}"
$fn = "${edgeFunctionUrl}"
$anon = Read-Host -Prompt "Cole a ANON KEY (Settings > API > anon public)"
$access_token = Read-Host -Prompt "Cole o access_token (eyJ...)"

# Sanitização Robusta
$access_token = $access_token.Trim()
# Remove "Bearer " prefix (case-insensitive)
$access_token = $access_token -replace "^(?i)bearer\\s*", ""
# Remove quotes, parenthesis, spaces from start/end (common copy-paste issues)
$access_token = $access_token -replace "^['""\\(\\)\\s]+|['""\\(\\)\\s]+$", ""
# Remove anything that is not alphanumeric, -, _, .
$access_token = $access_token -replace "[^a-zA-Z0-9\\-\\._]", ""

# Validação Estrita
if (($access_token -split "\\.").Count -ne 3) {
    Write-Host "Erro: Token inválido (deve ter 3 partes separadas por ponto)." -ForegroundColor Red
} else {
    Write-Host "OK: token capturado e sanitizado (nao exibido)." -ForegroundColor Green

    Write-Host "1) Teste Auth /auth/v1/user ..." -ForegroundColor Cyan
    curl.exe -X GET "$base/auth/v1/user" -H "apikey: $anon" -H "Authorization: Bearer $access_token"

    Write-Host "\`n2) Teste Edge Function ..." -ForegroundColor Cyan
    curl.exe -X POST "$fn" -H "apikey: $anon" -H "Authorization: Bearer $access_token" -H "Content-Type: application/json" -d "{""request_id"": ""PS-TEST-$(Get-Random)""}"
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
