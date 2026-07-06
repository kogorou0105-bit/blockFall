# Blockfall

Terminal Tetris built with TypeScript, Bun, OpenTUI, and React.

## Commands

Install from npm:

```sh
npm install -g blockfall
bf
```

Blockfall runs on Bun, so `bun` must be available in your `PATH`.

Run from source:

```sh
bun install
bun run play
```

To install the local CLI command:

```sh
bun link
bf
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
