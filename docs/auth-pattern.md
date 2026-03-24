# Manual Técnico: Patrón de Autenticación Stateless (Token-in-Header)

Este documento describe la arquitectura de seguridad implementada en **The Show Pro Series** para garantizar una comunicación fiable entre el cliente y el servidor utilizando Supabase y Next.js Server Actions.

## El Problema: Desincronización de Sesión
En aplicaciones modernas de Next.js, las Server Actions a menudo se ejecutan en un entorno "stateless" (sin estado). El método tradicional `supabase.auth.setSession()` puede fallar o ser lento, resultando en errores de "Usuario detectado: Ninguno" a pesar de que el usuario haya iniciado sesión en el navegador.

## La Solución: Inyección Directa de JWT
Para resolver esto, implementamos un patrón donde el **Access Token (JWT)** viaja explícitamente desde el frontend hasta el core de la Server Action.

### 1. Servidor: Cliente por Solicitud (`actions.ts`)
En lugar de un cliente global, cada acción crea su propio cliente inyectando el token en los headers globales de la petición.

```typescript
function getRequestClient(token?: string) {
    if (!token) return supabase; // Cliente público
    
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: { Authorization: `Bearer ${token}` }
        },
        auth: {
            persistSession: false, // Evita conflictos de cookies en el servidor
            autoRefreshToken: false,
        }
    });
}
```

### 2. Frontend: Referencia Persistente (`useTournamentState.ts`)
Para evitar esperas asíncronas durante una interacción rápida, el token se mantiene en un `useRef` que se sincroniza con el estado de autenticación real.

```typescript
const authTokenRef = useRef<string | null>(null);

// Sincronización en tiempo real
useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        authTokenRef.current = session?.access_token || null;
    });
    return () => subscription.unsubscribe();
}, []);
```

### 3. Validación de Administrador
La función `verifyAdmin` no solo comprueba que exista un usuario, sino que valida su email contra la lista blanca autorizada:
- **Email Autorizado:** `cjlacout.antigravity@gmail.com`

## Robustez de la Interfaz (Bypass de Bloqueos)
Además de la seguridad lógica, se implementaron medidas para combatir bloqueos del navegador:

1. **Layering (Z-Index):** Los botones críticos de administración (Reset) utilizan `z-[9999]` para asegurar que ningún overlay invisible intercepte los clics.
2. **Atajos de Teclado:** Se configuró el comando `Ctrl + Alt + R` como una vía directa para ejecutar el reinicio del sistema, saltando cualquier restricción de la interfaz visual o del ratón.
3. **Remoción de Bloqueos Nativos:** Se eliminó el uso de `window.confirm` en procesos críticos, ya que muchos navegadores modernos bloquean estas ventanas emergentes por defecto, deteniendo la ejecución del código.

---
*Este manual debe ser consultado antes de realizar cualquier cambio en la estructura de seguridad o en las funciones de persistencia de datos del proyecto.*
