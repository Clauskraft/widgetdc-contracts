import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const rootDir = dirname(scriptDir)
const schemasDir = join(rootDir, 'schemas')
const pythonDir = join(rootDir, 'python', 'widgetdc_contracts')
const tempDir = mkdtempSync(join(tmpdir(), 'widgetdc-python-'))
const stagedPythonDir = join(tempDir, 'widgetdc_contracts')
const stagedPyTyped = join(tempDir, 'py.typed')
const datamodelCodegenTimeoutMs = Number(process.env.WIDGETDC_PYTHON_CODEGEN_TIMEOUT_MS ?? 60_000)
const strictIntegerSchemas = new Set([
  'WdcChatSession',
  'WdcChatSessionPatchRequest',
])
const JSON_INTEGER_PARITY_HELPER = `def _normalize_json_integer(value: object) -> object:
    if isinstance(value, bool) or isinstance(value, str):
        raise ValueError('Input should be a JSON integer')
    if isinstance(value, float):
        if not math.isfinite(value) or not value.is_integer():
            raise ValueError('Input should be a finite JSON integer')
        return int(value)
    return value


JsonInteger = Annotated[StrictInt, BeforeValidator(_normalize_json_integer)]`
const CAPABILITY_UNIQUE_ITEMS_FIELDS = [
  'operation_refs',
  'risk_refs',
  'proof_requirement_refs',
  'legacy_aliases',
  'candidate_capability_ids',
] as const
const CAPABILITY_UNIQUE_ITEMS_HELPER = `def _reject_duplicate_items(value: object) -> object:
    if isinstance(value, list):
        seen: list[object] = []
        for item in value:
            if item in seen:
                raise ValueError('Input should contain unique items')
            seen.append(item)
    return value`
const CAPABILITY_NON_NULL_OPTIONAL_FIELDS = {
  legacy_aliases: 1,
  workbom_id: 2,
  correlation_id: 2,
} as const
const CAPABILITY_NON_NULL_OPTIONAL_HELPER = `def _reject_explicit_none(value: object) -> object:
    if value is None:
        raise ValueError('Explicit null is not allowed; omit the field instead')
    return value`
const CAPABILITY_STRICT_BOOLEAN_FIELDS = ['reference_only'] as const
const CAPABILITY_STRICT_BOOLEAN_HELPER = `def _require_json_boolean(value: object) -> object:
    if type(value) is not bool:
        raise ValueError('Input should be a JSON boolean')
    return value`
const CAPABILITY_DUMP_HELPER = `class _CapabilityContractDumpMixin:
    def model_dump(self, *args: object, **kwargs: object):
        kwargs['exclude_none'] = True
        return super().model_dump(*args, **kwargs)

    def model_dump_json(self, *args: object, **kwargs: object):
        kwargs['exclude_none'] = True
        return super().model_dump_json(*args, **kwargs)`

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

function ensureBaseModel(outputDir: string): void {
  mkdirSync(outputDir, { recursive: true })
  writeFileSync(join(outputDir, '_base.py'), BASE_MODEL, 'utf-8')
}

function listFilesRecursively(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listFilesRecursively(entryPath))
    } else if (entry.isFile()) {
      files.push(entryPath)
    }
  }
  return files.sort()
}

function collectImportNames(value: string): string[] {
  return value
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
}

function addImports(imports: Map<string, Set<string>>, key: string, names: string[]): void {
  let values = imports.get(key)
  if (!values) {
    values = new Set<string>()
    imports.set(key, values)
  }
  for (const name of names) {
    values.add(name)
  }
}

function collectImportLine(line: string, imports: Map<string, Set<string>>): boolean {
  const fromMatch = /^from ([\w.]+) import (.+)$/.exec(line)
  if (fromMatch) {
    addImports(imports, `from ${fromMatch[1]} import`, collectImportNames(fromMatch[2]))
    return true
  }

  const importMatch = /^import (.+)$/.exec(line)
  if (importMatch) {
    addImports(imports, 'import', collectImportNames(importMatch[1]))
    return true
  }

  return false
}

function normalizeGeneratedPython(content: string): string {
  const imports = new Map<string, Set<string>>()
  const body: string[] = []

  for (const line of content.replace(/\r\n/g, '\n').split('\n')) {
    if (!collectImportLine(line, imports)) {
      body.push(line)
    }
  }

  const normalizedImports = Array.from(imports.entries())
    .map(([key, names]) => `${key} ${Array.from(names).sort().join(', ')}`)
    .sort()

  return [
    ...normalizedImports,
    '---BODY---',
    body.join('\n').trimEnd(),
  ].join('\n')
}

function writeTextIfChanged(outPath: string, nextContent: string, materialCompare = false): boolean {
  if (existsSync(outPath)) {
    const currentContent = readFileSync(outPath, 'utf-8')
    if (currentContent === nextContent) {
      return false
    }
    if (
      materialCompare &&
      normalizeGeneratedPython(currentContent) === normalizeGeneratedPython(nextContent)
    ) {
      return false
    }
  }

  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, nextContent, 'utf-8')
  return true
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

function toPythonModuleName(moduleName: string): string {
  return moduleName.replace(/[^A-Za-z0-9_]/g, '_')
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

  const outputName = moduleName === 'http' ? 'http_' : toPythonModuleName(moduleName)
  const moduleTempDir = join(tempDir, moduleName)
  mkdirSync(moduleTempDir, { recursive: true })

  for (const [index, schemaName] of schemaNames.entries()) {
    const args = [
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
    ]

    if (moduleName === 'chat-contract-runtime' && strictIntegerSchemas.has(schemaName)) {
      args.push('--strict-types', 'int')
    }

    const result = spawnSync(datamodelCodegen, args, {
      encoding: 'utf-8',
      timeout: datamodelCodegenTimeoutMs,
      killSignal: 'SIGTERM',
    })

    if (result.error) {
      fail(`datamodel-codegen failed for ${moduleName}/${schemaName}: ${result.error.message}`)
    }

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

const scopedTypeAliases: Record<string, Record<string, string>> = {
  'WdcChatSessionPage': {
    'Item': 'WdcChatSession',
  },
  'CapabilityChainEdgeV1': {
    'CapabilityIdentifier': 'CapabilityIdentifierV1',
    'Target': 'CapabilityDefinitionRefV1',
  },
}
const scopedTypePromotions: Record<string, Record<string, string>> = {
  'CapabilityChainEdgeV1': {
    'Source': 'CapabilityDefinitionRefV1',
  },
}
const CAPABILITY_DERIVED_MODEL_CLASS_NAMES = ['CapabilityDefinitionRefV1'] as const

function getScopedTypeAlias(filePath: string, privateClass: string): string | null {
  return scopedTypeAliases[basename(filePath, '.py')]?.[privateClass] ?? null
}

function detectDuplicateTypes(classNames: string[], generatedFiles: string[]): TypeAlias[] {
  const aliases: TypeAlias[] = []
  const publicTypes = new Set(classNames)

  for (const filePath of generatedFiles) {
    const content = readFileSync(filePath, 'utf-8')
    const classMatches = content.matchAll(/^class\s+(\w+)\s*\(/gm)
    for (const match of classMatches) {
      const className = match[1]
      if (!publicTypes.has(className)) {
        if (getScopedTypeAlias(filePath, className)) {
          continue
        }

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
    'HandoffPayload': 'LauncherHandoffPayload',
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

function replaceClassDefinition(content: string, className: string): string {
  const lines = content.split('\n')
  const start = lines.findIndex((line) => line.startsWith(`class ${className}(`))
  if (start === -1) {
    return content
  }

  let end = start + 1
  while (end < lines.length && !lines[end].startsWith('class ')) {
    end++
  }

  lines.splice(start, end - start)
  return lines.join('\n')
}

function applyScopedTypeAliases(filePath: string, content: string): string {
  let result = content
  const aliases = scopedTypeAliases[basename(filePath, '.py')] ?? {}

  for (const [from, to] of Object.entries(aliases)) {
    result = replaceClassDefinition(result, from)
    result = result.replace(new RegExp(`\\b${from}\\b`, 'g'), to)
  }

  return result
}

function applyScopedTypePromotions(filePath: string, content: string): string {
  let result = content
  const promotions = scopedTypePromotions[basename(filePath, '.py')] ?? {}

  for (const [from, to] of Object.entries(promotions)) {
    result = result.replace(
      new RegExp(`^class ${from}\\(`, 'm'),
      `class ${to}(`,
    )
    result = result.replace(new RegExp(`\\b${from}\\b`, 'g'), to)
  }

  return result
}

function applyJsonIntegerParity(filePath: string, content: string): string {
  if (!strictIntegerSchemas.has(basename(filePath, '.py'))) {
    return content
  }

  return content.replace(/\bStrictInt\b/g, 'JsonInteger')
}

function applyTypeAliases(content: string, aliases: TypeAlias[]): string {
  let result = content

  for (const alias of aliases) {
    const classDefRegex = new RegExp(`^class ${alias.from}\\([^)]+\\):.*?(?=^class |$(?![\\s\\S]))`, 'gms')
    result = result.replace(classDefRegex, `${alias.from} = ${alias.to}\n\n`)
  }

  return result
}

function applyCapabilityUniqueItemsParity(content: string): string {
  let result = content
  let replacements = 0

  for (const field of CAPABILITY_UNIQUE_ITEMS_FIELDS) {
    const fieldPattern = new RegExp(`^(\\s*${field}: )(.+?)( = Field\\()`, 'm')
    result = result.replace(fieldPattern, (_match, prefix: string, annotation: string, suffix: string) => {
      replacements += 1
      return `${prefix}Annotated[${annotation}, AfterValidator(_reject_duplicate_items)]${suffix}`
    })
  }

  if (replacements !== CAPABILITY_UNIQUE_ITEMS_FIELDS.length) {
    throw new Error(
      `[generate-python] Expected ${CAPABILITY_UNIQUE_ITEMS_FIELDS.length} capability uniqueItems fields, replaced ${replacements}.`,
    )
  }

  return result
}

function applyCapabilityNonNullOptionalParity(content: string): string {
  let result = content
  let replacements = 0
  const expectedReplacements = Object.values(CAPABILITY_NON_NULL_OPTIONAL_FIELDS)
    .reduce((total, count) => total + count, 0)

  for (const [field, expected] of Object.entries(CAPABILITY_NON_NULL_OPTIONAL_FIELDS)) {
    let fieldReplacements = 0
    const fieldPattern = new RegExp(`^(\\s*${field}: )(.+?)( = Field\\()`, 'gm')
    result = result.replace(fieldPattern, (_match, prefix: string, annotation: string, suffix: string) => {
      fieldReplacements += 1
      replacements += 1
      return `${prefix}Annotated[${annotation}, BeforeValidator(_reject_explicit_none)]${suffix}`
    })
    if (fieldReplacements !== expected) {
      throw new Error(
        `[generate-python] Expected ${expected} capability ${field} fields, replaced ${fieldReplacements}.`,
      )
    }
  }

  if (replacements !== expectedReplacements) {
    throw new Error(
      `[generate-python] Expected ${expectedReplacements} capability non-null optional fields, replaced ${replacements}.`,
    )
  }

  return result
}

function applyCapabilityStrictBooleanParity(content: string): string {
  let result = content
  let replacements = 0

  for (const field of CAPABILITY_STRICT_BOOLEAN_FIELDS) {
    const fieldPattern = new RegExp(`^(\\s*${field}: )(.+)$`, 'm')
    result = result.replace(fieldPattern, (_match, prefix: string, annotation: string) => {
      replacements += 1
      return `${prefix}Annotated[${annotation}, BeforeValidator(_require_json_boolean)]`
    })
  }

  if (replacements !== CAPABILITY_STRICT_BOOLEAN_FIELDS.length) {
    throw new Error(
      `[generate-python] Expected ${CAPABILITY_STRICT_BOOLEAN_FIELDS.length} capability strict boolean fields, replaced ${replacements}.`,
    )
  }

  return result
}

function applyCapabilityDumpParity(content: string, classNames: string[]): string {
  let result = content
  let replacements = 0

  for (const className of classNames) {
    const multilineClassPattern = new RegExp(`^class ${className}\\(\\n`, 'm')
    if (multilineClassPattern.test(result)) {
      result = result.replace(
        multilineClassPattern,
        `class ${className}(\n    _CapabilityContractDumpMixin,\n`,
      )
      replacements += 1
      continue
    }

    const inlineClassPattern = new RegExp(`^class ${className}\\(`, 'm')
    result = result.replace(inlineClassPattern, () => {
      replacements += 1
      return `class ${className}(_CapabilityContractDumpMixin, `
    })
  }

  if (replacements !== classNames.length) {
    throw new Error(
      `[generate-python] Expected ${classNames.length} public capability model classes, replaced ${replacements}.`,
    )
  }

  return result
}

function removeDuplicateCapabilityIdentifierDefinitions(content: string): string {
  const marker = 'class CapabilityIdentifierV1('
  let result = content
  const firstStart = result.indexOf(marker)
  let duplicateStart = result.indexOf(marker, firstStart + marker.length)

  if (firstStart === -1 || duplicateStart === -1) {
    throw new Error(
      '[generate-python] Expected at least two generated CapabilityIdentifierV1 definitions.',
    )
  }

  while (duplicateStart !== -1) {
    const duplicateEnd = result.indexOf(
      '\nclass ',
      duplicateStart + marker.length,
    )
    if (duplicateEnd === -1) {
      throw new Error(
        '[generate-python] Could not bound a duplicate CapabilityIdentifierV1 definition.',
      )
    }
    result = `${result.slice(0, duplicateStart)}${result.slice(duplicateEnd + 1)}`
    duplicateStart = result.indexOf(marker, firstStart + marker.length)
  }

  return result
}

function mergeModule(
  moduleName: string,
  outputName: string,
  classNames: string[],
  generatedFiles: string[],
  outputDir: string,
): void {
  const imports = new Set<string>()
  const exportedClassNames = moduleName === 'capability'
    ? [...classNames, ...CAPABILITY_DERIVED_MODEL_CLASS_NAMES]
    : classNames

  for (const filePath of generatedFiles) {
    for (const line of readFileSync(filePath, 'utf-8').split(/\r?\n/)) {
      if ((line.startsWith('from ') || line.startsWith('import ')) && !line.includes('__future__')) {
        imports.add(line)
      }
    }
  }

  if (moduleName === 'chat-contract-runtime') {
    imports.add('import math')
    imports.add('from pydantic import BeforeValidator')
    imports.add('from typing import Annotated')
  }
  if (moduleName === 'capability') {
    imports.add('from pydantic import AfterValidator')
    imports.add('from pydantic import BeforeValidator')
    imports.add('from typing import Annotated')
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
    `__all__ = [${exportedClassNames.map((name) => `"${name}"`).join(', ')}]`,
    '',
    ...(moduleName === 'chat-contract-runtime' ? [JSON_INTEGER_PARITY_HELPER, ''] : []),
    ...(moduleName === 'capability'
      ? [
          CAPABILITY_UNIQUE_ITEMS_HELPER,
          '',
          CAPABILITY_NON_NULL_OPTIONAL_HELPER,
          '',
          CAPABILITY_STRICT_BOOLEAN_HELPER,
          '',
          CAPABILITY_DUMP_HELPER,
          '',
        ]
      : []),
  ]

  for (const filePath of generatedFiles) {
    const promotedBody = applyScopedTypePromotions(filePath, extractBody(filePath))
    const body = applyScopedTypeAliases(filePath, promotedBody)
    parts.push(applyJsonIntegerParity(filePath, body), '')
  }

  let content = `${parts.join('\n').trimEnd()}\n`
  content = applyTypeAliases(content, aliases)
  if (moduleName === 'capability') {
    content = removeDuplicateCapabilityIdentifierDefinitions(content)
    content = applyCapabilityUniqueItemsParity(content)
    content = applyCapabilityNonNullOptionalParity(content)
    content = applyCapabilityStrictBooleanParity(content)
    content = applyCapabilityDumpParity(content, exportedClassNames)
    content = `${content.trimEnd()}\n\nCapabilityChainEdgeV1.model_rebuild()\n`
  }

  writeFileSync(join(outputDir, `${outputName}.py`), content, 'utf-8')
}

function writeInit(modules: string[], outputDir: string): void {
  const lines = [
    '"""',
    'widgetdc-contracts — Auto-generated Pydantic v2 models.',
    'Source: @widgetdc/contracts TypeBox schemas.',
    'Do not edit manually — regenerate with: npm run python',
    '"""',
  ]

  for (const moduleName of modules) {
    const outputName = moduleName === 'http' ? 'http_' : toPythonModuleName(moduleName)
    if (moduleName === 'http') {
      lines.push('from . import http_ as http')
    } else if (outputName !== moduleName) {
      lines.push(`from . import ${outputName}`)
    } else {
      lines.push(`from . import ${moduleName}`)
    }
  }

  writeFileSync(join(outputDir, '__init__.py'), `${lines.join('\n')}\n`, 'utf-8')
  writeFileSync(stagedPyTyped, '', 'utf-8')
}

function commitPythonOutput(): void {
  for (const stagedPath of listFilesRecursively(stagedPythonDir)) {
    const outPath = join(pythonDir, relative(stagedPythonDir, stagedPath))
    writeTextIfChanged(outPath, readFileSync(stagedPath, 'utf-8'), true)
  }
  writeTextIfChanged(join(rootDir, 'python', 'py.typed'), readFileSync(stagedPyTyped, 'utf-8'))
}

function main(): void {
  const datamodelCodegen = resolveCommand('datamodel-codegen')
  ensureBaseModel(stagedPythonDir)

  const modules = listSchemaModules()
  for (const moduleName of modules) {
    const { outputName, classNames, generatedFiles } = generateModuleFiles(moduleName, datamodelCodegen)
    mergeModule(moduleName, outputName, classNames, generatedFiles, stagedPythonDir)
  }

  writeInit(modules, stagedPythonDir)
  commitPythonOutput()
  cleanupTemp()
  console.log(`Python models generated in ${pythonDir}`)
}

main()
