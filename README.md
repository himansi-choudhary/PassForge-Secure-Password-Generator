# 🔐 PassForge — Secure Password Generator

![PassForge Banner](https://img.shields.io/badge/PassForge-Secure%20Password%20Generator-4fffb0?style=for-the-badge&logo=shield&logoColor=black)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![No Backend](https://img.shields.io/badge/Backend-None-4fffb0?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-7b61ff?style=flat-square)

> A **premium, client-side password generator** with cryptographically secure randomness, entropy estimation, pronounceable passwords, and a polished dark/light UI. Zero dependencies. Zero backend. 100% private.

---

## ✨ Live Demo

> 📁 Simply open `index.html` in any modern browser — no server needed.

---

## 📸 Features

| Feature | Details |
|---|---|
| 🔒 **Cryptographic Randomness** | Uses `crypto.getRandomValues()` — not `Math.random()` |
| 📏 **Length Control** | Slider from 4 to 64 characters |
| 🔡 **Character Sets** | Uppercase, Lowercase, Numbers, Symbols |
| 🗣️ **Pronounceable Mode** | Syllable-based passwords easy to remember |
| 📊 **Strength Indicator** | Weak / Medium / Strong with animated bar |
| 🧮 **Entropy Estimation** | Displays bits of entropy (`H = L × log₂N`) |
| 📋 **Copy to Clipboard** | One-click copy with toast notification |
| 🔁 **Regenerate Button** | Instant new password with spin animation |
| 🕐 **Password History** | Last 5 passwords, click any to copy |
| 🌙 **Dark / Light Mode** | Persisted via `localStorage` + system preference |
| ⌨️ **Keyboard Shortcuts** | `Ctrl+G` generate · `Ctrl+Shift+C` copy |
| 📱 **Fully Responsive** | Mobile-first, works on all screen sizes |

---

## 🗂️ Project Structure

```
passforge/
├── index.html     # App structure & markup
├── style.css      # All styling — dark/light themes, animations
└── script.js      # Password logic, entropy, history, clipboard
```

---

## 🚀 Getting Started

### Option 1 — Open Locally

```bash
git clone https://github.com/YOUR_USERNAME/passforge.git
cd passforge
open index.html       # macOS
# or
start index.html      # Windows
# or
xdg-open index.html   # Linux
```

### Option 2 — Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Your app will be live at `https://YOUR_USERNAME.github.io/passforge`

### Option 3 — Deploy to Netlify / Vercel

Drop the folder into [Netlify Drop](https://app.netlify.com/drop) or connect the repo to [Vercel](https://vercel.com) — both work with zero config since there's no build step.

---

## 🔐 Security Notes

- All passwords are generated **entirely in your browser** using the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues).
- **No data is ever sent to any server.** There is no backend, no analytics, no logging.
- Uses **rejection sampling** to eliminate modulo bias in character selection.
- Uses **Fisher-Yates shuffle** (with `crypto.getRandomValues`) to ensure guaranteed character-set inclusion without positional bias.

---

## 🧮 Entropy Formula

Entropy is estimated as:

```
H = L × log₂(N)
```

Where:
- `L` = password length
- `N` = size of the character pool used (e.g. 26 + 26 + 10 + 32 = 94 for all sets)

| Entropy | Strength |
|---|---|
| < 40 bits | 🔴 Weak |
| 40 – 79 bits | 🟡 Medium |
| ≥ 80 bits | 🟢 Strong |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl` + `G` | Generate new password |
| `Ctrl` + `Shift` + `C` | Copy current password |

---

## 🎨 Design Highlights

- **Dark-first** glassmorphism UI with animated background grid and floating orbs
- **Syne** display font + **JetBrains Mono** for passwords and code
- Neon mint (`#4fffb0`) accent on dark, adjusted to `#00c47a` on light for contrast
- Smooth card entrance animations, slider fill, chip toggle states
- Toast notification with spring easing
- CSS custom properties for effortless theming

---

## 🛠️ Tech Stack

- **HTML5** — semantic, accessible markup
- **CSS3** — custom properties, `backdrop-filter`, CSS Grid, animations
- **Vanilla JavaScript (ES2020+)** — no frameworks, no build tools
- **Web Crypto API** — `crypto.getRandomValues` for true randomness
- **Phosphor Icons** — lightweight icon set via CDN
- **Google Fonts** — Syne + JetBrains Mono

---

## 📄 License

MIT License — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

## 🙌 Contributing

Pull requests are welcome! Here are some ideas:

- [ ] PWA support (offline mode via Service Worker)
- [ ] Export history as `.txt`
- [ ] Passphrase mode (word-based, e.g. `correct-horse-battery-staple`)
- [ ] Accessibility audit (WCAG AA)
- [ ] i18n / multi-language support

---

<p align="center">
  Made with ❤️ · Passwords generated locally · Nothing leaves your browser
</p>
