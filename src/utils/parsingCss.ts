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
  isStringValue,
  isMediaQuery,
} from './typeguards'
import { extractWeight, getModeNameByModeId } from './index'
import { isEveryNameTheSame, getModeValues } from './helpers'

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
  let isFirstVariableAlias = true
  let isFirstMediaQueryAlias = true
  const localCollections = figma.variables.getLocalVariableCollections();
  console.log(localCollections)
  const mqs: string[] = []
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


  let cssFloatsString = parsedFloatObjects.reduce(
    (acc: string, cur: TParsedFloatObject) => {
      
      const modeValues = getModeValues(cur.values, parsedFloatObjects)
      const isEveryModeValuesTheSame = isEveryNameTheSame(modeValues)
      const modeNames: string[] = []
      let defaultModeValue = ''

      if (modeValues.length > 1 && !isEveryModeValuesTheSame) {

        cur.valueIdentifiers.forEach(id => {
          const modeNameAndIsDefaultMode = getModeNameByModeId(id, localCollections)
          const modeName = modeNameAndIsDefaultMode?.modeName as string
          if (modeNameAndIsDefaultMode?.isDefaultModeId) defaultModeValue = modeName.replace(' ', '-').toLowerCase() as string
          modeNames.push(modeName.replace(' ', '-').toLowerCase() as string)
        })

        for (let i = 0; i < modeValues.length; i++) {
          let cssKey = cur.cssKey.slice(1)
          const mqKey = `--_mq${cssKey}-${modeNames[i]}`
          const mqValue = `${modeValues[i]}` 
          mqs.push(`${mqKey}: ${isNumericValue(mqValue) ? `${mqValue}px` : `var(${mqValue})`}`)
          if (mediaQueryKeyWords.includes(modeNames[i]) && cssMediaQueries.hasOwnProperty(modeNames[i])) {
            cssMediaQueries[modeNames[i]].keyValuePairs.push(`${cur.cssKey}: ${mqKey}`)
            if (modeNames[i] === defaultModeValue) { // This is where the default mode-value is assigned as default value for the CSS-Key for the current variable. This is the value that is being overwritten later by media queries.
              defaultModeValue = `${mqKey}`
            }
          }
        }

      }
      if (isNumericValue(cur.values[0])) {
        const curValue = defaultModeValue || cur.values[0] 
        return acc + `${cur.cssKey}: ${curValue}px;\n`
      } else if (isVariableAlias(cur.values[0])) {

        const curValue = cur.values[0] as VariableAlias
        const primitiveNumber = parsedFloatObjects.find((variable) => {
          return variable.originalId === curValue.id
        })
        const primitiveCssKey = primitiveNumber?.cssKey
        

        // if (primitiveCssKey?.includes('mobile')) {
        //   const parsedKeyAndValue =
        //   outputFormat === 'sass'
        //     ? `${cur.cssKey}: ${primitiveCssKey?.toLowerCase().replace('mobile', 'desktop')};`
        //     : `${cur.cssKey}: var(${primitiveCssKey?.toLowerCase().replace('mobile', 'desktop')});`
        //   mqOptions.push(parsedKeyAndValue)
        // }

        const lineBreak = isFirstVariableAlias
          ? '\n/* Standard Sizing Tokens */\n\n'
          : ''
        isFirstVariableAlias = false
        const parsedKeyAndValue =
          outputFormat === 'sass'
            ? `${cur.cssKey}: ${defaultModeValue || primitiveCssKey?.toLowerCase()}`
            : `${cur.cssKey}: var(${defaultModeValue || primitiveCssKey?.toLowerCase()})`
        return acc + lineBreak + `${parsedKeyAndValue};\n`
      } else {
        return acc + `\n`
      }
    },
    ' \n/* Numbers */\n\n'
  )

  // else if (isVariableAlias(cur.values[0]) && isMediaQuery(cur.groupAndName)) {
  //   const curValue = cur.values[0] as VariableAlias
  //   const primitiveNumber = parsedFloatObjects.find((variable) => {
  //     return variable.originalId === curValue.id
  //   })
  //   const primitiveCssKey = primitiveNumber?.cssKey
  //   const lineBreak = isFirstMediaQueryAlias
  //     ? '\n/* Media Query Tokens */\n\n'
  //     : ''
  //   isFirstMediaQueryAlias = false
  //   const parsedKeyAndValue =
  //     outputFormat === 'sass'
  //       ? `${cur.cssKey}: ${primitiveCssKey?.toLowerCase()}`
  //       : `${cur.cssKey}: var(${primitiveCssKey?.toLowerCase()})`
  //   return acc + lineBreak + `${parsedKeyAndValue};\n`



  // if (mqOptions.length > 0) {

  //   let mediaQueries = mqOptions.reduce((acc, cur) => {
  //     return acc + '\t' + cur + '\n'
  //   }, '\n@media (min-width: 800px) {\n')
  //   mediaQueries += '}'
  //   cssFloatsString += mediaQueries
  // }

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
