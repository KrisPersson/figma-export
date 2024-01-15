
import { TParsedColorObject, TTokenObject } from "./types";
import { convertPercentageToRgb, isRgbaObject, isTokenObject } from "./utils"


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
    if (isTokenObject(a.valuesByMode[Object.keys(a.valuesByMode)[0]])) {
      return -1
    } else {
      return 0
    }
  })

  const parsedColorObjects: TParsedColorObject[] = colorVariables.map((variable, i: Number) => {
    const identifier = Object.keys(variable.valuesByMode)[0]
    const groupAndColorName = variable.name.split('/')
    const valuePath: VariableValue = variable.valuesByMode[identifier]
    return {
      group: groupAndColorName[0],
      name: groupAndColorName[groupAndColorName.length - 1],
      value: isTokenObject(valuePath) ? { id: valuePath.id, type: valuePath.type } as TTokenObject : convertPercentageToRgb(variable.valuesByMode[identifier] as RGBA),
      originalId: variable.id 
    }
  })
  // const parsedFloatObjects = numberVariables.map(variable => {
  //   const identifier = Object.keys(variable.valuesByMode)[0]
  //   const groupAndName = variable.name.split('/')

  //   return {
  //     group: groupAndName[0],
  //     name: groupAndName[groupAndName.length - 1],
  //     value: variable.valuesByMode[identifier]
  //   }
  // })
  const cssColorString: string = parsedColorObjects.reduce((acc: string, cur: TParsedColorObject) => {
    const label = cur.name.split(' ')[0].toLowerCase()
    const weight = cur.name.split(' ').find(item => { 
      return item === '0' ? true : !!Number(item)
    })
    if (isRgbaObject(cur.value)) {
      const {r, g, b, a} = cur.value
      return acc + `--_palette-${label}-${weight}: rgba(${r}, ${g}, ${b}, ${a});\n`
    } else if (isTokenObject(cur.value)) {
      const curValue = cur.value as TTokenObject
      const primitiveColor = parsedColorObjects.find(variable => {
        return variable.originalId === curValue.id
      })
      const rgba = primitiveColor?.value
      return acc + `--c-${label}-${'bg-or-fg'}: var(--_palette-${label}-${weight})`
    } else return acc
    
  }, '/* Palette */ \n')
  console.log(cssColorString)
  figma.closePlugin();
};


