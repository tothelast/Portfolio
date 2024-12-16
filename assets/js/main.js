/**
 * Portfolio Website JavaScript
 * 
 * This file contains all the interactive functionality for the portfolio website:
 * - Particles background animation
 * - Scroll animations
 * - Smooth scrolling navigation
 * - Contact form handling
 * - Certificate modal functionality
 * - Dynamic year update
 */


/**
 * Particles.js Configuration
 * Creates an interactive particle background in the header
 */
const initializeParticles = () => {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80
            },
            color: {
                value: '#ffffff'
            },
            opacity: {
                value: 0.5
            },
            size: {
                value: 3
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#ffffff',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 6
            }
        }
    });
};


/**
 * Scroll Animation Handler
 * Handles revealing elements as they come into view while scrolling
 */
const initializeScrollAnimations = () => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        {
            threshold: 0.1
        }
    );

    // Observe all elements with animation class
    document.querySelectorAll('.animate-on-scroll')
        .forEach(el => observer.observe(el));
};


/**
 * Smooth Scrolling Navigation
 * Enables smooth scrolling when clicking on navigation links
 */
const initializeSmoothScrolling = () => {
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
};


/**
 * Contact Form Handler
 * Handles form submission (currently just shows a preview message)
 */
const initializeContactForm = () => {
    const contactForm = document.querySelector('.contact-form');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const canvas = document.getElementById('successCanvas');
    const ctx = canvas.getContext('2d');
    const successMessage = document.querySelector('.success-message');
    const closeButton = document.querySelector('.close-button');
    let particles = [];
    let animationId;

    // Particle class definition remains the same
    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.size = Math.random() * 5 + 2;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * 6 - 3;
            this.opacity = 1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity -= 0.01;
            this.size = Math.max(0, this.size - 0.1);
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function createParticles(x, y) {
        const colors = ['#059669', '#34D399', '#6EE7B7', '#A7F3D0'];
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]));
        }
    }

    // Modified animate function to only handle particles
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles = particles.filter(particle => particle.opacity > 0);

        particles.forEach(particle => {
            particle.update();
            particle.draw(ctx);
        });

        if (particles.length > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = 'none';
            // Removed the successMessage.style.display = 'none' from here
        }
    }

    closeButton.addEventListener('click', () => {
        cancelAnimationFrame(animationId);
        particles = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        successMessage.style.display = 'none';
    });

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        const formData = new FormData(contactForm);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Show success message and animation
                canvas.style.display = 'block';
                successMessage.style.display = 'block';
                createParticles(window.innerWidth / 2, window.innerHeight / 2);
                animate();
                contactForm.reset();

                // Set a timeout just for the particles
                setTimeout(() => {
                    cancelAnimationFrame(animationId);
                    particles = [];
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.style.display = 'none';
                    // Success message will stay until user clicks close
                }, 3000);
            } else {
                throw new Error(data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error occurred:', error);
            alert('An unexpected error occurred. Please try again later.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        }
    });
};



/**
 * Certificate Modal Handler
 * Manages the modal popup for viewing certificates
 */
const initializeCertificateModal = () => {
    const modal = document.getElementById('certificateModal');
    const modalImg = document.getElementById('modalImage');

    // Open modal when clicking certificate images
    document.querySelectorAll('.certification-image').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card flip
            modal.classList.add('active');
            modalImg.src = img.src;
        });
    });

    // Close modal when clicking outside image
    modal.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Prevent modal close when clicking the image
    modalImg.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close modal with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.classList.remove('active');
        }
    });
};


/**
 * Update Copyright Year
 * Sets the current year in the footer copyright text
 */
const updateCopyrightYear = () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
};


/**
 * Initialize All Functionality
 * Main initialization function that sets up all features
 */
const initializePortfolio = () => {
    initializeParticles();
    initializeScrollAnimations();
    initializeSmoothScrolling();
    initializeContactForm();
    initializeCertificateModal();
    updateCopyrightYear();
};


// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializePortfolio);