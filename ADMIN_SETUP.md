# Admin Panel Setup Guide

## Environment Variables

### Required Variables

1. **ADMIN_PASSWORD** - The password for logging into the admin panel
   - Username is always `admin`
   - Set this to a strong, secure password

### Optional Variables

1. **ADMIN_SECRET** - Secret key used for JWT token signing
   - **Has a built-in default value** - you don't need to set this
   - Only set this if you want a custom secret for production
   - If setting: use a long, random string (e.g., generate with `openssl rand -hex 32`)

### Setting Up Environment Variables

#### For Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your values:
   ```
   ADMIN_PASSWORD=your-secure-password-here
   ADMIN_SECRET=your-secret-key-for-jwt-signing
   ```

#### For Netlify Production

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the required variable:
   - `ADMIN_PASSWORD`: Your chosen admin password
4. Optionally add (if you want a custom secret):
   - `ADMIN_SECRET`: Your JWT secret key

## Admin Panel Features

### Site Statistics Management

- **Devices Repaired Counter**: Update the number shown on the homepage
  - Displayed in two locations: hero section and stats section
  - Automatically animates on the homepage

### Testimonials Management

- **Add Testimonials**: Create new customer testimonials
  - Customer name (required)
  - Location (optional)
  - Message (required)
  - Star rating (1-5)

- **View Testimonials**: See all existing testimonials
- **Delete Testimonials**: Remove testimonials as needed

## Accessing the Admin Panel

1. Navigate to `/admin.html` on your site
2. Log in with:
   - Username: `admin`
   - Password: (your ADMIN_PASSWORD)

## Troubleshooting

### "Not authorized" Error When Adding Testimonials

This error occurs when:
1. The `ADMIN_PASSWORD` environment variable is not set
2. Your session has expired - try logging out and back in

**Solution**: 
- Make sure `ADMIN_PASSWORD` is set in your environment
- Log out and log back in
- Check the browser console for detailed error messages

### Session Expires Too Quickly

The default session duration is 12 hours. To change this:
- Edit `netlify/functions/admin-login.js`
- Modify the `TOKEN_TTL_SECONDS` constant

## Security Notes

- Never commit your `.env` file to version control
- Use strong passwords for production
- The admin panel uses HttpOnly cookies for session management
- Sessions automatically expire after 12 hours
- All admin actions require authentication
