import {
  TParsedFloatObject,
  TParsedColorObject,
  TChosenOutputFormat,
  TParsedStringObject,
} from '../types'
import {
  isRgbaObject,
  isVariableAlias,
  isNumericValue,
  isStringValue,
} from './typeguards'
import { extractWeight } from './index'

export function parseCssClassesNumbers(
  parsedFloatObjects: TParsedFloatObject[]
) {
  const cssFloatsString = parsedFloatObjects.reduce(
    (acc: string, cur: TParsedFloatObject) => {
      if (isNumericValue(cur.value)) {
        return acc + `${cur.cssKey}: ${cur.value}${cur.cssUnit || ''};\n`
      } else if (isVariableAlias(cur.value)) {
        const curValue = cur.value as VariableAlias
        const primitiveNumber = parsedFloatObjects.find((variable) => {
          return variable.originalId === curValue.id
        })
        const primitiveCssKey = primitiveNumber?.cssKey
        // if (cur.cssKey === '--input-field-icon size') console.log('found it')
        return acc + `${cur.cssKey}: var(${primitiveCssKey});\n`
      } else {
        return acc + `\n`
      }
    },
    ' \n/* Numbers */\n\n'
  )

  return cssFloatsString
}

export function parseCssClassesColor(
  parsedColorObjects: TParsedColorObject[],
  outputFormat: TChosenOutputFormat
) {
  let isFirstVariableAlias = true

  const cssColorString: string = parsedColorObjects.reduce(
    (acc: string, cur: TParsedColorObject) => {
      if (isRgbaObject(cur.value)) {
        const { r, g, b, a } = cur.value
        return acc + cur.cssKey + `: rgba(${r}, ${g}, ${b}, ${a});\n`
      } else if (isVariableAlias(cur.value)) {
        const curValue = cur.value as VariableAlias
        const primitiveColor = parsedColorObjects.find((variable) => {
          return variable.originalId === curValue.id
        })
        const primitiveCssKey = primitiveColor?.cssKey
        const lineBreak = isFirstVariableAlias
          ? '\n/* Global variables */\n\n'
          : ''
        isFirstVariableAlias = false
        const parsedKeyAndValue =
          outputFormat === 'sass'
            ? `$c-${cur.name.replace(' ', '-')}${cur.weight ? '-' + cur.weight : ''}: ${primitiveCssKey?.toLowerCase()}`
            : `--c-${cur.name.replace(' ', '-')}${cur.weight ? '-' + cur.weight : ''}: var(${primitiveCssKey?.toLowerCase()})`
        return acc + lineBreak + `${parsedKeyAndValue};\n`
      } else return acc
    },
    '/* Palette */\n\n'
  )

  return cssColorString
}

export function parseCssClassesStrings(
  parsedStringObjects: TParsedStringObject[],
  outputFormat: TChosenOutputFormat
) {
  let isFirstVariableAlias = true

  const cssStringString: string = parsedStringObjects.reduce(
    (acc: string, cur: TParsedStringObject) => {
      if (isStringValue(cur.value)) {
        return acc + cur.cssKey + `: '${cur.value}';\n`
      } else if (isVariableAlias(cur.value)) {
        const curValue = cur.value as VariableAlias
        const primitiveString = parsedStringObjects.find((variable) => {
          return variable.originalId === curValue.id
        })
        const primitiveCssKey = primitiveString?.cssKey
        const lineBreak = isFirstVariableAlias
          ? '\n/* String Tokens */\n\n'
          : ''
        isFirstVariableAlias = false
        const parsedKeyAndValue =
          outputFormat === 'sass'
            ? `$${cur.name.replace(' ', '-')}: ${primitiveCssKey?.toLowerCase()}`
            : `--${cur.name.replace(' ', '-')}: var(${primitiveCssKey?.toLowerCase()})`
        return acc + lineBreak + `${parsedKeyAndValue};\n`
      } else return acc
    },
    '/* Strings */\n\n'
  )

  return cssStringString
}

export function parseColorNameAndCssKey(
  variable: Variable,
  outputFormat: string
) {
  const identifier = Object.keys(variable.valuesByMode)[0]
  let groupAndColorName: string[] = variable.name.split('/')

  let weight = extractWeight(groupAndColorName)
  if (weight.length === 1) {
    const index = groupAndColorName.indexOf(weight)
    groupAndColorName[index] += '0'
    weight += '0'
  }
  groupAndColorName = groupAndColorName.filter(
    (item) => item.toString() !== weight.toString()
  )

  const primitiveName =
    groupAndColorName[groupAndColorName.length - 1].toLowerCase()
  const tokenName = groupAndColorName.join('-').toLowerCase()
  const valuePath: VariableValue = variable.valuesByMode[identifier]

  const cssKey = isRgbaObject(valuePath)
    ? `${outputFormat === 'sass' ? '$' : '--'}_palette-${primitiveName.toLowerCase()}${weight ? '-' + weight.toString() : ''}`
        .replace(' ', '-')
        .replace('%', '')
    : `${outputFormat === 'sass' ? '$' : '--'}c-${tokenName}`
        .replace(' ', '-')
        .replace('%', '')
  return {
    cssKey,
    name: isRgbaObject(valuePath) ? primitiveName : tokenName,
    weight,
  }
}
