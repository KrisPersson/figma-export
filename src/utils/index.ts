import { TChosenOutputFormat, TParsedColorObject } from '../types'

import { parseColorNameAndCssKey } from './parsingCss'

import { sortColorVariables, sortNumberVariables } from './sorting'

import { isVariableAlias } from './typeguards'

import { extractColorValues, extractFloatValues, extractModeIds } from './helpers'


export function parseColorObjectsFromVariables(
  colorVariables: Variable[],
  outputFormat: TChosenOutputFormat
) {
  // Sorting variables so that token-variables (VariableAlias) are put at the end of the queue.

  const sortedColorVariables = sortColorVariables(colorVariables)

  const parsedColorObjects: TParsedColorObject[] = sortedColorVariables.map(
    (variable) => {
      const groupAndColorName: string[] = variable.name.split('/')
      const { cssKey, name, weight } = parseColorNameAndCssKey(
        variable,
        outputFormat
      )
      const valuesByMode: (VariableAlias | RGBA)[] =
        extractColorValues(variable)

      return {
        group: groupAndColorName[0].toLowerCase(),
        name: name.toLowerCase(),
        values: [...valuesByMode],
        originalId: variable.id,
        cssKey,
        weight,
      }
    }
  )
  return parsedColorObjects
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
      originalId: variable.id,
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
      originalId: variable.id,
    }
  })
  return parsedStringObjects
}
