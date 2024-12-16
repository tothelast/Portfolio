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

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent default form submission

        // Disable the button to prevent multiple submissions
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        const formData = new FormData(contactForm);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('Your message has been sent successfully!');
                contactForm.reset(); // Clear the form after successful submission
            } else {
                const errorData = await response.json();
                console.error('Submission failed:', errorData);
                alert('Failed to send your message. Please try again later.');
            }
        } catch (error) {
            console.error('Error occurred:', error);
            alert('An unexpected error occurred. Please check your internet connection.');
        } finally {
            // Re-enable the button
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