import { TChosenOutputFormat, TParsedColorObject } from '../types'

import { parseColorNameAndCssKey } from './parsingCss'

import { sortColorVariables, sortNumberVariables } from './sorting'

import { isVariableAlias, isNumericValue } from './typeguards'

export function convertPercentageToRgba(rgbObject: RGBA) {
  const { r, g, b, a } = rgbObject
  const convertedObject = {
    r: Math.floor(r * 255),
    g: Math.floor(g * 255),
    b: Math.floor(b * 255),
    a: Number(a.toFixed(2)),
  }
  return { ...convertedObject }
}

export function extractWeight(groupAndColorName: string[]) {
  const weight =
    groupAndColorName.find((item: string) => {
      const string = item.replace('%', '')
      return string === '0' ? true : !!Number(string)
    }) || ''
  return weight
}

export function extractRoleFromWeight(weight: number) {
  switch (weight) {
    case 900:
      return 'dark'
    case 700:
      return 'contrast'
    case 500:
      return 'base'
    case 300:
      return 'element'
    case 100:
      return 'bg'
    case 0:
      return 'light'
    default:
      throw new Error('No case matched at function extractRoleFromWeight')
  }
}

export function parseColorObjectsFromVariables(
  colorVariables: Variable[],
  outputFormat: TChosenOutputFormat
) {
  // Sorting variables so that token-variables (VariableAlias) are put at the end of the queue.

  const sortedColorVariables = sortColorVariables(colorVariables)

  const parsedColorObjects: TParsedColorObject[] = sortedColorVariables.map(
    (variable, i: Number) => {
      const identifier = Object.keys(variable.valuesByMode)[0]
      const valuePath: VariableValue = variable.valuesByMode[identifier]
      const groupAndColorName: string[] = variable.name.split('/')
      const { cssKey, name, weight } = parseColorNameAndCssKey(
        variable,
        outputFormat
      )
      return {
        group: groupAndColorName[0].toLowerCase(),
        name: name.toLowerCase(),
        value: isVariableAlias(valuePath)
          ? ({
              id: valuePath.id,
              type: valuePath.type,
            } as VariableAlias)
          : convertPercentageToRgba(valuePath as RGBA),
        originalId: variable.id,
        cssKey,
        weight,
      }
    }
  )
  return parsedColorObjects
}

export function extractFloatValues(variable: Variable) {
  const identifiers = Object.keys(variable.valuesByMode)
  console.log(identifiers)
  const values = []
  for (const key of identifiers) {
    const valuePath = variable.valuesByMode[key]
    if (isVariableAlias(valuePath)) {
      values.push({ ...valuePath } as VariableAlias)
    } else {
      values.push(Number(valuePath) + ' px')
    }
  }
  return values
}

export function extractModeIds(variable: Variable) {
  const identifiers = Object.keys(variable.valuesByMode)
  
  return identifiers
}

export function getModeNameByModeId(modeId: string, localCollections: VariableCollection[]) {
  const mode = localCollections.find(collection => {
    const result = collection.modes.find(mode => mode.modeId === modeId)
    return !!result
  })
  return mode?.name
}

export function parseFloatsObjectsFromVariables(
  numberVariables: Variable[],
  outputFormat: TChosenOutputFormat
) {
  const sortedNumberVariables = sortNumberVariables(numberVariables)

  const parsedFloatObjects = sortedNumberVariables.map((variable) => {
    const groupAndName = variable.name
      .split('/')
      .map((cur) => cur.toLowerCase().replace(' ', '-'))
    const group = groupAndName[0]
    const name = groupAndName[groupAndName.length - 1]
    return {
      group,
      name,
      groupAndName,
      values: extractFloatValues(variable),
      valueIdentifiers: extractModeIds(variable),
      cssKey: `${outputFormat === 'sass' ? '$' : '--'}${groupAndName.join('-')}`,
      originalId: variable.id
    }
  })
  return parsedFloatObjects
}

export function parseStringObjectsFromVariables(
  stringVariables: Variable[],
  outputFormat: TChosenOutputFormat
) {
  const parsedStringObjects = stringVariables.map((variable) => {
    const identifier = Object.keys(variable.valuesByMode)[0]
    const valuePath: VariableValue = variable.valuesByMode[identifier]
    const groupAndName = variable.name
      .split('/')
      .map((cur) => cur.toLowerCase().replace(' ', '-'))
    const group = groupAndName[0]
    const name = groupAndName[groupAndName.length - 1]
    return {
      group,
      name,
      value: isVariableAlias(valuePath)
        ? ({ ...valuePath } as VariableAlias)
        : variable.valuesByMode[identifier].toString(),
      cssKey: isVariableAlias(valuePath)
        ? `${outputFormat === 'sass' ? '$' : '--'}${groupAndName.join('-')}`
        : `${outputFormat === 'sass' ? '$' : '--_'}${name.toLowerCase().replace(' ', '-')}`,
      originalId: variable.id
    }
  })
  return parsedStringObjects
}
