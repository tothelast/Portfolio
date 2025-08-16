/**
 * Portfolio Website JavaScript
 *
 * This file contains all the interactive functionality for the portfolio website:
 * - Neural network background animation
 * - Scroll animations
 * - Smooth scrolling navigation
 * - Contact form handling
 * - Certificate modal functionality
 * - Dynamic year update
 */

const isMobileDevice = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

/**
 * Header State Management
 * Manages the toggle between neural network and traditional header
 */
let isNetworkMode = false; // Start in traditional mode
let neuralNetworkCleanup = null;

/**
 * Initialize particles.js for traditional mode
 */
const initializeParticlesJS = () => {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 60,
                density: {
                    enable: true,
                    value_area: 800,
                },
            },
            color: {
                value: ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b'],
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 2,
                    color: '#3b82f6',
                },
            },
            opacity: {
                value: 0.6,
                random: false,
                anim: {
                    enable: true,
                    speed: 0.8,
                    opacity_min: 0.3,
                    sync: false,
                },
            },
            size: {
                value: 4,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 2,
                    sync: false,
                },
            },
            line_linked: {
                enable: true,
                distance: 120,
                color: '#3b82f6',
                opacity: 0.6,
                width: 2,
                shadow: {
                    enable: true,
                    color: '#3b82f6',
                    blur: 5,
                },
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'bounce',
                bounce: false,
                attract: {
                    enable: true,
                    rotateX: 600,
                    rotateY: 1200,
                },
            },
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab',
                },
                onclick: {
                    enable: true,
                    mode: 'push',
                },
                resize: true,
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 0.8,
                    },
                },
                push: {
                    particles_nb: 4,
                },
            },
        },
        retina_detect: true,
    });
};

/**
 * Show traditional header elements
 */
const showTraditionalHeader = () => {
    const elements = [
        'profileImage',
        'profileName',
        'profileTitle',
        'socialLinks',
        'scrollIndicator',
    ];

    elements.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'block';
            // Force reflow
            element.offsetHeight;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

/**
 * Hide traditional header elements
 */
const hideTraditionalHeader = () => {
    const elements = [
        'profileImage',
        'profileName',
        'profileTitle',
        'socialLinks',
        'scrollIndicator',
    ];

    elements.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                element.style.display = 'none';
            }, 500);
        }
    });
};

/**
 * Toggle between neural network and traditional header
 */
const toggleHeaderMode = () => {
    const hideBtn = document.getElementById('hideNetworkBtn');
    const particlesContainer = document.getElementById('particles-js');

    if (isNetworkMode) {
        // Switch to traditional mode
        isNetworkMode = false;

        // Clean up neural network
        if (neuralNetworkCleanup) {
            neuralNetworkCleanup();
            neuralNetworkCleanup = null;
        }

        // Clear the particles container
        particlesContainer.innerHTML = '';

        // Initialize particles.js
        initializeParticlesJS();

        // Position button for traditional mode (top)
        positionButtonForTraditional(hideBtn);

        // Show traditional header elements
        showTraditionalHeader();

        // Update button text for traditional mode (when switching to traditional, button shows option to go back to network)
        hideBtn.querySelector('span').textContent = 'Show Network';

        // Update icon with simpler approach
        hideBtn.innerHTML = '<span>Show Network</span><i class="fas fa-brain"></i>';

        // Re-apply button styling after innerHTML change
        applyButtonStyling(hideBtn);

        // Re-attach event listeners since innerHTML was changed
        attachButtonEvents(hideBtn);
    } else {
        // Switch to network mode
        isNetworkMode = true;

        // Clean up particles.js
        if (window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom[0].pJS.fn.vendors.destroypJS();
            window.pJSDom = [];
        }

        // Clear the particles container
        particlesContainer.innerHTML = '';

        // Initialize neural network
        neuralNetworkCleanup = initializeNeuralNetwork();

        // Position button for network mode (center)
        positionButtonForNetwork(hideBtn);

        // Hide traditional header elements
        hideTraditionalHeader();

        // Update button text for network mode (when switching to network, button shows option to go to main)
        hideBtn.querySelector('span').textContent = 'Go to Main';

        // Update icon with simpler approach
        hideBtn.innerHTML = '<span>Go to Main</span><i class="fas fa-home"></i>';

        // Re-apply button styling after innerHTML change
        applyButtonStyling(hideBtn);

        // Re-attach event listeners since innerHTML was changed
        attachButtonEvents(hideBtn);
    }
};

/**
 * Attach button event listeners
 */
const attachButtonEvents = (hideBtn) => {
    hideBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        toggleHeaderMode();
    });

    // Add hover effects
    hideBtn.addEventListener('mouseenter', () => {
        hideBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        hideBtn.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        hideBtn.style.color = 'rgba(255, 255, 255, 0.95)';
        hideBtn.style.opacity = '0.95';

        // Apply scale based on current mode
        if (isNetworkMode) {
            hideBtn.style.transform = 'translate(-50%, -50%) scale(1.02)';
        } else {
            hideBtn.style.transform = 'translateX(-50%) scale(1.02)';
        }

        hideBtn.style.boxShadow =
            '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';

        // Icon hover effect
        const currentIcon = hideBtn.querySelector('i');
        if (currentIcon) {
            currentIcon.style.transform = 'scale(1.1) rotate(5deg)';
            currentIcon.style.color = 'rgba(255, 255, 255, 0.95)';
        }
    });

    hideBtn.addEventListener('mouseleave', () => {
        hideBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        hideBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        hideBtn.style.color = 'rgba(255, 255, 255, 0.8)';
        hideBtn.style.opacity = '0.8';

        // Reset transform based on current mode
        if (isNetworkMode) {
            hideBtn.style.transform = 'translate(-50%, -50%)';
        } else {
            hideBtn.style.transform = 'translateX(-50%)';
        }

        hideBtn.style.boxShadow =
            '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';

        // Reset icon
        const currentIcon = hideBtn.querySelector('i');
        if (currentIcon) {
            currentIcon.style.transform = 'scale(1) rotate(0deg)';
            currentIcon.style.color = 'rgba(255, 255, 255, 0.8)';
        }
    });
};

/**
 * Apply button styling (used after innerHTML changes)
 */
const applyButtonStyling = (hideBtn) => {
    const buttonStyles = {
        position: 'absolute',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '50px',
        color: 'rgba(255, 255, 255, 0.8)',
        padding: '0.75rem 1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: '99999',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.95rem',
        fontWeight: '500',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        pointerEvents: 'auto',
        opacity: '0.8',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        letterSpacing: '0.025em',
        minWidth: '160px',
        justifyContent: 'center',
    };

    Object.assign(hideBtn.style, buttonStyles);

    // Style the icon
    const icon = hideBtn.querySelector('i');
    if (icon) {
        icon.style.fontSize = '0.9rem';
        icon.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        icon.style.color = 'rgba(255, 255, 255, 0.8)';
    }
};

/**
 * Position button for network mode (center)
 */
const positionButtonForNetwork = (hideBtn) => {
    hideBtn.style.top = '50%';
    hideBtn.style.left = '50%';
    hideBtn.style.transform = 'translate(-50%, -50%)';
};

/**
 * Position button for traditional mode (top)
 */
const positionButtonForTraditional = (hideBtn) => {
    hideBtn.style.top = '2rem';
    hideBtn.style.left = '50%';
    hideBtn.style.transform = 'translateX(-50%)';
};

/**
 * Initialize header button functionality
 */
const initializeHeaderToggle = () => {
    const hideBtn = document.getElementById('hideNetworkBtn');
    if (hideBtn) {
        // Apply initial styling and positioning for traditional mode
        applyButtonStyling(hideBtn);
        positionButtonForTraditional(hideBtn);

        // Show traditional header elements since we start in traditional mode
        showTraditionalHeader();

        // Attach event listeners
        attachButtonEvents(hideBtn);
    }
};

/**
 * Neural Network Visualization
 * Creates an interactive neural network animation showing forward pass and backpropagation
 */
const initializeParticles = () => {
    // Start with traditional view (particles.js) as the main page
    console.log('Initializing with traditional particles view');
    initializeParticlesJS();
    isNetworkMode = false;

    // Make sure button shows correct state for traditional mode
    const hideBtn = document.getElementById('hideNetworkBtn');
    if (hideBtn) {
        hideBtn.querySelector('span').textContent = 'Show Network';
        const icon = hideBtn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-brain';
        }
    }
};

/**
 * Scroll Animation Handler
 * Handles revealing elements as they come into view while scrolling
 */
const initializeScrollAnimations = () => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        {
            threshold: 0.1,
        }
    );

    // Observe all elements with animation class
    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
};

/**
 * Smooth Scrolling Navigation
 * Enables smooth scrolling when clicking on navigation links
 */
const initializeSmoothScrolling = () => {
    document.querySelectorAll('nav a').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            targetElement.scrollIntoView({
                behavior: 'smooth',
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

    // Particle class definition
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
        const particleCount = isMobileDevice() ? 25 : 50; // Reduce particles on mobile
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]));
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles = particles.filter((particle) => particle.opacity > 0);

        particles.forEach((particle) => {
            particle.update();
            particle.draw(ctx);
        });

        if (particles.length > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = 'none';
        }
    }

    function showSuccessMessage() {
        // Force layout recalculation on mobile
        successMessage.style.display = 'block';
        successMessage.style.opacity = '0';

        // Trigger reflow
        successMessage.offsetHeight;

        // Add fade in
        successMessage.style.opacity = '1';
        successMessage.style.transition = 'opacity 0.3s ease-in';

        // Ensure proper positioning on mobile
        if (isMobileDevice()) {
            document.body.style.overflow = 'hidden';
            window.scrollTo(0, 0);
        }
    }

    function hideSuccessMessage() {
        successMessage.style.opacity = '0';
        setTimeout(() => {
            successMessage.style.display = 'none';
            if (isMobileDevice()) {
                document.body.style.overflow = '';
            }
        }, 300);
    }

    closeButton.addEventListener('click', () => {
        cancelAnimationFrame(animationId);
        particles = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        hideSuccessMessage();
    });

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        // Create FormData object
        const formData = new FormData(contactForm);

        try {
            // Submit the form
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                // Show success message and animation
                canvas.style.display = 'block';
                showSuccessMessage();

                // Start animation only if device can handle it
                if (!isMobileDevice() || window.innerWidth > 768) {
                    createParticles(window.innerWidth / 2, window.innerHeight / 2);
                    animate();
                }

                contactForm.reset();

                // Handle animation cleanup
                setTimeout(() => {
                    cancelAnimationFrame(animationId);
                    particles = [];
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.style.display = 'none';
                }, 3000);
            } else {
                throw new Error(data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error occurred:', error);
            alert('Failed to send message. Please try again later.');
        } finally {
            // Reset button state
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
    const certificates = Array.from(document.querySelectorAll('.certification-image'));
    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    // Add navigation arrows to modal if they don't exist
    if (!document.querySelector('.modal-nav')) {
        const navHTML = `
            <button class="modal-nav modal-nav-prev" aria-label="Previous certificate">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="modal-nav modal-nav-next" aria-label="Next certificate">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        modal.insertAdjacentHTML('beforeend', navHTML);
    }

    const prevButton = modal.querySelector('.modal-nav-prev');
    const nextButton = modal.querySelector('.modal-nav-next');

    function showCertificate(index) {
        modalImg.src = certificates[index].src;
        currentIndex = index;

        if (prevButton && nextButton) {
            prevButton.style.display = index === 0 ? 'none' : 'block';
            nextButton.style.display = index === certificates.length - 1 ? 'none' : 'block';
        }

        // Add fade effect
        modalImg.style.opacity = '0';
        setTimeout(() => {
            modalImg.style.opacity = '1';
        }, 50);
    }

    function navigateCertificates(direction) {
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < certificates.length) {
            showCertificate(newIndex);
        }
    }

    // Handle Desktop Navigation
    if (!isMobileDevice()) {
        // Desktop hover behavior remains default from CSS

        // Arrow key navigation
        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('active')) return;

            if (e.key === 'ArrowLeft') {
                navigateCertificates(-1);
            } else if (e.key === 'ArrowRight') {
                navigateCertificates(1);
            }
        });

        // Arrow button navigation
        prevButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateCertificates(-1);
        });

        nextButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateCertificates(1);
        });

        // Desktop click to open
        certificates.forEach((img, index) => {
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                modal.classList.add('active');
                showCertificate(index);
            });
        });
    }

    // Handle Mobile Interactions
    if (isMobileDevice()) {
        document.querySelectorAll('.certification-card').forEach((card, index) => {
            let isFlipped = false;

            // First tap to flip
            card.addEventListener('click', (e) => {
                if (!isFlipped) {
                    card.querySelector('.certification-card-inner').style.transform =
                        'rotateY(180deg)';
                    isFlipped = true;
                    e.stopPropagation();
                }
            });

            // Second tap to open modal
            const cardImage = card.querySelector('.certification-image');
            cardImage.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isFlipped) {
                    modal.classList.add('active');
                    showCertificate(index);

                    // Reset flip state after slight delay
                    setTimeout(() => {
                        card.querySelector('.certification-card-inner').style.transform = '';
                        isFlipped = false;
                    }, 300);
                }
            });

            // Reset flip state when clicking outside
            document.addEventListener('click', (e) => {
                if (!card.contains(e.target)) {
                    card.querySelector('.certification-card-inner').style.transform = '';
                    isFlipped = false;
                }
            });
        });

        // Mobile swipe navigation
        modal.addEventListener(
            'touchstart',
            (e) => {
                touchStartX = e.touches[0].clientX;
            },
            { passive: true }
        );

        modal.addEventListener(
            'touchmove',
            (e) => {
                e.preventDefault(); // Prevent page scroll while swiping
            },
            { passive: false }
        );

        modal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const swipeDistance = touchEndX - touchStartX;

            if (Math.abs(swipeDistance) > 50) {
                if (swipeDistance > 0) {
                    navigateCertificates(-1); // Swipe right = previous
                } else {
                    navigateCertificates(1); // Swipe left = next
                }
            }
        });
    }

    // Universal close handlers
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            // Reset all cards when closing modal
            document.querySelectorAll('.certification-card-inner').forEach((card) => {
                card.style.transform = '';
            });
        }
    });

    modalImg.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.classList.remove('active');
            // Reset all cards when closing modal
            document.querySelectorAll('.certification-card-inner').forEach((card) => {
                card.style.transform = '';
            });
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
    initializeHeaderToggle();
    initializeScrollAnimations();
    initializeSmoothScrolling();
    initializeContactForm();
    initializeCertificateModal();
    updateCopyrightYear();
};

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializePortfolio);
