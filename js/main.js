// Enhanced Main JavaScript for Green Repairs
// Combines existing functionality with new interactive features

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeTheme();
    initializeNavigation();
    initializeAnimations();
    initializeContactForm();
    initializeTestimonials();
    initializeCounters();
    initializeScrollEffects();
    initializeInteractiveElements();
    
    // Initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
});

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const html = document.documentElement;
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        html.classList.remove('dark');
    } else {
        html.classList.add('dark');
    }
    
    function toggleTheme() {
        html.classList.toggle('dark');
        const isDark = html.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Add smooth transition effect
        document.body.style.transition = 'background-color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);

        // Notify others (e.g., navbar) that theme changed
        window.dispatchEvent(new CustomEvent('themechange', { detail: { isDark } }));
    }
    
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);
}

// Enhanced Navigation
function initializeNavigation() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.querySelector('.navbar');
    
    // Mobile menu toggle
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            
            // Animate hamburger icon
            const icon = mobileMenuButton.querySelector('i');
            if (icon) {
                icon.style.transform = mobileMenu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(90deg)';
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuButton.querySelector('i');
                if (icon) icon.style.transform = 'rotate(0deg)';
            }
        });
    }
    
    // Navbar scroll + theme-aware styling
    if (navbar) {
        let lastScrollY = window.scrollY;

        const applyNavbarStyle = () => {
            const isDark = document.documentElement.classList.contains('dark');
            const bg = isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)'; // gray-900 vs white
            const shadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            const currentScrollY = window.scrollY;

            navbar.style.background = bg;
            navbar.style.backdropFilter = 'blur(20px)';
            navbar.style.boxShadow = currentScrollY > 100 ? shadow : 'none';

            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            lastScrollY = currentScrollY;
        };

        // Initial style
        applyNavbarStyle();
        // On scroll and theme change
        window.addEventListener('scroll', applyNavbarStyle);
        window.addEventListener('themechange', applyNavbarStyle);
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });
}

// Enhanced Animations
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Stagger child animations
                const children = entry.target.querySelectorAll('.stagger-child');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('animate-in');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Enhanced Contact Form
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = '<i data-feather="loader" class="w-5 h-5 animate-spin mr-2"></i>Sending...';
        submitButton.disabled = true;
        
        // Collect form data
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            device: formData.get('device'),
            message: formData.get('message')
        };
        
        try {
            const response = await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                showFormMessage('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
                contactForm.reset();
                
                // Add success animation
                contactForm.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    contactForm.style.transform = 'scale(1)';
                }, 200);
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            showFormMessage('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
        } finally {
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }
    });
    
    function showFormMessage(message, type) {
        if (!formMessage) return;
        
        formMessage.textContent = message;
        formMessage.className = `p-4 mb-6 rounded-lg ${type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`;
        formMessage.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
    }
}

// Enhanced Testimonials
function initializeTestimonials() {
    const testimonialsSection = document.getElementById('testimonials');
    const testimonialsGrid = document.getElementById('testimonialsGrid');
    
    if (!testimonialsGrid) return;
    
    async function loadTestimonials() {
        try {
            const response = await fetch('/.netlify/functions/testimonials');
            if (!response.ok) throw new Error('Failed to load testimonials');
            
            const testimonials = await response.json();
            
            if (testimonials && testimonials.length > 0) {
                renderTestimonials(testimonials);
                if (testimonialsSection) {
                    testimonialsSection.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.log('No testimonials available');
        }
    }
    
    function renderTestimonials(testimonials) {
        testimonialsGrid.innerHTML = '';
        
        testimonials.forEach((testimonial, index) => {
            const card = createTestimonialCard(testimonial, index);
            testimonialsGrid.appendChild(card);
        });
    }
    
    function createTestimonialCard(testimonial, index) {
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700';
        card.style.animationDelay = `${index * 100}ms`;
        
        const stars = '★'.repeat(testimonial.rating || 5) + '☆'.repeat(5 - (testimonial.rating || 5));
        
        card.innerHTML = `
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    ${(testimonial.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div class="ml-4">
                    <h4 class="font-semibold text-gray-900 dark:text-white">${testimonial.name || 'Anonymous'}</h4>
                    ${testimonial.location ? `<p class="text-sm text-gray-500 dark:text-gray-400">${testimonial.location}</p>` : ''}
                </div>
            </div>
            <div class="text-yellow-400 mb-4 text-lg">${stars}</div>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed italic">"${testimonial.message || ''}"</p>
        `;
        
        return card;
    }
    
    loadTestimonials();
}

// Animated Counters
function initializeCounters() {
    const counters = document.querySelectorAll('.count-up');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.count);
                animateCounter(counter, target);
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
    
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 30);
    }
}

// Enhanced Scroll Effects
function initializeScrollEffects() {
    // Parallax effect for elements with data-parallax
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.speed) || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    });
    
    // Progress indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'fixed top-0 left-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 z-50 transition-all duration-300';
    progressBar.style.width = '0%';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
    });

    // Back-to-top button behavior
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        const toggleBtn = () => {
            if (window.scrollY > 300) {
                backToTop.classList.remove('hidden');
                backToTop.style.opacity = '1';
                backToTop.style.transform = 'translateY(0) scale(1)';
            } else {
                backToTop.style.opacity = '0';
                backToTop.style.transform = 'translateY(8px) scale(0.95)';
                setTimeout(() => backToTop.classList.add('hidden'), 200);
            }
        };
        toggleBtn();
        window.addEventListener('scroll', toggleBtn);
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Interactive Elements
function initializeInteractiveElements() {
    // Enhanced button hover effects
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Service card interactions: tilt + diffused glow, and remove glint overlays
    document.querySelectorAll('.service-card').forEach(card => {
        // Disable any existing glint overlay inside the card
        card.querySelectorAll('.absolute.inset-0').forEach(overlay => {
            overlay.style.display = 'none';
        });

        // Remove Tailwind hover and group-hover classes to prevent flash/glint
        const stripHoverClasses = (el) => {
            const toRemove = [];
            el.classList.forEach(cls => {
                if (cls.startsWith('hover:') || cls.startsWith('group-hover:')) {
                    toRemove.push(cls);
                }
            });
            toRemove.forEach(cls => el.classList.remove(cls));
        };
        stripHoverClasses(card);
        card.querySelectorAll('*').forEach(stripHoverClasses);

        // Prepare for 3D tilt
        card.style.transformStyle = 'preserve-3d';
        card.style.perspective = '800px';
        card.style.transition = 'transform 200ms ease, box-shadow 200ms ease';
        card.style.overflow = 'hidden';

        // Create a glow layer
        const glow = document.createElement('div');
        glow.className = 'pointer-events-none';
        glow.style.cssText = `
            position: absolute;
            inset: 0;
            border-radius: inherit;
            z-index: 0;
            opacity: 0;
            transition: opacity 150ms ease;
        `;
        card.style.position = 'relative';
        card.prepend(glow);

        // Icon tilt target (first 64x64 icon wrapper if present)
        const icon = card.querySelector('.w-16.h-16');

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const px = (x / rect.width) - 0.5;   // -0.5 .. 0.5
            const py = (y / rect.height) - 0.5;  // -0.5 .. 0.5

            // Tilt
            const rotateX = (+py * 6).toFixed(2);
            const rotateY = (-px * 6).toFixed(2);
            card.style.transform = `translateY(-8px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)';

            // Diffused glow following cursor (radial gradient at cursor)
            glow.style.background = `radial-gradient(220px circle at ${x}px ${y}px, rgba(34,197,94,0.28), rgba(34,197,94,0.12) 35%, transparent 60%)`;

            // Icon subtle independent tilt/pop
            if (icon) {
                icon.style.willChange = 'transform';
                const iRotateX = (+py * 10).toFixed(2);
                const iRotateY = (-px * 10).toFixed(2);
                icon.style.transform = `translateZ(22px) rotateX(${iRotateX}deg) rotateY(${iRotateY}deg) scale(1.06)`;
                icon.style.transition = 'transform 120ms ease';
            }
        };

        card.addEventListener('mouseenter', () => {
            glow.style.opacity = '1';
            if (icon) {
                icon.style.transform = 'translateZ(14px) scale(1.04)';
            }
        });

        card.addEventListener('mousemove', handleMouseMove);

        card.addEventListener('mouseleave', () => {
            glow.style.opacity = '0';
            card.style.transform = 'translateY(0) scale(1) rotateX(0) rotateY(0)';
            card.style.boxShadow = '';
            if (icon) {
                icon.style.transform = '';
                icon.style.transition = '';
            }
        });
    });
    
    // Add ripple effect to buttons only (not service cards)
    document.querySelectorAll('.btn').forEach(element => {
        element.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(34, 197, 94, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
                z-index: 1;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .stagger-child {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Eliminate any background-image based glints on service cards */
        .service-card,
        .service-card:hover {
            background-image: none !important;
            background-size: auto !important;
            background-position: center !important;
        }

        /* Avoid transitioning background on service cards to prevent flashes */
        .service-card, .service-card * {
            transition-property: transform, color, opacity, border-color, box-shadow !important;
        }

    `;
    document.head.appendChild(style);
}

// Utility function for smooth animations
function animateElement(element, keyframes, options = {}) {
    const defaultOptions = {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards'
    };

    return element.animate(keyframes, { ...defaultOptions, ...options });
}

// Export functions for potential external use
window.GreenRepairs = {
    animateElement,
    initializeTheme,
    initializeNavigation,
    initializeContactForm,
    initializeTestimonials
};
