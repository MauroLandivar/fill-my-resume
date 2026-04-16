const STORAGE_KEY  = 'fillmyresume_v1';
const PHOTO_KEY    = 'fillmyresume_photo';
const API_KEY_STORE = 'fillmyresume_apikey';

const SYSTEM_PROMPT = `You are an expert career coach helping a job seeker craft compelling,
personalized answers to interview questions and job application forms.
Your answers must:
- Sound natural and human — not robotic or generic
- Reference specific experiences and metrics from the provided CV when available
- Be concise (3-5 sentences unless asked for more)
- Match the language requested (en = English, es = Spanish, pt = Portuguese)
- Never mention that you are an AI
Respond ONLY with the answer text — no preamble, no labels, no quotes around the answer.`;

// ── AES-GCM encryption ─────────────────────────────────
async function encryptApiKey(apiKey) {
  const encKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, encKey, new TextEncoder().encode(apiKey));
  const rawKey = await crypto.subtle.exportKey('raw', encKey);
  return {
    enc: Array.from(new Uint8Array(encrypted)),
    iv:  Array.from(iv),
    k:   Array.from(new Uint8Array(rawKey)),
  };
}

async function decryptApiKey(stored) {
  const encKey = await crypto.subtle.importKey('raw', new Uint8Array(stored.k), { name: 'AES-GCM' }, false, ['decrypt']);
  const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(stored.iv) }, encKey, new Uint8Array(stored.enc));
  return new TextDecoder().decode(dec);
}

// ── Storage helpers ────────────────────────────────────
function storageGet(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}
function storageSet(obj) {
  return new Promise(resolve => chrome.storage.local.set(obj, resolve));
}

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
    if (card.style.cursor === 'default') return;
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

// ── Profile photo ─────────────────────────────────────
const avatarWrap        = document.getElementById('avatar-wrap');
const avatarImg         = document.getElementById('avatar-img');
const avatarPlaceholder = document.getElementById('avatar-placeholder');
const avatarInput       = document.getElementById('avatar-input');

function showAvatar(dataUrl) {
  avatarImg.src = dataUrl;
  avatarImg.style.display = 'block';
  avatarPlaceholder.style.display = 'none';
  avatarWrap.classList.add('has-photo');
  avatarWrap.title = 'Download photo';
}

avatarWrap.addEventListener('click', () => {
  if (avatarWrap.classList.contains('has-photo')) {
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
  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    await storageSet({ [PHOTO_KEY]: dataUrl });
    showAvatar(dataUrl);
    showToast('Photo saved!');
  };
  reader.readAsDataURL(file);
  avatarInput.value = '';
});

// ── CV data — save / load (chrome.storage.local) ──────
const EDITABLE_SEL = '.field-value, .entry-field-value, .date-cell-value, .entry-title, .entry-subtitle';

async function saveToStorage() {
  const data = {};
  document.querySelectorAll(EDITABLE_SEL).forEach((el, i) => { data[i] = el.textContent.trim(); });
  await storageSet({ [STORAGE_KEY]: data });
}

async function loadFromStorage() {
  const result = await storageGet([STORAGE_KEY, PHOTO_KEY]);

  const data = result[STORAGE_KEY];
  if (data) {
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

  if (result[PHOTO_KEY]) showAvatar(result[PHOTO_KEY]);
}

// ── Edit Profile ──────────────────────────────────────
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

// ── Build CV summary for AI ───────────────────────────
function buildCvSummary() {
  const lines = [];
  document.querySelectorAll('.field-card:not([style*="cursor:default"])').forEach(card => {
    const label = card.querySelector('.field-label')?.textContent?.trim();
    const value = card.dataset.copy || card.querySelector('.field-value')?.textContent?.trim();
    if (label && value) lines.push(`${label}: ${value}`);
  });
  document.querySelectorAll('.entry-field').forEach(field => {
    const label = field.querySelector('.entry-field-label')?.textContent?.trim();
    const value = field.querySelector('.entry-field-value')?.textContent?.trim();
    if (label && value) lines.push(`${label}: ${value}`);
  });
  return lines.join('\n');
}

// ── API key modal ─────────────────────────────────────
const apiKeyModal  = document.getElementById('api-key-modal');
const apiKeyBtn    = document.getElementById('api-key-btn');
const apiKeyInput  = document.getElementById('api-key-input');
const apiSaveBtn   = document.getElementById('api-modal-save');
const apiCancelBtn = document.getElementById('api-modal-cancel');
const apiError     = document.getElementById('api-modal-error');
const toggleVis    = document.getElementById('toggle-key-vis');

function openApiModal() {
  apiKeyModal.classList.remove('hidden');
  apiError.classList.add('hidden');
  apiKeyInput.focus();
  lucide.createIcons({ nodes: [apiKeyModal] });
}
function closeApiModal() { apiKeyModal.classList.add('hidden'); }

apiKeyBtn.addEventListener('click', openApiModal);
apiCancelBtn.addEventListener('click', closeApiModal);
apiKeyModal.addEventListener('click', (e) => { if (e.target === apiKeyModal) closeApiModal(); });

toggleVis.addEventListener('click', () => {
  const isPassword = apiKeyInput.type === 'password';
  apiKeyInput.type = isPassword ? 'text' : 'password';
  toggleVis.querySelector('i').setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
  lucide.createIcons({ nodes: [toggleVis] });
});

apiSaveBtn.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  if (!key.startsWith('sk-ant-')) {
    apiError.textContent = 'Invalid key format. It should start with "sk-ant-".';
    apiError.classList.remove('hidden');
    return;
  }
  apiSaveBtn.disabled = true;
  apiSaveBtn.textContent = 'Saving...';
  try {
    const encrypted = await encryptApiKey(key);
    await storageSet({ [API_KEY_STORE]: encrypted });
    apiKeyBtn.classList.add('connected');
    apiKeyBtn.title = 'AI connected — click to change key';
    apiKeyInput.value = '';
    closeApiModal();
    showToast('AI connected!');
  } catch {
    apiError.textContent = 'Failed to save key. Please try again.';
    apiError.classList.remove('hidden');
  } finally {
    apiSaveBtn.disabled = false;
    apiSaveBtn.innerHTML = '<i data-lucide="lock" width="13" height="13"></i> Save & connect';
    lucide.createIcons({ nodes: [apiSaveBtn] });
  }
});

async function getDecryptedKey() {
  const result = await storageGet([API_KEY_STORE]);
  if (!result[API_KEY_STORE]) return null;
  return await decryptApiKey(result[API_KEY_STORE]);
}

async function initApiKeyStatus() {
  const key = await getDecryptedKey();
  if (key) {
    apiKeyBtn.classList.add('connected');
    apiKeyBtn.title = 'AI connected — click to change key';
  }
}

// ── Generate AI response (direct to Claude) ───────────
document.getElementById('generate-btn')?.addEventListener('click', async () => {
  const question = document.getElementById('ai-question').value.trim();
  const writingSample = document.getElementById('writing-sample')?.value?.trim() || '';
  const responseEl = document.getElementById('ai-response-text');
  const block = document.getElementById('ai-response-block');
  if (!question) { alert('Please enter a question first.'); return; }

  const apiKey = await getDecryptedKey();
  if (!apiKey) {
    openApiModal();
    return;
  }

  const btn = document.getElementById('generate-btn');
  btn.textContent = 'Generating...';
  btn.disabled = true;

  try {
    const langNames = { en: 'English', es: 'Spanish', pt: 'Portuguese' };
    const cvSummary = buildCvSummary();
    let userMessage = `Language: ${langNames[currentLang] || 'English'}\n\n`;
    if (cvSummary)      userMessage += `CV / Profile summary:\n${cvSummary}\n\n`;
    if (writingSample)  userMessage += `Writing style sample:\n${writingSample}\n\n`;
    userMessage += `Question to answer:\n${question}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (res.status === 401) throw new Error('invalid_key');
    if (!res.ok) throw new Error(`api_error_${res.status}`);
    const data = await res.json();
    responseEl.value = data.content[0].text;

  } catch (err) {
    if (err.message === 'invalid_key') {
      responseEl.value = 'Invalid API key. Click the key icon in the header to update it.';
    } else {
      responseEl.value = `Could not reach Claude API (${err.message}). Check your internet connection.`;
    }
  } finally {
    btn.innerHTML = '<i data-lucide="sparkles" width="14" height="14"></i> Generate response';
    btn.disabled = false;
    lucide.createIcons({ nodes: [btn] });
    block.style.display = 'flex';
    block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

// ── Copy AI response ──────────────────────────────────
document.getElementById('copy-response-btn')?.addEventListener('click', () => {
  const text = document.getElementById('ai-response-text').value;
  copyText(text, 'Response copied!');
});

document.getElementById('ai-response-block').style.display = 'none';

// ── Cargar CV ─────────────────────────────────────────
const uploadModal   = document.getElementById('upload-modal');
const reviewModal   = document.getElementById('review-modal');
const cvFileInput   = document.getElementById('cv-file-input');
const uploadDropZone = document.getElementById('upload-drop-zone');
const uploadFileName = document.getElementById('upload-file-name');
const uploadProcess = document.getElementById('upload-process');
const uploadError   = document.getElementById('upload-error');
let selectedCvFile  = null;

document.getElementById('upload-cv-btn').addEventListener('click', async () => {
  const key = await getDecryptedKey();
  if (!key) { openApiModal(); return; }
  selectedCvFile = null;
  uploadProcess.disabled = true;
  uploadFileName.textContent = 'PDF o Word (.docx)';
  uploadDropZone.classList.remove('has-file');
  uploadError.classList.add('hidden');
  uploadModal.classList.remove('hidden');
  lucide.createIcons({ nodes: [uploadModal] });
});

document.getElementById('upload-cancel').addEventListener('click', () => uploadModal.classList.add('hidden'));
uploadModal.addEventListener('click', (e) => { if (e.target === uploadModal) uploadModal.classList.add('hidden'); });

uploadDropZone.addEventListener('click', () => cvFileInput.click());
uploadDropZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadDropZone.classList.add('has-file'); });
uploadDropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelected(file);
});

cvFileInput.addEventListener('change', () => {
  if (cvFileInput.files[0]) handleFileSelected(cvFileInput.files[0]);
  cvFileInput.value = '';
});

function handleFileSelected(file) {
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const extOk = file.name.endsWith('.pdf') || file.name.endsWith('.docx');
  if (!allowed.includes(file.type) && !extOk) {
    uploadError.textContent = 'Formato no compatible. Usá PDF o Word (.docx).';
    uploadError.classList.remove('hidden');
    return;
  }
  selectedCvFile = file;
  uploadFileName.textContent = file.name;
  uploadDropZone.classList.add('has-file');
  uploadProcess.disabled = false;
  uploadError.classList.add('hidden');
}

// ── Extract text from file ────────────────────────────
async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('libs/pdf.worker.min.js');
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}

async function extractTextFromDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractText(file) {
  if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
    return await extractTextFromPdf(file);
  }
  return await extractTextFromDocx(file);
}

// ── Parse CV with Claude ──────────────────────────────
const CV_PARSE_PROMPT = `You are a CV parser. Extract all information from the CV text below and return ONLY a valid JSON object — no explanation, no markdown, no extra text.

JSON structure:
{
  "firstName": "",
  "lastName": "",
  "email": "",
  "countryCode": "",
  "phoneNumber": "",
  "dateOfBirth": "",
  "location": "",
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "occupationTitle": "",
  "bio": "",
  "workExperience": [
    {
      "company": "",
      "role": "",
      "startMonth": "",
      "startYear": "",
      "endMonth": "",
      "endYear": "",
      "current": false,
      "country": "",
      "contractType": "",
      "aboutCompany": "",
      "responsibilities": "",
      "achievements": "",
      "tools": ""
    }
  ],
  "education": [
    { "degree": "", "institution": "", "startYear": "", "endYear": "" }
  ],
  "certifications": [
    { "name": "", "url": "" }
  ],
  "skills": [],
  "languages": []
}

If a field is not found, leave it as empty string or empty array. Return ONLY the JSON.`;

async function parseCvWithClaude(text, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `${CV_PARSE_PROMPT}\n\nCV TEXT:\n${text.slice(0, 12000)}`
      }]
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  const raw = data.content[0].text.trim();
  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) throw new Error('No se encontró JSON en la respuesta');
  const jsonStr = raw.slice(jsonStart, jsonEnd + 1);
  try {
    return JSON.parse(jsonStr);
  } catch {
    // Response may be truncated — try extracting only the safe top-level fields
    const safe = {};
    const topFields = ['firstName','lastName','email','countryCode','phoneNumber','dateOfBirth','location','linkedin','github','portfolio','occupationTitle','bio'];
    for (const key of topFields) {
      const m = jsonStr.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
      if (m) safe[key] = m[1];
    }
    safe.workExperience = []; safe.education = []; safe.certifications = []; safe.skills = []; safe.languages = [];
    return safe;
  }
}

// ── Review modal ──────────────────────────────────────
function buildReviewModal(cv) {
  const body = document.getElementById('review-body');
  body.innerHTML = '';

  const section = (title, html) => {
    const div = document.createElement('div');
    div.innerHTML = `<div class="review-section-title">${title}</div>${html}`;
    body.appendChild(div);
  };

  const field = (label, name, value, multiline = false) => {
    const tag = multiline ? 'textarea' : 'input';
    const rows = multiline ? ' rows="3"' : '';
    return `<div class="review-field">
      <label>${label}</label>
      <${tag} class="review-input" data-review-field="${name}"${rows}>${multiline ? (value || '') : ''}</${tag}>
      ${!multiline ? `<script>document.querySelector('[data-review-field="${name}"]').value=${JSON.stringify(value || '')}<\/script>` : ''}
    </div>`;
  };

  // Personal
  section('Perfil Personal', [
    field('Nombre', 'firstName', cv.firstName),
    field('Apellido', 'lastName', cv.lastName),
    field('Email', 'email', cv.email),
    field('Código de país', 'countryCode', cv.countryCode),
    field('Número de teléfono', 'phoneNumber', cv.phoneNumber),
    field('Fecha de nacimiento', 'dateOfBirth', cv.dateOfBirth),
    field('Ubicación', 'location', cv.location),
    field('LinkedIn', 'linkedin', cv.linkedin),
    field('GitHub', 'github', cv.github),
    field('Portfolio', 'portfolio', cv.portfolio),
  ].join(''));

  // Professional
  section('Perfil Profesional', [
    field('Título', 'occupationTitle', cv.occupationTitle),
    field('Bio / Resumen', 'bio', cv.bio, true),
  ].join(''));

  // Work experience
  if (cv.workExperience?.length) {
    const cards = cv.workExperience.map((job, i) => `
      <div class="review-entry-card">
        <div class="review-entry-title">${job.company || ''} — ${job.role || ''}</div>
        <div class="review-field"><label>Empresa</label>
          <input class="review-input" data-review-field="we_${i}_company" value="${(job.company||'').replace(/"/g,'&quot;')}"></div>
        <div class="review-field"><label>Rol</label>
          <input class="review-input" data-review-field="we_${i}_role" value="${(job.role||'').replace(/"/g,'&quot;')}"></div>
        <div class="review-field"><label>Inicio</label>
          <input class="review-input" data-review-field="we_${i}_start" value="${[job.startMonth, job.startYear].filter(Boolean).join(' ')}"></div>
        <div class="review-field"><label>Fin</label>
          <input class="review-input" data-review-field="we_${i}_end" value="${job.current ? 'Present' : [job.endMonth, job.endYear].filter(Boolean).join(' ')}"></div>
        <div class="review-field"><label>País / Modalidad</label>
          <input class="review-input" data-review-field="we_${i}_location" value="${[job.country, job.contractType].filter(Boolean).join(' · ')}"></div>
        <div class="review-field"><label>Sobre la empresa</label>
          <textarea class="review-input" data-review-field="we_${i}_about" rows="2">${job.aboutCompany||''}</textarea></div>
        <div class="review-field"><label>Responsabilidades</label>
          <textarea class="review-input" data-review-field="we_${i}_resp" rows="3">${job.responsibilities||''}</textarea></div>
        <div class="review-field"><label>Logros</label>
          <textarea class="review-input" data-review-field="we_${i}_ach" rows="2">${job.achievements||''}</textarea></div>
        <div class="review-field"><label>Herramientas</label>
          <input class="review-input" data-review-field="we_${i}_tools" value="${(job.tools||'').replace(/"/g,'&quot;')}"></div>
      </div>`).join('');
    section('Experiencia Laboral', cards);
  }

  // Education
  if (cv.education?.length) {
    const cards = cv.education.map((edu, i) => `
      <div class="review-entry-card">
        <div class="review-field"><label>Institución</label>
          <input class="review-input" data-review-field="edu_${i}_inst" value="${(edu.institution||'').replace(/"/g,'&quot;')}"></div>
        <div class="review-field"><label>Título</label>
          <input class="review-input" data-review-field="edu_${i}_degree" value="${(edu.degree||'').replace(/"/g,'&quot;')}"></div>
        <div class="review-field"><label>Años</label>
          <input class="review-input" data-review-field="edu_${i}_years" value="${[edu.startYear, edu.endYear].filter(Boolean).join(' – ')}"></div>
      </div>`).join('');
    section('Educación', cards);
  }

  // Skills
  section('Habilidades', `<div class="review-field">
    <label>Skills (separadas por coma)</label>
    <textarea class="review-input" data-review-field="skills" rows="3">${(cv.skills||[]).join(', ')}</textarea>
  </div>`);

  // Languages
  section('Idiomas', `<div class="review-field">
    <label>Idiomas (uno por línea, ej: English — Fluent)</label>
    <textarea class="review-input" data-review-field="languages" rows="3">${(cv.languages||[]).join('\n')}</textarea>
  </div>`);

  lucide.createIcons({ nodes: [body] });
}

uploadProcess.addEventListener('click', async () => {
  if (!selectedCvFile) return;
  uploadProcess.disabled = true;
  uploadProcess.innerHTML = '<i data-lucide="loader" width="13" height="13"></i> Analizando...';
  lucide.createIcons({ nodes: [uploadProcess] });
  uploadError.classList.add('hidden');

  try {
    const apiKey = await getDecryptedKey();
    const text = await extractText(selectedCvFile);
    const cv = await parseCvWithClaude(text, apiKey);
    uploadModal.classList.add('hidden');
    buildReviewModal(cv);
    reviewModal.classList.remove('hidden');
    lucide.createIcons({ nodes: [reviewModal] });
  } catch (err) {
    uploadError.textContent = `Error: ${err.message}. Verificá tu API key o el archivo.`;
    uploadError.classList.remove('hidden');
  } finally {
    uploadProcess.disabled = false;
    uploadProcess.innerHTML = '<i data-lucide="sparkles" width="13" height="13"></i> Analizar con Claude';
    lucide.createIcons({ nodes: [uploadProcess] });
  }
});

document.getElementById('review-cancel').addEventListener('click', () => reviewModal.classList.add('hidden'));

document.getElementById('review-save').addEventListener('click', async () => {
  const get = (name) => document.querySelector(`[data-review-field="${name}"]`)?.value?.trim() || '';

  // Update by finding field labels
  document.querySelectorAll('.field-card').forEach(card => {
    const label = card.querySelector('.field-label')?.textContent?.trim().toLowerCase();
    const valueEl = card.querySelector('.field-value');
    if (!valueEl) return;
    const map = {
      'first name': 'firstName', 'nombre': 'firstName', 'nome': 'firstName',
      'last name': 'lastName', 'apellido': 'lastName', 'sobrenome': 'lastName',
      'email': 'email', 'correo electrónico': 'email', 'e-mail': 'email',
      'country code': 'countryCode', 'código de país': 'countryCode', 'código do país': 'countryCode',
      'phone number': 'phoneNumber', 'número de teléfono': 'phoneNumber', 'número de telefone': 'phoneNumber',
      'date of birth': 'dateOfBirth', 'fecha de nacimiento': 'dateOfBirth', 'data de nascimento': 'dateOfBirth',
      'location': 'location', 'ubicación': 'location', 'localização': 'location',
      'linkedin': 'linkedin',
      'github': 'github',
      'portfolio': 'portfolio', 'portafolio': 'portfolio', 'portfólio': 'portfolio',
      'occupation title': 'occupationTitle', 'título de ocupación': 'occupationTitle',
      'bio / summary': 'bio', 'resumen profesional': 'bio', 'resumo profissional': 'bio',
    };
    const fieldKey = map[label];
    if (fieldKey) {
      const val = get(fieldKey);
      if (val) {
        valueEl.textContent = val;
        card.dataset.copy = val;
      }
    }
  });

  // ── Work experience ───────────────────────────────
  const weCount = document.querySelectorAll('[data-review-field^="we_"][data-review-field$="_company"]').length;
  const existingEntries = document.querySelectorAll('.entry-card');

  for (let i = 0; i < weCount; i++) {
    const company  = get(`we_${i}_company`);
    const role     = get(`we_${i}_role`);
    const start    = get(`we_${i}_start`);
    const end      = get(`we_${i}_end`);
    const location = get(`we_${i}_location`);
    const about    = get(`we_${i}_about`);
    const resp     = get(`we_${i}_resp`);
    const ach      = get(`we_${i}_ach`);
    const tools    = get(`we_${i}_tools`);

    const entry = existingEntries[i];
    if (entry) {
      const setField = (label, val) => {
        entry.querySelectorAll('.entry-field').forEach(f => {
          if (f.querySelector('.entry-field-label')?.textContent?.toLowerCase().includes(label)) {
            const v = f.querySelector('.entry-field-value');
            if (v && val) { v.textContent = val; f.querySelector('[data-value]') && (f.querySelector('[data-value]').dataset.value = val); }
          }
        });
      };
      const setFieldCard = (labelText, val) => {
        entry.querySelectorAll('.field-card').forEach(card => {
          const lbl = card.querySelector('.field-label');
          if (lbl && lbl.textContent.trim().toLowerCase() === labelText.toLowerCase()) {
            const v = card.querySelector('.field-value');
            if (v && val) { v.textContent = val; card.dataset.copy = val; }
          }
        });
      };
      const titleEl = entry.querySelector('.entry-title');
      const subtitleEl = entry.querySelector('.entry-subtitle');
      if (titleEl && company) titleEl.textContent = `${company} — ${role}`;
      if (subtitleEl && start) subtitleEl.textContent = `${start} – ${end}${location ? ' · ' + location : ''}`;
      if (company) setFieldCard('Company', company);
      if (role)    setFieldCard('Role', role);
      setField('about', about);
      setField('responsib', resp);
      setField('achiev', ach);
      setField('tools', tools);
    }
  }

  // ── Skills ────────────────────────────────────────
  const skillsVal = get('skills');
  if (skillsVal) {
    const skillsList = skillsVal.split(',').map(s => s.trim()).filter(Boolean);
    document.querySelectorAll('.accordion').forEach(acc => {
      const label = acc.querySelector('.section-label')?.textContent?.trim().toLowerCase();
      if (label?.includes('skill') || label?.includes('habilidad')) {
        const wrap = acc.querySelector('.tags-wrap');
        if (wrap) {
          wrap.innerHTML = skillsList.map(s => `<span class="tag">${s}</span>`).join('');
          setupTags();
        }
      }
    });
  }

  // ── Languages ─────────────────────────────────────
  const langsVal = get('languages');
  if (langsVal) {
    const langList = langsVal.split('\n').map(s => s.trim()).filter(Boolean);
    document.querySelectorAll('.accordion').forEach(acc => {
      const label = acc.querySelector('.section-label')?.textContent?.trim().toLowerCase();
      if (label?.includes('language') || label?.includes('idioma')) {
        const wrap = acc.querySelector('.tags-wrap');
        if (wrap) {
          wrap.innerHTML = langList.map(s => `<span class="tag">${s}</span>`).join('');
          setupTags();
        }
      }
    });
  }

  await saveToStorage();
  reviewModal.classList.add('hidden');
  showToast('Perfil actualizado!');
});

// ── Init ──────────────────────────────────────────────
lucide.createIcons();
initApiKeyStatus();
loadFromStorage().then(() => {
  setupFieldCards();
  setupEntryFields();
  setupDateCells();
  setupTags();
  setupCompanyToggles();
  setupCompanyDelete();
  setupStarRating();
  setupStatusPills();
});
