
const { parseGameStats } = require('./src/lib/stats-parser');

const boxScoreText = `
GAME_ID: 11
VISITOR: ACCIN VORTEX
LOCAL: CACIQUES BY SWING

SECTION: SCOREBOARD
VISITOR_INNINGS: 0, 0, 0, 0, 0, 5, 2
VISITOR_RHE: 7, 10, 0
LOCAL_INNINGS: 1, 0, 0, 0, 0, 0, 0
LOCAL_RHE: 1, 6, 2

SECTION: VISITOR_BATTING
// # (Número), Nombre, PA, AB, R, H, 2B, 3B, HR, RBI, BB, SO, SB
24, Malarczuk Ladislao, 4, 2, 1, 1, 0, 0, 0, 0, 1, 1, 0
21, Ferrara Nahuel, 3, 3, 1, 1, 0, 0, 0, 1, 0, 1, 1
43, Muñoz Alejo, 4, 3, 1, 2, 1, 0, 0, 1, 1, 0, 1
52, Godoy Manuel, 4, 3, 0, 1, 0, 0, 0, 2, 1, 1, 0
5, Siviero Fausto, 4, 3, 1, 0, 0, 0, 0, 0, 1, 2, 0
27, Torrejon Luis, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0
12, Guape Junior, 4, 4, 2, 3, 1, 1, 0, 0, 0, 0, 0
10, Ortellado Franco, 4, 4, 1, 1, 0, 0, 0, 1, 0, 1, 1
59, Garcia Lautaro, 3, 2, 0, 1, 0, 0, 0, 0, 1, 0, 1
49, Muñoz Felipe, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0
23, Olheiser Federico, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0
88, Prieto Adolfo, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0

SECTION: LOCAL_BATTING
// # (Número), Nombre, PA, AB, R, H, 2B, 3B, HR, RBI, BB, SO, SB
72, Fernandez Julian, 3, 3, 1, 2, 0, 0, 0, 0, 0, 0, 0
8, Boyer Domingo, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0
18, Garolini Juan, 4, 3, 0, 1, 0, 0, 0, 1, 1, 2, 0
6, Saulo España, 3, 3, 0, 1, 0, 0, 0, 0, 0, 1, 0
13, Matute Jorge, 3, 3, 0, 0, 0, 0, 0, 0, 0, 2, 0
14, Ramirez Diego, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0
5, Macias Dermar, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0
87, Lozada Miguel, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0
27, Rafael Borges, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0
7, Villavicencio Gabriel, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0
21, Bambozzi Juan Cruz, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0
3, Kiukukawa Tomoki, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0
17, Diego Ramirez, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0

SECTION: VISITOR_PITCHING
// # (Número), Nombre, IP, H, R, ER, BB, SO, HR, W, L, S
36, Leonardo Bress, 2.00, 3, 1, 1, 0, 0, 0, 0, 0, 0
8, Segura Jorge, 2.33, 2, 0, 0, 1, 3, 0, 1, 0, 0
1, Morales Juan, 2.67, 1, 0, 0, 0, 4, 0, 0, 0, 1

SECTION: LOCAL_PITCHING
// # (Número), Nombre, IP, H, R, ER, BB, SO, HR, W, L, S
10, Chaparro Erick, 6.00, 7, 5, 2, 5, 8, 0, 0, 1, 0
1, Mata Valentin, 1.00, 3, 2, 2, 0, 3, 0, 0, 0, 0
`;

const parsed = parseGameStats(boxScoreText);
console.log(JSON.stringify(parsed, null, 2));
