// Utility functions
function el(q, ns=document){return ns.querySelector(q)}
function elA(q, ns=document){return Array.from(ns.querySelectorAll(q))}

let currentData = { site: {}, projects: [] };
let editingProjectIndex = null;

// Load data from JSON
async function load() {
  try {
    const res = await fetch('data/content.json', {cache: 'no-store'});
    currentData = await res.json();
    
    el('#brand').value = currentData.site.brand || 'Elgml';
    el('#lead').value = currentData.site.lead || '';
    el('#email').value = currentData.site.email || '';
    
    renderProjects();
    updateStats();
  } catch(e){
    console.error('Error loading data:', e);
    currentData = { 
      site: { brand: 'Elgml', lead: '', email: '' }, 
      projects: [] 
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

// Get and save site metadata
function saveSiteMeta() {
  currentData.site = {
    brand: el('#brand').value,
    lead: el('#lead').value,
    email: el('#email').value
  };
  
  updateStats();
  showSuccess('تم حفظ بيانات الموقع');
  // Auto-save to localStorage as backup
  localStorage.setItem('elgml_site_meta', JSON.stringify(currentData));
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
  }
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
  return {
    site: currentData.site,
    projects: currentData.projects
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
  const modal = el('#projectModal');
  if (e.target === modal) {
    closeProjectModal();
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', load);
