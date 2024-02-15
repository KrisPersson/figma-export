import {
  TParsedFloatObject,
  TParsedColorObject,
  TChosenOutputFormat,
  TParsedStringObject,
  TDeviceBreakPoints,
  TMediaQueriesMap,
  TmqEvaluationResult
} from '../types'
import {
  isRgbaObject,
  isVariableAlias,
  isNumericValue,
  isStringValue,
  isMediaQuery,
} from './typeguards'
import { extractWeight, getModeNameByModeId } from './index'
import { isEveryNameTheSame, getModeValues, evaluatePresentViewports, parseMediaQueries } from './helpers'
import { separateNumberStandardTokensFromComponentTokens } from './sorting'

export function parseCssClassesNumbers(
  parsedFloatObjects: TParsedFloatObject[],
  outputFormat: TChosenOutputFormat
) {
  const deviceBreakPoints: TDeviceBreakPoints = {
    mobile: "(max-width: 599px)",
    tablet: "(min-width: 600px) and (max-width: 899px)",
    laptop: "(min-width: 900px)",
    desktop: "(min-width: 900px)",
    widescreen: "(min-width: 1240px)",
  }
  const mediaQueryKeyWords = ["mobile", "tablet", "laptop", "desktop", "widescreen"]
  
  const localCollections = figma.variables.getLocalVariableCollections();
  

  // Initializing arrays to hold KeyValue-pairs separate by type.

  const numbers: string[] = []
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

   parsedFloatObjects.forEach(
    (cur: TParsedFloatObject) => {
      
      const modeValues = getModeValues(cur.values, parsedFloatObjects)
      const isEveryModeValueTheSame = isEveryNameTheSame(modeValues)
      const modeNames: string[] = []
      let defaultModeValue = ''

      if (modeValues.length > 1 && !isEveryModeValueTheSame) {

        cur.valueIdentifiers.forEach(id => {
          const modeNameAndIsDefaultMode = getModeNameByModeId(id, localCollections)
          const modeName = modeNameAndIsDefaultMode?.modeName as string
          if (modeName.toLowerCase() === 'mobile') defaultModeValue = modeName.replace(' ', '-').toLowerCase() as string
          modeNames.push(modeName.replace(' ', '-').toLowerCase() as string)
        })

        for (let i = 0; i < modeValues.length; i++) {
          let cssKey = cur.cssKey.slice(1)
          const mqKey = `--_mq${cssKey}-${modeNames[i]}`
          const mqValue = modeValues[i] 
          mqTokens.push(`${mqKey}: ${Number(mqValue) ? `${mqValue}px` : `var(${mqValue})`}`)
          if (mediaQueryKeyWords.includes(modeNames[i]) && cssMediaQueries.hasOwnProperty(modeNames[i])) {
            cssMediaQueries[modeNames[i]].keyValuePairs.push(`${cur.cssKey}: var(${mqKey})`)
            if (modeNames[i] === defaultModeValue) { // This is where the default mode-value is assigned as default value for the CSS-Key for the current variable. This is the value that is being overwritten later by media queries.
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
        
        const parsedKeyAndValue =
          outputFormat === 'sass'
            ? `${cur.cssKey}: ${defaultModeValue || primitiveCssKey?.toLowerCase()}`
            : `${cur.cssKey}: var(${defaultModeValue || primitiveCssKey?.toLowerCase()})`
        standardAndComponentTokens.push(`${parsedKeyAndValue}`)
      } else {
        return 'ParsedFloatObject fell thru - found no case while parsing'
      }
    }
  )

  const { standardTokens, componentTokens } = separateNumberStandardTokensFromComponentTokens(standardAndComponentTokens)

  // let cssString = cssFloatsStringArr.reduce((acc: string, cur: string) => {
  //   return acc + cur + ';\n'
  // },'')

  const parsedNumbersSection = numbers.length > 0 
    ? numbers.reduce((acc: string, cur: string) => {
      return acc + cur + ';\n'
    }, '/* Numbers */\n\n')
    : '';
  
  const parsedMqTokens = mqTokens.length > 0 
  ? mqTokens.reduce((acc: string, cur: string) => {
    return acc + cur + ';\n'
  }, '\n/* Media Query Tokens */\n\n')
  : '';

  const parsedStandardTokens = standardTokens.length > 0 
  ? standardTokens.reduce((acc: string, cur: string) => {
    return acc + cur + ';\n'
  }, '\n/* Standard Tokens */\n\n')
  : '';

  const parsedComponentTokens = componentTokens.length > 0 
  ? componentTokens.reduce((acc: string, cur: string) => {
    return acc + cur + ';\n'
  }, '\n/* Component Tokens */\n\n')
  : '';

  const parsedMediaQueries = '\n/* Media Queries */\n' + parseMediaQueries(cssMediaQueries, evaluatePresentViewports(cssMediaQueries)).reduce((acc, cur, i) => { return i === 0 ? acc : acc + '\n' + cur}, '')

  return parsedNumbersSection + parsedMqTokens + parsedStandardTokens + parsedComponentTokens + parsedMediaQueries
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
      } else return acc + `\n`
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
    weight
  }
}
