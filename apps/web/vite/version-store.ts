import { INITIAL_BUILD_ID, nextBuildId } from '../src/updates/version.ts'

let buildId = INITIAL_BUILD_ID

export function readMockBuildId() {
  return buildId
}

export function bumpMockBuildId() {
  buildId = nextBuildId(buildId)
  return buildId
}
