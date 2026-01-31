import { useAuth } from '@/hooks/use-auth'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export const RequireAuth = () => {
  const { user } = useAuth()
  const location = useLocation()
  const toastShown = useRef(false)

  useEffect(() => {
    if (!user) {
      // Only show toast if we are protecting a route that isn't login or root
      // But RequireAuth wraps protected routes, so any access here without user is invalid
      if (!toastShown.current) {
        toast.error('Por favor, faça login para acessar esta página.')
        toastShown.current = true
      }
    }
  }, [user])

  if (!user) {
    // Redirect to login page but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
