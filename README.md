# Blockfall

Terminal Tetris built with TypeScript, Bun, OpenTUI, and React.

## Prerequisites

Blockfall runs on Bun. Install Bun first:

```sh
curl -fsSL https://bun.sh/install | bash
```

Make sure `bun` is available in your `PATH`:

```sh
bun --version
```

## Commands

Install from npm:

```sh
npm install -g blockfall
bf
```

If your default npm registry is not the public npm registry, install with:

```sh
npm install -g blockfall --registry=https://registry.npmjs.org
```

Or switch your npm registry globally:

```sh
npm config set registry https://registry.npmjs.org
```

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
