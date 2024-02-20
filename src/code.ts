import {
  parseColorObjectsFromVariables,
  parseFloatsObjectsFromVariables,
  parseStringObjectsFromVariables,
} from './utils'

import {
  parseCssClassesColor,
  parseCssClassesNumbers,
  parseCssClassesStrings,
} from './utils/parsingCss'

figma.showUI(__html__)
figma.ui.resize(500, 330)
figma.ui.onmessage = async (msg) => {
  const { type, outputFormat, ignoreUnusedPrims } = msg

  if (ignoreUnusedPrims) {
    console.log('Checked!')
  } else {
    console.log('Not Checked!')
  }

  const localVariables =
    msg.type !== 'all'
      ? figma.variables.getLocalVariables(type.toUpperCase())
      : figma.variables.getLocalVariables() // argument optional to filter by variabel-type, for example "STRING"

  const colorVariables =
    type === 'all' || type === 'color'
      ? localVariables.filter((variable) => variable.resolvedType === 'COLOR')
      : []
  const numberVariables =
    type === 'all' || type === 'float'
      ? localVariables.filter((variable) => variable.resolvedType === 'FLOAT')
      : []
  const stringVariables =
    type === 'all' || type === 'string'
      ? localVariables.filter((variable) => variable.resolvedType === 'STRING')
      : []
  const boolVariables =
    type === 'all' || type === 'boolean'
      ? localVariables.filter((variable) => variable.resolvedType === 'BOOLEAN')
      : []

  let output = ''

  if (colorVariables.length > 0)
    output += parseCssClassesColor(
      parseColorObjectsFromVariables(colorVariables, outputFormat),
      outputFormat, ignoreUnusedPrims
    )
  if (numberVariables.length > 0)
    output += parseCssClassesNumbers(
      parseFloatsObjectsFromVariables(numberVariables, outputFormat),
      outputFormat
    )
  if (stringVariables.length > 0)
    output += parseCssClassesStrings(
      parseStringObjectsFromVariables(stringVariables, outputFormat),
      outputFormat
    )
  output += '\n'
  console.log(output)

  // figma.closePlugin();
}
