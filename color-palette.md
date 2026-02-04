# NOC Aquarium — Color Palette Design Guide

## Background: #0b1018 (dark navy)

All contrast ratios below are calculated against this background.

---

## Color Theory Principles Applied

### 1. WCAG Contrast Requirements
- **Normal text (≤18px):** minimum **4.5:1** ratio (AA)
- **Large text (≥18px bold / 24px):** minimum **3:1** ratio (AA)
- **Target for this project:** **5.5:1+** for all accent text

### 2. HSL-Based Design
On dark backgrounds, **Lightness (L)** is the primary driver of contrast, not Saturation.

- L = 55–70% → reliable text readability on dark BG
- S = 45–70% → enough color identity without neon harshness

### 3. Perceptual Luminance Non-uniformity
Same HSL lightness produces different WCAG contrast for different hues:
- **Green** (high luminance contribution) → needs lower L% for same contrast
- **Red** (medium) → moderate L%
- **Blue** (low luminance contribution) → needs higher L%

### 4. Common Mistake
Desaturating neon colors **lowers luminance**, reducing readability.
Correct: **raise Lightness** while moderately reducing Saturation.

---

## Final Palette

| Role | Hex | HSL | WCAG Ratio | Usage |
|------|-----|-----|-----------|-------|
| **Success Green** | `#61c777` | hsl(130, 50%, 58%) | ~6.5:1 | STATUS_OK, cables, newbie, packets |
| **Danger Red** | `#e06468` | hsl(358, 65%, 64%) | ~5.7:1 | STATUS_CRITICAL, firewall, hacker |
| **Warning Amber** | `#d9a840` | hsl(40, 65%, 55%) | ~7.0:1 | STATUS_WARN, database, janitor |
| **Accent Blue** | `#72b3e8` | hsl(210, 65%, 68%) | ~8.5:1 | Server, engineer, section headers |
| **Purple** | `#b48de6` | hsl(268, 60%, 73%) | ~6.5:1 | Switch, manager |
| **Info Cyan** | `#56c4d9` | hsl(190, 60%, 59%) | ~7.5:1 | Load balancer |
| **Text Primary** | `#d6dbe0` | hsl(210, 12%, 85%) | ~14:1 | Main body text |
| **Text Secondary** | `#959da5` | hsl(210, 8%, 62%) | ~6.2:1 | Dim labels, timestamps |
| **Medium Yellow** | `#c8b840` | hsl(50, 55%, 52%) | ~8.0:1 | Medium severity |

### Supporting Colors (non-text, structural)

| Role | Hex | Notes |
|------|-----|-------|
| Background | `#0b1018` | Base dark |
| Floor | `#181e2c` | Grid floor |
| Floor Alt | `#141a26` | Alternating |
| Grid Line | `#222838` | Subtle grid |
| Panel BG | `#0c1018` | Panel background |
| Panel Border | `#283040` | Panel borders |

---

## Reference Dashboards

These professional dark-mode dashboards informed the palette:
- **GitHub Primer Dark:** greens at ~58% L, reds at ~60% L
- **Grafana Dark:** status colors at L=55–65%, S=60–80%
- **Datadog:** accent colors at L=60–70%, generous use of mid-gray text
