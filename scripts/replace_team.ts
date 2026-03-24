
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function findAndReplaceTeam() {
    const { data: teams, error } = await supabase
        .from('teams')
        .select('*')

    if (error) {
        console.error('Error fetching teams:', error)
        return
    }

    const mayoTeam = teams.find(t => t.name.includes("MAYO'S"))

    if (!mayoTeam) {
        console.log('Team MAYO\'S not found')
        console.log('Found teams:', teams.map(t => t.name))
        return
    }

    console.log('Found MAYO\'S team:', mayoTeam)

    const { error: updateError } = await supabase
        .from('teams')
        .update({
            name: 'ARGENTINA U23 (ARG)',
            // If there's a short_name or city column, I might need to update that too
        })
        .eq('id', mayoTeam.id)

    if (updateError) {
        console.error('Error updating team:', updateError)
    } else {
        console.log('Successfully updated MAYO\'S to ARGENTINA U23 (ARG)')
    }
}

findAndReplaceTeam()
