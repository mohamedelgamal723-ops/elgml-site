async function loadContent() {
  try {
    const res = await fetch('data/content.json', {cache: 'no-store'});
    const data = await res.json();
    document.querySelector('.brand').textContent = data.site.brand || 'Elgml';
    const lead = document.querySelector('.hero .lead');
    if (lead) lead.textContent = data.site.lead || lead.textContent;
    // contact email
    const contactLink = document.querySelector('#contact a[href^="mailto:"]');
    if (contactLink) contactLink.href = 'mailto:' + (data.site.email || '');

    const grid = document.getElementById('works-grid');
    grid.innerHTML = '';
    (data.projects || []).forEach(p => {
      const article = document.createElement('article');
      article.className = 'work';

      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      if (p.poster) video.poster = p.poster;
      const src = document.createElement('source');
      src.src = p.video || '';
      src.type = 'video/mp4';
      video.appendChild(src);
      article.appendChild(video);

      const h4 = document.createElement('h4');
      h4.textContent = p.title || '';
      article.appendChild(h4);
      const pdesc = document.createElement('p');
      pdesc.textContent = p.description || '';
      article.appendChild(pdesc);

      grid.appendChild(article);
    });
  } catch (err) {
    console.error('Failed to load content.json', err);
  }
}

document.addEventListener('DOMContentLoaded', loadContent);
