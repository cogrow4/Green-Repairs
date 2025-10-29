<div align="center">

# 🌿 Green Repairs

<img src="./static/favicon.svg" alt="Green Repairs Logo" width="200" height="200">

### Professional Tech Repair Services Platform

*Fast, reliable, and affordable device repairs with modern web technology*

[![GitHub stars](https://img.shields.io/github/stars/cogrow4/Green-Repairs?style=for-the-badge&logo=github&color=22c55e)](https://github.com/cogrow4/Green-Repairs/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/cogrow4/Green-Repairs?style=for-the-badge&logo=github&color=22c55e)](https://github.com/cogrow4/Green-Repairs/network)
[![GitHub issues](https://img.shields.io/github/issues/cogrow4/Green-Repairs?style=for-the-badge&logo=github&color=22c55e)](https://github.com/cogrow4/Green-Repairs/issues)
[![License](https://img.shields.io/badge/License-Custom_NCL-22c55e?style=for-the-badge)](./LICENSE.md)

[![Netlify Status](https://api.netlify.com/api/v1/badges/bd21e028-ae93-4bbf-9ffb-bcfbbbc0f8d1/deploy-status)](https://app.netlify.com/projects/golden-dusk-1e4465/deploys)
[![Made with Tailwind](https://img.shields.io/badge/Made_with-Tailwind_CSS-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

[🌐 Live Demo](https://green-repairs.com) • [📖 Documentation](./ADMIN_SETUP.md) • [🐛 Report Bug](https://github.com/cogrow4/Green-Repairs/issues) • [✨ Request Feature](https://github.com/cogrow4/Green-Repairs/issues)

---

</div>

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎯 What Makes This Special](#-what-makes-this-special)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [🎨 Customization](#-customization)
- [📦 Deployment](#-deployment)
- [🔒 Security](#-security)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [💖 Credits](#-credits)

---

## ✨ Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🎨 **Modern UI/UX** | Beautiful dark mode, smooth animations, and responsive design |
| 📧 **Contact System** | Integrated email notifications via Mailgun |
| 🔐 **Admin Panel** | Secure authentication with testimonial & stats management |
| ⚡ **High Performance** | Optimized animations, lazy loading, and GPU acceleration |
| 📱 **Mobile First** | Fully responsive across all devices and screen sizes |
| 🌙 **Dark Mode** | Elegant dark theme with seamless switching |
| 📊 **Dynamic Stats** | Admin-controlled counters for business metrics |
| ⭐ **Testimonials** | CRUD system for customer reviews |
| 🎭 **3D Effects** | Interactive service cards with tilt and glow effects |
| 🔄 **Real-time Updates** | Dynamic content loading without page refresh |

</div>

---

## 🎯 What Makes This Special

### 🏗️ Built With Modern Technology

```
Frontend:         Tailwind CSS 3.x + Vanilla JavaScript (ES6+)
Backend:          Netlify Functions (Serverless)
Storage:          Netlify Blobs (Key-Value Store)
Email:            Mailgun API
Animations:       AOS (Animate on Scroll)
Icons:            Feather Icons
```

### 🎪 Interactive Features

- **Service Cards**: 3D tilt effects with cursor-following glow
- **Animated Counters**: Smooth count-up animations on scroll
- **Parallax Scrolling**: Depth-based background movement
- **Progress Bar**: Visual scroll progress indicator
- **Smooth Transitions**: Hardware-accelerated CSS transforms

### 🔧 Admin Capabilities

- 📈 **Statistics Management**: Update devices repaired counter
- 💬 **Testimonial Control**: Add, view, and delete customer reviews
- 🔐 **Secure Authentication**: JWT-based session management
- 📱 **Responsive Dashboard**: Works on all devices

---

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ (for local development)
- Netlify account (for deployment)
- Mailgun account (for contact form)

### Installation

```bash
# Clone the repository
git clone https://github.com/cogrow4/Green-Repairs.git

# Navigate to project directory
cd Green-Repairs

# Install dependencies (if using Netlify Dev)
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Local Development

```bash
# Start Netlify Dev server
netlify dev

# Or use a simple HTTP server
python -m http.server 8000
```

Open [http://localhost:8888](http://localhost:8888) in your browser.

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Email Configuration (Mailgun)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
MAILGUN_TO_EMAIL=your_email@example.com

# Admin Panel (Required)
ADMIN_PASSWORD=your_strong_password

# Admin Panel (Optional - has default value)
# ADMIN_SECRET=your_custom_secret
```

> 💡 **Tip**: See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for detailed configuration guide.

### Netlify Setup

1. **Connect Repository**
   - Go to Netlify Dashboard
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure Environment Variables**
   ```
   Site settings → Environment variables → Add variables
   ```
   Add all variables from your `.env` file

3. **Deploy Settings**
   - Build command: *(leave empty)*
   - Publish directory: `/`
   - Functions directory: `netlify/functions`

---

## 🎨 Customization

### Changing Colors

Edit the Tailwind config in `index.html`:

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#22c55e', // Change this to your brand color
        }
      }
    }
  }
}
```

### Adding Services

Add a new service card in `index.html` under the Services section:

```html
<div class="service-card group" data-aos="fade-up">
  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100...">
    <i data-feather="your-icon" class="w-8 h-8..."></i>
  </div>
  <h3 class="text-2xl font-bold mb-4">Your Service</h3>
  <p class="text-gray-600 dark:text-gray-300 mb-6">
    Service description...
  </p>
  <!-- Pricing and link -->
</div>
```

### Modifying Animations

Adjust animation settings in `js/main.js`:

```javascript
AOS.init({
  duration: 800,     // Animation duration
  easing: 'ease-in-out',
  once: true,        // Only animate once
  offset: 100        // Trigger offset
});
```

---

## 📦 Deployment

### Netlify (Recommended)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/cogrow4/Green-Repairs)

### Manual Deployment

```bash
# Build and test
npm run build

# Deploy via Netlify CLI
netlify deploy --prod
```

### Other Platforms

The site is static HTML/CSS/JS and can be deployed to:
- Vercel
- GitHub Pages
- Cloudflare Pages
- Any static hosting service

> ⚠️ **Note**: Netlify Functions required for admin panel and contact form.

---

## 🔒 Security

### Best Practices

- ✅ Never commit `.env` file to version control
- ✅ Use strong passwords for `ADMIN_PASSWORD`
- ✅ Enable HTTPS in production (Netlify provides this)
- ✅ Regularly update dependencies
- ✅ Use environment variables for all sensitive data
- ✅ Set secure cookies in production (`HttpOnly`, `Secure`, `SameSite`)

### Admin Access

- Admin panel: `/admin.html`
- Default username: `admin`
- Password: Set via `ADMIN_PASSWORD` environment variable
- Session duration: 12 hours

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

### How to Contribute

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed
- Add comments for complex logic

---

## 📄 License

This project is licensed under the **Custom Non-Commercial License (NCL)** - see the [LICENSE.md](LICENSE.md) file for details.

### License Summary

✅ **You CAN:**
- Use the code for your business website (repair shop, restaurant, etc.)
- Use for personal projects and portfolios
- Modify and adapt the code
- Share and distribute the code (for free)
- Use for educational purposes
- Make money from your business that uses this code

❌ **You CANNOT:**
- Sell this code or derivatives (on marketplaces, etc.)
- Charge money for the code itself
- Remove copyright notices
- Distribute without sharing the source code

📜 **You MUST:**
- Credit the original author (coeng24)
- Share modifications under the same license
- Include the original license with distributions
- Keep the source code open

---

## 💖 Credits

### Created By

**coeng24** - [GitHub](https://github.com/cogrow4)

### Technologies Used

- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Feather Icons](https://feathericons.com/) - Beautiful open source icons
- [AOS](https://michalsnik.github.io/aos/) - Animate on Scroll library
- [Netlify](https://www.netlify.com/) - Serverless deployment platform
- [Mailgun](https://www.mailgun.com/) - Email API service

### Inspiration

Inspired by modern web design trends and the need for accessible, performant repair service websites.

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ by coeng24**

[⬆ Back to Top](#-green-repairs)

</div>