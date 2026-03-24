
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://bqfcfqflodpewdssicak.supabase.co';
const supabaseKey = 'sb_publishable_2par32BiPa4FahajE_7vog_XbZ46--K';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listPlayers() {
    const { data: players, error } = await supabase
        .from('players')
        .select('id, name, number, team_id')
        .in('team_id', [1, 2]);

    if (error) {
        console.error('Error fetching players:', error);
        return;
    }

    console.log('LIST_OF_PLAYERS:');
    console.log(JSON.stringify(players, null, 2));
}

listPlayers();
