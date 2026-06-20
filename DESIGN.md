---
version: alpha
name: Soft Signal
description: A spacious, tactile interface system that pairs quiet monochrome surfaces with precise dark controls and restrained bursts of warm gradient color.

colors:
  primary: "#B81461"
  background: "#F4F4F3"
  surface: "#FAFAF9"
  surfaceElevated: "#FFFFFF"
  surfaceSunken: "#F0F0EF"
  textPrimary: "#171717"
  textSecondary: "#5F5F5C"
  textMuted: "#8A8A86"
  textDisabled: "#B9B9B4"
  borderSubtle: "#E5E5E2"
  borderStrong: "#CFCFCB"
  accent: "#B81461"
  accentHover: "#98104F"
  accentPressed: "#7D0D43"
  accentBright: "#EC2F8F"
  accentWarm: "#F28A3B"
  accentMuted: "#FBE0EF"
  accentText: "#71103D"
  onAccent: "#FFFFFF"
  controlStrong: "#20201F"
  controlStrongHover: "#080808"
  onControlStrong: "#FFFFFF"
  success: "#137A4B"
  successMuted: "#DDF4E8"
  warning: "#A05A00"
  warningMuted: "#FFF0CE"
  danger: "#C9342F"
  dangerMuted: "#FCE3E1"
  information: "#246BCE"
  informationMuted: "#E3EEFF"
  focusRing: "#D61D72"
  overlay: "rgba(17, 17, 17, 0.36)"

darkColors:
  background: "#141413"
  surface: "#1A1A19"
  surfaceElevated: "#222220"
  surfaceSunken: "#2A2A28"
  textPrimary: "#F7F7F4"
  textSecondary: "#C5C5BF"
  textMuted: "#969690"
  textDisabled: "#666662"
  borderSubtle: "#343431"
  borderStrong: "#4A4A46"
  accent: "#E64A99"
  accentHover: "#F064AC"
  accentPressed: "#C9327D"
  accentBright: "#FF66B4"
  accentWarm: "#FF9D52"
  accentMuted: "#4B2037"
  accentText: "#FFC2DF"
  onAccent: "#FFFFFF"
  controlStrong: "#F1F1EE"
  controlStrongHover: "#FFFFFF"
  onControlStrong: "#171717"
  success: "#67D59A"
  successMuted: "#183B2A"
  warning: "#F6BC63"
  warningMuted: "#493417"
  danger: "#FF8580"
  dangerMuted: "#4A2523"
  information: "#82B2FF"
  informationMuted: "#213653"
  focusRing: "#F064AC"
  overlay: "rgba(0, 0, 0, 0.64)"

typography:
  display-lg:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 3rem
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  heading-lg:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 2rem
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  heading-md:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body-lg:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  body-md:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.005em"
  body-sm:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0em"
  label-md:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 0.9375rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  caption:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.01em"

rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px

components:
  button-primary:
    backgroundColor: "{colors.controlStrong}"
    textColor: "{colors.onControlStrong}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    paddingInline: "{spacing.lg}"
    height: 48px
  button-secondary:
    backgroundColor: "{colors.surfaceSunken}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    paddingInline: "{spacing.lg}"
    height: 48px
  input:
    backgroundColor: "{colors.surfaceSunken}"
    textColor: "{colors.textPrimary}"
    placeholderColor: "{colors.textMuted}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    paddingInline: "{spacing.lg}"
    height: 48px
  card:
    backgroundColor: "{colors.surfaceElevated}"
    textColor: "{colors.textPrimary}"
    borderColor: "{colors.borderSubtle}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  modal:
    backgroundColor: "{colors.surfaceElevated}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
    width: 640px
  navigation:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  navigation-item:
    backgroundColor: "transparent"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    paddingInline: "{spacing.md}"
    height: 56px
  navigation-item-selected:
    backgroundColor: "{colors.surfaceElevated}"
    textColor: "{colors.textPrimary}"
    borderColor: "{colors.borderSubtle}"
    borderWidth: 1px
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    paddingInline: "{spacing.md}"
    height: 56px
    boxShadow: "0 1px 2px rgba(17, 17, 17, 0.06), 0 4px 12px rgba(17, 17, 17, 0.05)"
  badge:
    backgroundColor: "{colors.accentMuted}"
    textColor: "{colors.accentText}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    paddingInline: "{spacing.sm}"
    height: 28px
  list-item:
    backgroundColor: "{colors.surfaceElevated}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    paddingInline: "{spacing.lg}"
    height: 64px
---

## Overview

Soft Signal is a tactile, quietly expressive design language for approachable utility products. Its foundation is nearly monochrome: warm off-white canvases, white floating surfaces, charcoal controls, fine gray dividers, and generous negative space. Personality arrives through selective warm gradients, rounded geometry, human imagery, and small moments of responsive delight.

The product should feel calm before it feels colorful. Users should perceive it as trustworthy, direct, friendly, and carefully made rather than sterile or corporate. Strong hierarchy comes from scale, spacing, surface contrast, and restrained elevation—not from filling every region with color.

The visual language combines softly elevated productivity surfaces, oversized touch-friendly controls, and occasional celebratory gradient objects. Neutral UI handles routine work; color marks a reward, premium benefit, identity, or singular high-value moment.

Density is comfortably spacious. Controls are substantial, groups are clearly separated, and cards use enough interior padding to make their large radii feel intentional. Avoid cramped dashboards, cold blue-gray enterprise styling, excessive glass effects, hard-edged containers, and decorative gradients on routine controls.

## Colors

The default theme is light and warm. Use `background` (`#F4F4F3`) for page canvases and quiet application chrome. Use `surface` (`#FAFAF9`) for secondary regions and `surfaceElevated` (`#FFFFFF`) for cards, menus, modals, selected navigation tiles, and controls that must visibly lift from the page. `surfaceSunken` (`#F0F0EF`) denotes grouped inputs and low-emphasis control fills.

Text follows a compact hierarchy:

- `textPrimary` (`#171717`) for headings, values, labels, icons, and essential instructions.
- `textSecondary` (`#5F5F5C`) for supporting copy and important metadata.
- `textMuted` (`#8A8A86`) for placeholders, section labels, timestamps, and tertiary metadata.
- `textDisabled` (`#B9B9B4`) only for unavailable content.

Routine primary actions use `controlStrong` (`#20201F`) with white text. The raspberry accent `#B81461` is reserved for meaningful selections outside primary navigation, premium status, identity rings, rewards, and rare accent actions.

A celebratory gradient may blend `accentWarm` (`#F28A3B`) through `accentBright` (`#EC2F8F`) into `accent` (`#B81461`). Limit it to one dominant reward, milestone, or promotional surface per view.

Use `borderSubtle` (`#E5E5E2`) for separators, card outlines, and selected navigation tiles. Use `borderStrong` (`#CFCFCB`) only when an interactive boundary needs additional definition.

Semantic colors are functional:

- Success: `#137A4B` on `#DDF4E8`.
- Warning: `#A05A00` on `#FFF0CE`.
- Danger: `#C9342F` on `#FCE3E1`.
- Information: `#246BCE` on `#E3EEFF`.

Dark mode is a warm charcoal translation, not a mechanical inversion:

- `background` becomes `#141413`, preserving a faint warm bias rather than using pure black.
- `surface`, `surfaceElevated`, and `surfaceSunken` become `#1A1A19`, `#222220`, and `#2A2A28`.
- Primary, secondary, muted, and disabled text become `#F7F7F4`, `#C5C5BF`, `#969690`, and `#666662`.
- Borders become `#343431` and `#4A4A46`; they should remain visible without appearing luminous.
- The accent brightens to `#E64A99`, with `#F064AC` on hover and `#C9327D` when pressed.
- Primary controls invert to a near-white `#F1F1EE` surface with `#171717` text.
- Semantic colors use brighter foregrounds on deep tinted surfaces: success `#67D59A` on `#183B2A`, warning `#F6BC63` on `#493417`, danger `#FF8580` on `#4A2523`, and information `#82B2FF` on `#213653`.

Dark mode should feel dim, warm, and legible. Floating panels remain visibly lighter than the map and page background. Preserve the same hierarchy, spacing, and restrained use of accent color across themes.

Theme behavior defaults to the operating-system preference and offers explicit Light, Dark, and System choices. Persist explicit choices locally and apply the selected theme before first paint to avoid a flash of the wrong theme. Maps and other large visual canvases must use a purpose-built style for the active theme.

## Typography

Use Geist as the preferred family, with Inter and the system sans-serif stack as dependable substitutes. The style is a rounded neo-grotesk: legible, direct, slightly friendly, and free from ornamental detail.

Display and heading styles use weight 600, tight tracking, and compact line heights. Body copy uses regular weight and open line spacing. Labels use `label-md`: semibold, compact, and sentence case. Captions support badges, timestamps, and terse metadata.

Use tabular numerals for transit times, prices, dates, countdowns, and aligned data columns. Large numeric values may use the heading scale while retaining restrained weight.

Establish no more than four visible levels within one region: heading, primary content, supporting content, and caption. When hierarchy feels weak, adjust spacing or color before introducing another font size.

## Layout

Use a centered responsive shell with a maximum width between 1120px and 1280px. Focused workflows such as sharing or account management should use surfaces between 480px and 720px.

Desktop layouts use a 12-column grid with 24px gutters and 32px to 48px page padding. Major sections are separated by 32px to 48px; related controls use 8px to 16px gaps.

Cards generally use 24px interior padding. Large modals may use 32px where content is sparse. Pair large corner radii with generous padding so surfaces feel soft rather than inflated.

Align text and controls to shared edges. Use centered alignment for compact actions, avatars, promotional objects, and short empty states only. Forms, lists, data, and long copy remain left aligned.

On mobile, use 16px page padding and collapse multi-column layouts to one column. Keep interactive targets at least 44px tall and maintain 12px to 16px between unrelated controls.

## Elevation & Depth

Depth is soft, diffused, and minimal. Most hierarchy comes from background contrast and borders. Shadows are reserved for surfaces that genuinely float: selected navigation tiles, modals, menus, popovers, tooltips, and draggable or promotional cards.

Use these practical levels:

- Selected navigation tile: `0 1px 2px rgba(17,17,17,0.06), 0 4px 12px rgba(17,17,17,0.05)`.
- Floating card: `0 1px 2px rgba(17,17,17,0.08), 0 10px 30px rgba(17,17,17,0.08)`.
- Modal or large popover: `0 2px 6px rgba(17,17,17,0.08), 0 24px 64px rgba(17,17,17,0.14)`.

The selected navigation tile uses the lightest elevation in the system. It should read as gently raised from its parent surface, never as a card floating independently.

Avoid dark, crisp shadows, glowing edges, or routine glassmorphism.

## Shapes

Rounded geometry is a defining characteristic, but radius reflects scale.

Use 8px for small icon controls, 12px for buttons, inputs, and navigation rows, 16px for cards and menus, and 24px for large modals or expressive promotional cards. Use full pills for badges, compact call-to-action chips, segmented controls, avatars, and status indicators.

Buttons and inputs should usually share a 12px radius and 48px height when placed together. Navigation rows use a 12px radius and 56px height.

Icon containers may be circular or softly squared. Use circles for identity and status; use rounded squares for utility categories and repeated list icons.

## Components

### Buttons

Primary buttons use `controlStrong` with white text. They are 48px tall, use 12px corners, `label-md` typography, and 16px to 24px horizontal padding. Hover darkens to `#080808`.

Secondary buttons use `surfaceSunken`, `textPrimary`, and a subtle border where necessary. Tertiary and ghost buttons use transparent backgrounds and gain `surfaceSunken` on hover.

Accent buttons are reserved for rewards, identity, premium status, or meaningful selection. Disabled buttons use `surfaceSunken` and `textDisabled`, remove shadows, and must not communicate state through opacity alone.

Place icons 8px from their labels. Icon-only buttons must be square, at least 44px, and include an accessible label.

### Inputs

Text fields, search fields, and selects are 48px tall with a `surfaceSunken` fill, 12px radius, and either no visible border or a 1px `borderSubtle` border.

On focus, move to `surfaceElevated` and apply a 2px `focusRing` outline with a 2px offset. Placeholders use `textMuted`; entered values use `textPrimary`.

Errors use a danger border and danger-colored supporting text. Keep the entered value intact and pair color with an icon or explicit message.

### Cards

Cards use `surfaceElevated`, 16px corners, and 24px padding. Static cards use a subtle border without a shadow. Floating or interactive cards may use the floating-card shadow.

Card headers contain a title and optional action aligned on one row. Content follows after 16px. Footers are separated by 16px to 24px of space or a subtle divider.

Promotional and reward cards may use the warm-to-raspberry gradient, white primary text, and translucent white controls. Limit these surfaces to one dominant moment per view.

### Navigation

Use top navigation for compact products and side navigation when several destinations remain persistent. Navigation surfaces stay neutral.

Rows are 56px tall with 12px horizontal padding. Icons are 20px to 24px and sit 16px from their labels. Use one consistent outlined icon family with rounded joins and uniform stroke weight.

The selected destination uses the **Raised Tile** treatment:

- Fill the complete row with `surfaceElevated` (`#FFFFFF` in light mode and `#222220` in dark mode).
- Apply a 1px `borderSubtle` outline (`#E5E5E2` in light mode and `#343431` in dark mode).
- Use a 12px radius.
- Apply the selected-navigation shadow: `0 1px 2px rgba(17,17,17,0.06), 0 4px 12px rgba(17,17,17,0.05)`.
- Keep the icon and label `textPrimary` (`#171717` in light mode and `#F7F7F4` in dark mode).
- Set the label in `label-md` while unselected rows use `body-md`.
- Preserve the row's normal dimensions and alignment; selection must not shift nearby content.

Unselected rows remain transparent and flat. Hover uses `surfaceSunken` without elevation.

Do not add an accent rail, side bar, dot, underline, checkmark, colored icon, gradient, or saturated fill to selected navigation rows. The white surface, fine outline, soft elevation, and semibold label provide the complete selection signal.

Separate account, help, and sign-out actions from primary destinations with a subtle divider and 16px to 24px vertical spacing.

### Modals / Popovers

Modals use `surfaceElevated`, a 24px radius, and 24px to 32px padding. Use the `overlay` token for the backdrop.

Place a close control in the top-right when dismissal is safe. It must be at least 40px square. Destructive modals require explicit Cancel and Confirm actions.

Popovers use 16px corners, 12px outer padding, and 8px internal gaps. Transitions should take 160–220ms with an ease-out curve, a small opacity change, and no more than 8px translation.

### Badges / Tags

Badges are 24px to 28px tall, use `caption` typography, semibold weight, and 8px horizontal padding.

The default accent badge uses `accentMuted` with `accentText`. Semantic badges use muted backgrounds with their corresponding semantic foreground. Keep labels to one to three words.

### Lists / Tables

List rows are 56px to 72px tall. Use 16px horizontal padding and 12px to 16px gaps between avatars, icons, labels, and trailing controls.

Use subtle dividers between dense rows. Spacious lists may omit dividers and rely on rhythm. Hover applies `surfaceSunken`; selection requires a persistent marker or stronger background.

Tables use 48px headers and 52px to 60px rows. Keep numeric columns right aligned and use tabular numerals. Avoid vertical grid lines unless the data requires them.

Empty states should include one short heading, one sentence of guidance, and at most one primary action.

## Do's and Don'ts

### Do

- Do use the Raised Tile treatment consistently for selected navigation rows.
- Do use white fill, a subtle border, and the lightest system shadow for navigation selection.
- Do keep selected navigation icons charcoal and labels semibold.
- Do use charcoal controls for routine primary actions and reserve raspberry for meaningful signals.
- Do keep page backgrounds quieter than interactive surfaces.
- Do pair 16px to 24px radii with proportional interior padding.
- Do use the warm gradient for one celebratory or premium moment at a time.
- Do maintain a visible hierarchy using primary, secondary, and muted text colors.
- Do keep interactive targets at least 44px high.
- Do align icons, labels, metadata, and trailing controls to consistent edges.
- Do use explicit focus rings and pair semantic colors with text or icons.
- Do use the spacing scale as written.
- Do use the `darkColors` semantic mapping when dark mode is active.
- Do use a purpose-built dark map style with dark UI surfaces.

### Don't

- Don't add accent rails, side bars, dots, underlines, or checkmarks to selected navigation rows.
- Don't color selected navigation icons or labels raspberry.
- Don't give selected navigation tiles the same shadow as a modal or floating card.
- Don't change row dimensions or alignment between selected and unselected states.
- Don't use more than one strong accent or gradient focal point on the same screen.
- Don't apply saturated accent color to standard navigation or routine form controls.
- Don't invent new spacing or radius values when an existing token works.
- Don't use heavy, crisp, or black shadows on ordinary cards.
- Don't center-align forms, lists, tables, or long-form text.
- Don't use muted text for essential instructions.
- Don't communicate hover, focus, selection, success, or error through color alone.
- Don't mix unrelated icon styles within the same interface.
- Don't use pure black for the dark page or panel surfaces.
- Don't invert light-theme colors or reduce all dark-mode content to the same gray.
