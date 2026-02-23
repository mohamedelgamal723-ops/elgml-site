function el(q, ns=document){return ns.querySelector(q)}
function elA(q, ns=document){return Array.from(ns.querySelectorAll(q))}

async function load() {
  try {
    const res = await fetch('data/content.json', {cache: 'no-store'});
    const data = await res.json();
    el('#brand').value = data.site.brand || '';
    el('#lead').value = data.site.lead || '';
    el('#email').value = data.site.email || '';
    const list = el('#projects-list');
    list.innerHTML = '';
    (data.projects||[]).forEach(p => addProjectForm(p));
  } catch(e){
    console.error(e);
    // start empty
  }
}

function addProjectForm(p={id:Date.now().toString(),title:'',description:'',video:'videos/placeholder.mp4',poster:'videos/placeholder.jpg'}){
  const list = el('#projects-list');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label>عنوان</label><input class="proj-title" type="text" value="${escapeHtml(p.title)}">
    <label>وصف</label><textarea class="proj-desc">${escapeHtml(p.description)}</textarea>
    <label>مسار الفيديو</label><input class="proj-video" type="text" value="${escapeHtml(p.video)}">
    <label>مسار صورة الغلاف</label><input class="proj-poster" type="text" value="${escapeHtml(p.poster)}">
    <p><button class="remove btn" type="button" style="background:#7a2">حذف المشروع</button></p>
  `;
  list.appendChild(wrapper);
  wrapper.querySelector('.remove').addEventListener('click', ()=>wrapper.remove());
}

function escapeHtml(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function buildJSON(){
  const site = {brand:el('#brand').value,lead:el('#lead').value,email:el('#email').value};
  const projects = elA('#projects-list .field').map(f=>({
    id: Date.now().toString() + Math.random().toString(36).slice(2,6),
    title: f.querySelector('.proj-title').value,
    description: f.querySelector('.proj-desc').value,
    video: f.querySelector('.proj-video').value,
    poster: f.querySelector('.proj-poster').value
  }));
  return {site,projects};
}

function download(filename, text){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text],{type:'application/json'}));
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

document.addEventListener('DOMContentLoaded', ()=>{
  load();
  el('#add-project').addEventListener('click', ()=>addProjectForm());
  el('#download-json').addEventListener('click', ()=>{
    const out = buildJSON();
    download('content.json', JSON.stringify(out, null, 2));
    alert('تم تنزيل content.json. ادفعه إلى مجلد data في المستودع ليُعرض على الموقع.');
  });
});
