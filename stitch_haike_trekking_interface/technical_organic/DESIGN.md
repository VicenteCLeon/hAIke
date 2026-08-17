---
name: Technical Organic
colors:
  surface: '#101412'
  surface-dim: '#101412'
  surface-bright: '#353a37'
  surface-container-lowest: '#0a0f0d'
  surface-container-low: '#181d1a'
  surface-container: '#1c211e'
  surface-container-high: '#262b28'
  surface-container-highest: '#313633'
  on-surface: '#dfe4de'
  on-surface-variant: '#c0c9bd'
  inverse-surface: '#dfe4de'
  inverse-on-surface: '#2c322e'
  outline: '#8a9389'
  outline-variant: '#404940'
  surface-tint: '#91d69d'
  primary: '#91d69d'
  on-primary: '#003918'
  primary-container: '#5c9f6b'
  on-primary-container: '#003114'
  inverse-primary: '#286b3c'
  secondary: '#8dd3c9'
  on-secondary: '#003732'
  secondary-container: '#005850'
  on-secondary-container: '#86ccc1'
  tertiary: '#ffb688'
  on-tertiary: '#512400'
  tertiary-container: '#ca7f4b'
  on-tertiary-container: '#471e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acf3b8'
  primary-fixed-dim: '#91d69d'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#075227'
  secondary-fixed: '#a9f0e5'
  secondary-fixed-dim: '#8dd3c9'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdbc7'
  tertiary-fixed-dim: '#ffb688'
  on-tertiary-fixed: '#311300'
  on-tertiary-fixed-variant: '#703708'
  background: '#101412'
  on-background: '#dfe4de'
  surface-variant: '#313633'
typography:
  display-lg:
    fontFamily: DM Serif Display
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: DM Serif Display
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 42px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: DM Serif Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-sm:
    fontFamily: DM Serif Display
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  title-lg:
    fontFamily: DM Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  technical-mono:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style
The design system embodies a "Technical Organic" aesthetic, designed for high-altitude exploration and rugged outdoor utility. It bridges the gap between raw, unpredictable nature and the precision of modern navigational instruments. The target audience includes mountain hikers, backcountry explorers, and technical enthusiasts who require tools that feel as resilient as their gear.

The style leverages **Minimalism** with **Tactile** influences. It utilizes heavy whitespace to evoke the vastness of the mountains while employing precise, technical details—such as hairline borders and monospaced coordinates—to instill confidence and reliability. The emotional response is one of grounded focus, resilience, and quiet authority.

## Colors
The palette is a high-contrast, dark-mode-first execution inspired by high-mountain landscapes.
- **Surface & Base:** The primary canvas is "Deep Moss" (#0b140d), providing a low-glare, earthy foundation. "Slate Stone" (#1a1f1c) is used for elevated containers and UI layering.
- **Action Colors:** "Leaf Green" (#4a8c5a) serves as the primary action color, offering high visibility against dark backgrounds. "Stream Teal" (#5da399) is the secondary color for informative states and navigational paths.
- **Utility & Accents:** "Lichen Orange" (#c47a47) is reserved for technical alerts and warnings, ensuring immediate recognition. "Topographic Gold" (#bda55d) is used sparingly for micro-interactions and precision markers.
- **Text:** "Morning Mist" (#e8f0e9) provides a crisp, high-contrast reading experience for maximum legibility in outdoor conditions.

## Typography
The typography contrasts the elegance of a classic serif with the efficiency of a geometric sans-serif. 
- **Display & Headlines:** Use **DM Serif Display**. This adds a refined, editorial feel to the mountain experience, making titles feel like topographical landmarks.
- **Body & Interface:** Use **DM Sans**. This provides a neutral, highly readable foundation for technical data and long-form content. 
- **Technical Details:** Small labels and data points use DM Sans with increased letter spacing and uppercase styling to mimic the look of physical dials and compasses.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop and a **Fluid Grid** on mobile. 
- **Desktop:** A 12-column grid centered on the screen with 64px margins. Content is organized into logical blocks that mimic the structured rows of a field journal.
- **Mobile:** A 4-column fluid grid with 20px margins. 
- **Spacing Rhythm:** Use a base-8 increment. Wide "LG" and "XL" spacing is used between sections to maintain the "airy" feel of mountain vistas, while "XS" and "SM" are used for technical clusters of data.

## Elevation & Depth
In this dark, nature-inspired system, depth is conveyed through **Tonal Layers** rather than shadows.
- **Layer 0 (Background):** Deep Moss green.
- **Layer 1 (Cards/Containers):** Slate Stone grey with a subtle 1px border in "Granite" (#4a554d).
- **Layer 2 (Popovers/Modals):** Slate Stone grey with a more pronounced Slate border and a subtle dark glow to simulate being "raised" off the terrain.
- **Outlines:** Use low-contrast outlines for interactive elements. Avoid drop shadows entirely to maintain a flat, instrument-like appearance.

## Shapes
Shapes are **Soft** (roundedness 1). This provides enough curvature to feel organic and approachable, yet remains sharp enough to appear technical and precise. 
- **Buttons and Inputs:** Use 0.25rem (4px) corner radius.
- **Cards and Large Containers:** Use 0.5rem (8px).
- **Navigation Elements:** Stay geometric and rigid to maintain the "instrument" feel.

## Components
- **Buttons:** Primary buttons use a solid Leaf Green fill with Morning Mist text. Secondary buttons are ghost-style with a 1px Slate Stone border.
- **Chips:** Small, Slate Stone backgrounds with Stream Teal text, used for tags like "Elevation" or "Difficulty."
- **Inputs:** Dark Slate Stone backgrounds with a 1px Granite border. When focused, the border changes to Stream Teal.
- **Lists:** Clean, border-bottom only using Granite. Icons should be monochrome Morning Mist or Topographic Gold.
- **Cards:** Use Slate Stone grey. For technical cards, include a small "Topographic Gold" accent bar at the top or side to denote active data streams.
- **Checkboxes/Radios:** Square-ish (4px radius) using Leaf Green for the active state to ensure visibility against the dark moss surface.