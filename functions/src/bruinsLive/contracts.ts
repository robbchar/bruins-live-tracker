import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const contractsRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  'contracts',
)

const loadSchema = (filename: string) =>
  JSON.parse(readFileSync(resolve(contractsRoot, filename), 'utf-8')) as unknown

export const gameStateSchema = loadSchema('game-state.json')
export const todayStateSchema = loadSchema('today-state.json')
