import { BOARD_HEIGHT, BOARD_WIDTH, type Board, type GameState, type Piece, type RandomSource, type Tetromino } from "./types"
import { getRelativeCells, TETROMINOES } from "./tetrominoes"

const PREVIEW_COUNT = 5
const LINE_SCORE = [0, 40, 100, 300, 1200] as const

const JLSTZ_KICKS: Record<string, Point[]> = {
  "0>1": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: 2 },
    { x: -1, y: 2 },
  ],
  "1>0": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: -2 },
    { x: 1, y: -2 },
  ],
  "1>2": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: -2 },
    { x: 1, y: -2 },
  ],
  "2>1": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: 2 },
    { x: -1, y: 2 },
  ],
  "2>3": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ],
  "3>2": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: -2 },
    { x: -1, y: -2 },
  ],
  "3>0": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: -2 },
    { x: -1, y: -2 },
  ],
  "0>3": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ],
}

const I_KICKS: Record<string, Point[]> = {
  "0>1": [
    { x: 0, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 1 },
    { x: 1, y: -2 },
  ],
  "1>0": [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: -1 },
    { x: -1, y: 2 },
  ],
  "1>2": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: -2 },
    { x: 2, y: 1 },
  ],
  "2>1": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 2 },
    { x: -2, y: -1 },
  ],
  "2>3": [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: -1 },
    { x: -1, y: 2 },
  ],
  "3>2": [
    { x: 0, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 1 },
    { x: 1, y: -2 },
  ],
  "3>0": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 2 },
    { x: -2, y: -1 },
  ],
  "0>3": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: -2 },
    { x: 2, y: 1 },
  ],
}

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array.from({ length: BOARD_WIDTH }, () => null))
}

function createPiece(kind: Tetromino): Piece {
  return { kind, x: 3, y: -2, rotation: 0 }
}

function shuffleBag(rng: RandomSource): Tetromino[] {
  const bag = [...TETROMINOES]

  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const current = bag[i]
    bag[i] = bag[j]
    bag[j] = current
  }

  return bag
}

function ensureQueue(next: Tetromino[], rng: RandomSource): Tetromino[] {
  let queue = next

  while (queue.length < PREVIEW_COUNT + 1) {
    queue = [...queue, ...shuffleBag(rng)]
  }

  return queue
}

function popNext(next: Tetromino[], rng: RandomSource): { piece: Piece; next: Tetromino[] } {
  const queue = ensureQueue(next, rng)
  const [kind, ...rest] = queue
  return { piece: createPiece(kind), next: ensureQueue(rest, rng) }
}

function calculateLevel(lines: number): number {
  return Math.floor(lines / 10) + 1
}

function calculateDropInterval(level: number): number {
  return Math.max(80, 800 - (level - 1) * 55)
}

export function getPieceCells(piece: Piece): Point[] {
  return getRelativeCells(piece.kind, piece.rotation).map((cell) => ({
    x: piece.x + cell.x,
    y: piece.y + cell.y,
  }))
}

function collides(board: Board, piece: Piece): boolean {
  return getPieceCells(piece).some((cell) => {
    if (cell.x < 0 || cell.x >= BOARD_WIDTH || cell.y >= BOARD_HEIGHT) {
      return true
    }

    if (cell.y < 0) {
      return false
    }

    return board[cell.y][cell.x] !== null
  })
}

function placePiece(board: Board, piece: Piece): { board: Board; placedAboveTop: boolean } {
  const nextBoard = board.map((row) => [...row])
  let placedAboveTop = false

  for (const cell of getPieceCells(piece)) {
    if (cell.y < 0) {
      placedAboveTop = true
      continue
    }

    nextBoard[cell.y][cell.x] = piece.kind
  }

  return { board: nextBoard, placedAboveTop }
}

export function clearCompletedLines(board: Board): { board: Board; cleared: number } {
  const remainingRows = board.filter((row) => row.some((cell) => cell === null))
  const cleared = BOARD_HEIGHT - remainingRows.length
  const emptyRows = Array.from({ length: cleared }, () => Array.from({ length: BOARD_WIDTH }, () => null))

  return { board: [...emptyRows, ...remainingRows], cleared }
}

function lockPiece(state: GameState, rng: RandomSource, scoreBonus: number): GameState {
  const placed = placePiece(state.board, state.active)

  if (placed.placedAboveTop) {
    return { ...state, board: placed.board, score: state.score + scoreBonus, status: "game-over" }
  }

  const cleared = clearCompletedLines(placed.board)
  const lines = state.lines + cleared.cleared
  const level = calculateLevel(lines)
  const { piece, next } = popNext(state.next, rng)
  const score = state.score + scoreBonus + LINE_SCORE[cleared.cleared] * level

  if (collides(cleared.board, piece)) {
    return {
      ...state,
      board: cleared.board,
      active: piece,
      next,
      score,
      level,
      lines,
      lastClear: cleared.cleared,
      dropIntervalMs: calculateDropInterval(level),
      canHold: true,
      status: "game-over",
    }
  }

  return {
    ...state,
    board: cleared.board,
    active: piece,
    next,
    score,
    level,
    lines,
    lastClear: cleared.cleared,
    dropIntervalMs: calculateDropInterval(level),
    canHold: true,
  }
}

export function createGame(rng: RandomSource = Math.random): GameState {
  const board = createEmptyBoard()
  const { piece, next } = popNext([], rng)

  return {
    board,
    active: piece,
    hold: null,
    canHold: true,
    next,
    score: 0,
    level: 1,
    lines: 0,
    status: collides(board, piece) ? "game-over" : "playing",
    lastClear: 0,
    dropIntervalMs: calculateDropInterval(1),
  }
}

export function movePiece(state: GameState, dx: number): GameState {
  if (state.status !== "playing") {
    return state
  }

  const active = { ...state.active, x: state.active.x + dx }
  return collides(state.board, active) ? state : { ...state, active }
}

export function rotatePiece(state: GameState, direction: 1 | -1): GameState {
  if (state.status !== "playing") {
    return state
  }

  const from = state.active.rotation
  const rotation = (from + direction + 4) % 4
  const transition = `${from}>${rotation}`
  const kicks = state.active.kind === "I" ? I_KICKS[transition] : JLSTZ_KICKS[transition]

  if (state.active.kind === "O") {
    return { ...state, active: { ...state.active, rotation } }
  }

  for (const offset of kicks) {
    const active = { ...state.active, rotation, x: state.active.x + offset.x, y: state.active.y + offset.y }

    if (!collides(state.board, active)) {
      return { ...state, active }
    }
  }

  return state
}

export function softDrop(state: GameState, rng: RandomSource = Math.random): GameState {
  if (state.status !== "playing") {
    return state
  }

  const active = { ...state.active, y: state.active.y + 1 }

  if (!collides(state.board, active)) {
    return { ...state, active, score: state.score + 1 }
  }

  return lockPiece(state, rng, 0)
}

export function tick(state: GameState, rng: RandomSource = Math.random): GameState {
  if (state.status !== "playing") {
    return state
  }

  const active = { ...state.active, y: state.active.y + 1 }

  if (!collides(state.board, active)) {
    return { ...state, active }
  }

  return lockPiece(state, rng, 0)
}

export function hardDrop(state: GameState, rng: RandomSource = Math.random): GameState {
  if (state.status !== "playing") {
    return state
  }

  let distance = 0
  let active = state.active

  while (!collides(state.board, { ...active, y: active.y + 1 })) {
    active = { ...active, y: active.y + 1 }
    distance += 1
  }

  return lockPiece({ ...state, active }, rng, distance * 2)
}

export function holdPiece(state: GameState, rng: RandomSource = Math.random): GameState {
  if (state.status !== "playing" || !state.canHold) {
    return state
  }

  const heldKind = state.active.kind

  if (state.hold === null) {
    const { piece, next } = popNext(state.next, rng)
    return {
      ...state,
      active: piece,
      hold: heldKind,
      canHold: false,
      next,
      status: collides(state.board, piece) ? "game-over" : state.status,
    }
  }

  const active = createPiece(state.hold)

  return {
    ...state,
    active,
    hold: heldKind,
    canHold: false,
    status: collides(state.board, active) ? "game-over" : state.status,
  }
}

export function togglePause(state: GameState): GameState {
  if (state.status === "game-over") {
    return state
  }

  return { ...state, status: state.status === "paused" ? "playing" : "paused" }
}

export function getGhostPiece(state: GameState): Piece {
  let ghost = state.active

  while (!collides(state.board, { ...ghost, y: ghost.y + 1 })) {
    ghost = { ...ghost, y: ghost.y + 1 }
  }

  return ghost
}

export function getBoardWithPiece(state: GameState): Board {
  const board = state.board.map((row) => [...row])

  for (const cell of getPieceCells(state.active)) {
    if (cell.y >= 0 && cell.y < BOARD_HEIGHT && cell.x >= 0 && cell.x < BOARD_WIDTH) {
      board[cell.y][cell.x] = state.active.kind
    }
  }

  return board
}

type Point = Readonly<{ x: number; y: number }>
