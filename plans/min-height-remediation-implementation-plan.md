```markdown
# Min-Height Remediation Implementation Plan

## Overview

### Scope
- Implement the remediation items defined in [`./plans/min-height-removal-plan.md`](../.plans/min-height-removal-plan.md) by introducing shared viewport ratio variables, replacing pixel-based floors with percentage driven sizing, and updating affected components to consume the new variables.

### Constraints
- Do not introduce new pixel-based `min-height` or `height` floors.
- Maintain accessibility targets (21 touch areas) via responsive percentages.
- Respect landscape-first orientation logic already enforced.

## CSS Variable Framework

### Definition Site
- Extend the existing global stylesheet [`index.css`](../index.html#:58) with new `:root` declarations and landscape-specific overrides.

### Variables
| Variable | Default | Landscape Adjustment | Purpose |
| --- | --- | --- | --- |
| `--sidebar-width` | `min(22vw, 28vmin)` | `20vw` | Controls sidebar grid column width |
| `--keyboard-height` | `max(24vh, 18vmin)` | `25vh` | Anchors keyboard block height |
| `--board-height-ratio` | `calc(100vh - var(--keyboard-height) - var(--shell-padding))` | (same) | Governs puzzle board zone |
| `--shell-padding` | `clamp(1.6vmin, 2.8vmin, 3.6vmin)` | (same) | Shared padding budget |
| `--stopwatch-size` | `clamp(6vmin, 8vmin, 10vmin)` | (same) | Stopwatch circle |
| `--control-cap` | `min(16vmin, 3.75rem)` | (same) | Spin/Solve button height |

### Media Queries
- Add `@media (max-height: 540px)` override reducing `--keyboard-height` to `max(22vh, 20vmin)`.
- Ensure portrait clause keeps existing redirect overlay unaffected.

## Component Updates

### [`App.tsx`](../App.tsx:551)
1. Grid Columns
   - Replace inline `gridTemplateColumns: 'minmax(220px, 20vw) 1fr'` with `var(--sidebar-width)`.
2. Puzzle Board Shell
   - Swap `min-h-[clamp(240px,38vmin,480px)]` for `min-h-0` and inline style `minHeight: 'max(40vh, 0px)'` leveraging `--board-height-ratio`.
   - Ensure the outer flex sets `style={{ minHeight: 'var(--board-height-ratio)' }}`.
3. Spin/Solve Buttons
   - Tailwind utility: `h-[min(16vmin,3.75rem)]` plus `text-[length:min(5vmin,1.25rem)]`.
   - Update padding using `px-[min(6vw,2.8rem)]` and `py-[length:min(4vmin,1.1rem)]` to avoid px floors.
4. Inline Wheel Preview
   - Replace `h-[clamp(120px,16vmin,180px)] w[...]` with `size-[clamp(12vmin,14vmin,18vmin)]`.
5. Stopwatch Badge
   - Set `style={{ width: 'var(--stopwatch-size)', height: 'var(--stopwatch-size)' }}` and remove Tailwind clamp class.

### [`components/VirtualKeyboard.tsx`](../components/VirtualKeyboard.tsx:18)
1. Wrapper
   - Apply `style={{ height: 'var(--keyboard-height)' }}` to footer wrapper.
   - Ensure parent flex box in `App.tsx` allocates `flex-shrink: 0` and respects height.
2. Key Buttons
   - Update inline style to `style={{ height: 'min(12vmin, calc(var(--keyboard-height) / 3))' }}`.
   - Confirm responsive typography uses `text-[length:min(4.2vmin,1.3rem)]`.

### [`components/PlayerSidebar.tsx`](../components/PlayerSidebar.tsx:100)
1. Container Width
   - Ensure `App.tsx` grid column change cascades.
2. Control Buttons
   - Replace `h-9 w-9` with CSS variable `style={{ width: 'var(--sidebar-control-size)', height: 'var(--sidebar-control-size)' }}`.
   - Define `--sidebar-control-size: min(10vmin, 3.5rem)` in global vars.
3. Player Cards
   - Remove `min-h-[64px]`; rely on padding: add `py-[max(1.8vmin,0.75rem)]` using inline style to keep percentage-based.
   - Add `min-h-0` to scroll container.
4. Typography
   - Convert heading fonts to `text-[length:min(3.4vmin,1rem)]` etc. avoiding rem floors.

### [`components/Wheel.tsx`](../components/Wheel.tsx:288)
1. Inline Wheel
   - Should inherit sizing from parent (already handled via App).
2. Fullscreen Wheel
   - Replace `h-[70vh] w-[70vh]` class with inline style referencing `var(--wheel-fullscreen-size)`.
   - Add CSS variable default `--wheel-fullscreen-size: min(68vh, 68vw)`; ensure pointer offsets use relative units.
3. Container Height
   - Introduce `style={{ maxHeight: 'min(70vh, 90vmin)' }}`.

### Modal Stack

#### [`components/modals/shared/ModalSurface.tsx`](../components/modals/shared/ModalSurface.tsx:9)
- Update default `panelClassName` to use `height: var(--modal-viewport-height, min(88vh, 72vmin))` and `max-height: 100%`.
- Child container should set `display: flex; flex-direction: column; min-height: 0`.

#### [`components/modals/puzzle/PuzzleModal.tsx`](../components/modals/puzzle/PuzzleModal.tsx:278)
- Remove `h-[90vh] max-h-[90vh]` Tailwind classes.
- Wrap scroll area with `style={{ maxHeight: 'calc(100% - var(--modal-header-height))' }}`.
- Ensure tabs/control area uses `min-height: 0` to allow internal scroll.

#### [`components/modals/solve/SolveModal.tsx`](../components/modals/solve/SolveModal.tsx:67)
- Replace circular button sizes with `style={{ width: 'clamp(10vmin, 12vmin, 14vmin)', height: 'clamp(10vmin, 12vmin, 14vmin)' }}`.
- Update modal wrapper to rely on shared variable instead of `h-14`/`h-16` classes.

### Global Impact Checks
- Verify no remaining Tailwind classes include `min-h-[` with pixel stops or `h-[...]` referencing rem floors by running project search after each change.

## Validation Strategy
1. **Viewport Pass**
   - Use responsive dev tools at widths 1366x768, 1180x820, 812x375. Confirm layout object ratios match plan.
2. **Wheel Fullscreen**
   - Trigger on shortest viewport and check pointer alignment.
3. **Modal Scroll**
   - Populate puzzle library; ensure content scrolls inside modal without viewport overflow.
4. **Touch Targets**
   - Inspect button metrics using dev tools: confirm computed height >= 44px.
5. **Regression Audit**
   - Search for `clamp(` with pixel floors and `min-h-[` to ensure no reintroduced fixed minima.

## Hand-off Notes
- Implementers should follow todo checklist maintained in `update_todo_list` tracker.
- After implementation, execute `npm run build` per global instruction for verification.
- Document any variable adjustments discovered during manual validation.
```
