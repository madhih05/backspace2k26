/* ============================================
   NCRTESRT'26 - Conference JavaScript
   ============================================ */

// ============================================
// Mobile Menu Toggle
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.nav-container')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// ============================================
// Scroll to Top Button
// ============================================
window.addEventListener('scroll', function () {
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

document.getElementById('scrollTopBtn').addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ============================================
// Smooth Scroll Behavior for Navigation Links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Only prevent default for anchor links that point to sections
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            
            const offsetTop = target.offsetTop - 70; // Account for sticky navbar
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Animate Elements on Scroll
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.about-card, .guideline-card, .speaker-card, .contact-card, .timeline-content').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================
// Theme Tag Hover Effect
// ============================================
document.querySelectorAll('.theme-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function () {
        this.style.cursor = 'pointer';
    });

    tag.addEventListener('click', function () {
        // You can add functionality here to filter papers by theme
        console.log('Theme selected:', this.textContent);
    });
});

// ============================================
// Navbar Sticky on Scroll
// ============================================
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function () {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 100) {
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
});

// ============================================
// Active Navigation Link Highlighting
// ============================================
function highlightNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.style.color = '';
    });

    if (currentSection) {
        const activeLink = document.querySelector(`.nav-link[href="#${currentSection}"]`);
        if (activeLink) {
            activeLink.style.color = 'var(--accent-color)';
        }
    }
}

window.addEventListener('scroll', highlightNavLink);

// ============================================
// Copy to Clipboard Functionality for Bank Details
// ============================================
function addCopyFunctionality() {
    const infoItems = document.querySelectorAll('.info-item span');

    infoItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            const text = this.textContent;

            navigator.clipboard.writeText(text).then(function () {
                const originalText = item.textContent;
                item.textContent = 'Copied!';
                item.style.color = '#10b981';

                setTimeout(function () {
                    item.textContent = originalText;
                    item.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        });

        // Add visual indicator
        item.addEventListener('mouseenter', function () {
            this.style.textDecoration = 'underline';
        });

        item.addEventListener('mouseleave', function () {
            this.style.textDecoration = 'none';
        });
    });
}

addCopyFunctionality();

// ============================================
// Registration Button Animation
// ============================================
const registrationButtons = document.querySelectorAll('a[href*="forms.gle"]');

registrationButtons.forEach(button => {
    button.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.05)';
    });

    button.addEventListener('mouseleave', function () {
        this.style.transform = 'scale(1)';
    });
});

// ============================================
// Form Validation - Optional for future use
// ============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ============================================
// Page Load Animation
// ============================================
window.addEventListener('load', function () {
    document.body.style.opacity = '1';
    
    // Animate hero section elements
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroButtons = document.querySelector('.hero-buttons');

    if (heroTitle) {
        heroTitle.style.animation = 'fadeInDown 0.8s ease forwards';
    }

    if (heroSubtitle) {
        heroSubtitle.style.animation = 'fadeInUp 0.8s ease 0.2s forwards';
    }

    if (heroButtons) {
        heroButtons.style.animation = 'fadeInUp 0.8s ease 0.4s forwards';
    }
});

// ============================================
// Add CSS Animations
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
`;
document.head.appendChild(style);

// ============================================
// Performance: Lazy Load Images
// ============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// Event Tracking - Optional Analytics
// ============================================
function trackEvent(eventName, eventData) {
    // This can be connected to Google Analytics or other tracking services
    console.log('Event:', eventName, eventData);
}

// Track button clicks
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function () {
        trackEvent('button_click', {
            button_text: this.textContent,
            button_class: this.className
        });
    });
});

// ============================================
// Accessibility: Keyboard Navigation
// ============================================
document.addEventListener('keydown', function (e) {
    // Press 'R' to scroll to registration
    if (e.key === 'r' || e.key === 'R') {
        const registrationSection = document.getElementById('registration');
        if (registrationSection) {
            registrationSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Press 'H' to scroll to home
    if (e.key === 'h' || e.key === 'H') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// ============================================
// Dark Mode Toggle - Optional
// ============================================
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (prefersDarkMode) {
    // Optional: Add dark mode styles if the user prefers them
    // document.body.classList.add('dark-mode');
}

// ============================================
// Debounce Function for Performance
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// Throttle Function for Performance
// ============================================
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply throttle to scroll events for better performance
const handleScroll = throttle(function () {
    highlightNavLink();
}, 100);

window.addEventListener('scroll', handleScroll);

// ============================================
// Mobile Touch Optimizations
// ============================================
let touchStartX = 0;
let touchEndX = 0;

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        // Swiped left
        console.log('Swiped left');
    }
    if (touchEndX > touchStartX + 50) {
        // Swiped right
        console.log('Swiped right');
    }
}

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, false);

// ============================================
// Initialization Message
// ============================================
console.log('%cNCRTESRT\'26 Conference Website', 'color: #1e3a8a; font-size: 24px; font-weight: bold;');
console.log('%cProfessional Conference Landing Page', 'color: #d97706; font-size: 14px;');
console.log('Press "R" to go to Registration | Press "H" to go to Home');
