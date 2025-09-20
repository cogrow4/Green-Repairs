const fetch = require('node-fetch');
require('dotenv').config({ path: '.env' });

// Mailgun configuration - using environment variables
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_TO_EMAIL = process.env.MAILGUN_TO_EMAIL;

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    // Validate env variables first
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !MAILGUN_TO_EMAIL) {
      console.error('Missing required Mailgun environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: 'Email service is not configured.' })
      };
    }

    // Parse the form data (supports JSON and URL-encoded bodies)
    const contentType = (event.headers && (event.headers['content-type'] || event.headers['Content-Type'])) || '';
    let name, email, device, message;
    if (contentType.includes('application/json')) {
      const data = JSON.parse(event.body || '{}');
      ({ name, email, device, message } = data);
    } else {
      const params = new URLSearchParams(event.body || '');
      name = params.get('name');
      email = params.get('email');
      device = params.get('device');
      message = params.get('message');
    }

    // Validate required fields
    if (!name || !email || !device || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'All fields are required' })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Invalid email format' })
      };
    }

    // Prepare email content
    const subject = `Quote Request: ${device} - ${name}`;
    const emailContent = `New Quote Request from Green Repairs Website:

Name: ${name}
Email: ${email}
Device Type: ${device}

Message:
${message}

---
This message was sent from the Green Repairs contact form.`;

    // Log the received form data
    console.log('Form data received:', { name, email, device, message });
    
    // Log the Mailgun configuration
    console.log('Using Mailgun domain:', MAILGUN_DOMAIN);

    // Prepare the form data for Mailgun
    const formData = new URLSearchParams();
    formData.append('from', `Mailgun Sandbox <postmaster@${MAILGUN_DOMAIN}>`);
    formData.append('to', MAILGUN_TO_EMAIL);
    formData.append('subject', subject);
    formData.append('text', emailContent);
    formData.append('h:Reply-To', `${name} <${email}>`);
    
    console.log('Sending email with data:', {
      from: `Mailgun Sandbox <postmaster@${MAILGUN_DOMAIN}>`,
      to: MAILGUN_TO_EMAIL,
      subject: subject,
      'h:Reply-To': `${name} <${email}>`
    });

    // Send email using Mailgun
    const response = await fetch(
      `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Mailgun API error:', error);
      throw new Error('Failed to send email');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: 'An error occurred while sending your message. Please try again later.' 
      })
    };
  }
};
