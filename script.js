// Global variables
let scene, camera, renderer, particles, floatingShapes, lines;
let mouseX = 0, mouseY = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeThreeBackground();
    initializeScrollAnimations();
    initializeContactForm();
    initializeMobileMenu();
});

// Navigation functionality
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.backgroundColor = 'hsla(0, 0%, 10%, 0.95)';
        } else {
            navbar.style.backgroundColor = 'hsla(0, 0%, 10%, 0.7)';
        }
    });
}

// Smooth scrolling to sections
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu.classList.contains('show')) {
        toggleMobileMenu();
    }
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menuIcon');
    const closeIcon = document.getElementById('closeIcon');
    
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    function toggleMobileMenu() {
        const isOpen = mobileMenu.classList.contains('show');
        
        if (isOpen) {
            mobileMenu.classList.remove('show');
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';
        } else {
            mobileMenu.classList.add('show');
            menuIcon.style.display = 'none';
            closeIcon.style.display = 'block';
        }
    }
}

// Three.js Background Animation
function initializeThreeBackground() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Create particles
    createParticles();
    
    // Create floating shapes
    createFloatingShapes();
    
    // Create connecting lines
    createConnectingLines();

    camera.position.z = 5;

    // Mouse movement
    document.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    animate();

    // Handle window resize
    window.addEventListener('resize', handleResize);
}

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorPalette = [
        new THREE.Color(0x6366F1), // indigo
        new THREE.Color(0x8B5CF6), // purple
        new THREE.Color(0x10B981), // emerald
        new THREE.Color(0xF59E0B)  // amber
    ];

    for (let i = 0; i < particleCount; i++) {
        // Spread particles across wider area
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

        // Add random velocities
        velocities[i * 3] = (Math.random() - 0.5) * 0.01;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

        // Vary particle sizes
        sizes[i] = Math.random() * 0.03 + 0.01;

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
}

function createFloatingShapes() {
    const geometryTypes = [
        () => new THREE.BoxGeometry(0.1, 0.1, 0.1),
        () => new THREE.SphereGeometry(0.05, 8, 6),
        () => new THREE.ConeGeometry(0.05, 0.1, 4),
        () => new THREE.OctahedronGeometry(0.06)
    ];

    const colorPalette = [
        new THREE.Color(0x6366F1),
        new THREE.Color(0x8B5CF6),
        new THREE.Color(0x10B981),
        new THREE.Color(0xF59E0B)
    ];

    floatingShapes = [];
    for (let i = 0; i < 15; i++) {
        const geometry = geometryTypes[Math.floor(Math.random() * geometryTypes.length)]();
        const material = new THREE.MeshBasicMaterial({ 
            color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
            transparent: true,
            opacity: 0.3,
            wireframe: Math.random() > 0.5
        });
        const shape = new THREE.Mesh(geometry, material);
        
        shape.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );
        
        shape.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        floatingShapes.push({
            mesh: shape,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            velocity: {
                x: (Math.random() - 0.5) * 0.005,
                y: (Math.random() - 0.5) * 0.005,
                z: (Math.random() - 0.5) * 0.005
            }
        });
        
        scene.add(shape);
    }
}

function createConnectingLines() {
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    const lineColors = [];
    
    const positionAttribute = particles.geometry.getAttribute('position');
    const particleCount = positionAttribute.count;
    
    for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
            const dx = positionAttribute.getX(i) - positionAttribute.getX(j);
            const dy = positionAttribute.getY(i) - positionAttribute.getY(j);
            const dz = positionAttribute.getZ(i) - positionAttribute.getZ(j);
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance < 3 && Math.random() > 0.95) {
                linePositions.push(
                    positionAttribute.getX(i), positionAttribute.getY(i), positionAttribute.getZ(i),
                    positionAttribute.getX(j), positionAttribute.getY(j), positionAttribute.getZ(j)
                );
                
                const color = new THREE.Color(0x6366F1);
                lineColors.push(color.r, color.g, color.b, color.r, color.g, color.b);
            }
        }
    }
    
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(lineColors), 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.2
    });
    
    lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);
}

function handleMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Animate main particle system
    particles.rotation.x += 0.001;
    particles.rotation.y += 0.002;
    
    // Dynamic particle movement
    const positionAttribute = particles.geometry.getAttribute('position');
    for (let i = 0; i < positionAttribute.count; i++) {
        // Gentle floating motion
        positionAttribute.setY(i, 
            positionAttribute.getY(i) + Math.sin(time + i * 0.1) * 0.005
        );
    }
    positionAttribute.needsUpdate = true;

    // Animate floating shapes
    floatingShapes.forEach(shape => {
        shape.mesh.rotation.x += shape.rotationSpeed.x;
        shape.mesh.rotation.y += shape.rotationSpeed.y;
        shape.mesh.rotation.z += shape.rotationSpeed.z;
        
        shape.mesh.position.x += shape.velocity.x;
        shape.mesh.position.y += shape.velocity.y;
        shape.mesh.position.z += shape.velocity.z;
        
        // Boundary wrapping
        if (Math.abs(shape.mesh.position.x) > 10) {
            shape.velocity.x *= -1;
        }
        if (Math.abs(shape.mesh.position.y) > 10) {
            shape.velocity.y *= -1;
        }
        if (Math.abs(shape.mesh.position.z) > 10) {
            shape.velocity.z *= -1;
        }
    });

    // Camera movement based on mouse
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('.section-reveal');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Basic validation
        if (!name || !email || !message) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate form submission
        showToast('Sending message...', 'success');
        
        // In a real application, you would send this data to your server
        setTimeout(() => {
            showToast('Message sent successfully! I\'ll get back to you soon.', 'success');
            contactForm.reset();
        }, 2000);
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to skill badges
    const skillBadges = document.querySelectorAll('.skill-badge');
    skillBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
            this.style.boxShadow = '0 10px 25px hsla(243, 75%, 59%, 0.3)';
        });
        
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Add click effects to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateX(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0deg)';
        });
    });
    
    // Hero title is now static with gradient animation
    // No typing effect needed
});

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(function() {
    // Any scroll-based animations can go here
}, 16)); // ~60fps 