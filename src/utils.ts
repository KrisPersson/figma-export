import {
  TChosenOutputFormat,
  TParsedColorObject,
  TParsedFloatObject,
} from './types'

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

export function isRgbaObject(obj: any): obj is RGBA {
  return obj.hasOwnProperty('r') && obj.hasOwnProperty('g') && obj.hasOwnProperty('b') && obj.hasOwnProperty('a')
}
export function isVariableAlias(obj: any): obj is VariableAlias {
  return obj.id && obj.type
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
            ? `$c-${cur.name.replace(' ', '-')}: ${primitiveCssKey?.toLowerCase()}`
            : `--c-${cur.name.replace(' ', '-')}: var(${primitiveCssKey?.toLowerCase()})`
        return acc + lineBreak + `${parsedKeyAndValue};\n`
      } else return acc
    },
    '/* Palette */\n\n'
  )

  return cssColorString
}

function extractWeight(groupAndColorName: string[]) {
  const weight = groupAndColorName.find((item: string) => {
    const string = item.replace('%', '')
    return string === '0' ? true : !!Number(string)
  }) || ''
  return weight
}

function parseNameAndCssKey(variable: Variable, outputFormat: string) {
  const identifier = Object.keys(variable.valuesByMode)[0]
  let groupAndColorName: string[] = variable.name.split('/')

  const weight = extractWeight(groupAndColorName)

  groupAndColorName = groupAndColorName.filter(item => item.toString() !== weight.toString())

  const primitiveName = groupAndColorName[groupAndColorName.length - 1].toLowerCase()
  const tokenName = groupAndColorName.join('-').toLowerCase()
  const valuePath: VariableValue = variable.valuesByMode[identifier]
  if (groupAndColorName.includes('Blue') && weight == '500') console.log(valuePath)

  const cssKey = isRgbaObject(valuePath) ? `${outputFormat === 'sass' ? '$' : '--'}_palette-${primitiveName.toLowerCase()}${weight ? '-' + weight.toString() : ''}`.replace(' ', '-').replace('%', '') :
  `${outputFormat === 'sass' ? '$' : '--'}c-${tokenName}`.replace(' ', '-').replace('%', '')
  return {cssKey, name: isRgbaObject(valuePath) ? primitiveName : tokenName, weight}
}

export function parseColorObjectsFromVariables(
  colorVariables: Variable[],
  outputFormat: TChosenOutputFormat
) {
  // Sorting variables so that token-variables (VariableAlias) are put at the end of the queue.
  colorVariables.sort((a, b) => {
    if (isVariableAlias(b.valuesByMode[Object.keys(b.valuesByMode)[0]])) {
      return -1
    } else {
      return 0
    }
  })

  const parsedColorObjects: TParsedColorObject[] = colorVariables.map(
    (variable, i: Number) => {
      const identifier = Object.keys(variable.valuesByMode)[0]
      const valuePath: VariableValue = variable.valuesByMode[identifier]
      const groupAndColorName: string[] = variable.name.split('/')
      const {cssKey, name, weight} = parseNameAndCssKey(variable, outputFormat)

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
  console.log(parsedColorObjects)
  return parsedColorObjects
}

export function parseCssClassesNumbers(
  parsedFloatObjects: TParsedFloatObject[]
) {
  const cssFloatsString = parsedFloatObjects.reduce((acc: string, cur) => {
    return acc + `${cur.cssKey}: ${cur.value}${cur.cssUnit || ''};\n`
  }, ' \n/* Numbers */\n\n')

  return cssFloatsString
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
