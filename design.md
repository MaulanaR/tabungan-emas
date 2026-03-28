# Aurelian Reserve Design System

### 1. Overview & Creative North Star
**Creative North Star: The Sovereign Curator**
Aurelian Reserve is a design system crafted for high-value asset management, blending the heritage of physical bullion with the precision of modern fintech. It rejects the "standard dashboard" aesthetic in favor of a high-end editorial experience. The system utilizes intentional asymmetry, dramatic typographic scales, and tonal layering to evoke a sense of security, exclusivity, and permanence.

### 2. Colors
The palette is rooted in metallic earth tones, specifically focusing on "Burnished Gold" to represent physical wealth.

- **The "No-Line" Rule:** Sectioning must never be achieved through 1px solid borders. Boundaries are defined by transitions from `surface_container_low` to `surface_container_lowest`. For interactive elements, use soft shadows or subtle shifts in tonal depth rather than structural strokes.
- **Surface Hierarchy & Nesting:** Depth is created by stacking lighter surfaces on darker ones. For example, a `surface_container_lowest` (#FFFFFF) card sits atop a `surface_container_low` (#F6F3F2) background.
- **Signature Textures:** A specific "Gold Gradient" (`linear-gradient(135deg, #FFDA53 0%, #E0C36B 100%)`) is reserved for high-impact hero moments and primary action triggers.

### 3. Typography
The system uses a high-contrast pairing of **Manrope** for expressive headlines and **Inter** for utilitarian data.

- **Display & Headlines:** Utilize Manrope with `extra-bold` weights (800) and negative tracking (-0.025em) for a confident, editorial look.
- **Body & Labels:** Inter provides legibility for complex financial figures.
- **Ground Truth Scale:**
  - **Hero Value:** 3rem (48px) - 3.75rem (60px) with `extrabold` weight.
  - **Section Titles:** 1.5rem (24px) - 1.875rem (30px).
  - **Body Standard:** 0.875rem (14px) - 1.125rem (18px).
  - **Micro-data:** 9px to 11px for supplemental chart labels and metadata.

### 4. Elevation & Depth
Aurelian Reserve relies on **Tonal Layering** and **Ambient Shadows** to communicate hierarchy.

- **The Layering Principle:** Use `surface-container` tiers to distinguish content zones. The app background sits at `surface_container_low`, while primary cards rise to `surface_container_lowest`.
- **Ambient Shadows:** 
  - `shadow-sm`: Used for standard cards to provide a subtle "lift" from the page.
  - `shadow-lg`: Specifically for floating elements like the Bottom Nav and FAB, often combined with a 15-20% opacity primary color tint (`rgba(255,218,83,0.15)`)
- **Glassmorphism:** Navigation and context-specific overlays utilize a `white/80` (80% opacity) background with a `12px` backdrop blur to maintain spatial awareness.

### 5. Components
- **The Sovereign Card:** Rounded corners at 0.75rem (xl), minimal internal padding of 1.5rem, and no border. Used for asset listings and market updates.
- **Gold-Clad Buttons:** Primary actions use the `bg-gold-gradient`. Floating Action Buttons (FABs) are perfectly circular and house 24px icons.
- **Status Chips:** Use high-saturation tertiary colors (Blue for "Certified", Gold for "Trending") with `uppercase` labels and `0.05em` tracking for a professional, authenticated feel.
- **Bento Grid:** Layouts should prefer a 2:1 ratio for "Insights" cards vs "Action" cards to create a non-traditional, dynamic rhythm.

### 6. Do's and Don'ts
- **Do:** Use `Manrope` for all large numbers and currency symbols.
- **Do:** Use `0.75rem` (12px) spacing as the base unit for all margins and gaps.
- **Don't:** Use black (#000000) for text; use `on_surface` (#1C1B1B) to maintain tonal warmth.
- **Don't:** Apply heavy shadows to every element. Only the "Hero" and "Floating" tiers should have visible elevation.
- **Do:** Ensure all "Pure Gold" data (99.9%) is highlighted using the `tertiary` blue to provide a visual anchor against the warm palette.