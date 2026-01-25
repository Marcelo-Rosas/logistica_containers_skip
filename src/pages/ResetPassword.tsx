import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'
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
import { toast } from 'sonner'
import { Loader2, Lock, KeyRound } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updatePassword, session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !session) {
      // If no session, the link might be invalid or expired, or not clicked yet
      // But typically user lands here via email link which establishes session
      const hash = window.location.hash
      if (!hash || !hash.includes('access_token')) {
        toast.error('Link de recuperação inválido ou expirado.')
        navigate('/login')
      }
    }
  }, [session, loading, navigate])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await updatePassword(password)
      if (error) {
        toast.error('Erro ao atualizar senha: ' + error.message)
      } else {
        toast.success('Senha atualizada com sucesso!')
        navigate('/login')
      }
    } catch (error) {
      toast.error('Erro inesperado ao atualizar senha.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4 shadow-lg">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Definir Nova Senha
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie uma nova senha segura para sua conta
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle>Nova Senha</CardTitle>
            <CardDescription>Digite sua nova senha abaixo.</CardDescription>
          </CardHeader>
          <form onSubmit={handleReset}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    className="pl-9"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Atualizar Senha'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
