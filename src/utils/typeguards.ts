export function isRgbaObject(obj: any): obj is RGBA {
  return (
    obj.hasOwnProperty('r') &&
    obj.hasOwnProperty('g') &&
    obj.hasOwnProperty('b') &&
    obj.hasOwnProperty('a')
  )
}

export function isVariableAlias(obj: any): obj is VariableAlias {
  return obj.hasOwnProperty('id') && obj.type === 'VARIABLE_ALIAS'
}

export function isNumericValue(obj: any): obj is number {
  return typeof obj === 'number'
}

export function isStringValue(obj: any): obj is string {
  return typeof obj === 'string'
}

export function isMediaQuery(groupAndName: string[]) {
  return groupAndName.includes('desktop') || groupAndName.includes('mobile')
}
