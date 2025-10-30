"use client"

import { useState, useEffect, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { updateProfile, changePassword } from "../../store/slices/authSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Textarea } from "../../../../components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs"
import { Badge } from "../../../../components/ui/badge"
import { Switch } from "../../../../components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { User, Calendar, Shield, Bell, Palette, Loader2, Save, Key, Mail } from "lucide-react"
import { toast } from "react-toastify"

const ProfilePage = () => {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((state) => state.auth)

  const [activeTab, setActiveTab] = useState("profile")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    institution: "",
    department: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    theme: "light",
    language: "es",
  })

  // ✅ Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        location: user.location || "",
        institution: user.institution || "",
        department: user.department || "",
      })
      setPreferences({
        emailNotifications: user.preferences?.emailNotifications ?? true,
        pushNotifications: user.preferences?.pushNotifications ?? false,
        weeklyReports: user.preferences?.weeklyReports ?? true,
        theme: user.preferences?.theme || "light",
        language: user.preferences?.language || "es",
      })
    }
  }, [user])

  // ✅ Manejo de errores global
  useEffect(() => {
    if (error && activeTab === "profile") {
      toast.error(error)
    }
  }, [error, activeTab])

  // ✅ Actualizar perfil optimizado
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await dispatch(updateProfile(profileData)).unwrap()
      toast.success("Perfil actualizado correctamente")
    } catch (error) {
      toast.error(error || "No se pudo actualizar el perfil")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ Cambiar contraseña optimizado
  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setIsSubmitting(true)

    try {
      await dispatch(
        changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      ).unwrap()

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast.success("Contraseña actualizada correctamente")
    } catch (error) {
      toast.error(error || "No se pudo cambiar la contraseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ Preferencias con debounce
  const handlePreferencesUpdate = useCallback(async () => {
    setLocalLoading(true)

    try {
      await dispatch(updateProfile({ preferences })).unwrap()
      toast.success("Preferencias actualizadas")
    } catch (error) {
      toast.error(error || "No se pudieron actualizar las preferencias")
    } finally {
      setLocalLoading(false)
    }
  }, [preferences, dispatch])

  // ✅ Resetear formulario de contraseña
  const resetPasswordForm = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800 border-red-200",
      teacher: "bg-blue-100 text-blue-800 border-blue-200",
      student: "bg-green-100 text-green-800 border-green-200",
      reviewer: "bg-purple-100 text-purple-800 border-purple-200",
    }
    return colors[role] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getRoleLabel = (role) => {
    const labels = {
      admin: "Administrador",
      teacher: "Docente",
      student: "Estudiante",
      reviewer: "Revisor",
    }
    return labels[role] || "Usuario"
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  const isProfileModified = useCallback(() => {
    if (!user) return false
    return (
      profileData.firstName !== (user.firstName || "") ||
      profileData.lastName !== (user.lastName || "") ||
      profileData.email !== (user.email || "") ||
      profileData.phone !== (user.phone || "") ||
      profileData.bio !== (user.bio || "") ||
      profileData.location !== (user.location || "") ||
      profileData.institution !== (user.institution || "") ||
      profileData.department !== (user.department || "")
    )
  }, [profileData, user])

  if (loading && !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Cargando perfil...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground mt-2">Gestiona tu información personal y preferencias</p>
      </div>

      {/* Tarjeta de información del usuario */}
      <Card className="mb-8 border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={`${user?.firstName} ${user?.lastName}`} />
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 mt-3">
                <Badge variant="secondary" className={getRoleColor(user?.role)}>
                  {getRoleLabel(user?.role)}
                </Badge>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  Miembro desde {new Date(user?.createdAt).toLocaleDateString("es-ES")}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Preferencias</span>
          </TabsTrigger>
        </TabsList>

        {/* Información Personal */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu información personal y académica</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      placeholder="Tu apellido"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Cuéntanos sobre ti, tus intereses académicos, experiencia..."
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">{profileData.bio.length}/500 caracteres</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institución</Label>
                    <Input
                      id="institution"
                      value={profileData.institution}
                      onChange={(e) => setProfileData({ ...profileData, institution: e.target.value })}
                      placeholder="Universidad o institución"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                      placeholder="Departamento o facultad"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="Ciudad, País"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isProfileModified()}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSubmitting ? "Actualizando..." : "Actualizar Perfil"}
                  </Button>

                  {isProfileModified() && (
                    <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seguridad */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>Mantén tu cuenta segura con una contraseña fuerte y única</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Tu contraseña actual"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">La contraseña debe tener al menos 6 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Repite tu nueva contraseña"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !passwordData.currentPassword || !passwordData.newPassword}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    {isSubmitting ? "Cambiando..." : "Cambiar Contraseña"}
                  </Button>

                  <Button type="button" variant="outline" onClick={resetPasswordForm} disabled={isSubmitting}>
                    Limpiar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>Controla cómo y cuándo recibes notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  id: "emailNotifications",
                  title: "Notificaciones por Email",
                  description: "Recibe actualizaciones por correo electrónico",
                  checked: preferences.emailNotifications,
                },
                {
                  id: "pushNotifications",
                  title: "Notificaciones Push",
                  description: "Recibe notificaciones en tiempo real",
                  checked: preferences.pushNotifications,
                },
                {
                  id: "weeklyReports",
                  title: "Reportes Semanales",
                  description: "Recibe un resumen semanal de tu actividad",
                  checked: preferences.weeklyReports,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <h4 className="font-medium text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={item.checked}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, [item.id]: checked })}
                  />
                </div>
              ))}

              <Button onClick={handlePreferencesUpdate} disabled={localLoading} className="flex items-center gap-2">
                {localLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {localLoading ? "Guardando..." : "Guardar Preferencias"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferencias */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de la Aplicación</CardTitle>
              <CardDescription>Personaliza tu experiencia en la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="theme">Tema de la aplicación</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">🌞 Claro</SelectItem>
                    <SelectItem value="dark">🌙 Oscuro</SelectItem>
                    <SelectItem value="system">💻 Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="language">Idioma</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="pt">🇧🇷 Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handlePreferencesUpdate} disabled={localLoading} className="flex items-center gap-2">
                {localLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {localLoading ? "Guardando..." : "Guardar Preferencias"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProfilePage