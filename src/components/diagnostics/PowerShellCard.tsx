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

# --- SANITIZATION BLOCK ---
# 1. Trim whitespace
$access_token = $access_token.Trim()
# 2. Remove "Bearer" prefix (case-insensitive)
$access_token = $access_token -replace "^(?i)bearer\\s*", ""
# 3. Strip quotes (single/double) and parentheses that might be copied
# Fixed Regex: Uses single-set character class behavior for cleaning
$access_token = $access_token -replace "^['""\\(\\)\\s]+|['""\\(\\)\\s]+$", ""
# 4. Remove any non-base64-url characters (keep alphanumeric, -, _, .)
$access_token = $access_token -replace "[^a-zA-Z0-9\\-\\._]", ""
# --------------------------

# Validation
if (($access_token -split "\\.").Count -ne 3) {
    Write-Host "Erro: Token inválido (formato JWT incorreto)." -ForegroundColor Red
} else {
    Write-Host "OK: Token sanitizado e validado." -ForegroundColor Green

    # QA-00: Auth Check
    Write-Host "\`n1) Teste Auth /auth/v1/user ..." -ForegroundColor Cyan
    try {
        $authResp = curl.exe -s -o /dev/null -w "%{http_code}" -X GET "$base/auth/v1/user" -H "apikey: $anon" -H "Authorization: Bearer $access_token"
        if ($authResp -eq "200") {
             Write-Host "   [PASS] Auth Check (200 OK)" -ForegroundColor Green
        } else {
             Write-Host "   [FAIL] Auth Check ($authResp)" -ForegroundColor Red
             Exit
        }
    } catch {
        Write-Host "   [ERROR] Falha ao executar curl" -ForegroundColor Red
        Exit
    }

    # QA-02: Edge Function Happy Path
    Write-Host "\`n2) Teste Edge Function (Happy Path) ..." -ForegroundColor Cyan
    $reqId = [guid]::NewGuid().ToString()
    $body = @{
        request_id = $reqId
        bl_number  = "PS-QA-TEST"
        containers = @(
            @{
                codigo = "PS-CONT-" + (Get-Random -Minimum 1000 -Maximum 9999)
                tipo   = "20ft"
                items  = @()
            }
        )
    } | ConvertTo-Json -Depth 5

    curl.exe -X POST "$fn" -H "apikey: $anon" -H "Authorization: Bearer $access_token" -H "Content-Type: application/json" -d $body
}`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-slate-700" />
          PowerShell: QA Script
        </CardTitle>
        <CardDescription>
          Script atualizado com sanitização de token e teste de 2 estágios (Auth
          + Function).
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
