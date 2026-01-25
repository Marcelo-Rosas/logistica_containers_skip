import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, Lock, Mail, Package, AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState<{
    title: string
    message: string
  } | null>(null)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)

    // Sanitize email: remove [blocked] suffix and whitespace
    // This ensures standardized email handling as per user story
    let cleanEmail = email.trim()
    if (cleanEmail.toLowerCase().includes('[blocked]')) {
      cleanEmail = cleanEmail.replace(/\s*\[blocked\]\s*/gi, '')
      setEmail(cleanEmail) // Update UI with clean email
    }

    if (!cleanEmail || !password) {
      toast.error('Preencha email e senha')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await signIn(cleanEmail, password)
      if (error) {
        console.error('Login Error:', error)
        let errorTitle = 'Falha no Login'
        let errorMessage = error.message

        // Enhanced Error Handling based on Supabase error codes/messages
        if (error.message.includes('Invalid login credentials')) {
          errorTitle = 'Credenciais Inválidas'
          errorMessage = 'O email ou a senha fornecidos estão incorretos.'
        } else if (error.message.includes('Email not confirmed')) {
          errorTitle = 'Email Não Confirmado'
          errorMessage = 'Por favor, confirme seu email antes de fazer login.'
        } else if (error.message.includes('Too many requests')) {
          errorTitle = 'Muitas Tentativas'
          errorMessage =
            'Muitas tentativas de login. Tente novamente mais tarde.'
        }

        setLoginError({ title: errorTitle, message: errorMessage })
        toast.error(errorMessage)
      } else {
        toast.success('Login realizado com sucesso!')
        navigate(from, { replace: true })
      }
    } catch (error) {
      const genericMsg = 'Ocorreu um erro inesperado ao tentar fazer login.'
      setLoginError({ title: 'Erro Inesperado', message: genericMsg })
      toast.error(genericMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4 shadow-lg">
            <Package className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Logística Container
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerenciamento inteligente de frota e BLs
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Acesse sua conta</CardTitle>
            <CardDescription>
              Entre com suas credenciais para continuar
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{loginError.title}</AlertTitle>
                  <AlertDescription>{loginError.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@empresa.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          &copy; 2026 Logística Container Inc. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
