import { TParsedFloatObject, TParsedColorObject, TChosenOutputFormat } from "../types"
import { isRgbaObject, isVariableAlias } from "./typeguards"
import { extractWeight } from "./index"

export function parseCssClassesNumbers(
    parsedFloatObjects: TParsedFloatObject[]
  ) {
    const cssFloatsString = parsedFloatObjects.reduce((acc: string, cur) => {
      return acc + `${cur.cssKey}: ${cur.value}${cur.cssUnit || ''};\n`
    }, ' \n/* Numbers */\n\n')
  
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
              ? `$c-${cur.name.replace(' ', '-')}: ${primitiveCssKey?.toLowerCase()}`
              : `--c-${cur.name.replace(' ', '-')}: var(${primitiveCssKey?.toLowerCase()})`
          return acc + lineBreak + `${parsedKeyAndValue};\n`
        } else return acc
      },
      '/* Palette */\n\n'
    )
  
    return cssColorString
}

export function parseNameAndCssKey(variable: Variable, outputFormat: string) {
    const identifier = Object.keys(variable.valuesByMode)[0]
    let groupAndColorName: string[] = variable.name.split('/')
  
    const weight = extractWeight(groupAndColorName)
  
    groupAndColorName = groupAndColorName.filter(item => item.toString() !== weight.toString())
  
    const primitiveName = groupAndColorName[groupAndColorName.length - 1].toLowerCase()
    const tokenName = groupAndColorName.join('-').toLowerCase()
    const valuePath: VariableValue = variable.valuesByMode[identifier]
    // if (groupAndColorName.includes('Blue') && weight == '500') console.log(valuePath)
  
    const cssKey = isRgbaObject(valuePath) ? `${outputFormat === 'sass' ? '$' : '--'}_palette-${primitiveName.toLowerCase()}${weight ? '-' + weight.toString() : ''}`.replace(' ', '-').replace('%', '') :
    `${outputFormat === 'sass' ? '$' : '--'}c-${tokenName}`.replace(' ', '-').replace('%', '')
    return {cssKey, name: isRgbaObject(valuePath) ? primitiveName : tokenName, weight}
  }