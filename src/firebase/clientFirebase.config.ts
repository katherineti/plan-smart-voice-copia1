//Conexion al proyecto oronixos-1915d
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics'; // 💡 Nuevo: Importación de Analytics
import { getAuth, setPersistence, browserLocalPersistence, getAuth as firebaseGetAuth, onAuthStateChanged  } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 1. Obtener la configuración de las variables de entorno de Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID, // Opcional, si usas Analytics
}; 

// Verificar si la clave API está presente antes de inicializar (buena práctica)
if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key no encontrada. Asegúrate de que tu archivo .env está configurado correctamente y las variables tienen el prefijo VITE_");
  throw new Error("Fallo en la configuración de Firebase: API Key no definida.");
}

// 2. Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);
console.log("firebase - app " , app)

// 3. Obtener instancias de los servicios que probablemente necesitarás
export const auth = getAuth(app);
export const db = getFirestore(app);

// 4. Inicializar Firebase Analytics
let analytics: any;

// Firebase recomienda comprobar si el entorno es compatible (p. ej., no Server-Side Rendering)
isSupported().then(supported => {
    if (supported && firebaseConfig.measurementId) {
        analytics = getAnalytics(app);
        console.log("Firebase Analytics inicializado correctamente.");
    } else if (!supported) {
        console.warn("Firebase Analytics no es compatible con este entorno (isSupported() retornó false).");
    } else {
        console.warn("measurementId no encontrado. Analytics no inicializado.");
    }
});

// Opcional: Configurar persistencia para que la sesión de usuario se mantenga (comportamiento por defecto es 'local', pero es bueno forzarlo si se necesita)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistencia de autenticación de Firebase configurada.");
  })
  .catch((error) => {
    console.error("Error al configurar la persistencia de autenticación:", error);
  });

//escuchador de las sesiones de usuario en la aplicacion, y para que funcione se necesita un estado de react para guardar el usuario: useUser.tsx (no se esta usando)
export const onChangeUser= (setUsuario) => {
  const auth = getAuth(app);
  onAuthStateChanged(auth, (user) => {
    const usuario = user? user.displayName: null
    setUsuario(usuario)
});
} 


// Puedes exportar la app si necesitas otros servicios después
export default app;

// NOTA: Para usar estos servicios en un componente de React, simplemente importa:
// import { auth, db } from './firebase';

//Hay que importar este archivo a la aplicacion, para poder usarlo en los componentes