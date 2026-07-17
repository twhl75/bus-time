# Active Buses Design QA

- Source visual truth: `/Users/teren/.codex/generated_images/019f6e3a-1a57-7d83-9eea-1304894df0e9/exec-ecbdbb5f-d6bb-4f0e-95d6-43b0d3144074.png`
- Implementation screenshot: `/Users/teren/.codex/worktrees/13e2/bus-time/public/screenshots/active-buses-redesign.png`
- Focused panel screenshot: `/Users/teren/.codex/worktrees/13e2/bus-time/public/screenshots/active-buses-redesign-panel.png`
- Viewport: 1280 × 900 desktop; responsive header also checked at 390 × 844.
- State: route 5, five representative live-format vehicles, Bus 1706 selected, system dark theme.
- Primary interactions tested: route selection, bus-row selection/deselection, selected-row state, map recentering, and matching bus popup.
- Browser console: no errors. Existing MapLibre style-image and fit-bounds warnings were observed; neither is caused by the redesigned panel.

## Full-view comparison evidence

The full app capture preserves the existing map-first composition and 360 px desktop panel. The new grouped list uses the selected mock's hierarchy: 3D bus asset, bus number, current position, lightweight separators, and one elevated selected row. The reporting and direction line remains directly beneath the title with its corresponding icons.

## Focused region comparison evidence

The source and focused panel capture were opened together for direct visual comparison. Important details remained readable at the focused scale, so no additional crop was needed. The implementation matches the source's typography hierarchy, gold-over-blue bus treatment, list rhythm, selected chevron, restrained elevation, and two-line row content. The capture uses the design system's intended dark token translation; the source uses the corresponding light tokens.

## Required fidelity surfaces

- Fonts and typography: Geist is retained. Heading, bus number, metadata, and current-position weights and line heights preserve the source hierarchy. Long stop names wrap to two lines without clipping.
- Spacing and layout rhythm: 360 px desktop width, 16 px outer radius, 12 px selected radius, 112 px minimum rows, consistent separators, and 20 px panel padding match the target's compact tactile rhythm.
- Colors and visual tokens: warm neutral card surfaces, raspberry selected state, muted secondary copy, and dark-theme translations come from the existing Soft Signal tokens.
- Image quality and asset fidelity: the bus is a generated transparent raster asset rather than CSS/SVG art. Its gold roofline and blue lower stripe remain crisp at the rendered 88 px slot with no visible chroma halo.
- Copy and content: each selectable row contains only the bus number and nearest current stop. Destination, direction badge, coordinates, and other metadata were removed from the row and popup.
- Icons: the existing BusFront and ArrowLeftRight header icons remain aligned with their reporting and direction labels. The selected-row chevron uses the same existing icon family.
- Accessibility and behavior: rows are semantic buttons with explicit labels, keyboard focus rings, pressed state, practical touch height, and reduced-motion compatibility through the existing app preference handling.

## Comparison history

1. Earlier P2: the selected bus popup used a white MapLibre surface with dark-theme white text. Fixed with theme-aware popup surface rules and a two-line bus-number/current-position popup. Post-fix evidence shows `#222220` popup background with readable light foreground.
2. Earlier P2: the collapsed mobile drawer clipped the restored two-line header metadata. Fixed by increasing its collapsed height from 112 px to 136 px. Post-fix evidence shows both reporting and direction lines fully visible at 390 × 844.
3. Earlier P2: the 3D bus appeared smaller than the source at desktop scale. Fixed by increasing its layout slot to 88 px. Post-fix focused evidence shows a source-consistent visual weight without crowding row text.

## Findings

No actionable P0, P1, or P2 differences remain.

## Follow-up polish

- P3: the current dark-theme screenshot is intentionally denser in contrast than the light source mock; a future light-theme capture could document both token translations.
- P3: MapLibre's external style emits an unrelated missing `wood-pattern` warning.

## Implementation checklist

- [x] Preserve reporting and direction metadata with corresponding icons.
- [x] Show only bus number and nearest current position in each row.
- [x] Use a real gold-and-blue 3D bus image asset.
- [x] Implement hover, focus, selected, empty, and responsive states.
- [x] Focus the selected vehicle on the map and show matching popup content.
- [x] Verify tests, lint, build, desktop interaction, and mobile header layout.

final result: passed
