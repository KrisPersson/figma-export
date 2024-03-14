import {
  isMediaQuery,
  isNumericValue,
  isRgbaObject,
  isVariableAlias,
} from './typeguards'
import { extractWeight, isStandardNumberToken } from './helpers'

export function sortColorVariables(colorVariables: Variable[]) {
  const primitives = colorVariables.filter((vari) => {
    const identifier = Object.keys(vari.valuesByMode)[0]
    const valuePath: VariableValue = vari.valuesByMode[identifier]
    return isRgbaObject(valuePath)
  })

  const tokens = colorVariables.filter((vari) => {
    const identifier = Object.keys(vari.valuesByMode)[0]
    const valuePath: VariableValue = vari.valuesByMode[identifier]
    return isVariableAlias(valuePath)
  })

  primitives.sort((a, b) => {
    const groupAndColorNameA: string = a.name
    const groupAndColorNameB: string = b.name
    let aWeight = extractWeight(groupAndColorNameA.split('/'))
    let bWeight = extractWeight(groupAndColorNameB.split('/'))
    const aNameMinusWeight = groupAndColorNameA
      .split('/')
      .filter((part) => part !== aWeight)
      .join('')
    const bNameMinusWeight = groupAndColorNameB
      .split('/')
      .filter((part) => part !== bWeight)
      .join('')

    if (aWeight.toString().length === 2) {
      aWeight = '0' + aWeight.toString()
    }
    if (bWeight.toString().length === 2) {
      bWeight = '0' + bWeight.toString()
    }

    if (aNameMinusWeight + aWeight > bNameMinusWeight + bWeight) {
      return 1
    } else if (aNameMinusWeight + aWeight < bNameMinusWeight + bWeight) {
      return -1
    } else {
      return 0
    }
  })

  tokens.sort((a, b) => {
    const groupAndColorNameA: string = a.name
    const groupAndColorNameB: string = b.name
    if (groupAndColorNameA > groupAndColorNameB) {
      return 1
    } else if (groupAndColorNameA < groupAndColorNameB) {
      return -1
    } else {
      return 0
    }
  })

  const sortedColorVariables = [...primitives, ...tokens]
  return sortedColorVariables
}

export function sortNumberVariables(numberVariables: Variable[]) {
  const primitives: Variable[] = []
  const mediaQuerieTokens: Variable[] = []
  const tokens: Variable[] = []

  numberVariables.forEach((vari) => {
    const identifier = Object.keys(vari.valuesByMode)[0]
    const valuePath: VariableValue = vari.valuesByMode[identifier]
    const groupAndName = vari.name.split('/').map((cur) => cur.toLowerCase())

    if (isNumericValue(valuePath)) primitives.push(vari)
    else if (isMediaQuery(groupAndName)) mediaQuerieTokens.push(vari)
    else tokens.push(vari)
  })

  mediaQuerieTokens.sort((a, b) => {
    if (
      b.name
        .split('/')
        .map((cur) => cur.toLowerCase())
        .includes('mobile')
    )
      return 1
    else return 0
  })

  primitives.sort((a, b) => {
    const identifierA = Object.keys(a.valuesByMode)[0]
    const valuePathA: VariableValue = a.valuesByMode[identifierA]
    const identifierB = Object.keys(b.valuesByMode)[0]
    const valuePathB: VariableValue = b.valuesByMode[identifierB]
    return Number(valuePathA) - Number(valuePathB)
  })

  const sortedNumberVariables = [...primitives, ...mediaQuerieTokens, ...tokens]
  return sortedNumberVariables
}



export function separateNumberStandardTokensFromComponentTokens(
  standardTokens: string[]
) {
  const standards: string[] = []
  const components: string[] = []

  standardTokens.forEach((token) => {
    if (isStandardNumberToken(token)) {
      standards.push(token)
    } else {
      components.push(token)
    }
  })

  return { standardTokens: standards, componentTokens: components }
}
