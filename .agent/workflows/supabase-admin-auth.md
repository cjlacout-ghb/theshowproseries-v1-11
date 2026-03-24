---
description: Implementación del Patrón "Stateless Token-in-Header" para autenticación de Administrador con Supabase y Next.js Server Actions.
---

Este flujo de trabajo documenta la solución definitiva para conectar un frontend de Next.js con Server Actions protegidas por Supabase, evitando problemas de sincronización de sesión y bloqueos de eventos del navegador.

### 1. Preparación del Cliente de Supabase (Lado Servidor)

En el archivo de acciones (ej. `src/app/actions.ts`), no uses el cliente global con sesión persistente. Crea un cliente por solicitud que inyecte el token directamente en los headers.

```typescript
// getRequestClient asegura que la identidad del usuario viaje en el "DNA" de la petición
function getRequestClient(token?: string) {
    if (!token) return supabase; // Cliente anónimo por defecto
    
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: { Authorization: `Bearer ${token}` }
        },
        auth: {
            persistSession: false, // Las Server Actions son stateless
            autoRefreshToken: false,
        }
    });
}

// verifyAdmin valida que el token sea aceptado por Supabase
async function verifyAdmin(client: any) {
    const { data: { user }, error } = await client.auth.getUser();
    
    if (error) {
        throw new Error(`Sesión inválida: ${error.message}`);
    }
    
    if (!user || user.email !== "TU_EMAIL_ADMIN@gmail.com") {
        throw new Error("Acceso no autorizado.");
    }
}
```

### 2. Guardado del Token en el Frontend

En tu Hook de estado global (ej. `src/hooks/useTournamentState.ts`), mantén una referencia al token para que esté disponible instantáneamente sin esperas asíncronas largas.

```typescript
const authTokenRef = useRef<string | null>(null);

useEffect(() => {
    // Escucha cambios de auth para mantener el token actualizado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        authTokenRef.current = session?.access_token || null;
    });

    // Obtención inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
        authTokenRef.current = session?.access_token || null;
    });

    return () => subscription.unsubscribe();
}, []);

const getAuthToken = useCallback(async () => {
    return authTokenRef.current || (await supabase.auth.getSession()).data.session?.access_token;
}, []);
```

### 3. Ejecución de la Acción Protegida

Cuando llames a la función del servidor, siempre pasa el token explícitamente.

```typescript
const handleAction = async () => {
    const token = await getAuthToken();
    if (!token) return toast({ title: "Error", description: "Inicia sesión" });
    
    await miServerAction({ data, token: token });
};
```

### 4. Seguridad de Interacción (Bypass de Bloqueos)

Si el navegador bloquea eventos `click` o ventanas `confirm`, implementa:
1. **Shortcut de Emergencia**: `Ctrl + Alt + R` para disparar la acción sin usar el mouse.
2. **Layering**: Usa `z-[9999]` en el botón de reset.
3. **Remoción de Popups**: Evita `window.confirm` si detectas que el navegador lo está suprimiendo.

### Por qué usar este flujo:
- **Confiabilidad**: Funciona incluso si el middleware de Next.js pierde las cookies.
- **Transparencia**: El servidor sabe exactamente quién hace la petición en cada milisegundo.
- **Portabilidad**: Es agnóstico a la configuración de cookies de Windows o navegadores estrictos.
