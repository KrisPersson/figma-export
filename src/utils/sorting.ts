import { isRgbaObject, isVariableAlias } from "./typeguards";
import { extractWeight } from "./index"

export function sortColorVariables(colorVariables: Variable[]) {

    const primitives = colorVariables.filter(vari => {
        const identifier = Object.keys(vari.valuesByMode)[0]
        const valuePath: VariableValue = vari.valuesByMode[identifier]
        return isRgbaObject(valuePath)
    });

    const tokens = colorVariables.filter(vari => {
        const identifier = Object.keys(vari.valuesByMode)[0]
        const valuePath: VariableValue = vari.valuesByMode[identifier]
        return isVariableAlias(valuePath)
    });
    
    primitives.sort((a, b) => {
        const groupAndColorNameA: string = a.name
        const groupAndColorNameB: string = b.name
        let aWeight: string = extractWeight(groupAndColorNameA.split('/'))
        let bWeight = extractWeight(groupAndColorNameB.split('/'))
        const aNameMinusWeight = groupAndColorNameA.split('/').filter(part => part !== aWeight).join('')
        const bNameMinusWeight = groupAndColorNameB.split('/').filter(part => part !== bWeight).join('')

        if (aWeight.toString().length === 2) {
            aWeight = '0' + aWeight.toString()
        } 
        if (bWeight.toString().length === 2) {
            bWeight = '0' + bWeight.toString()
        } 

        if (aNameMinusWeight + aWeight > bNameMinusWeight + bWeight) {
            return 1
        } else if (aNameMinusWeight + aWeight < bNameMinusWeight + bWeight) {
            return -1
        } else {
            return 0
        }
    })

    tokens.sort((a, b) => {
        const groupAndColorNameA: string = a.name
        const groupAndColorNameB: string = b.name
        if (groupAndColorNameA > groupAndColorNameB) {
            return 1
        } else if (groupAndColorNameA < groupAndColorNameB) {
            return -1
        } else {
            return 0
        }
    })

    const sortedColorVariables = [...primitives, ...tokens]
    return sortedColorVariables
}