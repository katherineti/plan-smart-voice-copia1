import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { getAuth } from 'firebase/auth';

const provider_google = new GoogleAuthProvider();
const auth = getAuth();

// Configura el idioma de la cuenta de Google para el login
provider_google.setCustomParameters({
    'prompt': 'select_account' // Forzar al usuario a seleccionar una cuenta
});
/**
 * Inicia el proceso de autenticación de Google mediante redirección.
 * NOTA: Usa signInWithRedirect porque signInWithPopup a menudo falla en entornos iFrame/Canvas.
 */
export async function loginGoogle() {
    try {
        console.log("Iniciando redirección de Google...");
        // auth ya está importado desde la configuración central
        await signInWithPopup(auth, provider_google);
    } catch (error) {
        // Este catch solo se activa si hay un error ANTES de que se inicie la redirección.
        console.error("Error al iniciar la redirección de Google:", error);
        throw error;
    }
}
export { auth }