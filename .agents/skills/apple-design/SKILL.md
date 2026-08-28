---
name: apple-design
description: Create stunning, modern UI designs inspired by Apple's design language with clean minimalist aesthetics, fluid SF Pro typography, frosted glassmorphism, dark mode compatibility, and smooth micro-animations.
---

# Apple Design System

Create stunning, modern UI designs inspired by Apple's design language. This design system provides guidelines, components, and patterns for building clean, minimalist interfaces with attention to detail, smooth animations, and premium aesthetics.

---

## When to Use This Skill
Use this skill when:
- Designing portfolio websites or personal sites
- Creating landing pages or product showcases
- Implementing hero sections with visual impact
- Building card-based layouts for projects or products
- Adding glassmorphism or frosted glass effects
- Implementing smooth, delightful animations
- Creating dark mode compatible designs
- Designing navigation bars, modals, or forms
- Building contact forms or call-to-action sections
- Working with modern CSS features (`backdrop-filter`, gradients, layered shadows)

---

## Quick Start

### 1. Core Design Principles
- **Minimalism:** Remove unnecessary elements, focus on content.
- **Typography:** Large, bold headlines with system fonts.
- **Colors:** Neutral base with strategic accent colors.
- **Spacing:** 8px grid system with generous whitespace.
- **Effects:** Glassmorphism, soft shadows, smooth animations.
- **Imagery:** High-quality, properly sized images.

### 2. Color System
```css
/* Light Mode */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f7;
  --bg-tertiary: #e8e8ed;
  --text-primary: #1d1d1f;
  --text-secondary: #86868b;
  --accent-blue: #0071e3;
  --accent-green: #30d158;
  --border-color: rgba(0, 0, 0, 0.1);
  --glass-bg: rgba(255, 255, 255, 0.72);
  --glass-border: rgba(255, 255, 255, 0.4);
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #000000;
    --bg-secondary: #1d1d1f;
    --bg-tertiary: #2c2c2e;
    --text-primary: #f5f5f7;
    --text-secondary: #a1a1a6;
    --accent-blue: #0a84ff;
    --accent-green: #32d74b;
    --border-color: rgba(255, 255, 255, 0.12);
    --glass-bg: rgba(29, 29, 31, 0.72);
    --glass-border: rgba(255, 255, 255, 0.15);
  }
}
```

### 3. Typography
```css
/* System font stack */
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', sans-serif;

/* Fluid responsive typography */
h1 {
  font-size: clamp(2.5rem, 5vw + 1rem, 4.5rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.025em;
}

h2 {
  font-size: clamp(2rem, 3.5vw + 0.8rem, 3.25rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

p {
  font-size: 1.0625rem;
  line-height: 1.55;
  letter-spacing: -0.01em;
}
```

### 4. Spacing
Use an 8px-based spacing scale:
```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem;  /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem;    /* 16px */
  --space-6: 1.5rem;  /* 24px */
  --space-8: 2rem;    /* 32px */
  --space-12: 3rem;   /* 48px */
  --space-16: 4rem;   /* 64px */
  --space-24: 6rem;   /* 96px */
}
```

---

## Core Components

### 1. Hero Section
```html
<section class="hero">
  <div class="hero-content">
    <h1 class="hero-title">Hi, I'm <span class="gradient-text">Your Name</span></h1>
    <p class="hero-subtitle">Developer creating amazing experiences</p>
    <div class="hero-actions">
      <button class="btn btn-primary">View Work</button>
      <button class="btn btn-secondary">Contact</button>
    </div>
  </div>
</section>
```

### 2. Glass Card
```css
.glass-card {
  background: var(--glass-bg, rgba(255, 255, 255, 0.72));
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.3));
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
```

### 3. Project Card
```css
.project-card {
  border-radius: 24px;
  overflow: hidden;
  background: var(--bg-secondary);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
}
```

### 4. Navigation Bar
```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--glass-bg, rgba(255, 255, 255, 0.8));
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
}
```

### 5. Buttons
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: 980px;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 44px;
  text-decoration: none;
}

.btn-primary {
  background: var(--accent-blue);
  color: #ffffff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.35);
}

.btn-secondary {
  background: rgba(0, 113, 227, 0.08);
  color: var(--accent-blue);
  border: 1px solid rgba(0, 113, 227, 0.25);
}

.btn-secondary:hover {
  background: var(--accent-blue);
  color: #ffffff;
  transform: translateY(-2px);
}
```

---

## Animations

### Hover Effects
```css
/* Lift effect */
.hover-lift {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
}

/* Image zoom */
.image-zoom {
  transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover .image-zoom {
  transform: scale(1.05);
}
```

### Entrance Animations
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```

---

## AI Assistant Instructions

When this skill is activated for Apple-inspired design:

### 1. Always Prioritize
- Clean, minimalist aesthetics
- Generous whitespace and breathing room
- Smooth, delightful animations (300–600ms)
- Dark mode compatibility
- Responsive design (mobile-first)
- Accessibility (WCAG AA minimum, 4.5:1 contrast, 44x44px touch targets)

### 2. Component Creation Workflow
1. Start with semantic HTML structure
2. Apply modern CSS (flexbox, grid, custom properties)
3. Add glassmorphism for cards and overlays where appropriate
4. Implement hover states with subtle transitions
5. Ensure dark mode support using CSS custom properties
6. Test responsiveness across mobile, tablet, and desktop breakpoints

### 3. Styling Approach
- Use CSS variables for all colors and spacing
- Apply system font stack for typography (`-apple-system, BlinkMacSystemFont, 'SF Pro Display'`)
- Implement soft shadows for depth (layered shadows)
- Add smooth transitions with cubic-bezier easing (`cubic-bezier(0.4, 0, 0.2, 1)`)
- Use `clamp()` for fluid typography
- Follow 8px spacing grid consistently

### 4. Never Do
- ❌ Use overly complex, jerky animations
- ❌ Ignore responsive design
- ❌ Sacrifice accessibility for aesthetics
- ❌ Use outdated CSS patterns (floats, `!important`)
- ❌ Forget dark mode considerations
- ❌ Animate width/height (use `transform` and `opacity` instead)

### 5. For Portfolio Sites Specifically
- Create impactful hero sections with large typography and gradients
- Design project cards with image zoom on hover
- Build clean navigation with blur effects (`backdrop-filter`)
- Implement smooth scroll reveal animations
- Add contact forms with modern, accessible inputs
- Use glassmorphism strategically for visual hierarchy and interest

### 6. Code Quality Standards
- Write clean, well-commented code
- Use modern CSS features (CSS grid, `clamp()`, custom properties)
- Optimize for performance (GPU-accelerated properties only)
- Follow accessibility guidelines (ARIA, keyboard navigation, focus states)
- Provide both light and dark mode styles
- Use semantic HTML elements

---

## Best Practices

### Performance
- ✅ Animate only `transform` and `opacity`
- ✅ Use `will-change` sparingly
- ✅ Optimize images (WebP, lazy loading)
- ✅ Minimize `backdrop-filter` usage over complex layers
- ❌ Avoid animating `width`, `height`, `top`, `left`

### Accessibility
- ✅ Maintain 4.5:1 contrast ratio for text
- ✅ Provide focus indicators (`outline: 2px solid var(--accent-blue); outline-offset: 2px;`)
- ✅ Use semantic HTML
- ✅ Add ARIA labels for icon-only buttons
- ✅ Respect `prefers-reduced-motion`
- ✅ Minimum touch target: 44x44px

### Responsive Design
- ✅ Mobile-first approach
- ✅ Fluid typography with `clamp()`
- ✅ Flexible grid layouts with `auto-fit` / `auto-fill`
- ✅ Breakpoints: 640px (`sm`), 768px (`md`), 1024px (`lg`), 1280px (`xl`)

---

## Quick Reference

### Shadow Scale
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.08), 0 16px 32px rgba(0, 0, 0, 0.08);
--shadow-xl: 0 24px 48px rgba(0, 0, 0, 0.12);
```

### Border Radius Scale
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### Animation Duration & Easing
```css
--duration-fast: 150ms; /* Micro-interactions */
--duration-base: 300ms; /* Standard transitions */
--duration-slow: 500ms; /* Complex animations */

--ease-apple: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```
