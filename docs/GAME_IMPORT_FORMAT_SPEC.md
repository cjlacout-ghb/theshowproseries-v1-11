# Formato Oficial de Importación de Juego (Game Import Format)

Este documento define el formato de archivo de texto (.txt) requerido para la importación automática de estadísticas de juego en el sistema "The Show Pro Series".

## Estructura General

El archivo debe ser un archivo de texto plano (`.txt`).
Los comentarios pueden agregarse con `//` al inicio de la línea (el sistema los ignorará).
Las secciones deben estar claramente marcadas como se muestra a continuación.

### Ejemplo de Archivo

```text
GAME_ID: 1
VISITOR: CACIQUES BY SWING (CHI)
LOCAL: MAYO'S (MEX)

SECTION: SCOREBOARD
// Las entradas (innings) deben estar separadas por comas.
// RHE = Carreras (Runs), Hits, Errores (Errors)
VISITOR_INNINGS: 0, 1, 0, 2, 0, 1, 1
VISITOR_RHE: 5, 9, 1
LOCAL_INNINGS: 1, 0, 0, 1, 0, 0, 0
LOCAL_RHE: 2, 6, 2

SECTION: VISITOR_BATTING
// Columnas requeridas:
// # (Número), Nombre, PA, AB, R, H, 2B, 3B, HR, RBI, BB, SO, SB
// PA: Turnos Totales (Plate Appearances)
// AB: Turnos al Bate (At Bats)
// R: Carreras (Runs)
// H: Hits
// 2B: Dobles
// 3B: Triples
// HR: Home Runs
// RBI: Carreras Impulsadas
// BB: Base por bolas
// SO: Ponches (Strikeouts)
// SB: Bases Robadas
21, RAMOS DANIEL, 4, 4, 1, 2, 0, 0, 0, 1, 0, 0, 1
10, FERNÁNDEZ LEONARDO, 4, 3, 0, 1, 0, 0, 0, 0, 1, 1, 0
// ... el resto de la lista

SECTION: LOCAL_BATTING
// Mismas columnas que arriba
5, LOPEZ JUAN, 3, 3, 0, 1, 0, 0, 0, 0, 0, 1, 0
// ... el resto de la lista

SECTION: VISITOR_PITCHING
// Columnas requeridas:
// # (Número), Nombre, IP, H, R, ER, BB, SO, HR, W, L, S
// IP: Innings Pitched (ej: 5.0, 5.1, 5.2)
// H: Hits permitidos
// R: Carreras permitidas
// ER: Carreras Limpias (Earned Runs)
// BB: Base por bolas
// SO: Ponches
// HR: Home Runs permitidos
// W: Win (Victoria) -> 1 para Sí, 0 para No
// L: Loss (Derrota) -> 1 para Sí, 0 para No
// S: Save (Salvamento) -> 1 para Sí, 0 para No
33, CRUZ ALEJANDRO, 5.0, 5, 2, 2, 5, 1, 0, 1, 0, 0
// ... el resto de la lista

SECTION: LOCAL_PITCHING
// Mismas columnas que arriba
12, PEREZ JOSE, 4.0, 6, 3, 3, 1, 3, 0, 0, 1, 0
// ... el resto de la lista
```

## Reglas Importantes

1.  **Nombres**: Deben coincidir con los nombres en el sistema, pero el sistema intentará coincidir flexiblemente (ej: "Juan Perez" coincidirá con "PEREZ JUAN"). El número de camiseta (#) ayuda a confirmar la identidad.
2.  **Valores Numéricos**: Todos los campos estadísticos deben ser números. Use `0` si no hubo acción en esa categoría.
3.  **Separadores**: Use comas (`,`) para separar los valores.
