export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20

export type Tetromino = "I" | "J" | "L" | "O" | "S" | "T" | "Z"
export type Cell = Tetromino | null
export type Board = Cell[][]

export type Point = Readonly<{
  x: number
  y: number
}>

export type Piece = Readonly<{
  kind: Tetromino
  x: number
  y: number
  rotation: number
}>

export type GameStatus = "playing" | "paused" | "game-over"

export type GameState = Readonly<{
  board: Board
  active: Piece
  hold: Tetromino | null
  canHold: boolean
  next: Tetromino[]
  score: number
  level: number
  lines: number
  status: GameStatus
  lastClear: number
  dropIntervalMs: number
}>

export type RandomSource = () => number
