
import { TParsedColorObject } from "./types";
import { isVariableAlias, parseCssClassesColor, parseColorObjectsFromVariables, parseFloatsObjectsFromVariables, parseCssClassesNumbers  } from "./utils"

figma.showUI(__html__);
figma.ui.resize(500, 300)
figma.ui.onmessage = async msg => {

  const { type } = msg

  const localVariables = msg.type !== 'all' ? 
    figma.variables.getLocalVariables(type.toUpperCase()) :
    figma.variables.getLocalVariables(); // argument optional to filter by variabel-type, for example "STRING"

  const colorVariables = type === 'all' || type === 'color' ? localVariables.filter(variable => variable.resolvedType === 'COLOR') : []
  const numberVariables = type === 'all' || type === 'float' ? localVariables.filter(variable => variable.resolvedType === 'FLOAT') : []
  const stringVariables = type === 'all' || type === 'string' ? localVariables.filter(variable => variable.resolvedType === 'STRING') : []
  const boolVariables = type === 'all' || type === 'boolean' ? localVariables.filter(variable => variable.resolvedType === 'BOOLEAN') : []

  let outPut = ''

  if (colorVariables.length > 0) outPut += parseCssClassesColor(parseColorObjectsFromVariables(colorVariables))
  if (numberVariables.length > 0) outPut += parseCssClassesNumbers(parseFloatsObjectsFromVariables(numberVariables))

  console.log(outPut)

  // figma.closePlugin();
};