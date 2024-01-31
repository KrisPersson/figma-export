import {
  parseColorObjectsFromVariables,
  parseFloatsObjectsFromVariables
} from './utils'

import { parseCssClassesColor, parseCssClassesNumbers } from "./utils/parsingCss"

figma.showUI(__html__)
figma.ui.resize(500, 330)
figma.ui.onmessage = async (msg) => {
  const { type, outputFormat } = msg

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
  // console.log(colorVariables)

  if (colorVariables.length > 0)
    output += parseCssClassesColor(
      parseColorObjectsFromVariables(colorVariables, outputFormat),
      outputFormat
    )
  if (numberVariables.length > 0)
    output += parseCssClassesNumbers(
      parseFloatsObjectsFromVariables(numberVariables, outputFormat)
    )
  output += '\n'
  console.log(output)

  // figma.closePlugin();
}
