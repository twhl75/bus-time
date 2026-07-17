# Active Buses Design QA

- Source visual truth: `/Users/teren/.codex/generated_images/019f6e3a-1a57-7d83-9eea-1304894df0e9/exec-ecbdbb5f-d6bb-4f0e-95d6-43b0d3144074.png`
- Implementation screenshot: `/Users/teren/.codex/worktrees/13e2/bus-time/public/screenshots/active-buses-redesign.png`
- Focused panel screenshot: `/Users/teren/.codex/worktrees/13e2/bus-time/public/screenshots/active-buses-redesign-panel.png`
- Viewport: 1280 × 900 desktop; responsive header also checked at 390 × 844.
- State: route 5, five representative live-format vehicles, Bus 1706 selected, system dark theme.
- Primary interactions tested: route selection, bus-row selection/deselection, selected-row state, and map recentering without an obstructive popup.
- Browser console: no errors. Existing MapLibre style-image and fit-bounds warnings were observed; neither is caused by the redesigned panel.

## Full-view comparison evidence

The full app capture preserves the existing map-first composition and 360 px desktop panel. The new grouped list uses the selected mock's hierarchy: 3D bus asset, bus number, current position, and one elevated selected row. The reporting count and direction remain on separate lines beneath the title with their corresponding icons.

## Focused region comparison evidence

The source and focused panel capture were opened together for direct visual comparison. Important details remained readable at the focused scale, so no additional crop was needed. The implementation matches the source's typography hierarchy, gold-over-blue bus treatment, list rhythm, restrained elevation, and two-line row content. The capture uses the design system's intended dark token translation; the source uses the corresponding light tokens.

## Required fidelity surfaces

- Fonts and typography: Geist is retained. Heading, bus number, metadata, and current-position weights and line heights preserve the source hierarchy. Long stop names wrap to two lines without clipping.
- Spacing and layout rhythm: 360 px desktop width, 16 px outer radius, 12 px row radius, 112 px minimum rows, and 20 px panel padding match the target's compact tactile rhythm.
- Colors and visual tokens: warm neutral card surfaces, a muted route-color selected state, secondary copy, and dark-theme translations come from the existing Soft Signal tokens.
- Image quality and asset fidelity: the bus is a generated transparent raster asset rather than CSS/SVG art. Its gold roofline and blue lower stripe remain crisp at the rendered 88 px slot with no visible chroma halo.
- Copy and content: each selectable row contains only the bus number and nearest current stop. Destination, direction badge, coordinates, and other metadata were removed from the row, and bus selection creates no popup.
- Icons: the existing BusFront and ArrowLeftRight header icons remain aligned with their reporting and direction labels.
- Accessibility and behavior: rows are semantic buttons with explicit labels, keyboard focus rings, pressed state, practical touch height, and reduced-motion compatibility through the existing app preference handling.

## Comparison history

1. Earlier P2: the selected bus popup obscured the map and duplicated row content. It was removed; selecting a bus now focuses its marker without opening an overlay.
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
- [x] Focus the selected vehicle on the map without opening a popup.
- [x] Verify tests, lint, build, desktop interaction, and mobile header layout.

---

# Interaction QA — Stop Selection

- Design truth: the selected stop is represented by a filled route-color circle; stop details live only in the slide-up drawer; prediction rows use vehicle number as their main label and omit direction and route number.
- Before selection: `/private/tmp/bus-time-stop-selection-before.png`
- Selected state: `/private/tmp/bus-time-stop-selection-selected.png`
- Cleared state: `/private/tmp/bus-time-stop-selection-cleared.png`
- State: Route 1 in light mode with live arrival predictions.
- Primary interactions tested: selecting a map stop, opening the stop drawer, reading live predictions, closing the drawer, and clearing the selected-stop treatment.
- Console check: no browser errors.

## Findings

- No map popup is created when a stop is selected.
- The selected stop circle fills with the active route color and increases from 5px to 7px for clear map feedback.
- Closing the stop drawer clears the selected-stop fill.
- Prediction rows show `Vehicle #…` as the primary label with only arrival time and scheduled status alongside it.
- Direction, destination, and route number are absent from prediction rows.
- Empty and loading states remain unchanged.

## Verification

- [x] Selected stop receives a filled route-color circle.
- [x] Stop selection opens only the slide-up drawer.
- [x] Vehicle rows use vehicle number as the main label.
- [x] Arrival time and scheduled status remain visible.
- [x] Selection clears when the drawer closes.
- [x] Lint, tests, production build, browser interactions, and console checks pass.

final result: passed
