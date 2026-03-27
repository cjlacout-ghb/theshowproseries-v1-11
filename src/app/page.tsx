import { getTeams, getGames } from '@/actions/games'
import TournamentManager from '@/components/TournamentManager'

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const teams = await getTeams()
    const games = await getGames()

    return (
      <TournamentManager
        initialTeams={teams}
        initialGames={games}
      />
    )
  } catch (error: any) {
    console.error("Critical Error loading Home Page:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <h1 className="text-2xl font-bold">Error Carga de Datos</h1>
        <p>{error.message}</p>
        <p className="text-sm text-gray-400 mt-2">Revise la consola del servidor para más detalles.</p>
      </div>
    )
  }
}
