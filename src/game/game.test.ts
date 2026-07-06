import { describe, expect, test } from "bun:test"
import { BOARD_WIDTH, type Board } from "./types"
import { clearCompletedLines, createEmptyBoard, createGame, hardDrop, holdPiece, movePiece, rotatePiece } from "./game"

const fixedRng = () => 0.25

describe("game logic", () => {
  test("creates a playable initial state", () => {
    const game = createGame(fixedRng)

    expect(game.status).toBe("playing")
    expect(game.board).toHaveLength(20)
    expect(game.next.length).toBeGreaterThanOrEqual(5)
  })

  test("moves and rotates the active piece without mutating the previous state", () => {
    const game = createGame(fixedRng)
    const moved = movePiece(game, -1)
    const rotated = rotatePiece(moved, 1)

    expect(moved.active.x).toBe(game.active.x - 1)
    expect(rotated.active.rotation).toBe((moved.active.rotation + 1) % 4)
    expect(game.active.rotation).toBe(0)
  })

  test("clears completed lines", () => {
    const board: Board = createEmptyBoard()
    board[19] = Array.from({ length: BOARD_WIDTH }, () => "T")

    const result = clearCompletedLines(board)

    expect(result.cleared).toBe(1)
    expect(result.board[0].every((cell) => cell === null)).toBe(true)
  })

  test("hard drop locks the piece and spawns the next one", () => {
    const game = createGame(fixedRng)
    const dropped = hardDrop(game, fixedRng)

    expect(dropped.score).toBeGreaterThan(0)
    expect(dropped.active).not.toEqual(game.active)
  })

  test("uses SRS kicks when rotating I against the left wall", () => {
    const game = createGame(fixedRng)
    const rotated = rotatePiece(
      {
        ...game,
        active: { kind: "I", x: -1, y: 0, rotation: 1 },
      },
      1,
    )

    expect(rotated.active.rotation).toBe(2)
    expect(rotated.active.x).toBe(1)
  })

  test("holds once per active piece and unlocks after lock", () => {
    const game = createGame(fixedRng)
    const held = holdPiece(game, fixedRng)
    const heldAgain = holdPiece(held, fixedRng)
    const dropped = hardDrop(held, fixedRng)

    expect(held.hold).toBe(game.active.kind)
    expect(held.canHold).toBe(false)
    expect(held.active.kind).not.toBe(game.active.kind)
    expect(heldAgain).toBe(held)
    expect(dropped.canHold).toBe(true)
  })
})
