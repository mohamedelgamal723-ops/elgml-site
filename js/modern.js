// GSAP Animations for Modern Template
gsap.registerPlugin();

document.addEventListener('DOMContentLoaded', function() {
    // Load site content from content.json and update all sections
    async function loadSiteContent() {
      try {
        const res = await fetch('data/content.json', {cache: 'no-store'});
        const data = await res.json();
        // Navbar brand
        if (data.site && data.site.brand) {
          document.querySelector('.logo-text').textContent = data.site.brand;
        }
        // Hero section
        if (data.site && data.site.brand) {
          document.getElementById('site-title').textContent = 'مرحبا أنا ' + data.site.brand;
        }
        if (data.site && data.site.lead) {
          document.getElementById('site-subtitle').textContent = data.site.lead;
        }
        // Logo
        if (data.site && data.site.logo) {
          let nav = document.querySelector('.logo-text');
          if (nav && data.site.logo) {
            nav.innerHTML = `<img src="${data.site.logo}" alt="logo" style="max-height:40px;vertical-align:middle;">`;
          }
        }
        // Email
        if (data.site && data.site.email) {
          document.getElementById('contact-email').textContent = data.site.email;
          document.getElementById('contact-email').href = 'mailto:' + data.site.email;
        }
        // Section titles
        if (data.settings && data.settings.pages) {
          if (data.settings.pages.aboutTitle) document.querySelector('#about .section-title').textContent = data.settings.pages.aboutTitle;
          if (data.settings.pages.servicesTitle) document.querySelector('#services .section-title').textContent = data.settings.pages.servicesTitle;
          if (data.settings.pages.portfolioTitle) document.querySelector('#portfolio .section-title').textContent = data.settings.pages.portfolioTitle;
          if (data.settings.pages.contactTitle) document.querySelector('#contact .section-title').textContent = data.settings.pages.contactTitle;
        }
        // About section text
        if (data.settings && data.settings.pages) {
          // You can add more granular about text fields if needed
        }
        // Portfolio/projects
        if (data.projects && Array.isArray(data.projects)) {
          const grid = document.getElementById('portfolio-grid');
          if (grid) {
            grid.innerHTML = data.projects.map(p => `
              <div class="portfolio-item">
                <video src="${p.video}" poster="${p.poster}" controls style="width:100%;border-radius:10px;"></video>
                <h3>${p.title}</h3>
                <p>${p.description}</p>
              </div>
            `).join('');
          }
        }
        // Colors (optional: update CSS variables)
        if (data.settings && data.settings.colors) {
          const root = document.documentElement;
          if (data.settings.colors.primary) root.style.setProperty('--primary', data.settings.colors.primary);
          if (data.settings.colors.secondary) root.style.setProperty('--secondary', data.settings.colors.secondary);
          if (data.settings.colors.dark) root.style.setProperty('--dark', data.settings.colors.dark);
        }
        // SEO (optional: update meta tags)
        if (data.settings && data.settings.seo) {
          if (data.settings.seo.title) document.title = data.settings.seo.title;
          if (data.settings.seo.description) document.querySelector('meta[name="description"]').setAttribute('content', data.settings.seo.description);
          if (data.settings.seo.keywords) document.querySelector('meta[name="keywords"]').setAttribute('content', data.settings.seo.keywords);
        }
      } catch(e) {
        console.error('Error loading site content:', e);
      }
    }

    // Initial load
    loadSiteContent();

    // Live reload: poll for changes every 2 seconds
    setInterval(loadSiteContent, 2000);
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
