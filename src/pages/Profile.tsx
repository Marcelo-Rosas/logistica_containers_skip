import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Loader2, User, Camera, Save, Mail, Phone } from 'lucide-react'
import { getProfile, updateProfile, uploadAvatar } from '@/services/profile'

const profileSchema = z.object({
  full_name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Por favor, insira um email válido.',
  }),
  phone: z.string().optional().or(z.literal('')),
  avatar_url: z.string().optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      avatar_url: '',
    },
  })

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    try {
      setLoading(true)
      const { data, error } = await getProfile(user.id)

      if (error) {
        toast.error('Erro ao carregar perfil.')
        return
      }

      if (data) {
        form.reset({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || '',
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Erro inesperado ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
      return
    }

    const file = e.target.files[0]
    setUploading(true)

    try {
      const publicUrl = await uploadAvatar(user.id, file)
      form.setValue('avatar_url', publicUrl, { shouldDirty: true })
      toast.success('Imagem carregada com sucesso!')
    } catch (error: any) {
      // Sanitize error before logging to prevent cloning issues
      const errorMessage = error.message || 'Erro desconhecido'
      console.error('Upload error:', errorMessage)
      toast.error(`Erro no upload: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await updateProfile(user.id, {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone || null,
        avatar_url: values.avatar_url || null,
      })

      if (error) {
        throw new Error(error.message)
      }

      toast.success('Perfil atualizado com sucesso!')

      // Reload to ensure everything is synced
      loadProfile()
    } catch (error: any) {
      // Sanitize error before logging
      const errorMessage = error.message || 'Erro desconhecido'
      console.error('Update profile error:', errorMessage)
      toast.error('Falha ao atualizar perfil.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Carregando perfil...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e aparência no sistema.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seus dados de contato e foto de perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-muted">
                    <AvatarImage
                      src={form.watch('avatar_url') || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl bg-slate-100">
                      {form
                        .watch('full_name')
                        ?.substring(0, 2)
                        .toUpperCase() || <User />}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Alterar foto</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Avatar (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://exemplo.com/foto.jpg"
                            {...field}
                            disabled={uploading}
                          />
                        </FormControl>
                        <FormDescription>
                          Você pode fazer upload de uma foto ou colar uma URL
                          externa.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="Seu nome"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="seu@email.com"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Email utilizado para login e notificações.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone / WhatsApp</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="(00) 00000-0000"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="submit" disabled={saving || uploading}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}
