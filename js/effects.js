// Advanced Visual Effects System for Green Repairs
// Interactive particles, dynamic animations, and world-class effects

class AdvancedEffects {
    constructor() {
        this.particles = [];
        this.mousePos = { x: 0, y: 0 };
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.initParticles();
        this.startAnimation();
        this.initScrollEffects();
        this.initMagneticElements();
        this.initMorphingShapes();
        this.initDynamicGradients();
        this.isInitialized = true;
    }

    createCanvas() {
        // Create particle canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.8;
        `;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        document.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
            this.createMouseParticles(e.clientX, e.clientY);
        });

        // Touch support for mobile
        document.addEventListener('touchmove', (e) => {
            if (e.touches[0]) {
                this.mousePos.x = e.touches[0].clientX;
                this.mousePos.y = e.touches[0].clientY;
                this.createMouseParticles(e.touches[0].clientX, e.touches[0].clientY);
            }
        });
    }

    initParticles() {
        const particleCount = Math.min(150, Math.floor(window.innerWidth / 10));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomColor(),
                life: 1,
                maxLife: Math.random() * 200 + 100,
                type: Math.random() > 0.7 ? 'glow' : 'normal'
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(34, 197, 94, ',  // green-500
            'rgba(16, 185, 129, ', // emerald-500
            'rgba(20, 184, 166, ', // teal-500
            'rgba(59, 130, 246, ', // blue-500
            'rgba(147, 51, 234, ', // purple-500
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createMouseParticles(x, y) {
        if (Math.random() > 0.8) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 4 + 2,
                opacity: 0.8,
                color: this.getRandomColor(),
                life: 60,
                maxLife: 60,
                type: 'mouse'
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse attraction for nearby particles
            const dx = this.mousePos.x - particle.x;
            const dy = this.mousePos.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100 && particle.type !== 'mouse') {
                const force = (100 - distance) / 100 * 0.01;
                particle.vx += dx * force * 0.01;
                particle.vy += dy * force * 0.01;
            }
            
            // Boundary wrapping
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Life cycle
            particle.life--;
            if (particle.life <= 0 || particle.opacity <= 0) {
                if (particle.type === 'mouse') {
                    this.particles.splice(i, 1);
                } else {
                    // Respawn regular particles
                    particle.x = Math.random() * this.canvas.width;
                    particle.y = Math.random() * this.canvas.height;
                    particle.life = particle.maxLife;
                    particle.opacity = Math.random() * 0.5 + 0.2;
                }
            }
            
            // Fade out mouse particles
            if (particle.type === 'mouse') {
                particle.opacity = particle.life / particle.maxLife;
            }
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections between nearby particles
        this.drawConnections();
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.save();
            
            if (particle.type === 'glow') {
                // Glow effect
                this.ctx.shadowColor = particle.color + '0.8)';
                this.ctx.shadowBlur = 20;
            }
            
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color + particle.opacity + ')';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = (120 - distance) / 120 * 0.1;
                    this.ctx.strokeStyle = `rgba(34, 197, 94, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    initScrollEffects() {
        // Advanced parallax and scroll animations
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        const observerOptions = {
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            rootMargin: '-10% 0px -10% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                const speed = parseFloat(element.dataset.parallax) || 0.5;
                const rect = element.getBoundingClientRect();
                const scrolled = window.pageYOffset;
                const rate = scrolled * speed;
                
                if (entry.isIntersecting) {
                    element.style.transform = `translate3d(0, ${rate}px, 0)`;
                }
            });
        }, observerOptions);

        parallaxElements.forEach(el => observer.observe(el));

        // Smooth scroll reveal animations
        this.initScrollReveal();
    }

    initScrollReveal() {
        const revealElements = document.querySelectorAll('.service-card, .hero-content, .footer-content > div');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // Add staggered animation for child elements
                    const children = entry.target.querySelectorAll('h3, p, .btn, i[data-feather]');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Prepare child elements
            const children = el.querySelectorAll('h3, p, .btn, i[data-feather]');
            children.forEach(child => {
                child.style.opacity = '0';
                child.style.transform = 'translateY(20px)';
                child.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            });
            
            revealObserver.observe(el);
        });
    }

    initMagneticElements() {
        // Magnetic hover effects for buttons and interactive elements
        const magneticElements = document.querySelectorAll('.btn, .service-card, .social-links a');
        
        magneticElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
            
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const moveX = x * 0.1;
                const moveY = y * 0.1;
                
                element.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.02)`;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translate(0, 0) scale(1)';
            });
        });
    }

    initMorphingShapes() {
        // Create floating morphing shapes
        const shapesContainer = document.createElement('div');
        shapesContainer.className = 'morphing-shapes';
        shapesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        `;
        document.body.appendChild(shapesContainer);

        // Create multiple morphing shapes
        for (let i = 0; i < 5; i++) {
            const shape = document.createElement('div');
            shape.className = 'morphing-shape';
            shape.style.cssText = `
                position: absolute;
                width: ${Math.random() * 300 + 100}px;
                height: ${Math.random() * 300 + 100}px;
                background: linear-gradient(45deg, 
                    rgba(34, 197, 94, 0.1), 
                    rgba(16, 185, 129, 0.1), 
                    rgba(20, 184, 166, 0.1)
                );
                border-radius: 50%;
                filter: blur(40px);
                animation: morphFloat ${Math.random() * 20 + 10}s infinite linear;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
            `;
            shapesContainer.appendChild(shape);
        }
    }

    initDynamicGradients() {
        // Dynamic gradient backgrounds that respond to scroll and mouse
        const hero = document.querySelector('.hero');
        if (hero) {
            let gradientAngle = 0;
            
            const updateGradient = () => {
                gradientAngle += 0.5;
                const mouseInfluence = (this.mousePos.x / window.innerWidth) * 60;
                const scrollInfluence = (window.pageYOffset / window.innerHeight) * 30;
                
                const angle = gradientAngle + mouseInfluence + scrollInfluence;
                
                hero.style.background = `
                    linear-gradient(${angle}deg, 
                        hsl(${120 + Math.sin(gradientAngle * 0.01) * 20}, 70%, 25%), 
                        hsl(${140 + Math.cos(gradientAngle * 0.01) * 20}, 80%, 35%),
                        hsl(${160 + Math.sin(gradientAngle * 0.015) * 15}, 75%, 30%)
                    )
                `;
                
                requestAnimationFrame(updateGradient);
            };
            
            updateGradient();
        }
    }

    startAnimation() {
        const animate = () => {
            this.updateParticles();
            this.drawParticles();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas) {
            this.canvas.remove();
        }
        const shapesContainer = document.querySelector('.morphing-shapes');
        if (shapesContainer) {
            shapesContainer.remove();
        }
    }
}

// Advanced CSS animations and keyframes
const advancedStyles = `
    @keyframes morphFloat {
        0% { transform: translate(0, 0) rotate(0deg) scale(1); }
        25% { transform: translate(100px, -100px) rotate(90deg) scale(1.1); }
        50% { transform: translate(-50px, -200px) rotate(180deg) scale(0.9); }
        75% { transform: translate(-150px, -50px) rotate(270deg) scale(1.05); }
        100% { transform: translate(0, 0) rotate(360deg) scale(1); }
    }

    @keyframes pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
    }

    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
    }

    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }

    .revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }

    .service-card {
        position: relative;
        overflow: hidden;
    }

    /* Disable shimmer/glint sweep on service cards */
    .service-card::before {
        content: none !important;
        display: none !important;
    }
    /* Hover shimmer disabled */

    .btn {
        position: relative;
        overflow: hidden;
        background-size: 200% 100%;
        background-image: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
        background-repeat: no-repeat;
        background-position: -200% 0;
        transition: all 0.3s ease;
    }

    .btn:hover {
        background-position: 200% 0;
        animation: shimmer 0.6s ease-in-out;
    }

    .hero-content h1 {
        background: linear-gradient(45deg, #ffffff, #22c55e, #10b981, #ffffff);
        background-size: 300% 300%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradientShift 4s ease-in-out infinite;
    }

    @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }

    .navbar {
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .service-card {
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Loading animation */
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #0f172a, #1e293b, #334155);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease-out;
    }

    .loading-spinner {
        width: 60px;
        height: 60px;
        border: 3px solid rgba(34, 197, 94, 0.3);
        border-top: 3px solid #22c55e;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Smooth scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
    }

    ::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #22c55e, #10b981);
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #16a34a, #059669);
    }
`;

// Initialize effects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add advanced styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = advancedStyles;
    document.head.appendChild(styleSheet);

    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingOverlay);

    // Initialize effects after a short delay
    setTimeout(() => {
        const effects = new AdvancedEffects();
        
        // Remove loading overlay
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.remove(), 500);
        }, 1000);
        
        // Store effects instance globally for potential cleanup
        window.advancedEffects = effects;
    }, 100);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.advancedEffects) {
        window.advancedEffects.destroy();
    }
});
