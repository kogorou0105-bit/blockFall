#!/usr/bin/env bun

import { createCliRenderer } from "@opentui/core"
import { createRoot, type Root } from "@opentui/react"
import { App } from "./ui/App"

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
  exitSignals: [],
})

let root: Root | null = null
let shuttingDown = false

function shutdown(code = 0): void {
  if (shuttingDown) {
    return
  }

  shuttingDown = true
  root?.unmount()
  renderer.destroy()
  process.exitCode = code
  setTimeout(() => process.exit(code), 0)
}

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
  process.once(signal, () => shutdown(signal === "SIGINT" ? 130 : 0))
}

root = createRoot(renderer)
root.render(<App onExit={() => shutdown(0)} />)
