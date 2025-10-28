// no esta en uso
import { onChangeUser } from "@/firebase/clientFirebase.config";
import { useEffect, useState } from "react";

const useUser= () => {
 //creacion de un estado de react. usuario es el valor del estado, setUsuario es la funcion con la que vamos a actualizar el estado
  const [usuario, setUsuario] = useState<string | null>(undefined);

  //useEfect se ejecuta cuando cambia el valor de un estado, en este caso cuando cambia el valor del usuario
  useEffect(() => {
    //llamada a la funcion onChangeUser para escuchar los cambios de sesion de usuario
    onChangeUser(setUsuario);
  }, [])
  
  return usuario;
}

export default useUser