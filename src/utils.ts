import { TParsedColorObject, TParsedFloatObject } from "./types";

export function convertPercentageToRgba(rgbObject: RGBA) {
    const { r, g, b, a } = rgbObject;
    const convertedObject = {
        r: Math.floor(r * 255),
        g: Math.floor(g * 255),
        b: Math.floor(b * 255),
        a: Number(a.toFixed(2))
    };
    return {...convertedObject};
}

export function extractRoleFromWeight(weight: number) {
    switch (weight) {
        case 900:
          return "dark"
        case 700:
          return "contrast"
        case 500:
          return "base"
        case 300:
          return "element"
        case 100:
          return "bg"
        case 0:
          return "light"
        default:
            throw new Error("No case matched at function extractRoleFromWeight")
    }
}

export function isRgbaObject(obj: any): obj is RGBA {
  return obj.r && obj.g && obj.b && obj.a
}
export function isVariableAlias(obj: any): obj is VariableAlias {
  return obj.id && obj.type
}

export function parseCssClassesColor(parsedColorObjects: TParsedColorObject[]) {
  let isFirstVariableAlias = true

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
      const lineBreak = isFirstVariableAlias ? '\n /* Global variables */ \n\n' : ''
      isFirstVariableAlias = false
      return acc + lineBreak + `--c-${cur.name.replace(' ', '-')}: var(${cssKey?.toLocaleLowerCase()});\n`
    } else return acc
    
  }, '/* Palette */ \n\n')

  return cssColorString
}

export function parseColorObjectsFromVariables(colorVariables: Variable[]) {

  // Sorting variables so that token-variables (VariableAlias) are put at the end of the queue.
  colorVariables.sort((a, b) => {
    if (isVariableAlias(b.valuesByMode[Object.keys(b.valuesByMode)[0]])) {
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
      value: isVariableAlias(valuePath) ? { id: valuePath.id, type: valuePath.type } as VariableAlias : convertPercentageToRgba(valuePath as RGBA),
      originalId: variable.id,
      cssKey: isRgbaObject(valuePath) ? `--_palette-${groupAndColorName[0].toLowerCase()}-${weight}` : 'token css key',
      weight
    }
  })
  return parsedColorObjects
}

export function parseCssClassesNumbers(parsedFloatObjects: TParsedFloatObject[]) {
  const cssFloatsString = parsedFloatObjects.reduce((acc: string, cur) => {
      return acc + `${cur.cssKey}: ${cur.value}${cur.cssUnit || ''};\n`
  }, ' \n /* Numbers */ \n\n' )

  return cssFloatsString
}

export function parseFloatsObjectsFromVariables(numberVariables: Variable[]) {
  const parsedFloatObjects = numberVariables.map(variable => {
    const identifier = Object.keys(variable.valuesByMode)[0]
    const groupAndName = variable.name.split('/')
    const group = groupAndName[0]
    const name = groupAndName[groupAndName.length - 1]
    
    return {
      group,
      name,
      value: Number(variable.valuesByMode[identifier]),
      cssUnit: 'px',
      cssKey: `--${name.toLowerCase().replace(' ', '-')}`,
      originalId: variable.id
    }
  })
  return parsedFloatObjects
}