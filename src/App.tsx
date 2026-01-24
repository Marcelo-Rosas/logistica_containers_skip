/* Main App Component - Updated with Routes for BL Management and Divergences */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Clientes from './pages/Clientes'
import Containers from './pages/Containers'
import ContainerDetails from './pages/ContainerDetails'
// Alocacoes page removed
import Events from './pages/Events'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'
import Faturamento from './pages/Faturamento'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

// New Pages
import BLManagement from './pages/BLManagement'
import BLRegister from './pages/BLRegister'
import BLDetails from './pages/BLDetails'
import Divergences from './pages/Divergences'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />

          {/* BL Routes */}
          <Route path="/bl" element={<BLManagement />} />
          <Route path="/bl/cadastrar" element={<BLRegister />} />
          <Route path="/bl/:id" element={<BLDetails />} />
          <Route path="/divergencias" element={<Divergences />} />

          <Route path="/clientes" element={<Clientes />} />
          <Route path="/containers" element={<Containers />} />
          <Route path="/containers/:id" element={<ContainerDetails />} />
          {/* Route path="/alocacoes" removed */}
          <Route path="/eventos" element={<Events />} />
          <Route path="/faturamento" element={<Faturamento />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
