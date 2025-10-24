const { getStore } = require('@netlify/blobs');
const fs = require('fs');
const path = require('path');

const LOCAL_DIR = '/tmp/netlify-blobs';

async function migrateTestimonials() {
  const testimonialsFile = path.join(LOCAL_DIR, 'testimonials.json');
  
  if (fs.existsSync(testimonialsFile)) {
    console.log('Found existing testimonials in /tmp, migrating...');
    const raw = fs.readFileSync(testimonialsFile, 'utf8');
    const data = JSON.parse(raw || '[]');
    
    if (Array.isArray(data) && data.length > 0) {
      const store = getStore('testimonials');
      await store.setJSON('data.json', data);
      console.log(`Migrated ${data.length} testimonials to Netlify Blobs`);
      return data;
    }
  }
  
  console.log('No testimonials found in /tmp');
  return null;
}

async function migrateSiteStats() {
  const statsFile = path.join(LOCAL_DIR, 'site-stats.json');
  
  if (fs.existsSync(statsFile)) {
    console.log('Found existing site stats in /tmp, migrating...');
    const raw = fs.readFileSync(statsFile, 'utf8');
    const data = JSON.parse(raw || '{}');
    
    if (Object.keys(data).length > 0) {
      const store = getStore('site-stats');
      await store.setJSON('data.json', data);
      console.log(`Migrated site stats to Netlify Blobs:`, data);
      return data;
    }
  }
  
  console.log('No site stats found in /tmp');
  return null;
}

exports.handler = async function (event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const testimonials = await migrateTestimonials();
    const stats = await migrateSiteStats();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        migrated: {
          testimonials: testimonials ? testimonials.length : 0,
          stats: stats ? true : false
        }
      })
    };
  } catch (err) {
    console.error('Migration error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Migration failed',
        details: String(err)
      })
    };
  }
};
