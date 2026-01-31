/* Landing Page - Redirects auth users to /containers, shows public content to others */
import { useAuth } from '@/hooks/use-auth'
import { Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Package,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  LogIn,
} from 'lucide-react'

export default function Index() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/containers" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 bg-white border-b flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <Package className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Logística Container
          </span>
        </div>
        <Button asChild size="sm">
          <Link to="/login">
            Acessar Sistema <LogIn className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="py-20 px-6 text-center space-y-8 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-3xl mx-auto space-y-4 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
              Gestão Inteligente de <br />
              <span className="text-primary">Frota e Armazenagem</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Controle total sobre containers, BLs e faturamento. Otimize sua
              operação logística com dados em tempo real e automação de custos.
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link to="/login">
                  Começar Agora <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
              >
                Saiba Mais
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Controle de Frota</h3>
              <p className="text-slate-600">
                Monitore status, localização e ocupação de cada container em
                tempo real.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Faturamento Automático</h3>
              <p className="text-slate-600">
                Cálculo preciso de armazenagem (Pro-rata) e custos acessórios
                sem planilhas manuais.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Segurança de Dados</h3>
              <p className="text-slate-600">
                Integridade garantida com Supabase, RLS e backups automáticos.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-center text-sm">
        <p>
          &copy; 2026 Logística Container Inc. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
