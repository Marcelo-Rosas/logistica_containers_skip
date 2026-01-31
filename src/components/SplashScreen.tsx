import { Package } from 'lucide-react'

export function SplashScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4 animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xl animate-bounce">
        <Package className="h-8 w-8" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Logística Container
        </h2>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
          <p className="text-sm text-muted-foreground font-medium">
            Carregando sistema...
          </p>
        </div>
      </div>
    </div>
  )
}
