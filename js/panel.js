// Authentication Configuration
const AUTH_CONFIG = {
  username: 'admin',
  password: 'admin123'
};

// Utility functions
function el(q, ns=document){return ns.querySelector(q)}
function elA(q, ns=document){return Array.from(ns.querySelectorAll(q))}

let currentData = { site: {}, projects: [], stats: [], services: [], settings: {} };
let logoDataUrl = '';
let editingProjectIndex = null;
let editingServiceIndex = null;
let editingStatIndex = null;
let isAuthenticated = false;

// Check authentication on page load
function checkAuth() {
  const token = localStorage.getItem('elgml_auth_token');
  if (token === 'authenticated') {
    isAuthenticated = true;
    showPanel();
  } else {
    showLogin();
  }
}

// Show login screen
function showLogin() {
  el('#loginScreen').classList.remove('hidden');
  el('#panelContent').style.display = 'none';
  el('#logoutBtn').style.display = 'none';
  isAuthenticated = false;
}

// Show panel content
function showPanel() {
  el('#loginScreen').classList.add('hidden');
  el('#panelContent').style.display = 'block';
  el('#logoutBtn').style.display = 'block';
  isAuthenticated = true;
  load();
}

// Handle login
function handleLogin(e) {
  e.preventDefault();
  
  const username = el('#loginUsername').value.trim();
  const password = el('#loginPassword').value.trim();
  const errorEl = el('#loginError');
  
  if (username === AUTH_CONFIG.username && password === AUTH_CONFIG.password) {
    localStorage.setItem('elgml_auth_token', 'authenticated');
    errorEl.classList.remove('show');
    showPanel();
  } else {
    errorEl.textContent = '❌ اسم المستخدم أو كلمة المرور غير صحيحة';
    errorEl.classList.add('show');
    el('#loginPassword').value = '';
  }
}

// Handle logout
function handleLogout() {
  if (confirm('هل تريد تسجيل الخروج؟')) {
    localStorage.removeItem('elgml_auth_token');
    el('#loginUsername').value = '';
    el('#loginPassword').value = '';
    el('#loginError').classList.remove('show');
    showLogin();
  }
}

// Render logo preview
function renderLogo() {
  const preview = el('#logoPreview');
  if (logoDataUrl) {
    preview.innerHTML = `<img src="${logoDataUrl}" alt="الشعار" style="max-width:180px;max-height:90px;display:block;">`;
  } else {
    preview.innerHTML = '<span style="opacity:0.6;">لا يوجد شعار حالي</span>';
  }
}

// Save logo
function saveLogo() {
  if (logoDataUrl) {
    if (!currentData.site) currentData.site = {};
    currentData.site.logo = logoDataUrl;
    if (!currentData.settings) currentData.settings = {};
    showSuccess('تم حفظ الشعار بنجاح');
    localStorage.setItem('elgml_site_logo', logoDataUrl);
    // Save complete data
    localStorage.setItem('elgml_backup', JSON.stringify(currentData));
  } else {
    alert('يرجى اختيار صورة شعار أولاً');
  }
}

// Load data from localStorage first, then from content.json
async function load() {
  try {
    // Try to load from localStorage first (saved data)
    const savedData = localStorage.getItem('elgml_backup');
    if (savedData) {
      try {
        currentData = JSON.parse(savedData);
      } catch(e) {
        // If localStorage is corrupted, load from content.json
        const res = await fetch('data/content.json', {cache: 'no-store'});
        currentData = await res.json();
      }
    } else {
      // If no saved data, load from content.json
      const res = await fetch('data/content.json', {cache: 'no-store'});
      currentData = await res.json();
      // Save it to localStorage for next time
      localStorage.setItem('elgml_backup', JSON.stringify(currentData));
    }
    
    el('#brand').value = currentData.site.brand || 'Elgml';
    el('#lead').value = currentData.site.lead || '';
    el('#email').value = currentData.site.email || '';
    // Load logo
    logoDataUrl = currentData.site.logo || '';
    renderLogo();

    // Handle logo file input
    el('#logoInput').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        logoDataUrl = evt.target.result;
        renderLogo();
      };
      reader.readAsDataURL(file);
    });
    
    // Load settings
    const settings = currentData.settings || {};
    el('#colorPrimary').value = settings.colors?.primary || '#ff6b6b';
    el('#colorSecondary').value = settings.colors?.secondary || '#4ecdc4';
    el('#colorDark').value = settings.colors?.dark || '#0a0e27';
    
    el('#aboutTitle').value = settings.pages?.aboutTitle || 'عني';
    el('#aboutText1').value = settings.pages?.aboutText1 || '';
    el('#aboutText2').value = settings.pages?.aboutText2 || '';
    el('#servicesTitle').value = settings.pages?.servicesTitle || 'الخدمات';
    el('#portfolioTitle').value = settings.pages?.portfolioTitle || 'أحدث الأعمال';
    el('#contactTitle').value = settings.pages?.contactTitle || 'تواصل معي';
    
    el('#seoTitle').value = settings.seo?.title || 'Elgml - صوت احترافي';
    el('#seoDescription').value = settings.seo?.description || '';
    el('#seoKeywords').value = settings.seo?.keywords || '';
    
    el('#show3dBackground').checked = settings.features?.show3dBackground !== false;
    el('#showStats').checked = settings.features?.showStats !== false;
    el('#showServices').checked = settings.features?.showServices !== false;
    el('#showPortfolio').checked = settings.features?.showPortfolio !== false;
    el('#animationsEnabled').checked = settings.features?.animationsEnabled !== false;
    
    // Load contact info
    const contact = settings.contact || {};
    el('#contactEmail').value = contact.email || currentData.site.email || '';
    el('#contactWhatsapp').value = contact.whatsapp || '';
    el('#contactInstagram').value = contact.instagram || '';
    el('#contactTwitter').value = contact.twitter || '';
    el('#contactYoutube').value = contact.youtube || '';
    
    // Load stats from settings
    currentData.stats = settings.stats || [];
    
    // Load services from settings
    currentData.services = settings.services || [];
    
    renderProjects();
    renderServices();
    renderStats();
    updateStats();
  } catch(e){
    console.error('Error loading data:', e);
    currentData = { 
      site: { brand: 'Elgml', lead: '', email: '' }, 
      projects: [],
      settings: {}
    };
    updateStats();
  }
}

// Update statistics display
function updateStats() {
  const statsHtml = `
    <div class="stat-card">
      <div class="stat-number">${currentData.projects.length}</div>
      <div class="stat-label">عدد المشاريع</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${currentData.site.brand ? '✓' : '✕'}</div>
      <div class="stat-label">البراند محدّد</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${currentData.site.email ? '✓' : '✕'}</div>
      <div class="stat-label">البريد محدّد</div>
    </div>
  `;
  el('#statsRow').innerHTML = statsHtml;
}

// Render projects list
function renderProjects() {
  const list = el('#projects-list');
  const empty = el('#emptyProjects');
  
  if (currentData.projects.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  
  empty.style.display = 'none';
  list.innerHTML = currentData.projects.map((p, idx) => `
    <div class="project-item">
      <div class="project-header">
        <div>
          <h3 style="color: var(--light); margin-bottom: 5px;">${escapeHtml(p.title)}</h3>
          <p class="project-index">المشروع #${idx + 1}</p>
        </div>
        <div class="project-actions">
          <button class="btn btn-small btn-secondary" onclick="editProject(${idx})">✏️ تعديل</button>
          <button class="btn btn-small btn-danger" onclick="deleteProject(${idx})">🗑️ حذف</button>
        </div>
      </div>
      <p style="opacity: 0.8; font-size: 0.9rem; margin-bottom: 10px;">${escapeHtml(p.description)}</p>
      <p style="opacity: 0.6; font-size: 0.85rem;">
        📹 ${escapeHtml(p.video)} | 🖼️ ${escapeHtml(p.poster)}
      </p>
    </div>
  `).join('');
}

// Render services list
function renderServices() {
  const list = el('#services-list');
  const empty = el('#emptyServices');
  
  if (!currentData.services || currentData.services.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  
  empty.style.display = 'none';
  list.innerHTML = currentData.services.map((s, idx) => `
    <div class="project-item">
      <div class="project-header">
        <div>
          <h3 style="color: var(--light); margin-bottom: 5px;">${s.icon || '✨'} ${escapeHtml(s.title)}</h3>
          <p class="project-index">الخدمة #${idx + 1}</p>
        </div>
        <div class="project-actions">
          <button class="btn btn-small btn-secondary" onclick="editService(${idx})">✏️ تعديل</button>
          <button class="btn btn-small btn-danger" onclick="deleteService(${idx})">🗑️ حذف</button>
        </div>
      </div>
      <p style="opacity: 0.8; font-size: 0.9rem;">${escapeHtml(s.description)}</p>
    </div>
  `).join('');
}

// Render stats list
function renderStats() {
  const list = el('#stats-list');
  const empty = el('#emptyStats');
  
  if (!currentData.stats || currentData.stats.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  
  empty.style.display = 'none';
  list.innerHTML = currentData.stats.map((s, idx) => `
    <div class="project-item">
      <div class="project-header">
        <div>
          <h3 style="color: var(--light); margin-bottom: 5px;">📊 ${escapeHtml(s.number)}</h3>
          <p class="project-index">${escapeHtml(s.label)}</p>
        </div>
        <div class="project-actions">
          <button class="btn btn-small btn-secondary" onclick="editStat(${idx})">✏️ تعديل</button>
          <button class="btn btn-small btn-danger" onclick="deleteStat(${idx})">🗑️ حذف</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Get and save site metadata
function saveSiteMeta() {
  if (!currentData.site) currentData.site = {};
  if (!currentData.settings) currentData.settings = {};
  
  currentData.site.brand = el('#brand').value;
  currentData.site.lead = el('#lead').value;
  currentData.site.email = el('#email').value;
  // logo is handled separately
  updateStats();
  showSuccess('تم حفظ بيانات الموقع');
  // Save to localStorage - complete data
  localStorage.setItem('elgml_backup', JSON.stringify(currentData));
  localStorage.setItem('elgml_site_meta', JSON.stringify(currentData.site));
  // Force the site to reload
  if (window.location.pathname.includes('panel')) {
    // On panel, just show success
  }
}

// Save settings
function saveSettings() {
  if (!currentData.settings) currentData.settings = {};
  if (!currentData.site) currentData.site = {};
  if (!currentData.projects) currentData.projects = [];
  
  currentData.settings.colors = {
    primary: el('#colorPrimary').value,
    secondary: el('#colorSecondary').value,
    dark: el('#colorDark').value
  };
  currentData.settings.pages = {
    aboutTitle: el('#aboutTitle').value,
    aboutText1: el('#aboutText1').value,
    aboutText2: el('#aboutText2').value,
    servicesTitle: el('#servicesTitle').value,
    portfolioTitle: el('#portfolioTitle').value,
    contactTitle: el('#contactTitle').value
  };
  currentData.settings.seo = {
    title: el('#seoTitle').value,
    description: el('#seoDescription').value,
    keywords: el('#seoKeywords').value
  };
  currentData.settings.features = {
    show3dBackground: el('#show3dBackground').checked,
    showStats: el('#showStats').checked,
    showServices: el('#showServices').checked,
    showPortfolio: el('#showPortfolio').checked,
    animationsEnabled: el('#animationsEnabled').checked
  };
  
  // CRITICAL: Ensure stats, services and contact are always in settings
  currentData.settings.stats = currentData.stats || [];
  currentData.settings.services = currentData.services || [];
  currentData.settings.contact = currentData.settings.contact || {};
  
  showSuccess('تم حفظ الإعدادات بنجاح!');
  
  // Save COMPLETE data structure
  const completeData = {
    site: currentData.site,
    projects: currentData.projects,
    settings: currentData.settings
  };
  localStorage.setItem('elgml_backup', JSON.stringify(completeData));
  localStorage.setItem('elgml_settings', JSON.stringify(currentData.settings));
  localStorage.setItem('elgml_site_meta', JSON.stringify(currentData.site));
}
}

// Open project modal for adding new project
function openProjectModal(index) {
  editingProjectIndex = index;
  const modal = el('#projectModal');
  const title = el('#modalTitle');
  
  if (index === null) {
    title.textContent = '➕ أضف مشروع جديد';
    el('#projectTitle').value = '';
    el('#projectDesc').value = '';
    el('#projectVideo').value = '';
    el('#projectPoster').value = '';
  } else {
    const p = currentData.projects[index];
    title.textContent = '✏️ تعديل المشروع';
    el('#projectTitle').value = p.title || '';
    el('#projectDesc').value = p.description || '';
    el('#projectVideo').value = p.video || '';
    el('#projectPoster').value = p.poster || '';
  }
  
  modal.classList.add('active');
}

// Close project modal
function closeProjectModal() {
  el('#projectModal').classList.remove('active');
  editingProjectIndex = null;
}

// Save project
function saveProject() {
  const title = el('#projectTitle').value.trim();
  const desc = el('#projectDesc').value.trim();
  const video = el('#projectVideo').value.trim();
  const poster = el('#projectPoster').value.trim();
  
  if (!title || !desc || !video || !poster) {
    alert('⚠️ يجب ملء جميع الحقول');
    return;
  }
  
  const videoPath = video.includes('/') ? video : `videos/${video}.mp4`;
  const posterPath = poster.includes('/') ? poster : `images/${poster}.jpg`;
  
  const project = {
    id: Date.now().toString(),
    title,
    description: desc,
    video: videoPath,
    poster: posterPath
  };
  
  if (editingProjectIndex !== null) {
    project.id = currentData.projects[editingProjectIndex].id;
    currentData.projects[editingProjectIndex] = project;
  } else {
    currentData.projects.push(project);
  }
  
  renderProjects();
  updateStats();
  closeProjectModal();
  showSuccess('تم حفظ المشروع بنجاح');
  localStorage.setItem('elgml_projects', JSON.stringify(currentData.projects));
  localStorage.setItem('elgml_backup', JSON.stringify(currentData));
}

// Edit project
function editProject(index) {
  openProjectModal(index);
}

// Delete project
function deleteProject(index) {
  if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
    currentData.projects.splice(index, 1);
    renderProjects();
    updateStats();
    showSuccess('تم حذف المشروع');
    localStorage.setItem('elgml_projects', JSON.stringify(currentData.projects));
    localStorage.setItem('elgml_backup', JSON.stringify(currentData));
  }
}

// Service management functions
function openServiceModal(index) {
  editingServiceIndex = index;
  const modal = el('#serviceModal');
  const title = el('#serviceModalTitle');
  
  if (index === null) {
    title.textContent = '➕ أضف خدمة جديدة';
    el('#serviceTitle').value = '';
    el('#serviceDesc').value = '';
    el('#serviceIcon').value = '✨';
  } else {
    const s = currentData.services[index];
    title.textContent = '✏️ تعديل الخدمة';
    el('#serviceTitle').value = s.title || '';
    el('#serviceDesc').value = s.description || '';
    el('#serviceIcon').value = s.icon || '✨';
  }
  
  modal.classList.add('active');
}

function closeServiceModal() {
  el('#serviceModal').classList.remove('active');
  editingServiceIndex = null;
}

function saveService() {
  const title = el('#serviceTitle').value.trim();
  const desc = el('#serviceDesc').value.trim();
  const icon = el('#serviceIcon').value.trim() || '✨';
  
  if (!title || !desc) {
    alert('⚠️ يجب ملء جميع الحقول');
    return;
  }
  
  const service = {
    id: Date.now().toString(),
    title,
    description: desc,
    icon
  };
  
  if (!currentData.services) currentData.services = [];
  if (!currentData.settings) currentData.settings = {};
  if (!currentData.settings.services) currentData.settings.services = [];
  
  if (editingServiceIndex !== null) {
    service.id = currentData.services[editingServiceIndex].id;
    currentData.services[editingServiceIndex] = service;
  } else {
    currentData.services.push(service);
  }
  
  // Also update in settings
  currentData.settings.services = currentData.services;
  
  renderServices();
  closeServiceModal();
  showSuccess('تم حفظ الخدمة بنجاح');
  localStorage.setItem('elgml_services', JSON.stringify(currentData.services));
  localStorage.setItem('elgml_backup', JSON.stringify(currentData));
}

function editService(index) {
  openServiceModal(index);
}

function deleteService(index) {
  if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
    currentData.services.splice(index, 1);
    if (!currentData.settings) currentData.settings = {};
    currentData.settings.services = currentData.services;
    renderServices();
    showSuccess('تم حذف الخدمة');
    localStorage.setItem('elgml_services', JSON.stringify(currentData.services));
    localStorage.setItem('elgml_backup', JSON.stringify(currentData));
  }
}

// Stat management functions
function openStatModal(index) {
  editingStatIndex = index;
  const modal = el('#statModal');
  const title = el('#statModalTitle');
  
  if (index === null) {
    title.textContent = '➕ أضف إحصائية جديدة';
    el('#statNumber').value = '';
    el('#statLabel').value = '';
  } else {
    const s = currentData.stats[index];
    title.textContent = '✏️ تعديل الإحصائية';
    el('#statNumber').value = s.number || '';
    el('#statLabel').value = s.label || '';
  }
  
  modal.classList.add('active');
}

function closeStatModal() {
  el('#statModal').classList.remove('active');
  editingStatIndex = null;
}

function saveStat() {
  const number = el('#statNumber').value.trim();
  const label = el('#statLabel').value.trim();
  
  if (!number || !label) {
    alert('⚠️ يجب ملء جميع الحقول');
    return;
  }
  
  const stat = {
    id: Date.now().toString(),
    number,
    label
  };
  
  if (!currentData.stats) currentData.stats = [];
  if (!currentData.settings) currentData.settings = {};
  if (!currentData.settings.stats) currentData.settings.stats = [];
  
  if (editingStatIndex !== null) {
    stat.id = currentData.stats[editingStatIndex].id;
    currentData.stats[editingStatIndex] = stat;
  } else {
    currentData.stats.push(stat);
  }
  
  // Also update in settings
  currentData.settings.stats = currentData.stats;
  
  renderStats();
  closeStatModal();
  showSuccess('تم حفظ الإحصائية بنجاح');
  localStorage.setItem('elgml_stats', JSON.stringify(currentData.stats));
  localStorage.setItem('elgml_backup', JSON.stringify(currentData));
}

function editStat(index) {
  openStatModal(index);
}

function deleteStat(index) {
  if (confirm('هل أنت متأكد من حذف هذه الإحصائية؟')) {
    currentData.stats.splice(index, 1);
    if (!currentData.settings) currentData.settings = {};
    currentData.settings.stats = currentData.stats;
    renderStats();
    showSuccess('تم حذف الإحصائية');
    localStorage.setItem('elgml_stats', JSON.stringify(currentData.stats));
    localStorage.setItem('elgml_backup', JSON.stringify(currentData));
  }
}

// Save contact info
function saveContactInfo() {
  if (!currentData.settings) currentData.settings = {};
  if (!currentData.settings.contact) currentData.settings.contact = {};
  
  currentData.settings.contact = {
    email: el('#contactEmail').value.trim(),
    whatsapp: el('#contactWhatsapp').value.trim(),
    instagram: el('#contactInstagram').value.trim(),
    twitter: el('#contactTwitter').value.trim(),
    youtube: el('#contactYoutube').value.trim()
  };
  
  showSuccess('تم حفظ بيانات التواصل بنجاح');
  localStorage.setItem('elgml_contact', JSON.stringify(currentData.settings.contact));
  localStorage.setItem('elgml_backup', JSON.stringify(currentData));
}

// Show success message
function showSuccess(msg) {
  const msgEl = el('#successMessage');
  msgEl.textContent = '✓ ' + msg;
  msgEl.classList.add('show');
  setTimeout(() => msgEl.classList.remove('show'), 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(s){
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Build JSON object
function buildJSON() {
  saveSiteMeta();
  saveSettings();
  saveContactInfo();
  
  const settings = currentData.settings || {};
  settings.stats = currentData.stats || [];
  settings.services = currentData.services || [];
  
  return {
    site: currentData.site,
    projects: currentData.projects,
    settings: settings
  };
}

// Download JSON file
function downloadJSON() {
  saveSiteMeta();
  const data = buildJSON();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type:'application/json'}));
  a.download = 'content.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  showSuccess('تم تحميل content.json');
}

// Upload JSON file
function uploadJSON() {
  el('#jsonFileInput').click();
}

// Handle file upload
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      currentData = data;
      load();
      showSuccess('تم استيراد البيانات بنجاح');
    } catch(err) {
      alert('❌ خطأ في ملف JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// Backup data to localStorage
function backupData() {
  saveSiteMeta();
  localStorage.setItem('elgml_backup', JSON.stringify(buildJSON()));
  showSuccess('تم إنشاء نسخة احتياطية محلية');
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  const projectModal = el('#projectModal');
  const serviceModal = el('#serviceModal');
  const statModal = el('#statModal');
  
  if (e.target === projectModal) {
    closeProjectModal();
  }
  if (e.target === serviceModal) {
    closeServiceModal();
  }
  if (e.target === statModal) {
    closeStatModal();
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', checkAuth);
