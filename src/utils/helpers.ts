import { TParsedFloatObject } from "../types"
import {  isVariableAlias } from "./typeguards"

export function isEveryNameTheSame(modeNames: (string | undefined)[]) {
    const control = modeNames[0]
    for (let i = 0; i < modeNames.length; i++) {
        if (modeNames[i] !== control) return false
    }
    return true
}
export function getModeValues(valueArr: (string | VariableAlias)[], parsedFloatObjects: TParsedFloatObject[]) {
    
    const result = valueArr.map(val => {
        if (isVariableAlias(val)) {
          const primitiveVar = parsedFloatObjects.find((variable) => {
            return variable.originalId === val.id
          })
          return primitiveVar?.cssKey.toString()
        } else {
          return val.toString()
        }
    })
    return result
}