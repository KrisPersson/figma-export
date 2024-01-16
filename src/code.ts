
import { TParsedColorObject } from "./types";
import { isVariableAlias, parseCssClassesColor, parseColorObjectsFromVariables  } from "./utils"

figma.showUI(__html__);
figma.ui.resize(500, 300)
figma.ui.onmessage = async msg => {

  
  // const nodes: SceneNode[] = [];
  // const localCollections = figma.variables.getLocalVariableCollections();

  const localVariables = msg.type !== 'all' ? 
    figma.variables.getLocalVariables(msg.type.toUpperCase()) :
    figma.variables.getLocalVariables(); // argument optional to filter by variabel-type, for example "STRING"


  const colorVariables = localVariables.filter(variable => variable.resolvedType === 'COLOR')
  const numberVariables = localVariables.filter(variable => variable.resolvedType === 'FLOAT')
  const stringVariables = localVariables.filter(variable => variable.resolvedType === 'STRING')
  const boolVariables = localVariables.filter(variable => variable.resolvedType === 'BOOLEAN')

  colorVariables.sort((a, b) => {
    if (isVariableAlias(a.valuesByMode[Object.keys(a.valuesByMode)[0]])) {
      return -1
    } else {
      return 0
    }
  })

  const parsedColorObjects = parseColorObjectsFromVariables(colorVariables)
  console.log(parseCssClassesColor(parsedColorObjects))

  // const parsedFloatObjects = numberVariables.map(variable => {
  //   const identifier = Object.keys(variable.valuesByMode)[0]
  //   const groupAndName = variable.name.split('/')

  //   return {
  //     group: groupAndName[0],
  //     name: groupAndName[groupAndName.length - 1],
  //     value: variable.valuesByMode[identifier]
  //   }
  // })

  // figma.closePlugin();
};


