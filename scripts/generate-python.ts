import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const rootDir = dirname(scriptDir)
const schemasDir = join(rootDir, 'schemas')
const pythonDir = join(rootDir, 'python', 'widgetdc_contracts')
const tempDir = mkdtempSync(join(tmpdir(), 'widgetdc-python-'))

const BASE_MODEL = `"""Base model for all WidgeTDC contracts. Wire format is snake_case."""
from pydantic import BaseModel, ConfigDict


class WidgeTDCBaseModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
    )
`

function cleanupTemp(): void {
  rmSync(tempDir, { recursive: true, force: true })
}

function fail(message: string): never {
  cleanupTemp()
  throw new Error(message)
}

function resolveCommand(command: string): string {
  const lookup = process.platform === 'win32' ? 'where' : 'which'
  const result = spawnSync(lookup, [command], { encoding: 'utf-8' })

  if (result.status !== 0) {
    fail(`Required command not found: ${command}`)
  }

  const firstMatch = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean)

  if (!firstMatch) {
    fail(`Required command not found: ${command}`)
  }

  return firstMatch
}

function ensureBaseModel(): void {
  mkdirSync(pythonDir, { recursive: true })

  for (const entry of readdirSync(pythonDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.py') && entry.name !== '_base.py') {
      unlinkSync(join(pythonDir, entry.name))
    }
  }

  const baseModelPath = join(pythonDir, '_base.py')
  if (!existsSync(baseModelPath)) {
    writeFileSync(baseModelPath, BASE_MODEL, 'utf-8')
  }
}

function listSchemaModules(): string[] {
  if (!existsSync(schemasDir)) {
    fail(`No schemas/ directory found at ${schemasDir}. Run 'npm run schemas' first.`)
  }

  return readdirSync(schemasDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

function toPythonClassName(schemaName: string): string {
  if (/^[A-Z][A-Za-z0-9]*$/.test(schemaName)) {
    return schemaName
  }

  return schemaName
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => {
      const normalized = part.replace(/^[^A-Za-z]+/, '')
      if (!normalized) {
        return ''
      }
      return normalized[0].toUpperCase() + normalized.slice(1)
    })
    .filter(Boolean)
    .join('')
}

function generateModuleFiles(moduleName: string, datamodelCodegen: string): {
  outputName: string,
  schemaNames: string[],
  classNames: string[],
  generatedFiles: string[],
} {
  const moduleDir = join(schemasDir, moduleName)
  const schemaNames = readdirSync(moduleDir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => basename(name, '.json'))
  const classNames = schemaNames.map(toPythonClassName)

  const outputName = moduleName === 'http' ? 'http_' : moduleName
  const moduleTempDir = join(tempDir, moduleName)
  mkdirSync(moduleTempDir, { recursive: true })

  for (const [index, schemaName] of schemaNames.entries()) {
    const result = spawnSync(
      datamodelCodegen,
      [
        '--input', join(moduleDir, `${schemaName}.json`),
        '--input-file-type', 'jsonschema',
        '--output', join(moduleTempDir, `${schemaName}.py`),
        '--output-model-type', 'pydantic_v2.BaseModel',
        '--target-python-version', '3.12',
        '--use-standard-collections',
        '--use-union-operator',
        '--field-constraints',
        '--enum-field-as-literal', 'all',
        '--collapse-root-models',
        '--class-name', classNames[index],
      ],
      { encoding: 'utf-8' },
    )

    if (result.status !== 0) {
      fail(`datamodel-codegen failed for ${moduleName}/${schemaName}: ${result.stderr || result.stdout}`)
    }
  }

  return {
    outputName,
    schemaNames,
    classNames,
    generatedFiles: schemaNames.map((schemaName) => join(moduleTempDir, `${schemaName}.py`)),
  }
}

function extractBody(filePath: string): string {
  const lines = readFileSync(filePath, 'utf-8').split(/\r?\n/)
  const classIndex = lines.findIndex((line) => line.startsWith('class '))

  if (classIndex === -1) {
    fail(`Generated file did not contain a class definition: ${filePath}`)
  }

  return lines.slice(classIndex).join('\n').trimEnd()
}

type TypeAlias = { from: string; to: string }

function detectDuplicateTypes(classNames: string[], generatedFiles: string[]): TypeAlias[] {
  const aliases: TypeAlias[] = []
  const publicTypes = new Set(classNames)

  for (const filePath of generatedFiles) {
    const content = readFileSync(filePath, 'utf-8')
    const classMatches = content.matchAll(/^class\s+(\w+)\s*\(/gm)
    for (const match of classMatches) {
      const className = match[1]
      if (!publicTypes.has(className)) {
        const publicEquivalent = findPublicEquivalent(className, publicTypes, filePath)
        if (publicEquivalent) {
          aliases.push({ from: className, to: publicEquivalent })
        }
      }
    }
  }

  return aliases
}

function findPublicEquivalent(privateClass: string, publicTypes: Set<string>, filePath: string): string | null {
  const knownMappings: Record<string, string> = {
    'ProposedRule': 'ConfiguratorRule',
    'PreSeededNode': 'CanvasNodeSeed',
  }

  if (knownMappings[privateClass]) {
    return publicTypes.has(knownMappings[privateClass]) ? knownMappings[privateClass] : null
  }

  const content = readFileSync(filePath, 'utf-8')
  const privateClassRegex = new RegExp(`^class ${privateClass}\\((?:BaseModel|RootModel[^)]*?)\\):.*?(?=^class |\\z)`, 'gms')
  const privateMatch = privateClassRegex.exec(content)
  if (!privateMatch) {
    return null
  }
  const privateBody = privateMatch[0]

  for (const publicType of publicTypes) {
    const publicClassRegex = new RegExp(`^class ${publicType}\\((?:BaseModel|RootModel[^)]*?)\\):.*?(?=^class |\\z)`, 'gms')
    const publicMatch = publicClassRegex.exec(content)
    if (publicMatch) {
      const publicBody = publicMatch[0]
      const normalizedPrivate = privateBody.replace(/^class \w+/, 'class X').trim()
      const normalizedPublic = publicBody.replace(/^class \w+/, 'class X').trim()
      if (normalizedPrivate === normalizedPublic) {
        console.warn(`[generate-python] Detected duplicate class '${privateClass}' equivalent to '${publicType}'. Consider adding to knownMappings.`)
        return publicType
      }
    }
  }

  console.warn(`[generate-python] Private class '${privateClass}' has no public equivalent in knownMappings. Consider adding it manually.`)
  return null
}

function applyTypeAliases(content: string, aliases: TypeAlias[]): string {
  let result = content

  for (const alias of aliases) {
    const classDefRegex = new RegExp(`^class ${alias.from}\\([^)]+\\):.*?(?=^class |$(?![\\s\\S]))`, 'gms')
    result = result.replace(classDefRegex, `${alias.from} = ${alias.to}\n\n`)
  }

  return result
}

function mergeModule(moduleName: string, outputName: string, classNames: string[], generatedFiles: string[]): void {
  const imports = new Set<string>()

  for (const filePath of generatedFiles) {
    for (const line of readFileSync(filePath, 'utf-8').split(/\r?\n/)) {
      if ((line.startsWith('from ') || line.startsWith('import ')) && !line.includes('__future__')) {
        imports.add(line)
      }
    }
  }

  const aliases = detectDuplicateTypes(classNames, generatedFiles)

  const parts: string[] = [
    '"""',
    `widgetdc_contracts.${outputName} — Auto-generated Pydantic v2 models.`,
    `Source: @widgetdc/contracts schemas/${moduleName}/`,
    'Do not edit manually — regenerate with: npm run python',
    '"""',
    '',
    'from __future__ import annotations',
    '',
    ...Array.from(imports).sort(),
    '',
    `__all__ = [${classNames.map((name) => `"${name}"`).join(', ')}]`,
    '',
  ]

  for (const filePath of generatedFiles) {
    parts.push(extractBody(filePath), '')
  }

  let content = `${parts.join('\n').trimEnd()}\n`
  content = applyTypeAliases(content, aliases)

  writeFileSync(join(pythonDir, `${outputName}.py`), content, 'utf-8')
}

function writeInit(modules: string[]): void {
  const lines = [
    '"""',
    'widgetdc-contracts — Auto-generated Pydantic v2 models.',
    'Source: @widgetdc/contracts TypeBox schemas.',
    'Do not edit manually — regenerate with: npm run python',
    '"""',
  ]

  for (const moduleName of modules) {
    if (moduleName === 'http') {
      lines.push('from . import http_ as http')
    } else {
      lines.push(`from . import ${moduleName}`)
    }
  }

  writeFileSync(join(pythonDir, '__init__.py'), `${lines.join('\n')}\n`, 'utf-8')
  writeFileSync(join(rootDir, 'python', 'py.typed'), '', 'utf-8')
}

function main(): void {
  const datamodelCodegen = resolveCommand('datamodel-codegen')
  ensureBaseModel()

  const modules = listSchemaModules()
  for (const moduleName of modules) {
    const { outputName, classNames, generatedFiles } = generateModuleFiles(moduleName, datamodelCodegen)
    mergeModule(moduleName, outputName, classNames, generatedFiles)
  }

  writeInit(modules)
  cleanupTemp()
  console.log(`Python models generated in ${pythonDir}`)
}

main()
