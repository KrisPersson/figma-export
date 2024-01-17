
import { TParsedColorObject } from "./types";
import { isVariableAlias, parseCssClassesColor, parseColorObjectsFromVariables, parseFloatsObjectsFromVariables, parseCssClassesNumbers  } from "./utils"

figma.showUI(__html__);
figma.ui.resize(500, 300)
figma.ui.onmessage = async msg => {

  const localVariables = msg.type !== 'all' ? 
    figma.variables.getLocalVariables(msg.type.toUpperCase()) :
    figma.variables.getLocalVariables(); // argument optional to filter by variabel-type, for example "STRING"

  const colorVariables = localVariables.filter(variable => variable.resolvedType === 'COLOR')
  const numberVariables = localVariables.filter(variable => variable.resolvedType === 'FLOAT')
  const stringVariables = localVariables.filter(variable => variable.resolvedType === 'STRING')
  const boolVariables = localVariables.filter(variable => variable.resolvedType === 'BOOLEAN')

  colorVariables.sort((a, b) => {
    if (isVariableAlias(b.valuesByMode[Object.keys(b.valuesByMode)[0]])) {
      return -1
    } else {
      return 0
    }
  })

  let outPut = ''

  if (colorVariables.length > 0) outPut += parseCssClassesColor(parseColorObjectsFromVariables(colorVariables))
  if (numberVariables.length > 0) outPut += parseCssClassesNumbers(parseFloatsObjectsFromVariables(numberVariables))

  console.log(outPut)

  // figma.closePlugin();
};