import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  getRedirectResult, 
  User as FirebaseUser, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,    
  createUserWithEmailAndPassword,  
  updateProfile,                   // Para establecer el nombre de usuario
} from 'firebase/auth';

import { auth } from '../firebase/clientFirebase.config'; 
import { loginGoogle } from '../auth/auth_google_provider_create'; 
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string | null;
  name: string | null;
  picture?: string | null;
}

// Definición de Interfaz del Contexto
interface AuthContextType {
  user: User | null;
  signInWithGoogle: () => Promise<void>; // Llama a loginGoogle()
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom Hook para un fácil consumo del contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mapea el objeto User de Firebase a tu interfaz local
  const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName,
    picture: firebaseUser.photoURL
  });

  // --- Listener Principal de Firebase Auth (Gestión de Persistencia) ---
  useEffect(() => {
    let isMounted = true;

    // 1. Intentar resolver el resultado de la redirección de Google
    // Esto es crucial para la autenticación por redirect
    const handleRedirectResult = async () => {
      try {
        // console.log("Comprobando resultado de redirección...");
        const result = await getRedirectResult(auth);
        
        if (result && isMounted) {
          // El resultado existe, el usuario se ha autenticado con éxito por redirección.
          const firebaseUser = result.user;
          const mappedUser = mapFirebaseUser(firebaseUser);
          setUser(mappedUser);
          localStorage.setItem('user', JSON.stringify(mappedUser));
          console.log("getRedirectResult: Autenticación de Google exitosa.", mappedUser.email);
        }
      } catch (error) {
        console.error("Error al procesar el resultado de la redirección de Google:", error);
        // Opcional: mostrar un toast o mensaje al usuario si el error es grave
      }
    };
    
    // 2. Configurar el listener de estado de autenticación (siempre debe ir)
    // Esto captura el estado inicial y cualquier cambio posterior (incluyendo el resultado de la redirección)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        const mappedUser = mapFirebaseUser(firebaseUser);
        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        console.log("onAuthStateChanged: Usuario autenticado", mappedUser.email);
      } else {
        // En caso de que se haya cerrado sesión o la sesión haya expirado
        setUser(null);
        localStorage.removeItem('user');
        console.log("onAuthStateChanged: Usuario desautenticado o sesión expirada.");
      }
      
      // Finalmente, la carga ha terminado.
      setIsLoading(false);
    });

    // Ejecutar el manejo de resultados de redirección
    handleRedirectResult();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // --- Métodos de Autenticación ---
  const signInWithGoogle = async () => {
    // Llama a la función que inicia la redirección. El resultado se gestiona en el useEffect.
    await loginGoogle();
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 🟢 Uso del método real de Firebase para Email/Password
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged se encarga de actualizar el estado 'user'
      return true;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setIsLoading(false); // Detener la carga solo en caso de error
      throw error; // Propagar el error para mostrar un Toast en el Login.tsx
    }
  };

   const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 🟢 Uso del método real de Firebase para la creación de usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 🟢 Actualizar el perfil para establecer el nombre (displayName)
      await updateProfile(userCredential.user, {
        displayName: name,
        photoURL: null 
      });

      // onAuthStateChanged se encarga de actualizar el estado 'user'
      return true;
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      setIsLoading(false); // Detener la carga solo en caso de error
      throw error; // Propagar el error para mostrar un Toast en el Login.tsx
    }
  };

  const signOut = () => {
    // 🟢 Uso del método real de Firebase para cerrar sesión
    firebaseSignOut(auth).then(() => {
        console.log("Cierre de sesión de Firebase exitoso.");
    }).catch((error) => {
        console.error("Error al cerrar sesión de Firebase:", error);
    }).finally(() => {
        // onAuthStateChanged pondrá 'user' a null
    });
  };

  // Si isLoading es TRUE y no hay usuario, podemos mostrar un spinner global
  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  // --- Renderizado del Contexto ---
  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signIn, signUp, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};