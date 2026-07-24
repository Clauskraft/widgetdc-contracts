#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

function run(command, args, options = {}) {
  if (process.platform === 'win32' && /^(npm|npx|pnpm|yarn)$/.test(command)) {
    return spawnSync('cmd.exe', ['/d', '/s', '/c', [command, ...args].join(' ')], {
      cwd: process.cwd(),
      encoding: 'utf8',
      shell: false,
      ...options,
    })
  }

  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: false,
    ...options,
  })
  if (result.error?.code === 'ENOENT' && process.platform === 'win32' && !/\.(cmd|exe|bat)$/i.test(command)) {
    return spawnSync(`${command}.cmd`, args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      shell: false,
      ...options,
    })
  }
  return result
}

function git(args) {
  const result = run('git', args)
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed:\n${result.stderr || result.stdout}`)
  }
  return result.stdout
}

function trackedStatusLines() {
  return git(['status', '--porcelain=v1'])
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .filter((line) => !line.startsWith('?? '))
}

function buildClassification(statusLines) {
  const nameStatus = git(['diff', '--name-status']).trim()
  const numstat = git(['diff', '--numstat']).trim()
  const summary = git(['diff', '--summary']).trim()

  if (!nameStatus && !numstat && !summary) {
    return {
      category: 'git_index_or_stat_cache_status_churn',
      detail: 'tracked porcelain status changed, but git diff name-status/numstat/summary are empty',
      statusLines,
    }
  }

  return {
    category: 'tracked_content_or_metadata_change',
    detail: 'tracked porcelain status has corresponding git diff output',
    statusLines,
    nameStatus,
    numstat,
    summary,
  }
}

function sameStatus(a, b) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort())
}

function commandFromArgv(argv) {
  const separator = argv.indexOf('--')
  const commandArgs = separator >= 0 ? argv.slice(separator + 1) : argv
  if (commandArgs.length === 0) {
    throw new Error('Usage: node scripts/assert-build-artifact-parity.mjs -- <command> [args...]')
  }
  return commandArgs
}

const commandArgs = commandFromArgv(process.argv.slice(2))
const before = trackedStatusLines()

const build = run(commandArgs[0], commandArgs.slice(1), { stdio: 'inherit' })
if (build.status !== 0) {
  console.error(`[build-artifact-parity] Build command failed with exit ${build.status}.`)
  process.exit(build.status ?? 1)
}

const after = trackedStatusLines()
if (!sameStatus(before, after)) {
  console.error('[build-artifact-parity] Build command left tracked artifact/status churn.')
  console.error(JSON.stringify(buildClassification(after), null, 2))
  console.error('[build-artifact-parity] Baseline tracked status before build:')
  console.error(JSON.stringify(before, null, 2))
  process.exit(1)
}

if (after.length === 0) {
  console.log('[build-artifact-parity] Build command left tracked status clean.')
} else {
  console.log('[build-artifact-parity] Build command preserved the pre-existing tracked status exactly.')
}
