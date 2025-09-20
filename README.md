# Green Repairs Website

Professional tech repair services website with a functional contact form.

## Features

- Responsive design using Tailwind CSS
- Interactive contact form with validation
- Email notifications via Mailgun
- Modern UI with smooth animations

## Prerequisites

- PHP 7.4 or higher
- Composer
- Web server (Apache/Nginx)
- Mailgun account (for email functionality)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/green-repairs.git
   cd green-repairs
   ```

2. Install dependencies:
   ```bash
   composer install
   ```

3. Copy the `.env.example` to `.env` and update with your Mailgun credentials:
   ```bash
   cp .env.example .env
   ```

4. Configure your web server to point to the `public` directory

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
MAILGUN_TO_EMAIL=your_email@example.com
```

## Deployment

### Shared Hosting

1. Upload all files to your web server
2. Ensure the `storage` directory is writable
3. Set the document root to the `public` directory

### VPS/Cloud Hosting

1. Clone the repository to your server
2. Install dependencies with `composer install --no-dev`
3. Set up your web server (Apache/Nginx) to point to the `public` directory
4. Set proper permissions:
   ```bash
   chmod -R 755 storage
   chmod -R 755 bootstrap/cache
   ```

## Security

- Never commit your `.env` file
- Keep your dependencies up to date
- Use HTTPS in production

## License

This project is open-source and available under the [MIT License](LICENSE).