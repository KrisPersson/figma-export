import {
  TParsedFloatObject,
  TParsedColorObject,
  TChosenOutputFormat,
  TParsedStringObject,
  TDeviceBreakPoints,
  TMediaQueriesMap
} from '../types'
import {
  isRgbaObject,
  isVariableAlias,
  isNumericValue,
  isStringValue
} from './typeguards'
import {
  isEveryNameTheSame,
  getModeValues,
  areColorsTheSame,
  removeDoubles,
  extractWeight,
  getModeNameByModeId
} from './helpers'
import { separateNumberStandardTokensFromComponentTokens } from './sorting'
import { evaluatePresentViewports,
  parseMediaQueries, mediaQueryKeyWords } from "./media-queries"

export function parseCssClassesNumbers(
  parsedFloatObjects: TParsedFloatObject[],
  outputFormat: TChosenOutputFormat,
  ignoreUnusedPrims: boolean,
  createMediaQueries: boolean
) {
  const deviceBreakPoints: TDeviceBreakPoints = {
    mobile: '(max-width: 599px)',
    tablet: '(min-width: 600px) and (max-width: 899px)',
    laptop: '(min-width: 900px)',
    desktop: '(min-width: 900px)',
    widescreen: '(min-width: 1240px)',
  }

  const localCollections = figma.variables.getLocalVariableCollections()

  // Initializing arrays to hold KeyValue-pairs separate by type.

  const numbers: string[] = []
  const usedPrims: string[] = []
  const mqTokens: string[] = []
  const standardAndComponentTokens: string[] = []

  let cssMediaQueries: TMediaQueriesMap = {
    mobile: {
      keyValuePairs: []
    },
    tablet: {
      keyValuePairs: []
    },
    laptop: {
      keyValuePairs: []
    },
    desktop: {
      keyValuePairs: []
    },
    widescreen: {
      keyValuePairs: []
    }
  }

  parsedFloatObjects.forEach((cur: TParsedFloatObject) => {
    const modeValues = getModeValues(cur.values, parsedFloatObjects)

    const isEveryModeValueTheSame = isEveryNameTheSame(modeValues)
    const modeNames: string[] = []
    let defaultModeValue = ''

    if (modeValues.length > 1 && !isEveryModeValueTheSame) {
      cur.valueIdentifiers.forEach((id) => {
        const modeNameAndIsDefaultMode = getModeNameByModeId(
          id,
          localCollections
        )
        const modeName = modeNameAndIsDefaultMode?.modeName as string
        if (modeName.toLowerCase() === 'mobile')
          defaultModeValue = modeName.replace(' ', '-').toLowerCase() as string
        modeNames.push(modeName.replace(' ', '-').toLowerCase() as string)
      })
      for (let i = 0; i < modeValues.length; i++) {

        let cssKey = cur.cssKey.slice(1)
        const mqKey = `${outputFormat === 'sass' ? '$_mq-' : '--_mq'}${cssKey}-${modeNames[i]}`
        const mqValue = modeValues[i]
        mqTokens.push(
          `${mqKey}: ${isNumericValue(mqValue) ? `${mqValue}px` : outputFormat === 'sass' ? `${mqValue}` : `var(${mqValue})`}`
        )

        const splitMqValue = mqValue?.toString().split('-')
        if (splitMqValue?.includes('scale') || splitMqValue?.includes('$scale') || isNumericValue(mqValue)) {
          usedPrims.push(mqValue as string)
        }
        if (
          mediaQueryKeyWords.includes(modeNames[i]) &&
          cssMediaQueries.hasOwnProperty(modeNames[i])
        ) {
          cssMediaQueries[modeNames[i]].keyValuePairs.push(
            `${cur.cssKey}: ${outputFormat === 'sass' ? mqKey : `var(${mqKey})`}`
          )

          if (modeNames[i] === defaultModeValue) {
            // This is where the default mode-value is assigned as default value for the CSS-Key for the current variable. This is the value that is being overridden later by media queries.
            defaultModeValue = `${mqKey}`
          }
        }
      }
    }

    if (isNumericValue(cur.values[0])) {
      const curValue = cur.values[0]
      numbers.push(`${cur.cssKey}: ${curValue}px`)
    } else if (isVariableAlias(cur.values[0])) {
      const curValue = cur.values[0] as VariableAlias
      const primitiveNumber = parsedFloatObjects.find((variable) => {
        return variable.originalId === curValue.id
      })
      const primitiveCssKey = primitiveNumber?.cssKey
      
      if (
        primitiveCssKey?.split('-').includes('scale') ||
        primitiveCssKey?.split('-').includes('$scale')
      ) {
        usedPrims.push(primitiveCssKey)
      }

      const parsedKeyAndValue =
        outputFormat === 'sass'
          ? `${cur.cssKey}: ${defaultModeValue || primitiveCssKey?.toLowerCase()}`
          : `${cur.cssKey}: var(${defaultModeValue || primitiveCssKey?.toLowerCase()})`
      standardAndComponentTokens.push(`${parsedKeyAndValue}`)
    } else {
      return 'ParsedFloatObject fell thru - found no case while parsing'
    }
  })

  const { standardTokens, componentTokens } =
    separateNumberStandardTokensFromComponentTokens(standardAndComponentTokens)
  const usedPrimsNoDoubles = removeDoubles(usedPrims)
  const filteredNumbers = ignoreUnusedPrims
    ? numbers.filter((num) => {
        return usedPrimsNoDoubles.includes(num.split(':')[0])
      })
    : numbers

  const parsedNumbersSection =
    filteredNumbers.length > 0
      ? filteredNumbers.reduce((acc: string, cur: string) => {
          return acc + cur + ';\n'
        }, '\n/* Numbers */\n\n')
      : ''

  const parsedMqTokens =
    mqTokens.length > 0
      ? mqTokens.reduce((acc: string, cur: string) => {
          return acc + cur + ';\n'
        }, '\n/* Media Query Tokens */\n\n')
      : ''

  const parsedStandardTokens =
    standardTokens.length > 0
      ? standardTokens.reduce((acc: string, cur: string) => {
          return acc + cur + ';\n'
        }, '\n/* Standard Tokens */\n\n')
      : ''

  const parsedComponentTokens =
    componentTokens.length > 0
      ? componentTokens.reduce((acc: string, cur: string) => {
          return acc + cur + ';\n'
        }, '\n/* Component Tokens */\n\n')
      : ''

  const parsedMediaQueries = createMediaQueries
    ? '\n/* Media Queries */\n' +
      parseMediaQueries(
        cssMediaQueries,
        evaluatePresentViewports(cssMediaQueries)
      ).reduce((acc, cur, i) => {
        return i === 0 ? acc : acc + '\n' + cur
      }, '')
    : ''
  return (
    parsedNumbersSection +
    parsedMqTokens +
    parsedStandardTokens +
    parsedComponentTokens +
    parsedMediaQueries
  )
}

export function parseCssClassesColor(
  parsedColorObjects: TParsedColorObject[],
  outputFormat: TChosenOutputFormat,
  ignoreUnusedPrims: boolean,
  createMediaQueries: boolean,
  createClassesForColorModes: boolean
) {
  let isFirstVariableAlias = true
  const usedCssKeysAsValues: string[] = []
  const parsedPalette: string[] = []
  const parsedGlobalVars: string[] = []
  const darkModeKeyValuePairs: string[] = []

  parsedColorObjects.forEach((cur: TParsedColorObject) => {
    let darkModeValue = ''
    if (
      cur.values.length > 1 &&
      !areColorsTheSame(cur.values[0], cur.values[1])
    ) {
      if (isRgbaObject(cur.values[1])) {
        darkModeValue = `rgba(${cur.values[1].r}, ${cur.values[1].g}, ${cur.values[1].b}, ${cur.values[1].a})`
      } else {
        const curValue = cur.values[1] as VariableAlias
        const primitiveColor = parsedColorObjects.find((variable) => {
          return variable.originalId === curValue.id
        })
        const cssKey = primitiveColor?.cssKey as string
        usedCssKeysAsValues.push(cssKey)
        darkModeValue = outputFormat === 'sass' ? cssKey : `var(${cssKey})`
      }
      darkModeKeyValuePairs.push(
        `${cur.cssKey}${cur.weight ? '-' + cur.weight : ''}: ${darkModeValue}`
      )
    }
    if (isRgbaObject(cur.values[0])) {
      const { r, g, b, a } = cur.values[0]

      parsedPalette.push(cur.cssKey + `: rgba(${r}, ${g}, ${b}, ${a});\n`)
    } else if (isVariableAlias(cur.values[0])) {
      const curValue = cur.values[0] as VariableAlias
      const primitiveColor = parsedColorObjects.find((variable) => {
        return variable.originalId === curValue.id
      })
      const primitiveCssKey = primitiveColor?.cssKey as string
      usedCssKeysAsValues.push(primitiveCssKey)

      isFirstVariableAlias = false
      const parsedKeyAndValue =
        outputFormat === 'sass'
          ? `$c-${cur.name.replace(' ', '-')}${cur.weight ? '-' + cur.weight : ''}: ${primitiveCssKey?.toLowerCase()}`
          : `--c-${cur.name.replace(' ', '-')}${cur.weight ? '-' + cur.weight : ''}: var(${primitiveCssKey?.toLowerCase()})`
      parsedGlobalVars.push(`${parsedKeyAndValue};\n`)
    }
  }, '/* Palette */\n\n')

  const usedKeysNoDoubles = removeDoubles(usedCssKeysAsValues)
  const filteredPalette = ignoreUnusedPrims
    ? parsedPalette.filter((baseColorKeyValue: string) => {
        return usedKeysNoDoubles.includes(baseColorKeyValue.split(':')[0])
      })
    : parsedPalette

  const paletteString = filteredPalette.reduce((acc: string, cur: string) => {
    return acc + cur
  }, '\n/* Palette */\n\n')

  const globalVarString = parsedGlobalVars.reduce(
    (acc: string, cur: string) => {
      return acc + cur
    },
    '\n/* Global variables */\n\n'
  )

  const darkModeQuery =
    darkModeKeyValuePairs.length > 0 && createMediaQueries
      ? darkModeKeyValuePairs.reduce((acc: string, cur: string) => {
          return acc + '\n' + '\t' + cur + ';'
        }, '\n\n@media (prefers-color-scheme: dark) {') + '\n}\n\n'
      : ''

  const darkModeClass =
    darkModeKeyValuePairs.length > 0 && createClassesForColorModes
      ? darkModeKeyValuePairs.reduce((acc: string, cur: string) => {
          return acc + '\n' + '\t' + cur + ';'
        }, '\n\n.dark-mode {') + '\n}\n\n'
      : ''

  return paletteString + globalVarString + darkModeQuery + darkModeClass
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
      } else return acc + `\n`
    },
    '\n/* Strings */\n\n'
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
