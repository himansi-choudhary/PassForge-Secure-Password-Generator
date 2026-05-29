/**
 * PassForge — script.js
 * Vanilla JS password generator with:
 *  - Cryptographically random generation (crypto.getRandomValues)
 *  - Pronounceable password mode
 *  - Entropy estimation
 *  - Strength scoring
 *  - Copy to clipboard + toast
 *  - Last-5 history with click-to-copy
 *  - Light / dark theme toggle
 *  - Zero external dependencies
 */

/* ══════════════════════════════════════════════════════════
   1. DOM REFERENCES
   ══════════════════════════════════════════════════════════ */
const passwordOutput  = document.getElementById('passwordOutput');
const copyBtn         = document.getElementById('copyBtn');
const regenBtn        = document.getElementById('regenBtn');
const generateBtn     = document.getElementById('generateBtn');
const lengthSlider    = document.getElementById('lengthSlider');
const lengthValue     = document.getElementById('lengthValue');
const optUppercase    = document.getElementById('optUppercase');
const optLowercase    = document.getElementById('optLowercase');
const optNumbers      = document.getElementById('optNumbers');
const optSymbols      = document.getElementById('optSymbols');
const optPronounceable= document.getElementById('optPronounceable');
const strengthBar     = document.getElementById('strengthBar');
const strengthLabel   = document.getElementById('strengthLabel');
const entropyLabel    = document.getElementById('entropyLabel');
const historyList     = document.getElementById('historyList');
const historyEmpty    = document.getElementById('historyEmpty');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const themeToggle     = document.getElementById('themeToggle');
const themeIcon       = document.getElementById('themeIcon');
const toast           = document.getElementById('toast');
const toastMsg        = document.getElementById('toastMsg');


/* ══════════════════════════════════════════════════════════
   2. CHARACTER SETS
   ══════════════════════════════════════════════════════════ */
const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers:   '0123456789',
  symbols:   '!@#$%^&*()-_=+[]{}|;:,.<>?'
};

// Syllable pools for pronounceable passwords
const CONSONANTS = ['b','c','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','z'];
const VOWELS     = ['a','e','i','o','u'];


/* ══════════════════════════════════════════════════════════
   3. CRYPTOGRAPHIC RANDOM HELPERS
   ══════════════════════════════════════════════════════════ */

/**
 * Returns a cryptographically secure random integer in [0, max).
 * Uses rejection sampling to avoid modulo bias.
 * @param {number} max - exclusive upper bound
 * @returns {number}
 */
function secureRandom(max) {
  const array = new Uint32Array(1);
  const limit  = Math.floor(0x100000000 / max) * max; // reject-sample ceiling
  let r;
  do {
    crypto.getRandomValues(array);
    r = array[0];
  } while (r >= limit);
  return r % max;
}

/**
 * Picks a random character from a string using secureRandom.
 * @param {string} str
 * @returns {string}
 */
function randomChar(str) {
  return str[secureRandom(str.length)];
}

/**
 * Shuffles an array in-place using the Fisher-Yates algorithm
 * with cryptographically random indices.
 * @param {Array} arr
 * @returns {Array} (same array, mutated)
 */
function secureShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


/* ══════════════════════════════════════════════════════════
   4. PASSWORD GENERATION
   ══════════════════════════════════════════════════════════ */

/**
 * Generates a random password with guaranteed inclusion of
 * at least one character from each selected character set.
 * @returns {string} generated password or empty string if no charset selected
 */
function generatePassword() {
  const len          = parseInt(lengthSlider.value, 10);
  const usePronounce = optPronounceable.checked;

  if (usePronounce) {
    return generatePronounceablePassword(len);
  }

  // Build the active character pool
  let pool = '';
  const guaranteed = [];

  if (optUppercase.checked) { pool += CHARS.uppercase; guaranteed.push(randomChar(CHARS.uppercase)); }
  if (optLowercase.checked) { pool += CHARS.lowercase; guaranteed.push(randomChar(CHARS.lowercase)); }
  if (optNumbers.checked)   { pool += CHARS.numbers;   guaranteed.push(randomChar(CHARS.numbers));   }
  if (optSymbols.checked)   { pool += CHARS.symbols;   guaranteed.push(randomChar(CHARS.symbols));   }

  if (!pool) return ''; // no options selected

  // Fill the rest of the password randomly from the pool
  const rest = Array.from({ length: len - guaranteed.length }, () => randomChar(pool));

  // Combine guaranteed + rest, then shuffle so guaranteed chars aren't always at front
  return secureShuffle([...guaranteed, ...rest]).join('');
}

/**
 * Generates a pronounceable (syllable-based) password.
 * Alternates consonant-vowel pairs, optionally inserting numbers.
 * @param {number} len - target length
 * @returns {string}
 */
function generatePronounceablePassword(len) {
  const useNumbers  = optNumbers.checked;
  const useUppercase= optUppercase.checked;
  const result      = [];
  let toggle = false; // false = consonant, true = vowel

  while (result.length < len) {
    // Occasionally insert a number
    if (useNumbers && result.length > 0 && result.length < len - 1 && secureRandom(5) === 0) {
      result.push(randomChar(CHARS.numbers));
      continue;
    }

    const char = toggle ? randomChar(VOWELS) : randomChar(CONSONANTS);
    // Optionally capitalise
    result.push(useUppercase && secureRandom(4) === 0 ? char.toUpperCase() : char);
    toggle = !toggle;
  }

  return result.slice(0, len).join('');
}


/* ══════════════════════════════════════════════════════════
   5. ENTROPY & STRENGTH SCORING
   ══════════════════════════════════════════════════════════ */

/**
 * Estimates password entropy in bits: H = L × log2(N)
 * where L = length, N = effective pool size.
 * @param {string} password
 * @returns {number} entropy in bits
 */
function calcEntropy(password) {
  if (!password) return 0;

  let poolSize = 0;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += CHARS.symbols.length;

  if (poolSize === 0) return 0;
  return Math.floor(password.length * Math.log2(poolSize));
}

/**
 * Returns a strength tier object based on entropy bits.
 * @param {number} bits
 * @returns {{ tier: 'weak'|'medium'|'strong', label: string, pct: number }}
 */
function getStrength(bits) {
  if (bits < 40)  return { tier: 'weak',   label: 'Weak',   pct: Math.max(8, bits / 40 * 33) };
  if (bits < 80)  return { tier: 'medium', label: 'Medium', pct: 33 + (bits - 40) / 40 * 34 };
  return               { tier: 'strong', label: 'Strong', pct: Math.min(100, 67 + (bits - 80) / 40 * 33) };
}

/**
 * Updates the strength bar, label, and entropy display.
 * @param {string} password
 */
function updateStrengthUI(password) {
  if (!password) {
    strengthBar.style.width   = '0%';
    strengthBar.className     = 'strength-bar-fill';
    strengthLabel.textContent = '—';
    strengthLabel.className   = 'strength-label';
    entropyLabel.textContent  = '';
    return;
  }

  const bits   = calcEntropy(password);
  const { tier, label, pct } = getStrength(bits);

  strengthBar.style.width   = `${pct}%`;
  strengthBar.className     = `strength-bar-fill ${tier}`;
  strengthLabel.textContent = label;
  strengthLabel.className   = `strength-label ${tier}`;
  entropyLabel.textContent  = `${bits} bits entropy`;
}


/* ══════════════════════════════════════════════════════════
   6. UI UPDATE — SLIDER FILL TRICK
   ══════════════════════════════════════════════════════════ */

/**
 * Updates the slider's CSS custom property to visually fill
 * the track up to the current thumb position.
 */
function updateSliderFill() {
  const min = parseInt(lengthSlider.min);
  const max = parseInt(lengthSlider.max);
  const val = parseInt(lengthSlider.value);
  const pct = ((val - min) / (max - min)) * 100;
  lengthSlider.style.background =
    `linear-gradient(to right, var(--accent) ${pct}%, var(--border) ${pct}%)`;
}


/* ══════════════════════════════════════════════════════════
   7. HISTORY  (last 5 passwords)
   ══════════════════════════════════════════════════════════ */
const MAX_HISTORY = 5;
let passwordHistory = []; // newest-first array of strings

/**
 * Adds a password to history (max 5), then re-renders the list.
 * @param {string} pw
 */
function addToHistory(pw) {
  if (!pw) return;
  // Avoid consecutive duplicates
  if (passwordHistory[0] === pw) return;
  passwordHistory.unshift(pw);
  if (passwordHistory.length > MAX_HISTORY) passwordHistory.pop();
  renderHistory();
}

/**
 * Rebuilds the history list in the DOM.
 */
function renderHistory() {
  // Remove old history items (keep the empty placeholder)
  historyList.querySelectorAll('.history-item').forEach(el => el.remove());

  if (passwordHistory.length === 0) {
    historyEmpty.style.display = 'flex';
    return;
  }

  historyEmpty.style.display = 'none';

  passwordHistory.forEach((pw, idx) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `Copy history password ${idx + 1}`);
    li.innerHTML = `
      <span class="history-pw">${escapeHTML(pw)}</span>
      <span class="history-copy-hint">click to copy</span>
    `;
    li.addEventListener('click', () => copyToClipboard(pw, 'History password copied!'));
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') copyToClipboard(pw, 'History password copied!');
    });
    historyList.appendChild(li);
  });
}

/**
 * Basic HTML escaping to safely insert passwords into the DOM.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/* ══════════════════════════════════════════════════════════
   8. CLIPBOARD & TOAST
   ══════════════════════════════════════════════════════════ */
let toastTimer = null; // stores timeout ID to debounce toast

/**
 * Copies text to the clipboard and shows a toast notification.
 * @param {string} text - text to copy
 * @param {string} [message='Password copied!'] - toast message
 */
async function copyToClipboard(text, message = 'Password copied!') {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast(message);
  } catch {
    // Fallback for older browsers / non-HTTPS
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(message);
  }
}

/**
 * Displays the toast notification for ~2 seconds.
 * @param {string} message
 */
function showToast(message) {
  toastMsg.textContent = message;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}


/* ══════════════════════════════════════════════════════════
   9. THEME TOGGLE
   ══════════════════════════════════════════════════════════ */

/** Applies the given theme and persists it in localStorage. */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.className = theme === 'dark' ? 'ph-bold ph-moon' : 'ph-bold ph-sun';
  localStorage.setItem('passforge-theme', theme);
}

/** Reads saved theme preference on page load. */
function loadTheme() {
  const saved = localStorage.getItem('passforge-theme');
  const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  applyTheme(saved || preferred);
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});


/* ══════════════════════════════════════════════════════════
   10. PRONOUNCEABLE TOGGLE BEHAVIOUR
   When "Pronounceable" is checked, other character options
   become partially managed (letters are implicit, so we
   visually dim the irrelevant ones but don't force-uncheck).
   ══════════════════════════════════════════════════════════ */
optPronounceable.addEventListener('change', () => {
  const isPronounce = optPronounceable.checked;
  // When pronounceable mode is on, uppercase/lowercase are used internally.
  // We dim symbols (not applicable) to guide the user.
  [optUppercase, optLowercase, optSymbols].forEach(el => {
    el.closest('.option-chip').style.opacity = isPronounce ? '0.45' : '1';
    el.closest('.option-chip').style.pointerEvents = isPronounce ? 'none' : '';
  });
  if (isPronounce) {
    // Pronounceable implies letters; force enable for correct entropy display
    optUppercase.checked = true;
    optLowercase.checked = true;
  }
});


/* ══════════════════════════════════════════════════════════
   11. CORE GENERATE FLOW
   ══════════════════════════════════════════════════════════ */

/**
 * Main generate function — builds password, updates UI, records history.
 */
function generate() {
  const pw = generatePassword();

  if (!pw) {
    showToast('⚠ Select at least one character type!');
    passwordOutput.value = '';
    updateStrengthUI('');
    return;
  }

  // Animate the regen icon
  const regenIcon = regenBtn.querySelector('i');
  regenIcon.classList.remove('spin');
  void regenIcon.offsetWidth; // force reflow to restart animation
  regenIcon.classList.add('spin');

  passwordOutput.value = pw;
  updateStrengthUI(pw);
  addToHistory(pw);
}


/* ══════════════════════════════════════════════════════════
   12. EVENT LISTENERS
   ══════════════════════════════════════════════════════════ */

// Generate button
generateBtn.addEventListener('click', generate);

// Regen (icon) button
regenBtn.addEventListener('click', generate);

// Copy button
copyBtn.addEventListener('click', () => {
  copyToClipboard(passwordOutput.value);
});

// Length slider — update display + regenerate live
lengthSlider.addEventListener('input', () => {
  lengthValue.textContent = lengthSlider.value;
  lengthSlider.setAttribute('aria-valuenow', lengthSlider.value);
  updateSliderFill();
  // Live-regenerate only if there's already a password showing
  if (passwordOutput.value) generate();
});

// Option checkboxes — regenerate live on change
[optUppercase, optLowercase, optNumbers, optSymbols].forEach(el => {
  el.addEventListener('change', () => {
    if (passwordOutput.value) generate();
  });
});

// Clear history
clearHistoryBtn.addEventListener('click', () => {
  passwordHistory = [];
  renderHistory();
});

// Keyboard shortcut: Ctrl/Cmd+G to generate, Ctrl/Cmd+C to copy
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'g') { e.preventDefault(); generate(); }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    copyToClipboard(passwordOutput.value);
  }
});


/* ══════════════════════════════════════════════════════════
   13. INITIALISATION
   ══════════════════════════════════════════════════════════ */
(function init() {
  loadTheme();
  updateSliderFill();
  renderHistory();
  // Generate a password immediately on page load
  generate();
})();