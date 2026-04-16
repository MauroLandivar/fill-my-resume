// ── Current language ───────────────────────────────────
let currentLang = 'en';

// ── Global toast ───────────────────────────────────────
const toastLabels = { en: 'Copied!', es: 'Copiado!', pt: 'Copiado!' };
let toastTimer = null;

function showToast(label) {
  const toast = document.getElementById('global-toast');
  const text  = document.getElementById('toast-text');
  if (!toast) return;
  text.textContent = label || toastLabels[currentLang];
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1400);
  lucide.createIcons({ nodes: [toast] });
}

function copyText(val, label) {
  if (!val) return;
  navigator.clipboard.writeText(val).then(() => showToast(label));
}

// ── Language switcher ──────────────────────────────────
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('[data-en]').forEach(el => {
      if (el.classList.contains('field-card')) return;
      el.textContent = el.dataset[currentLang] || el.dataset.en;
    });

    document.querySelectorAll('.field-card[data-en]').forEach(card => {
      card.dataset.copy = card.dataset[currentLang] || card.dataset.en;
    });

    document.querySelectorAll('.tag[data-en]').forEach(tag => {
      tag.textContent = tag.dataset[currentLang] || tag.dataset.en;
    });

    lucide.createIcons();
  });
});

// ── Click-to-copy on field cards ──────────────────────
function setupFieldCards() {
  document.querySelectorAll('.field-card').forEach(card => {
    if (card.style.cursor === 'default') return; // skip non-copyable cards (interview/AI)
    card.addEventListener('click', (e) => {
      if (e.target.closest('a, button, input, textarea, [contenteditable]')) return;
      const val = card.dataset.copy || card.querySelector('.field-value')?.textContent?.trim() || '';
      copyText(val);
    });
  });
}

// ── Click-to-copy on entry fields ────────────────────
function setupEntryFields() {
  document.querySelectorAll('.entry-field').forEach(field => {
    field.style.cursor = 'pointer';
    field.style.borderRadius = '8px';
    field.style.padding = '6px';
    field.style.margin = '-6px';
    field.style.transition = 'background 0.15s ease';

    field.addEventListener('mouseenter', () => { field.style.background = 'rgba(0,0,0,0.03)'; });
    field.addEventListener('mouseleave', () => { field.style.background = ''; });

    field.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const val = field.querySelector('.entry-field-value')?.textContent?.trim() || '';
      copyText(val);
    });
  });
}

// ── Date cells ────────────────────────────────────────
function setupDateCells() {
  document.querySelectorAll('.date-cell').forEach(cell => {
    cell.style.cursor = 'pointer';
    cell.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const val = cell.querySelector('.date-cell-value')?.textContent?.trim() || '';
      copyText(val);
      cell.style.background = '#DCFCE7';
      setTimeout(() => { cell.style.background = ''; }, 500);
    });
  });

  document.querySelectorAll('.date-copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyText(btn.dataset.value);
      const icon = btn.querySelector('i');
      icon.setAttribute('data-lucide', 'check');
      btn.classList.add('copied');
      lucide.createIcons({ nodes: [btn] });
      setTimeout(() => {
        icon.setAttribute('data-lucide', 'copy');
        btn.classList.remove('copied');
        lucide.createIcons({ nodes: [btn] });
      }, 1500);
    });
  });
}

// ── Tags ──────────────────────────────────────────────
function setupTags() {
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const val = tag.textContent.replace(/\s+/g, ' ').trim();
      copyText(val);
      tag.classList.add('copied');
      setTimeout(() => tag.classList.remove('copied'), 1500);
    });
  });
}

// ── Accordion toggle ──────────────────────────────────
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    trigger.closest('.accordion').classList.toggle('open');
  });
});

// ── Entry card toggle ─────────────────────────────────
document.querySelectorAll('.entry-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    trigger.closest('.entry-card').classList.toggle('open');
  });
});

// ── Company accordion toggle ──────────────────────────
function setupCompanyToggles() {
  document.querySelectorAll('.company-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.company-entry').classList.toggle('open');
    });
  });
}

// ── Company delete ────────────────────────────────────
function setupCompanyDelete() {
  document.querySelectorAll('.company-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!confirm('Remove this company from your tracker?')) return;
      btn.closest('.company-entry').remove();
      updateCompanyCount();
    });
  });
}

function updateCompanyCount() {
  const count = document.querySelectorAll('.company-entry').length;
  const el = document.getElementById('company-count');
  if (el) el.textContent = count;
}

// ── Add company ───────────────────────────────────────
let companyIdCounter = 10;

document.getElementById('add-company-btn')?.addEventListener('click', () => {
  companyIdCounter++;
  const id = companyIdCounter;
  const html = `
    <div class="company-entry open" data-id="${id}">
      <div class="company-trigger">
        <button class="company-toggle">
          <span class="entry-trigger-left">
            <i data-lucide="building-2" width="14" height="14" class="entry-icon"></i>
            <span>
              <div class="entry-title" contenteditable="true" spellcheck="false" style="outline:none;min-width:80px;">New Company — Role</div>
              <div class="entry-subtitle">Applied ${new Date().toLocaleDateString('en', {month:'short', year:'numeric'})}</div>
            </span>
          </span>
          <span class="company-trigger-right">
            <span class="status-badge-mini applied">Applied</span>
            <i data-lucide="chevron-down" width="14" height="14" class="entry-chevron"></i>
          </span>
        </button>
        <button class="company-delete-btn" data-id="${id}" title="Remove company">
          <i data-lucide="x" width="13" height="13"></i>
        </button>
      </div>
      <div class="company-body">
        <div class="field-card" style="cursor:default;">
          <span class="field-label">How much do I like this company?</span>
          <div class="star-rating" data-rating="0">
            <button class="star" data-value="1"><i data-lucide="star" width="18" height="18"></i></button>
            <button class="star" data-value="2"><i data-lucide="star" width="18" height="18"></i></button>
            <button class="star" data-value="3"><i data-lucide="star" width="18" height="18"></i></button>
            <button class="star" data-value="4"><i data-lucide="star" width="18" height="18"></i></button>
            <button class="star" data-value="5"><i data-lucide="star" width="18" height="18"></i></button>
          </div>
        </div>
        <div class="field-card" style="cursor:default;">
          <span class="field-label">Desired Salary</span>
          <div class="field-row">
            <div class="salary-display">
              <span class="salary-currency">USD</span>
              <span class="salary-value" contenteditable="true" spellcheck="false">0 / month</span>
            </div>
          </div>
          <div class="salary-hint">Click value to edit</div>
        </div>
        <div class="field-card" style="cursor:default;">
          <span class="field-label">Application Status</span>
          <div class="status-pills">
            <button class="status-pill active" data-status="applied">Applied</button>
            <button class="status-pill" data-status="interview">Interview</button>
            <button class="status-pill" data-status="offer">Offer</button>
            <button class="status-pill" data-status="rejected">Rejected</button>
          </div>
        </div>
        <div class="field-card notes-card" style="cursor:default;">
          <span class="field-label">Notes & Company Details</span>
          <textarea class="notes-textarea" placeholder="Company notes, hiring manager, salary range, questions to ask..."></textarea>
        </div>
      </div>
    </div>`;

  const list = document.getElementById('company-list');
  const addBtn = document.getElementById('add-company-btn');
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const entry = wrapper.firstElementChild;
  list.insertBefore(entry, addBtn);

  // Wire up new entry
  entry.querySelector('.company-toggle').addEventListener('click', () => entry.classList.toggle('open'));
  entry.querySelector('.company-delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (!confirm('Remove this company?')) return;
    entry.remove();
    updateCompanyCount();
  });
  setupStarRating(entry);
  setupStatusPills(entry);
  lucide.createIcons({ nodes: [entry] });
  updateCompanyCount();
});

// ── Star rating ───────────────────────────────────────
function setupStarRating(scope) {
  const root = scope || document;
  root.querySelectorAll('.star-rating').forEach(container => {
    const stars = container.querySelectorAll('.star');
    let current = parseInt(container.dataset.rating) || 0;
    const paint = n => stars.forEach((s, i) => s.classList.toggle('active', i < n));
    paint(current);
    stars.forEach((star, idx) => {
      star.addEventListener('mouseenter', () => paint(idx + 1));
      star.addEventListener('mouseleave', () => paint(current));
      star.addEventListener('click', () => { current = idx + 1; paint(current); });
    });
  });
}

// ── Status pills ──────────────────────────────────────
function setupStatusPills(scope) {
  const root = scope || document;
  root.querySelectorAll('.status-pills').forEach(group => {
    group.querySelectorAll('.status-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        group.querySelectorAll('.status-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        // Update status badge in company header
        const entry = group.closest('.company-entry');
        if (entry) {
          const badge = entry.querySelector('.status-badge-mini');
          if (badge) {
            badge.className = 'status-badge-mini ' + pill.dataset.status;
            badge.textContent = pill.textContent;
          }
        }
      });
    });
  });
}

// ── Job URL open link ─────────────────────────────────
document.getElementById('job-url')?.addEventListener('input', (e) => {
  const link = document.getElementById('job-url-open');
  if (link) link.href = e.target.value || '#';
});

// ── Generate AI response (mock) ───────────────────────
document.getElementById('generate-btn')?.addEventListener('click', () => {
  const question = document.getElementById('ai-question').value.trim();
  const responseEl = document.getElementById('ai-response-text');
  const block = document.getElementById('ai-response-block');
  if (!question) { alert('Please enter a question first.'); return; }

  const btn = document.getElementById('generate-btn');
  btn.textContent = 'Generating...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = '<i data-lucide="sparkles" width="14" height="14"></i> Generate response';
    btn.disabled = false;
    lucide.createIcons({ nodes: [btn] });

    responseEl.value = `Based on your CV and the job description, here's a tailored response:

"${generateMockResponse(question)}"

— Tailored to your profile · Matches your writing style`;
    block.style.display = 'flex';
    block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 1200);
});

function generateMockResponse(question) {
  const q = question.toLowerCase();
  if (q.includes('prioriti')) return 'My prioritization process starts with discovery — I combine customer interviews with usage data to identify the highest-impact pain points. At Viva, I used this approach to lead 6 product launches that added $20k+/month in revenue. I typically score opportunities by Impact × Effort, aligned to OKRs, and validate with small tests before committing resources.';
  if (q.includes('fit') || q.includes('why')) return 'I believe I\'m a strong fit because my 7+ years span both the strategic (Brand Management) and execution (Product Ownership) sides of the role. At Viva, I owned $5M/month in revenue end-to-end — not just roadmaps, but real business outcomes. I\'m energized by companies that measure success in outcomes, not outputs.';
  if (q.includes('conflict') || q.includes('stakeholder')) return 'I lead with data and empathy. When stakeholders disagree, I surface the underlying goals behind each position and find the shared objective. At Viva, I navigated conflicts between Sales, Tech, and Finance by creating a shared scoring model — everyone could see the trade-offs clearly, which turned debates into decisions.';
  if (q.includes('motivo') || q.includes('work') || q.includes('join')) return 'What draws me to this company is the combination of a clear product vision and a culture that seems to value deep customer understanding. I want to work somewhere where discovery is treated as a discipline, not an afterthought — and everything I\'ve seen suggests that\'s how you operate.';
  return 'Drawing on my 7+ years of international experience across product and brand management, I would approach this by first ensuring I deeply understand the customer problem before proposing any solution. My track record at Viva demonstrates that this approach consistently delivers measurable results — including a 30% increase in digital payments and a <2% churn rate on a key B2B segment.';
}

// ── Copy AI response ──────────────────────────────────
document.getElementById('copy-response-btn')?.addEventListener('click', () => {
  const text = document.getElementById('ai-response-text').value;
  copyText(text, 'Response copied!');
});

// ── AI response block hidden initially ────────────────
document.getElementById('ai-response-block').style.display = 'none';

// ── Profile photo ─────────────────────────────────────
const avatarWrap        = document.getElementById('avatar-wrap');
const avatarImg         = document.getElementById('avatar-img');
const avatarPlaceholder = document.getElementById('avatar-placeholder');
const avatarInput       = document.getElementById('avatar-input');
const PHOTO_KEY         = 'fillmyresume_photo';

function showAvatar(dataUrl) {
  avatarImg.src = dataUrl;
  avatarImg.style.display = 'block';
  avatarPlaceholder.style.display = 'none';
  avatarWrap.classList.add('has-photo');
  avatarWrap.title = 'Download photo';
}

(function loadPhoto() {
  const saved = localStorage.getItem(PHOTO_KEY);
  if (saved) showAvatar(saved);
})();

avatarWrap.addEventListener('click', () => {
  if (avatarWrap.classList.contains('has-photo')) {
    // Download
    const a = document.createElement('a');
    a.href = avatarImg.src;
    a.download = 'profile-photo.jpg';
    a.click();
    showToast('Downloaded!');
  } else {
    avatarInput.click();
  }
});

avatarInput.addEventListener('change', () => {
  const file = avatarInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    localStorage.setItem(PHOTO_KEY, dataUrl);
    showAvatar(dataUrl);
    showToast('Photo saved!');
  };
  reader.readAsDataURL(file);
  avatarInput.value = '';
});

// ── Edit Profile ──────────────────────────────────────
const EDITABLE_SEL = '.field-value, .entry-field-value, .date-cell-value, .entry-title, .entry-subtitle';
const STORAGE_KEY  = 'fillmyresume_v1';

function saveToStorage() {
  const data = {};
  document.querySelectorAll(EDITABLE_SEL).forEach((el, i) => { data[i] = el.textContent.trim(); });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  let data;
  try { data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return; }
  if (!data) return;
  document.querySelectorAll(EDITABLE_SEL).forEach((el, i) => {
    const val = data[i];
    if (!val) return;
    el.textContent = val;
    const card = el.closest('.field-card');
    if (card) card.dataset.copy = val;
    const btn = el.closest('.entry-field-row, .date-cell-row')?.querySelector('[data-value]');
    if (btn) btn.dataset.value = val;
  });
}

let isEditMode = false;
const editProfileBtn = document.getElementById('edit-profile-btn');

editProfileBtn?.addEventListener('click', () => {
  if (!isEditMode) {
    isEditMode = true;
    document.body.classList.add('edit-mode');
    document.querySelectorAll(EDITABLE_SEL).forEach(el => { el.contentEditable = 'true'; el.spellcheck = false; });
    editProfileBtn.innerHTML = '<i data-lucide="check" width="14" height="14"></i> Save Profile';
    editProfileBtn.classList.add('saving');
    lucide.createIcons({ nodes: [editProfileBtn] });
  } else {
    isEditMode = false;
    document.body.classList.remove('edit-mode');
    document.querySelectorAll(EDITABLE_SEL).forEach(el => {
      el.contentEditable = 'false';
      const val = el.textContent.trim();
      const card = el.closest('.field-card');
      if (card) card.dataset.copy = val;
      const btn = el.closest('.entry-field-row, .date-cell-row')?.querySelector('[data-value]');
      if (btn) btn.dataset.value = val;
    });
    saveToStorage();
    editProfileBtn.innerHTML = '<i data-lucide="pencil" width="14" height="14"></i> Edit Profile';
    editProfileBtn.classList.remove('saving');
    lucide.createIcons({ nodes: [editProfileBtn] });
    showToast('Saved!');
  }
});

// ── Init ──────────────────────────────────────────────
lucide.createIcons();
loadFromStorage();
setupFieldCards();
setupEntryFields();
setupDateCells();
setupTags();
setupCompanyToggles();
setupCompanyDelete();
setupStarRating();
setupStatusPills();
