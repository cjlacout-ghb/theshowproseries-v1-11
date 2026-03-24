
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://bqfcfqflodpewdssicak.supabase.co';
const supabaseKey = 'sb_publishable_2par32BiPa4FahajE_7vog_XbZ46--K';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGame() {
    const { data: game, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', 11)
        .single();

    if (error) {
        console.error('Error fetching game 11:', error);
        return;
    }

    console.log('GAME_11_DATA:');
    console.log(JSON.stringify(game, null, 2));
}

checkGame();
