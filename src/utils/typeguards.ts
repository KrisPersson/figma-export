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
