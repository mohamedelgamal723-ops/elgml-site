// GSAP Animations for Modern Template
gsap.registerPlugin();

document.addEventListener('DOMContentLoaded', function() {
  // Animate hero content on load
  gsap.from('.hero-content', {
    duration: 1,
    opacity: 0,
    y: 30,
    ease: 'power3.out'
  });

  // Animate section titles on scroll
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true
      },
      duration: 0.8,
      opacity: 0,
      y: 30,
      ease: 'power3.out'
    });
  });

  // Animate service cards
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        once: true
      },
      duration: 0.6,
      opacity: 0,
      y: 20,
      delay: index * 0.1,
      ease: 'power3.out'
    });

    // Add hover animation
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        duration: 0.3,
        transform: 'translateY(-10px)',
        boxShadow: '0 20px 40px rgba(255, 107, 107, 0.2)',
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        duration: 0.3,
        transform: 'translateY(0)',
        boxShadow: 'none',
        ease: 'power2.out'
      });
    });
  });

  // Animate portfolio items
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  portfolioItems.forEach((item, index) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        once: true
      },
      duration: 0.6,
      opacity: 0,
      scale: 0.9,
      delay: index * 0.08,
      ease: 'back.out'
    });
  });

  // Navbar link active state on scroll
  const navLinks = document.querySelectorAll('.nav-link');
  const sections_array = document.querySelectorAll('.section, #home');

  window.addEventListener('scroll', () => {
    let current = '';
    sections_array.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });

  // Contact info hover effect
  const contactItems = document.querySelectorAll('.contact-item');
  contactItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, {
        duration: 0.3,
        transform: 'translateY(-8px)',
        boxShadow: '0 15px 40px rgba(78, 205, 196, 0.2)',
        ease: 'power2.out'
      });
    });

    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        duration: 0.3,
        transform: 'translateY(0)',
        ease: 'power2.out'
      });
    });
  });

  // Stats counter animation
  const stats = document.querySelectorAll('.stat-number');
  const observerOptions = {
    threshold: 0.5
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        entry.target.classList.add('animated');
        gsap.from(entry.target, {
          duration: 2,
          textContent: 0,
          snap: { textContent: 1 },
          ease: 'power1.inOut'
        });
      }
    });
  }, observerOptions);

  stats.forEach(stat => observer.observe(stat));
});
