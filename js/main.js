/**
 * Main JavaScript file for Remco van Rooijen - SAFe 6.0 Implementation Consultant
 * Handles animations, scroll behavior, form validation, and interactive elements
 */

// ===== DOM Content Loaded =====
document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    initScrollAnimations();
    initBackToTop();
    initContactForm();
    initSmoothScroll();
    initActiveNavLink();
    initSkillBars();
    initFloatingElements();
});

// ===== Header Functionality =====
function initHeader() {
    const header = document.querySelector('.header');
    
    // Add scrolled class on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle (if needed)
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            document.querySelector('.nav').classList.toggle('active');
        });
    }
}

// ===== Scroll Animations =====
function initScrollAnimations() {
    // Add animation classes to elements
    const animatedElements = document.querySelectorAll(
        '.hero-text, .hero-image, .service-card, .certification-card, .testimonial-card, .skills-category, .about-text, .about-visual, .contact-info, .contact-form'
    );
    
    animatedElements.forEach((element, index) => {
        element.classList.add('animate-on-scroll');
        // Add delay based on index for staggered animation
        element.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ===== Back to Top Button =====
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== Contact Form =====
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Simple validation
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Email validation
            if (!validateEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate form submission (replace with actual API call)
            showNotification('Message sent successfully! I will get back to you soon.', 'success');
            contactForm.reset();
            
            // In a real implementation, you would send the data to a server
            // Example:
            // sendContactForm(name, email, subject, message);
        });
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Append notification to body
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Calculate header offset
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                updateActiveNavLink(targetId);
            }
        });
    });
}

// ===== Active Navigation Link =====
function initActiveNavLink() {
    // Update active link on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const headerHeight = document.querySelector('.header').offsetHeight;
        const scrollPosition = window.scrollY + headerHeight + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = `#${section.getAttribute('id')}`;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                updateActiveNavLink(sectionId);
            }
        });
    });
}

function updateActiveNavLink(activeId) {
    const navLinks = document.querySelectorAll('.nav a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === activeId) {
            link.classList.add('active');
        }
    });
}

// ===== Skill Bars Animation =====
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate each skill bar with a delay
                const skillItems = entry.target.querySelectorAll('.skill-item');
                skillItems.forEach((item, index) => {
                    const progressBar = item.querySelector('.skill-progress');
                    if (progressBar) {
                        setTimeout(() => {
                            progressBar.style.width = progressBar.style.width;
                        }, index * 200);
                    }
                });
            }
        });
    }, observerOptions);
    
    // Observe each skills category
    const skillsCategories = document.querySelectorAll('.skills-category');
    skillsCategories.forEach(category => {
        observer.observe(category);
    });
}

// ===== Floating Elements Animation =====
function initFloatingElements() {
    const floatingCards = document.querySelectorAll('.floating-card');
    
    // Add subtle floating animation
    floatingCards.forEach((card, index) => {
        card.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
        card.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Add float animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }
    `;
    document.head.appendChild(style);
}

// ===== CTA Button Functionality =====
document.addEventListener('DOMContentLoaded', function() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Scroll to contact section
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = contactSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Primary buttons in hero section
    const heroButtons = document.querySelectorAll('.hero-buttons button');
    heroButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.textContent.includes('Start Your Transformation')) {
                // Scroll to services
                const servicesSection = document.getElementById('services');
                if (servicesSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = servicesSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            } else if (this.textContent.includes('Download My Profile')) {
                // Trigger download (placeholder - replace with actual PDF)
                showNotification('Profile download will start shortly', 'success');
            }
        });
    });
});

// ===== Parallax Effect for Hero Section =====
window.addEventListener('scroll', function() {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const scrolled = window.pageYOffset;
        const heroContent = heroSection.querySelector('.hero-content');
        
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    }
});

// ===== Typing Effect for Hero Title (Optional) =====
function initTypingEffect() {
    const heroTitle = document.querySelector('.hero-text h2');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        // Start typing effect when page loads
        setTimeout(typeWriter, 1000);
    }
}

// ===== Counter Animation for Floating Cards =====
function initCounters() {
    const counters = document.querySelectorAll('.floating-card p');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const text = element.textContent;
    const hasNumber = /\d+/.test(text);
    
    if (hasNumber) {
        const match = text.match(/(\d+)/);
        if (match) {
            const targetNumber = parseInt(match[1]);
            const prefix = text.substring(0, text.indexOf(match[1]));
            const suffix = text.substring(text.indexOf(match[1]) + match[1].length);
            
            let currentNumber = 0;
            const increment = targetNumber / 50;
            
            const timer = setInterval(() => {
                currentNumber += increment;
                if (currentNumber >= targetNumber) {
                    currentNumber = targetNumber;
                    clearInterval(timer);
                }
                element.textContent = prefix + Math.floor(currentNumber) + suffix;
            }, 30);
        }
    }
}

// ===== Dark Mode Toggle (Optional) =====
function initDarkMode() {
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            // Save preference to localStorage
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
        });
        
        // Check for saved preference
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
        }
    }
}

// ===== Mobile Responsiveness =====
function initMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuButton && nav) {
        mobileMenuButton.addEventListener('click', function() {
            nav.classList.toggle('mobile-open');
        });
    }
}

// ===== Initialize All Features =====
console.log('Remco van Rooijen - SAFe 6.0 Consultant Website Initialized');
console.log('All features loaded successfully');
