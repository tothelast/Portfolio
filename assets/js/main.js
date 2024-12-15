// Initialize particles
particlesJS('particles-js', {
    particles: {
        number: { value: 80 },
        color: { value: '#ffffff' },
        opacity: { value: 0.5 },
        size: { value: 3 },
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

// Scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

// Smooth scrolling
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form handling
document.querySelector('.contact-form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Form submission is disabled in this preview.');
});


// Certificate modal functionality
const modal = document.getElementById('certificateModal');
const modalImg = document.getElementById('modalImage');

// Add click event listeners to certificate images
document.querySelectorAll('.certification-image').forEach(img => {
    img.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card flip when clicking image
        modal.classList.add('active');
        modalImg.src = img.src;
    });
});

// Close modal when clicking outside the image
modal.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Prevent modal from closing when clicking the image itself
modalImg.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Close modal with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        modal.classList.remove('active');
    }
});

// Update copyright year
document.getElementById('currentYear').textContent = new Date().getFullYear();

