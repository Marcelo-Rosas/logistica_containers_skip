/* Sidebar Component implementation specific to the Logistics App */
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  Box,
  BarChart3,
  Settings,
  LogOut,
  Package,
  History,
  Receipt,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = useSidebar()
  const { signOut } = useAuth()
  const collapsed = state === 'collapsed'

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      toast.error('Erro ao sair')
    }
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Gestão de BLs', path: '/bl' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: Box, label: 'Containers', path: '/containers' },
    { icon: AlertTriangle, label: 'Divergências', path: '/divergencias' },
    { icon: History, label: 'Movimentações', path: '/eventos' },
    { icon: Receipt, label: 'Faturamento', path: '/faturamento' },
    { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-center py-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Package className="h-6 w-6" />
          {!collapsed && <span>Logística</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="p-2 gap-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                isActive={
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + '/')
                }
                className={cn(
                  'transition-all duration-200',
                  (location.pathname === item.path ||
                    location.pathname.startsWith(item.path + '/')) &&
                    'bg-accent text-accent-foreground font-medium',
                )}
              >
                <Link to={item.path}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sair" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
