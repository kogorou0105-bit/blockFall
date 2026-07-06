import { useKeyboard } from "@opentui/react"
import { useEffect, useState } from "react"
import {
  createGame,
  getGhostPiece,
  getPieceCells,
  hardDrop,
  holdPiece,
  movePiece,
  rotatePiece,
  softDrop,
  tick,
  togglePause,
} from "../game/game"
import { getRelativeCells } from "../game/tetrominoes"
import { BOARD_HEIGHT, BOARD_WIDTH, type Cell, type GameState, type Tetromino } from "../game/types"
import { COLORS, EMPTY_COLOR, GHOST_COLOR, MUTED_COLOR, PANEL_COLOR, TEXT_COLOR } from "./theme"

type AppProps = Readonly<{
  onExit: () => void
}>

type DisplayCell = Readonly<{
  kind: Cell
  ghost: boolean
}>

function createDisplayGrid(state: GameState): DisplayCell[][] {
  const grid = state.board.map((row) => row.map((kind) => ({ kind, ghost: false })))
  const ghost = getGhostPiece(state)

  for (const cell of getPieceCells(ghost)) {
    if (cell.y >= 0 && cell.y < BOARD_HEIGHT && cell.x >= 0 && cell.x < BOARD_WIDTH && grid[cell.y][cell.x].kind === null) {
      grid[cell.y][cell.x] = { kind: ghost.kind, ghost: true }
    }
  }

  for (const cell of getPieceCells(state.active)) {
    if (cell.y >= 0 && cell.y < BOARD_HEIGHT && cell.x >= 0 && cell.x < BOARD_WIDTH) {
      grid[cell.y][cell.x] = { kind: state.active.kind, ghost: false }
    }
  }

  return grid
}

function cellColor(cell: DisplayCell): string {
  if (cell.ghost) {
    return GHOST_COLOR
  }

  return cell.kind === null ? EMPTY_COLOR : COLORS[cell.kind]
}

function BoardView({ state }: { state: GameState }) {
  const grid = createDisplayGrid(state)

  return (
    <box style={{ border: true, borderColor: "#3a445c", padding: 1, flexDirection: "column", backgroundColor: PANEL_COLOR }}>
      {grid.map((row, rowIndex) => (
        <box key={rowIndex} style={{ flexDirection: "row" }}>
          {row.map((cell, columnIndex) => (
            <box key={`${rowIndex}-${columnIndex}`} style={{ width: 2, height: 1, backgroundColor: cellColor(cell) }} />
          ))}
        </box>
      ))}
    </box>
  )
}

function PreviewPiece({ kind }: { kind: Tetromino }) {
  const cells = new Set(getRelativeCells(kind, 0).map((cell) => `${cell.x},${cell.y}`))

  return (
    <box style={{ flexDirection: "column", gap: 0 }}>
      {Array.from({ length: 3 }, (_, y) => (
        <box key={y} style={{ flexDirection: "row" }}>
          {Array.from({ length: 4 }, (_, x) => {
            const filled = cells.has(`${x},${y}`)
            return <box key={`${x}-${y}`} style={{ width: 2, height: 1, backgroundColor: filled ? COLORS[kind] : PANEL_COLOR }} />
          })}
        </box>
      ))}
    </box>
  )
}

function Sidebar({ state }: { state: GameState }) {
  return (
    <box style={{ width: 32, flexDirection: "column", gap: 1 }}>
      <box style={{ border: true, borderColor: "#3a445c", padding: 1, flexDirection: "column", backgroundColor: PANEL_COLOR }}>
        <text fg={MUTED_COLOR}>Score</text>
        <text fg={TEXT_COLOR}>{state.score.toString()}</text>
        <text fg={MUTED_COLOR}>Level</text>
        <text fg={TEXT_COLOR}>{state.level.toString()}</text>
        <text fg={MUTED_COLOR}>Lines</text>
        <text fg={TEXT_COLOR}>{state.lines.toString()}</text>
      </box>

      <box style={{ border: true, borderColor: "#3a445c", padding: 1, flexDirection: "column", gap: 1, backgroundColor: PANEL_COLOR }}>
        <text fg={MUTED_COLOR}>Hold {state.canHold ? "" : "(locked)"}</text>
        {state.hold === null ? <text fg={MUTED_COLOR}>Empty</text> : <PreviewPiece kind={state.hold} />}
      </box>

      <box style={{ border: true, borderColor: "#3a445c", padding: 1, flexDirection: "column", gap: 1, backgroundColor: PANEL_COLOR }}>
        <text fg={MUTED_COLOR}>Next</text>
        {state.next.slice(0, 3).map((kind, index) => (
          <PreviewPiece key={`${kind}-${index}`} kind={kind} />
        ))}
      </box>

      <box style={{ border: true, borderColor: "#3a445c", padding: 1, flexDirection: "column", backgroundColor: PANEL_COLOR }}>
        <text fg={MUTED_COLOR}>Controls</text>
        <text fg={TEXT_COLOR}>Move: arrows</text>
        <text fg={TEXT_COLOR}>Rotate: up / x / z</text>
        <text fg={TEXT_COLOR}>Hold: c</text>
        <text fg={TEXT_COLOR}>Drop: down / space</text>
        <text fg={TEXT_COLOR}>Pause: p</text>
        <text fg={TEXT_COLOR}>Quit: q / esc</text>
      </box>
    </box>
  )
}

function statusText(state: GameState): string {
  if (state.status === "paused") {
    return "Paused - press P to resume"
  }

  if (state.status === "game-over") {
    return "Game over - press R to restart"
  }

  if (state.lastClear > 0) {
    return `Cleared ${state.lastClear} line${state.lastClear > 1 ? "s" : ""}`
  }

  return "Stack clean. Keep falling."
}

export function App({ onExit }: AppProps) {
  const [game, setGame] = useState(() => createGame())

  useEffect(() => {
    if (game.status !== "playing") {
      return
    }

    const timer = setInterval(() => {
      setGame((current) => tick(current))
    }, game.dropIntervalMs)

    return () => clearInterval(timer)
  }, [game.dropIntervalMs, game.status])

  useKeyboard((key) => {
    if (key.name === "escape" || key.name === "q" || (key.name === "c" && key.ctrl)) {
      onExit()
      return
    }

    if (key.name === "r") {
      setGame((current) => (current.status === "game-over" ? createGame() : current))
      return
    }

    if (key.name === "p") {
      setGame((current) => togglePause(current))
      return
    }

    if (key.name === "left") {
      setGame((current) => movePiece(current, -1))
    } else if (key.name === "right") {
      setGame((current) => movePiece(current, 1))
    } else if (key.name === "down") {
      setGame((current) => softDrop(current))
    } else if (key.name === "up" || key.name === "x") {
      setGame((current) => rotatePiece(current, 1))
    } else if (key.name === "z") {
      setGame((current) => rotatePiece(current, -1))
    } else if (key.name === "c") {
      setGame((current) => holdPiece(current))
    } else if (key.name === "space") {
      setGame((current) => hardDrop(current))
    }
  })

  return (
    <box style={{ width: "100%", height: "100%", padding: 1, flexDirection: "column", gap: 1, backgroundColor: "#0b0f18" }}>
      <box style={{ flexDirection: "column" }}>
        <text fg="#8be9fd">BLOCKFALL</text>
        <text fg={MUTED_COLOR}>{statusText(game)}</text>
      </box>

      <box style={{ flexDirection: "row", gap: 2 }}>
        <BoardView state={game} />
        <Sidebar state={game} />
      </box>
    </box>
  )
}
