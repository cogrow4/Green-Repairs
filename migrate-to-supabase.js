const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Set Supabase credentials directly
process.env.PUBLIC_SUPABASE_URL = 'https://wrrqtpmsexsydwtbkver.supabase.co';
process.env.PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycnF0cG1zZXhzeWR3dGJrdmVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDcwMTAsImV4cCI6MjA3NzI4MzAxMH0.DBqjtNujMFLrG1CKhgKuvA1xY5IHPE5ej-8549ISmeY';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  try {
    let testimonialsInserted = 0;
    let siteStatsInserted = 0;

    // Read testimonials data
    try {
      console.log('Reading testimonials data...');
      const testimonialsData = JSON.parse(fs.readFileSync('/tmp/netlify-blobs/testimonials.json', 'utf8'));

      // Insert testimonials data
      console.log('Inserting testimonials data into Supabase...');
      const { data: testimonialsResult, error: testimonialsError } = await supabase
        .from('testimonials')
        .insert(testimonialsData);

      if (testimonialsError) {
        console.error(`Testimonials insertion error: ${testimonialsError.message}`);
      } else {
        testimonialsInserted = testimonialsResult?.length || 0;
        console.log(`Inserted ${testimonialsInserted} testimonials`);
      }
    } catch (error) {
      console.log('Testimonials data not found, skipping:', error.message);
    }

    // Read site-stats data
    try {
      console.log('Reading site-stats data...');
      const siteStatsData = JSON.parse(fs.readFileSync('/tmp/netlify-blobs/site-stats.json', 'utf8'));

      // Insert site-stats data (as a single row)
      console.log('Inserting site-stats data into Supabase...');
      const { data: siteStatsResult, error: siteStatsError } = await supabase
        .from('site_stats')
        .insert([siteStatsData]);

      if (siteStatsError) {
        console.error(`Site-stats insertion error: ${siteStatsError.message}`);
      } else {
        siteStatsInserted = 1;
        console.log('Inserted 1 site-stats record');
      }
    } catch (error) {
      console.log('Site-stats data not found, skipping:', error.message);
    }

    console.log('Migration completed successfully!');
    console.log(`Total inserted: ${testimonialsInserted} testimonials, ${siteStatsInserted} site-stats record`);

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrateData();