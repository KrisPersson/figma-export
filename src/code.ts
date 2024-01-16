
import { TParsedColorObject } from "./types";
import { convertPercentageToRgb, isRgbaObject, isVariableAlias  } from "./utils"

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

  const parsedColorObjects: TParsedColorObject[] = colorVariables.map((variable, i: Number) => {
    const identifier = Object.keys(variable.valuesByMode)[0]
    const groupAndColorName = variable.name.split('/')
    const weight = variable.name.split(' ').find(item => { 
      return item === '0' ? true : !!Number(item)
    }) || ''
    const valuePath: VariableValue = variable.valuesByMode[identifier]
    return {
      group: groupAndColorName[0].toLowerCase(),
      name: groupAndColorName[groupAndColorName.length - 1].toLowerCase(),
      value: isVariableAlias(valuePath) ? { id: valuePath.id, type: valuePath.type } as VariableAlias : convertPercentageToRgb(valuePath as RGBA),
      originalId: variable.id,
      cssKey: isRgbaObject(valuePath) ? `--_palette-${groupAndColorName[0].toLowerCase()}-${weight}` : 'token css key' ,
      weight
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
    if (isRgbaObject(cur.value)) {
      const {r, g, b, a} = cur.value
      return acc + cur.cssKey + `: rgba(${r}, ${g}, ${b}, ${a});\n`
    } else if (isVariableAlias(cur.value)) {
        const curValue = cur.value as VariableAlias
        const primitiveColor = parsedColorObjects.find(variable => {
          return variable.originalId === curValue.id
        })
      const cssKey = primitiveColor?.cssKey
      return acc + `--c-${cur.name.replace(' ', '-')}: var(${cssKey?.toLocaleLowerCase()});\n`
    } else return acc
    
  }, '/* Palette */ \n')
  console.log(cssColorString)
  // figma.closePlugin();
};


