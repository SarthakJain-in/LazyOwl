# NeuroBank Brand Design & UI Guidelines

Based on the provided dashboard designs (Dark and Light modes), here is the extracted brand design, typography, and color scheme.

## 1. Core Visual Identity
- **Vibe:** Modern, trustworthy, tech-forward, and premium.
- **Style:** Clean "Fintech" dashboard with ample whitespace, soft geometric shapes, and a high-contrast layout. 
- **Key Elements:** Pronounced border radii, diffuse glows (in dark mode), soft drop shadows (in light mode), and sleek fluid data visualizations.

---

## 2. Color Palette

### 🎨 Brand & Accent Colors
- **Brand Blue (Primary Accent):** `#4361EE` (Used for primary buttons like "+ Add new Widget", active states, progress indicators, and chart lines).
- **Brand Gradient:** A smooth linear gradient from rich indigo/purple to the primary brand blue (seen prominently on the "AI Insights" card and the logo).

### 🌑 Dark Mode Theme
- **App Background:** `#0B0E14` (Deep, pure dark navy/black).
- **Surface / Cards:** `#13161F` (Slightly lighter dark shade to create depth).
- **Primary Text:** `#FFFFFF` (Pure white for high-contrast headings and primary data).
- **Secondary Text:** `#8B92A5` (Muted gray-blue for labels, dates, and less important details).
- **Borders / Dividers:** `#222635` (Faint, low-contrast lines).

### ☀️ Light Mode Theme
- **App Background:** `#F4F7FE` (Very light, cool-toned gray/blue for a spacious feel).
- **Surface / Cards:** `#FFFFFF` (Pure white cards to stand out against the background).
- **Primary Text:** `#1B254B` (Deep navy/black for maximum legibility).
- **Secondary Text:** `#A3AED0` (Soft gray-blue, keeping the UI light but readable).
- **Borders / Dividers:** `#E9EDF7` (Extremely light borders).

### 🔴🟢 Semantic / Functional Colors
- **Success (Positive):** `#05CD99` (A vibrant teal/green for positive values, e.g., `+$27.00`, `↑ 12%`).
- **Danger (Negative):** `#EE5D50` (A distinct orange/red for negative changes or alerts, e.g., `↓ 2`).

---

## 3. Typographic Style

- **Font Family:** A modern, humanist or geometric sans-serif (e.g., *Inter*, *SF Pro Display*, or *Plus Jakarta Sans*).
- **Hierarchical Structure:**
  - **Large Headings:** Bold (700 weight), large tracking. Used for greetings ("Welcome back, George!") and major numerical data (Account balances).
  - **Section Titles / Card Headers:** Semi-bold or Medium (500-600 weight), medium size (e.g., "Balance Overview").
  - **Body Text:** Regular (400 weight). Used for standard information like transaction names.
  - **Microcopy:** Small, usually uppercase or slightly tracked out (e.g., "MONDAY, MARCH 24").
- **Treatment:** Numbers in balances and charts use tabular lining (monospaced numbers) to ensure they align perfectly vertically in lists.

---

## 4. UI Components & Architecture

### Cards & Containers
- **Border Radius:** Very soft and friendly. Large cards utilize an `18px` to `24px` border radius. Inner elements use `8px` to `12px`.
- **Light Mode Shadows:** Diffuse, broad drop shadows (e.g., `box-shadow: 0px 10px 40px rgba(112, 144, 176, 0.12)`) to give cards a floating, weightless effect.
- **Dark Mode Depth:** Relies strictly on subtle color variation between the background and surface, occasionally accented with very faint, localized glows behind active elements.

### Buttons & Inputs
- **Primary CTA:** Solid Brand Blue fill, with rounded corners matching the inner element radius (approx `12px`).
- **Secondary Actions:** Outline buttons or low-opacity filled buttons (e.g., the "Manage Widgets" button).
- **Iconography:** Solid, filled icons for active states (menu); line-art, 1.5px to 2px stroke icons for inactive states.

### Data Visualization
- **Line Charts:** Curved, Bezier splines rather than jagged lines. They feature a soft, semi-transparent gradient fill that fades to 0% opacity toward the bottom.
- **Donut / Progress Charts:** Thick tracking lines, rounded stroke caps (`stroke-linecap: round`), featuring a clear contrast between the "achieved" value (Brand Blue) and the "remaining" value (Card Background/Gray).
