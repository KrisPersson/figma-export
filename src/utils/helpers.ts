import {
  TParsedFloatObject
} from '../types'
import { isRgbaObject, isStringValue, isVariableAlias } from './typeguards'

export function convertPercentageToRgba(rgbObject: RGBA) {
  const { r, g, b, a } = rgbObject
  const convertedObject = {
    r: Math.floor(r * 255),
    g: Math.floor(g * 255),
    b: Math.floor(b * 255),
    a: Number(a.toFixed(2))
  }
  return { ...convertedObject }
}

export function extractWeight(groupAndColorName: string[]) {
  const weight =
    groupAndColorName.find((item: string) => {
      const string = item.replace('%', '')
      return string === '0' ? true : !!Number(string)
    }) || ''
  return weight
}

export function isEveryNameTheSame(modeNames: (string | undefined)[]) {
  const control = modeNames[0]
  for (let i = 0; i < modeNames.length; i++) {
    if (modeNames[i] !== control) return false
  }
  return true
}
export function getModeValues(
  valueArr: (string | VariableAlias)[],
  parsedFloatObjects: TParsedFloatObject[]
) {
  const result = valueArr.map((val) => {
    if (isVariableAlias(val)) {
      const primitiveVar = parsedFloatObjects.find((variable) => {
        return variable.originalId === val.id
      })
      return primitiveVar?.cssKey.toString()
    } else {
      return val
    }
  })
  return result
}

export function removeDoubles(stringArr: string[]) {
  const newArr: string[] = []
  stringArr.forEach((str) => {
    if (!newArr.includes(str)) newArr.push(str)
  })
  return newArr
}

export function areColorsTheSame(
  colorOne: VariableAlias | RGBA,
  colorTwo: VariableAlias | RGBA
) {
  const colorOneIsVariableAlias = isVariableAlias(colorOne)
  const colorTwoIsVariableAlias = isVariableAlias(colorTwo)

  if (colorOneIsVariableAlias !== colorTwoIsVariableAlias) return false
  if (!colorOneIsVariableAlias && !colorTwoIsVariableAlias) {
    if (colorOne.r !== colorTwo.r) return false
    if (colorOne.g !== colorTwo.g) return false
    if (colorOne.b !== colorTwo.b) return false
    if (colorOne.a !== colorTwo.a) return false
  } else {
    const colorOneAlias = colorOne as VariableAlias
    const colorTwoAlias = colorTwo as VariableAlias

    if (colorOneAlias.id !== colorTwoAlias.id) return false
  }
  return true
}

export function extractFloatValues(variable: Variable) {
  const identifiers = Object.keys(variable.valuesByMode)
  const values = []
  for (const key of identifiers) {
    const valuePath = variable.valuesByMode[key]
    if (isVariableAlias(valuePath)) {
      values.push({ ...valuePath } as VariableAlias)
    } else {
      values.push(valuePath as string)
    }
  }
  return values
}

export function extractColorValues(variable: Variable) {
  const identifiers = Object.keys(variable.valuesByMode)
  const values: (VariableAlias | RGBA)[] = []
  for (const key of identifiers) {
    const valuePath = variable.valuesByMode[key]
    if (isVariableAlias(valuePath)) {
      values.push({ ...valuePath } as VariableAlias)
    } else {
      values.push(convertPercentageToRgba(valuePath as RGBA))
    }
  }

  return values
}

export function extractModeIds(variable: Variable) {
  const identifiers = Object.keys(variable.valuesByMode)

  return identifiers
}

export function getModeNameByModeId(
  modeId: string,
  localCollections: VariableCollection[]
) {
  for (let i = 0; i < localCollections.length; i++) {
    const modes = localCollections[i].modes
    for (const mode of modes) {
      if (mode.modeId === modeId) {
        return {
          modeName: mode.name,
          isDefaultModeId: mode.modeId === localCollections[i].defaultModeId,
        } // Returns mode name and whether or not it is the defaultMode
      }
    }
  }
  return { modeName: "", isDefaultModeId: false }
}

export function isStandardNumberToken(string: string) {
  const arr = string.split('-')
  if (arr.includes('_mq') && arr.includes('mobile)')) {
    return true
  } else {
    return false
  }
}

export function camelCaseify(name: string) {
  const newName = name.replace("--c-", "").split("-").filter(item => item)
  let string = ''
  newName.forEach((item, i) => {
    if (i === 0) {
      string += item
    } else {
      string += (item[0].toUpperCase() + item.slice(1))
    }
  })
  
  return string
}

export function findPrimitiveFloatValue(objectsToSearch: any[], startVal: string | number | VariableAlias, ending = "px") {
  if (typeof startVal === "string" || typeof startVal === "number") {
    return `${startVal}${ending}` as string
  } 
  
  let primitiveValue = objectsToSearch.find(variable => {
    return variable.originalId === startVal.id
  })

  if (isVariableAlias(primitiveValue.values[0])) {
    findPrimitiveFloatValue(objectsToSearch, primitiveValue.values[0])
  } else {
    return `${primitiveValue.values[0]}${ending}`
  }
}

export function findPrimitiveColorValue(objectsToSearch: any[], startVal: string | number | VariableAlias, ending = "") {
  if (isRgbaObject(startVal)) {
    console.log('uppe')
    const {r, g, b, a} = startVal as RGBA
    return `rgba(${r}, ${g}, ${b}, ${a})` as string
  } 
  
  let primitiveValue = objectsToSearch.find(variable => {
    const value = startVal as VariableAlias
    return variable.originalId === value.id
  })

  if (isVariableAlias(primitiveValue.values[0])) {
    findPrimitiveColorValue(objectsToSearch, primitiveValue.values[0])
  } else {
    const {r, g, b, a} = primitiveValue?.values[0] as RGBA
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }
}

export function arrayToPath(arr: string[]) {
  return arr.reduce((acc, current) => {
      return acc ? `${acc}[${JSON.stringify(current)}]` : `[${JSON.stringify(current)}]`;
  }, '');
}

export function applyPathToObject(obj: any, path: string, value: string) {
  const keys = path.split('[').filter(Boolean).map(key => key.replace(/["\]]/g, ''));
  let current = obj;
  for (const key of keys) {
      if (!current[key]) {
          current[key] = {};
      }
      if (keys.indexOf(key) === keys.length - 1) {
          current[key] = value;
      }
      current = current[key];
  }
}