document.addEventListener("DOMContentLoaded", function() {
  // Initialize loading overlay
  const loadingOverlay = document.querySelector('.loading-overlay');
  
  // Initialize core functionality
  initializeSidebar();
  setupEventListeners();
  // startTypeWriter(); // <-- Remove or comment out this line
  
  // Fetch and load XML data
  loadPortfolioData();
  
  // Observe sections for animations
  setupScrollAnimations();
});

// ========================
// DATA LOADING FUNCTIONS
// ========================

function loadPortfolioData() {
  fetch('/static/data.xml')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.text();
    })
    .then(xmlText => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");
      
      // Check for XML errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML parsing error');
      }
      
      // Load all sections from XML
      loadHomeSection(xmlDoc);
      loadPortfolioSection(xmlDoc);
      loadSkillsAndTalents(xmlDoc);
      loadOrganizations(xmlDoc);
      loadServices(xmlDoc);
      loadTestimonials(xmlDoc);
      loadContactSection(xmlDoc);
      
      // Hide loading overlay after content is loaded
      setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        setTimeout(() => loadingOverlay.remove(), 500);
      }, 500);
    })
    .catch(error => {
      console.error('Error loading portfolio data:', error);
      showErrorState(error);
    });
}

function loadHomeSection(xml) {
  const home = xml.querySelector('home');
  if (!home) return;
  
  // Set profile information
  setElementText('#full-name', getXmlText(home, 'name'));
  // Animate tagline from XML
  animateTagline(getXmlText(home, 'tagline'));
  setElementAttribute('#profile-photo', 'src', getXmlText(home, 'photo'));
  setElementText('#location span', getXmlText(home, 'location'));
  
  // Load social links
  loadSocialLinks(home.querySelectorAll('social link'), '#social-links');
}

function loadPortfolioSection(xml) {
  const projects = xml.querySelectorAll('projects project');
  const tableBody = document.querySelector('#projects-table tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  projects.forEach((project, index) => {
    const row = document.createElement('tr');
    row.classList.add('section-animate');
    row.style.animationDelay = `${index * 0.1}s`;
    
    const title = getXmlText(project, 'title');
    const description = getXmlText(project, 'description');
    const technologies = getXmlText(project, 'technologies');
    const link = getXmlText(project, 'link');

    // Convert technologies to bullet list
    let techListHtml = 'Not specified';
    if (technologies) {
      const techArray = technologies.split(',').map(tech => tech.trim()).filter(Boolean);
      if (techArray.length > 0) {
        techListHtml = `<ul class="tech-list">${techArray.map(tech => `<li>${tech}</li>`).join('')}</ul>`;
      }
    }
    
    row.innerHTML = `
      <td>${title || 'Untitled Project'}</td>
      <td>${description || 'No description available'}</td>
      <td>
        ${techListHtml}
      </td>
      <td>
        ${link ? `<a href="${link}" target="_blank" class="project-link">
          View <i class="fas fa-external-link-alt"></i>
        </a>` : 'N/A'}
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

function loadSkillsAndTalents(xml) {
  // Load skills
  const skillsList = document.getElementById('skills-list');
  if (skillsList) {
    const skills = getXmlText(xml, 'skills').split(',') || [];
    skillsList.innerHTML = '';
    
    skills.forEach((skill, index) => {
      if (!skill.trim()) return;
      
      const li = document.createElement('li');
      li.classList.add('section-animate');
      li.style.animationDelay = `${index * 0.1}s`;
      
      // Generate random progress between 60-100%
      const progress = Math.floor(Math.random() * 40) + 60;
      
      li.innerHTML = `
        <i class="${getSkillIcon(skill.trim())}"></i>
        <span>${skill.trim()}</span>
        <div class="skill-progress">
          <div class="progress-bar" style="width: ${progress}%"></div>
        </div>
      `;
      
      skillsList.appendChild(li);
    });
  }
  
  // Load talents
  const talentsList = document.getElementById('talents-list');
  if (talentsList) {
    const talents = getXmlText(xml, 'talents').split(',') || [];
    talentsList.innerHTML = '';
    
    talents.forEach((talent, index) => {
      if (!talent.trim()) return;
      
      const li = document.createElement('li');
      li.classList.add('section-animate');
      li.style.animationDelay = `${index * 0.1}s`;
      
      li.innerHTML = `
        <i class="${getTalentIcon(talent.trim())}"></i>
        <span>${talent.trim()}</span>
      `;
      
      talentsList.appendChild(li);
    });
  }
}

function loadOrganizations(xml) {
  const orgs = xml.querySelectorAll('organizations organization');
  const tableBody = document.querySelector('#orgs-table tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  orgs.forEach((org, index) => {
    const row = document.createElement('tr');
    row.classList.add('section-animate');
    row.style.animationDelay = `${index * 0.1}s`;
    
    row.innerHTML = `
      <td>${getXmlText(org, 'name') || 'Unknown Organization'}</td>
      <td>${getXmlText(org, 'role') || 'Member'}</td>
      <td>${getXmlText(org, 'years') || 'Present'}</td>
    `;
    
    tableBody.appendChild(row);
  });
}

function loadServices(xml) {
  const services = xml.querySelectorAll('services service');
  const servicesGrid = document.querySelector('.services-grid');
  if (!servicesGrid) return;
  
  servicesGrid.innerHTML = '';
  
  services.forEach((service, index) => {
    const card = document.createElement('div');
    card.classList.add('service-card', 'section-animate');
    card.style.animationDelay = `${index * 0.1}s`;
    
    const title = getXmlText(service, 'title');
    const description = getXmlText(service, 'description');
    
    card.innerHTML = `
      <div class="service-icon">
        <i class="${getServiceIcon(title)}"></i>
      </div>
      <h3>${title || 'Service'}</h3>
      <p>${description || 'Description not available'}</p>
    `;
    
    servicesGrid.appendChild(card);
  });
}

function loadTestimonials(xml) {
  const testimonials = xml.querySelectorAll('testimonials testimonial');
  const testimonialsContainer = document.querySelector('#testimonials .section-content');
  
  if (!testimonialsContainer) return;
  
  // Create container for testimonial cards
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'testimonials-container';
  
  testimonials.forEach((testimonial, index) => {
    const person = getXmlText(testimonial, 'person') || 'Anonymous';
    const relation = getXmlText(testimonial, 'relation') || 'Colleague';
    const message = getXmlText(testimonial, 'message') || 'No message provided';
    const imagePath = getXmlText(testimonial, 'image') || `https://i.pravatar.cc/150?img=${index + 10}`;
    
    // Generate random rating between 4-5 stars
    const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5
    
    const card = document.createElement('div');
    card.className = 'testimonial-card section-animate';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
      <div class="testimonial-content">
        <p>"${message}"</p>
      </div>
      <div class="testimonial-author">
        <img src="${imagePath}" alt="${person}" class="testimonial-avatar">
        <div class="author-info">
          <h4>${person}</h4>
          <p>${relation}</p>
          <div class="testimonial-rating">
            ${'<i class="fas fa-star"></i>'.repeat(rating)}
            ${'<i class="far fa-star"></i>'.repeat(5 - rating)}
          </div>
        </div>
      </div>
    `;
    
    cardsContainer.appendChild(card);
  });
  
  // Remove existing table if present
  const existingTable = testimonialsContainer.querySelector('.table-container');
  if (existingTable) {
    existingTable.remove();
  }
  
  // Add cards container
  testimonialsContainer.appendChild(cardsContainer);
}

function loadContactSection(xml) {
  const contact = xml.querySelector('contact');
  if (!contact) return;
  
  // Set contact info
  setElementText('#contact-email', getXmlText(contact, 'email'));
  setElementText('#contact-phone', getXmlText(contact, 'phone'));
  
  // Load social links
  loadSocialLinks(contact.querySelectorAll('social link'), '#contact-social');
}

// ========================
// CONTACT FORM HANDLING
// ========================

function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalBtnText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    try {
      // Validate form
      if (!validateContactForm(formData)) {
        return;
      }
      
      // Send data to server
      const response = await fetch('https://your-server-endpoint.com/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          subject: formData.get('subject'),
          message: formData.get('message')
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        showFormFeedback('success', 'Message sent successfully!');
        contactForm.reset();
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      showFormFeedback('error', error.message || 'Failed to send message. Please try again later.');
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

function validateContactForm(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  
  // Reset previous error states
  document.querySelectorAll('.form-error').forEach(el => el.remove());
  
  let isValid = true;
  
  // Name validation
  if (!name || name.trim().length < 2) {
    showFieldError('name', 'Please enter your full name');
    isValid = false;
  }
  
  // Email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('email', 'Please enter a valid email address');
    isValid = false;
  }
  
  // Message validation
  if (!message || message.trim().length < 10) {
    showFieldError('message', 'Message must be at least 10 characters');
    isValid = false;
  }
  
  return isValid;
}

function showFieldError(fieldName, message) {
  const field = document.querySelector(`[name="${fieldName}"]`);
  if (!field) return;
  
  const formGroup = field.closest('.form-group');
  if (!formGroup) return;
  
  // Remove existing error if any
  const existingError = formGroup.querySelector('.form-error');
  if (existingError) existingError.remove();
  
  // Add error message
  const errorElement = document.createElement('div');
  errorElement.className = 'form-error';
  errorElement.textContent = message;
  formGroup.appendChild(errorElement);
  
  // Highlight field
  field.classList.add('error');
  field.addEventListener('input', function clearError() {
    field.classList.remove('error');
    errorElement.remove();
    field.removeEventListener('input', clearError);
  }, { once: true });
}

function showFormFeedback(type, message) {
  // Remove existing feedback if any
  const existingFeedback = document.querySelector('.form-feedback');
  if (existingFeedback) existingFeedback.remove();
  
  // Create feedback element
  const feedback = document.createElement('div');
  feedback.className = `form-feedback ${type}`;
  
  // Add appropriate icon
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  feedback.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;
  
  // Insert before form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.parentNode.insertBefore(feedback, contactForm);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      feedback.classList.add('fade-out');
      setTimeout(() => feedback.remove(), 500);
    }, 5000);
  }
}

// =====================
// UTILITY FUNCTIONS
// =====================

function getXmlText(parent, selector) {
  const element = parent.querySelector(selector);
  return element ? element.textContent.trim() : '';
}

function setElementText(selector, text) {
  const element = document.querySelector(selector);
  if (element && text) element.textContent = text;
}

function setElementAttribute(selector, attr, value) {
  const element = document.querySelector(selector);
  if (element && value) element.setAttribute(attr, value);
}

function loadSocialLinks(links, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container || !links) return;
  
  container.innerHTML = '';
  
  links.forEach(link => {
    const url = link.getAttribute('url');
    const platform = link.textContent.trim().toLowerCase();
    
    if (!url) return;
    
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.title = platform;
    
    // Set appropriate icon based on platform
    let iconClass;
    switch(platform) {
      case 'facebook': iconClass = 'fab fa-facebook-f'; break;
      case 'twitter': iconClass = 'fab fa-twitter'; break;
      case 'instagram': iconClass = 'fab fa-instagram'; break;
      case 'linkedin': iconClass = 'fab fa-linkedin-in'; break;
      case 'github': iconClass = 'fab fa-github'; break;
      case 'tiktok': iconClass = 'fab fa-tiktok'; break;
      default: iconClass = 'fas fa-share';
    }
    
    a.innerHTML = `<i class="${iconClass}"></i>`;
    container.appendChild(a);
  });
}

function getServiceIcon(service) {
  if (!service) return 'fas fa-cog';
  
  const serviceLower = service.toLowerCase();
  if (serviceLower.includes('web')) return 'fas fa-laptop-code';
  if (serviceLower.includes('mobile')) return 'fas fa-mobile-alt';
  if (serviceLower.includes('design')) return 'fas fa-paint-brush';
  if (serviceLower.includes('seo')) return 'fas fa-search';
  if (serviceLower.includes('consult')) return 'fas fa-comments';
  return 'fas fa-star';
}

function getSkillIcon(skill) {
  const skillLower = skill.toLowerCase();
  if (skillLower.includes('html')) return 'fab fa-html5';
  if (skillLower.includes('css')) return 'fab fa-css3-alt';
  if (skillLower.includes('js') || skillLower.includes('javascript')) return 'fab fa-js';
  if (skillLower.includes('team')) return 'fas fa-users';
  if (skillLower.includes('time')) return 'fas fa-clock';
  if (skillLower.includes('creativ')) return 'fas fa-lightbulb';
  if (skillLower.includes('epas')) return 'fas fa-bolt';      // EPAS icon
  if (skillLower.includes('bpp')) return 'fas fa-cogs';       // BPP icon
  return 'fas fa-check';
}

function getTalentIcon(talent) {
  const talentLower = talent.toLowerCase();
  if (talentLower.includes('design')) return 'fas fa-paint-brush';
  if (talentLower.includes('sing')) return 'fas fa-music';
  if (talentLower.includes('conflict')) return 'fas fa-handshake';
  if (talentLower.includes('mentor')) return 'fas fa-hands-helping';
  return 'fas fa-star';
}

// =====================
// ANIMATIONS & INTERACTIVITY
// =====================

function initializeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.querySelector('.menu-toggle');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (!sidebar || !menuToggle) return;
  
  // Toggle sidebar on menu button click
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    menuToggle.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
  });
  
  // Close sidebar when clicking overlay
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    menuToggle.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  });
  
  // Close sidebar when clicking a link (mobile)
  document.querySelectorAll('#sidebar a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 992) {
        sidebar.classList.remove('active');
        menuToggle.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
}

function setupEventListeners() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Contact form handling
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'success-message';
      successMsg.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <p>Message sent successfully!</p>
      `;
      document.body.appendChild(successMsg);
      
      // Animate in
      setTimeout(() => {
        successMsg.classList.add('show');
        
        // Remove after animation
        setTimeout(() => {
          successMsg.remove();
          this.reset();
        }, 3000);
      }, 100);
    });
  }
  
  // Location click handler
  const locationElement = document.getElementById('location');
  if (locationElement) {
    locationElement.addEventListener('click', () => {
      const locationText = locationElement.querySelector('span')?.textContent;
      if (locationText) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`, '_blank');
      }
    });
  }
}

function setupScrollAnimations() {
  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, { threshold: 0.1 });

  // Observe all sections and cards
  document.querySelectorAll('section, .card, .service-card, table tr').forEach(el => {
    observer.observe(el);
  });
  
  // Highlight active sidebar link based on scroll position
  const sections = document.querySelectorAll('section');
  const sidebarLinks = document.querySelectorAll('#sidebar a');
  
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (pageYOffset >= sectionTop - sectionHeight / 3) {
        current = section.getAttribute('id');
      }
    });
    
    sidebarLinks.forEach(link => {
      link.parentElement.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.parentElement.classList.add('active');
      }
    });
  });
  
  // Add visibility observer for sections
  document.querySelectorAll('section').forEach(section => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) section.classList.add('visible');
      },
      { threshold: 0.15 }
    );
    observer.observe(section);
  });
}

function startTypeWriter() {
  const taglineElement = document.getElementById('tagline');
  if (!taglineElement) return;

  const phrases = [
    "Coding my way to the future!",
    "Passionate web developer",
    "Creating digital experiences",
    "Turning ideas into reality"
  ];
  
  let currentPhrase = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  let text = '';
  
  function type() {
    const fullText = phrases[currentPhrase];
    
    if (isDeleting) {
      text = fullText.substring(0, text.length - 1);
      typingSpeed = 50;
    } else {
      text = fullText.substring(0, text.length + 1);
      typingSpeed = 100;
    }
    
    taglineElement.textContent = text;
    
    if (!isDeleting && text === fullText) {
      typingSpeed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && text === '') {
      isDeleting = false;
      currentPhrase = (currentPhrase + 1) % phrases.length;
      typingSpeed = 500; // Pause before typing next
    }
    
    setTimeout(type, typingSpeed);
  }
  
  // Start typing after a short delay
  setTimeout(type, 1000);
}

function animateTagline(text) {
  const taglineElement = document.getElementById('tagline');
  if (!taglineElement || !text) return;
  let i = 0;
  let isDeleting = false;

  function type() {
    if (!isDeleting) {
      taglineElement.textContent = text.substring(0, i + 1);
      i++;
      if (i < text.length) {
        setTimeout(type, 60);
      } else {
        setTimeout(() => {
          isDeleting = true;
          setTimeout(type, 1200); // Pause before deleting
        }, 600);
      }
    } else {
      taglineElement.textContent = text.substring(0, i - 1);
      i--;
      if (i > 0) {
        setTimeout(type, 40);
      } else {
        isDeleting = false;
        setTimeout(type, 600); // Pause before typing again
      }
    }
  }
  type();
}

function showErrorState(error) {
  const loadingOverlay = document.querySelector('.loading-overlay');
  if (!loadingOverlay) return;
  
  loadingOverlay.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <h3>Error Loading Portfolio</h3>
      <p>${error.message || 'Failed to load portfolio data. Please try again later.'}</p>
      <button class="retry-btn" onclick="window.location.reload()">
        <i class="fas fa-sync-alt"></i> Try Again
      </button>
    </div>
  `;
}