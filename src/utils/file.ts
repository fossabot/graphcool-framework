import {GraphcoolConfig, Resolver, ProjectInfo} from '../types'
import { projectInfoToContents } from './utils'
import {
  graphcoolConfigFilePath,
  graphcoolProjectFileName,
  exampleSchema,
  projectFileSuffix
} from './constants'

const debug = require('debug')('graphcool')

/*
 * Project File (.../project.graphcool)
 */

export function writeProjectFile(projectInfo: ProjectInfo, resolver: Resolver, path?: string) {
  path = isValidProjectFilePath(path) ? path : graphcoolProjectFileName
  resolver.write(path!, projectInfoToContents(projectInfo))
}

export function readProjectInfoFromProjectFile(resolver: Resolver, path: string): ProjectInfo | undefined {
  const projectId = readProjectIdFromProjectFile(resolver, path)

  if (!projectId) {
    return undefined
  }

  const version = readVersionFromProjectFile(resolver, path)
  const schema = readDataModelFromProjectFile(resolver, path)

  return { projectId, version, schema} as ProjectInfo
}

export function readProjectIdFromProjectFile(resolver: Resolver, path: string): string | undefined {
  const contents = resolver.read(path)
  const matches = contents.match(/# project: ([a-z0-9]*)/)

  if (!matches || matches.length !== 2) {
    return undefined
  }

  return matches[1]
}

export function readVersionFromProjectFile(resolver: Resolver, path: string): string | undefined {
  const contents = resolver.read(path)
  const matches = contents.match(/# version: ([a-z0-9]*)/)

  if (!matches || matches.length !== 2) {
    return undefined
  }

  return matches[1]
}

export function readDataModelFromProjectFile(resolver: Resolver, path: string): string {
  const contents = resolver.read(path)

  const dataModelStartIndex = contents.indexOf(`type`)
  const dataModel = contents.substring(dataModelStartIndex, contents.length)
  return dataModel
}


export function isValidProjectFilePath(projectFilePath?: string): boolean {
  if (!projectFilePath) {
    return false
  }
  return projectFilePath.endsWith(projectFileSuffix)
}

export function writeExampleSchemaFile(resolver: Resolver): string {
  const path = 'example.graphql'
  resolver.write(path, exampleSchema)
  return path
}


/*
 * Graphcool Config (~/.graphcool)
 */

export function readGraphcoolConfig(resolver: Resolver): GraphcoolConfig {
  const configFileContent = resolver.read(graphcoolConfigFilePath)
  return JSON.parse(configFileContent)
}

export function writeGraphcoolConfig(config: GraphcoolConfig, resolver: Resolver): void {
  resolver.write(graphcoolConfigFilePath, JSON.stringify(config, null, 2))
}

export function deleteGraphcoolConfig(resolver: Resolver): void {
  resolver.delete(graphcoolConfigFilePath)
}