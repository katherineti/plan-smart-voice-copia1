import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Loader2, Mountain } from 'lucide-react';
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
    if (error?.code) {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'El formato del correo electrónico es inválido.';
            case 'auth/user-disabled':
                return 'El usuario ha sido deshabilitado.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Credenciales inválidas.';
            case 'auth/email-already-in-use':
                return 'El correo ya está registrado.';
            case 'auth/weak-password':
                return 'La contraseña debe tener al menos 6 caracteres.';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a237e] via-[#0d47a1] to-[#4a148c] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      <div className="w-full max-w-md p-8 space-y-6 glass-effect rounded-2xl z-10">
        <div className="flex justify-center mb-6">
          <div className="relative p-2">
            <img src='/public/favicon.ico' alt='logo' className='h-24 w-24 rounded-xl shadow-inner' />   
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          OronixOS
        </h1>
        
        <p className="text-center text-muted-foreground">
          {isSignUp ? 'Crea tu cuenta' : 'Inicia sesión en tu cuenta'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nombre y Apellido"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            {isSignUp ? 'Registrarse' : 'Iniciar sesión'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
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

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:underline"
          >
            {isSignUp ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
