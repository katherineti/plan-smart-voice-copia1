import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Mountain } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { BASE_PATH } from "./../../const";

const Login = () => {
  const { user, signInWithGoogle, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/calendar');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Las contraseñas no coinciden",
          variant: "destructive"
        });
        return;
      }
      
      const success = await signUp(formData.email, formData.password, formData.name);
      if (success) {
        toast({
          title: "Registro exitoso",
          description: "Bienvenido a OronixOS"
        });
      } else {
        toast({
          title: "Error",
          description: "El usuario ya existe",
          variant: "destructive"
        });
      }
    } else {
      const success = await signIn(formData.email, formData.password);
      if (success) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de nuevo"
        });
      } else {
        toast({
          title: "Error",
          description: "Credenciales incorrectas",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a237e] via-[#0d47a1] to-[#4a148c] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      <div className="w-full max-w-md p-8 space-y-6 glass-effect rounded-2xl z-10">
        {/* <div className="flex justify-center mb-6">
          <div className="relative">
            <Mountain className="h-20 w-20 text-primary" />
            {/* <img src='/public/favicon.ico' alt='logo' className='h-10 w-10 text-secondary absolute -bottom-2 -right-2' /> * /}
            <Calendar className="h-10 w-10 text-secondary absolute -bottom-2 -right-2" />
            {/* <img src='/public/favicon.ico' alt='logo' className='h-10 w-10 text-secondary absolute -bottom-2 -right-2' /> * /}
          </div>
        </div> */}
        {/* IMAGEN ACTUALIZADA*/}
        <div className="flex justify-center mb-6">
          <div className="relative p-2">
            <img src={`${BASE_PATH}favicon.ico`} alt='logo' className='h-24 w-24 rounded-xl shadow-inner' />
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

{/*         <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
          </div>
        </div> */}
{/* 
        <Button 
          onClick={() => {
            const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=331740833241-dcatejrha9638tluv83a66p4ds5vpveh.apps.googleusercontent.com&redirect_uri=${window.location.origin}/calendar&response_type=token&scope=email%20profile`;
            window.location.href = googleAuthUrl;
          }}
          variant="outline"
          className="w-full gap-2 hover:bg-primary/10"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </Button>
*/}
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
