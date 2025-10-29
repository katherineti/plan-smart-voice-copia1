import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Calendar, Loader2, Mail, Mountain, Sparkles, User, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const { 
    user, 
    signInWithGoogle, // Ahora es el método que usa la redirección
    signIn, 
    signUp,
    isLoading
  } = useAuth();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado local para el formulario de Email/Pass

  // Redirección cuando el usuario cambia
  // Redirección cuando el usuario cambia (persistencia completada)
  useEffect(() => {
    // Si el usuario existe, redirige al calendario.
    if (user && !isLoading) {
      navigate('/calendar');
    }
  }, [user, navigate, isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const parseFirebaseError = (error: any): string => {
    console.log("error?.code: " , error?.code)
    if (error?.code) {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'El formato del correo electrónico es inválido.';
            case 'auth/user-disabled':
                return 'El usuario ha sido deshabilitado.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Credenciales inválidas.';
            case 'auth/invalid-credential':
                return 'Credenciales inválidas.';
            case 'auth/email-already-in-use':
                return 'El correo ya está registrado.';
            case 'auth/weak-password':
                return 'La contraseña debe tener al menos 6 caracteres.';
            case 'auth/too-many-requests':
                return 'Demasiadas solicitudes de autenticación. Debe esperar 15min para volver a intentar';
            default:
                return 'Error desconocido. Inténtalo de nuevo.';
        }
    }
    return 'Error desconocido en la autenticación.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { email, password, name, confirmPassword } = formData;
    
    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Error de Validación",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    let success = false;
    let title = "";
    let description = "";

    try {
        if (isSignUp) {
            await signUp(email, password, name);
            success = true;
            title = "Registro Exitoso";
            description = "Tu cuenta ha sido creada. Redirigiendo...";
        } else {
            await signIn(email, password);
            success = true;
            title = "Inicio de Sesión Exitoso";
            description = "Bienvenido de nuevo. Redirigiendo...";
        }
    } catch (error) {
        success = false;
        title = "Error de Autenticación";
        console.log("error" , error)
        description = parseFirebaseError(error);
    } finally {
        setIsSubmitting(false);

        toast({
            title: title,
            description: description,
            variant: success ? "default" : "destructive",
        });

        if (success) {
            // La navegación la maneja el useEffect
        }
    }
  };

  const handleGoogleSignIn = async () => {
    // El Contexto se encarga de cambiar isLoading a true y realizar la redirección
    try {
        await signInWithGoogle();
        // El código después de await NO se ejecuta si la redirección es exitosa.
    } catch (error) {
        console.error("Error al iniciar la redirección de Google:", error);
        toast({
            title: "Error de Redirección",
            description: "No se pudo iniciar el proceso de Google.",
            variant: "destructive",
        });
    }
  };

  // 🟢 Pantalla de Carga: Muestra "Cargando..." mientras Firebase verifica la persistencia inicial
  if (isLoading && !user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-xl text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin"/> Verificando sesión...
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 w-fit">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Asistente de voz inteligente</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                OronixOS
                </span>
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
                Organiza tu calendario con comandos de voz. Agenda eventos, tareas y festividades automáticamente.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: "🎤", text: "Comandos por voz" },
                { icon: "📢", text: "Escucha a tu asistente" },
                { icon: "📅", text: "Múltiples calendarios" },
                // { icon: "⚡", text: "Organización automática" },
                { icon: "🔔", text: "Recordatorios personalizados" },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
                <div className="space-y-2 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-50"></div>
                      <div className="relative bg-slate-900 p-3 rounded-full">
                        <Calendar className="h-8 w-8 text-purple-400" />
                      </div>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white">{isSignUp ? "Crear cuenta" : "Bienvenido"}</h2>
                  <p className="text-gray-400 text-sm">
                    {isSignUp ? "Únete a miles de usuarios que organizan su vida" : "Inicia sesión para continuar"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nombre completo
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>

                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-300 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Confirmar contraseña
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        {isSignUp ? "Crear cuenta" : "Iniciar sesión"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900/80 px-2 text-gray-400 rounded-[50px] border border-white/10">O continúa con</span>
                  </div>
                </div>

        <div className="mt-6">
            <Button 
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full gap-2 hover:bg-primary/10"
                // Se deshabilita si el estado global está en carga (redirección)
                disabled={isLoading || isSubmitting} 
            >

                <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {(isLoading || isSubmitting) ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Redirigiendo...</span>
                    </>
                ) : (
                    <>
                        Google
                    </>
                )}
            </Button>
        </div>

                <p className="text-center text-sm text-gray-400">
                  {isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp)
                      setFormData({ name: "", email: "", password: "", confirmPassword: "" })
                    }}
                    className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text font-semibold hover:from-purple-300 hover:to-blue-300 transition-all duration-300"
                  >
                    {isSignUp ? "Inicia sesión" : "Regístrate"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

};

export default Login;
