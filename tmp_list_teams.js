
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bqfcfqflodpewdssicak.supabase.co';
const supabaseKey = 'sb_publishable_2par32BiPa4FahajE_7vog_XbZ46--K';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTeams() {
    const { data: teams, error } = await supabase
        .from('teams')
        .select('id, name');

    if (error) {
        console.error('Error fetching teams:', error);
        return;
    }

    console.log('LIST_OF_TEAMS:');
    console.log(JSON.stringify(teams, null, 2));
}

listTeams();
