
import { TParsedColorObject } from "./types";
import { convertPercentageToRgb } from "./utils"


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
  console.log(numberVariables)

  const parsedColorObjects: TParsedColorObject[] = colorVariables.map(variable => {
    const identifier = '1:0'
    const groupAndColorName = variable.name.split('/')
    return {
      group: groupAndColorName[0],
      name: groupAndColorName[groupAndColorName.length - 1],
      rgba: convertPercentageToRgb(variable.valuesByMode[identifier] as RGBA) 
    }
  })

  const cssColorString: string = parsedColorObjects.reduce((acc: string, cur: TParsedColorObject) => {
    const label = cur.name.split(' ')[0].toLowerCase()
    const weight = cur.name.split(' ').find(item => { 
      return item === '0' ? true : !!Number(item)
    })
    const {r, g, b, a} = cur.rgba
    return acc + `--_palette-${label}-${weight}: rgba(${r}, ${g}, ${b}, ${a});\n`
  }, '/* Palette */ \n')
  console.log(cssColorString)
  figma.closePlugin();
};


