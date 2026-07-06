# Blockfall

Terminal Tetris built with TypeScript, Bun, OpenTUI, and React.

## Commands

```sh
bun install
bun run play
```

To install the local CLI command:

```sh
bun link
blockfall
```

## Controls

- `Left` / `Right`: move
- `Down`: soft drop
- `Up` or `X`: rotate clockwise
- `Z`: rotate counter-clockwise
- `C`: hold current piece
- `Space`: hard drop
- `P`: pause
- `R`: restart after game over
- `Q`, `Esc`, or `Ctrl+C`: quit

## Structure

- `src/game`: pure TypeScript game state and rules
- `src/ui`: OpenTUI + React terminal rendering
- `src/index.tsx`: Bun entry point
