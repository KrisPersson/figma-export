import {
  TChosenOutputFormat,
  TParsedColorObject
} from '../types'

import { parseNameAndCssKey } from "./parsingCss"

import { sortColorVariables } from './sorting'

import { isVariableAlias } from './typeguards'

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
  const weight = groupAndColorName.find((item: string) => {
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
      const {cssKey, name, weight} = parseNameAndCssKey(variable, outputFormat)
      // if (cssKey === '--_palette-light-50') console.log(isRgbaObject(valuePath), variable.id)
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
  // console.log(parsedColorObjects)
  return parsedColorObjects
}


export function parseFloatsObjectsFromVariables(
  numberVariables: Variable[],
  outputFormat: TChosenOutputFormat
) {
  const parsedFloatObjects = numberVariables.map((variable) => {
    const identifier = Object.keys(variable.valuesByMode)[0]
    const groupAndName = variable.name.split('/')
    const group = groupAndName[0]
    const name = groupAndName[groupAndName.length - 1]

    return {
      group,
      name,
      value: Number(variable.valuesByMode[identifier]),
      cssUnit: 'px',
      cssKey: `${outputFormat === 'sass' ? '$' : '--'}${name.toLowerCase().replace(' ', '-')}`,
      originalId: variable.id,
    }
  })
  return parsedFloatObjects
}
