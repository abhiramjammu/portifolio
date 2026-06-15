document.addEventListener('DOMContentLoaded', () => {

    // --- PRELOAD ASSETS ---
    const preloadedRedRobot = new Image();
    preloadedRedRobot.src = 'assets/3d_robot_red_nobg.png';
    window.currentParticleColor = { r: 79, g: 172, b: 254 }; // Default Blue

    // --- HERO ANIMATION SEQUENCE ---
    const robotImg = document.getElementById('hero-robot');
    const orbsContainer = document.querySelector('.cr-1');
    const cooldownText = document.getElementById('cooldown-text');

    function runHeroSequence() {
        if(!robotImg || !orbsContainer || !cooldownText) return;
        
        // Phase 1: Blue Robot, Active Orbs (4 seconds)
        robotImg.src = 'assets/3d_robot_blue_nobg.png';
        window.currentParticleColor = { r: 79, g: 172, b: 254 }; // Blue
        orbsContainer.classList.add('orbs-active');
        cooldownText.style.opacity = '0';
        cooldownText.style.transform = 'translateY(-50%) translateX(-20px)';
        
        setTimeout(() => {
            // Phase 2: Collapse Orbs (takes exactly 0.5 seconds in CSS)
            orbsContainer.classList.remove('orbs-active');
            
            setTimeout(() => {
                // Phase 3: Exact moment they hit the center -> Red Robot, HUD appears
                robotImg.src = preloadedRedRobot.src; // Uses preloaded image instantly
                window.currentParticleColor = { r: 255, g: 8, b: 68 }; // Red
                cooldownText.style.opacity = '1';
                cooldownText.style.transform = 'translateY(-50%) translateX(0px)';
                
                let countdown = 3;
                cooldownText.innerHTML = `COOLDOWN: 0${countdown}S`;
                
                const countInterval = setInterval(() => {
                    countdown--;
                    if(countdown > 0) {
                        cooldownText.innerHTML = `COOLDOWN: 0${countdown}S`;
                    } else {
                        clearInterval(countInterval);
                        // Phase 4: Restart Sequence
                        runHeroSequence();
                    }
                }, 1000);
            }, 400); // Anticipates the 500ms CSS collapse by 100ms for perfectly snappy visual impact
        }, 4000); // 4 seconds of orbiting
    }
    
    // Start Sequence
    runHeroSequence();

    // --- PARTICLE NETWORK (Connecting Universe Dots) ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = document.querySelector('.hero-section').offsetHeight || window.innerHeight;
        
        let particles = [];
        const particleCount = 45; // Increased a bit from 30
        
        const mouse = { x: -1000, y: -1000, radius: 150 };
        
        document.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = document.querySelector('.hero-section').offsetHeight || window.innerHeight;
        });
        
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.8; // Slower speed
                this.vy = (Math.random() - 0.5) * 0.8;
                this.radius = Math.random() * 1.5 + 1; // Smaller dots
            }
            update(orbitCenter) {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > width) this.vx = -this.vx;
                if (this.y < 0 || this.y > height) this.vy = -this.vy;
                
                // Orbit Collision
                if (orbitCenter && orbitCenter.radius > 0) {
                    let dx = this.x - orbitCenter.x;
                    let dy = this.y - orbitCenter.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < orbitCenter.radius) {
                        // Push it exactly outside the boundary
                        const nx = dx / distance;
                        const ny = dy / distance;
                        this.x = orbitCenter.x + nx * orbitCenter.radius;
                        this.y = orbitCenter.y + ny * orbitCenter.radius;
                        
                        // Reflect velocity vector
                        const dotProduct = this.vx * nx + this.vy * ny;
                        // Only reflect if moving towards the center
                        if (dotProduct < 0) {
                            this.vx -= 2 * dotProduct * nx;
                            this.vy -= 2 * dotProduct * ny;
                        }
                    }
                }
                
                // Mouse Interaction (Push away slightly to create dynamic flow)
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= forceDirectionX * force * 3;
                    this.y -= forceDirectionY * force * 3;
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${window.currentParticleColor.r}, ${window.currentParticleColor.g}, ${window.currentParticleColor.b}, 0.8)`;
                ctx.fill();
            }
        }
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            
            // Calculate Orbit Center
            let orbitCenter = { x: -1000, y: -1000, radius: 0 };
            const orbitEl = document.querySelector('.cr-1');
            if (orbitEl) {
                const rect = orbitEl.getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();
                orbitCenter.x = (rect.left + rect.width / 2) - canvasRect.left;
                orbitCenter.y = (rect.top + rect.height / 2) - canvasRect.top;
                orbitCenter.radius = rect.width / 2 + 10; // Added 10px buffer
            }
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update(orbitCenter);
                particles[i].draw();
                
                for (let j = i; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${window.currentParticleColor.r}, ${window.currentParticleColor.g}, ${window.currentParticleColor.b}, ${(1 - distance/120) * 0.45})`; // Slightly more visible lines
                        ctx.lineWidth = 0.6;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }
    
    // ----------------------------------------------------
    // 1. NAVBAR SCROLL EFFECT
    // ----------------------------------------------------
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });

    // ----------------------------------------------------
    // 2. INTERSECTION OBSERVER FOR ANIMATIONS
    // ----------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal-up');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ----------------------------------------------------
    // 3. HIGH PERFORMANCE VIDEO LAZY LOADER & PAUSER
    // ----------------------------------------------------
    // This entirely solves the extreme lag issue. Videos only load and play when visible.
    const videos = document.querySelectorAll('video[data-src]');
    
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting) {
                // Load source if not loaded
                if (!video.src && video.dataset.src) {
                    video.src = video.dataset.src;
                    video.load();
                    
                    video.addEventListener('loadeddata', () => {
                        video.classList.add('loaded');
                    }, { once: true });
                }
                
                // Only autoplay if it's NOT a hover-play video
                if (!video.classList.contains('hover-play')) {
                    video.play().catch(e => console.log("Autoplay prevented", e));
                }
            } else {
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, {
        rootMargin: "200px 0px 200px 0px",
        threshold: 0
    });

    videos.forEach(video => {
        videoObserver.observe(video);
        
        // Add hover logic for hover-play videos
        if (video.classList.contains('hover-play')) {
            const container = video.closest('.scroll-card');
            if (container) {
                container.addEventListener('mouseenter', () => {
                    video.play().catch(e => console.log(e));
                });
                container.addEventListener('mouseleave', () => {
                    video.pause();
                    video.currentTime = 0; // Optional: reset to start
                });
            }
        }
    });

    // ----------------------------------------------------
    // 3.5 AUTO-SCROLL LOGIC
    // ----------------------------------------------------
    
    // Horizontal sections (Advanced AI, Education)
    const horizontalSections = document.querySelectorAll('.horizontal-scroll-section');
    horizontalSections.forEach(section => {
        let isHovered = false;
        section.addEventListener('mouseenter', () => isHovered = true);
        section.addEventListener('mouseleave', () => isHovered = false);
        
        setInterval(() => {
            if (!isHovered) {
                section.scrollLeft += 1;
                
                // If reached the end, loop back
                if (section.scrollLeft + section.clientWidth >= section.scrollWidth - 2) {
                    section.scrollLeft = 0;
                }
            }
        }, 45); // Reduced speed for slower ambient scroll
    });

    // ----------------------------------------------------
    // 3.6 VOLUME TOGGLE BUTTONS
    // ----------------------------------------------------
    document.querySelectorAll('.volume-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Find the video element within the same container
            const container = btn.closest('.scroll-card') || btn.closest('.video-container');
            if (container) {
                const video = container.querySelector('video');
                if (video) {
                    video.muted = !video.muted;
                    btn.textContent = video.muted ? '🔇' : '🔊';
                }
            }
        });
    });

    // Mini carousels (AE, Talking Head) scroll to next on video end
    const miniCarousels = document.querySelectorAll('.mini-carousel');
    miniCarousels.forEach(carousel => {
        const carouselVideos = carousel.querySelectorAll('video');
        carouselVideos.forEach(video => {
            video.addEventListener('ended', () => {
                // Scroll the container to the right by its clientWidth
                carousel.scrollBy({ left: carousel.clientWidth, behavior: 'smooth' });
                
                // If it's the last video, scroll back to start
                if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
                    setTimeout(() => {
                        carousel.scrollTo({ left: 0, behavior: 'smooth' });
                    }, 1000);
                }
            });
        });
    });



});
