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
