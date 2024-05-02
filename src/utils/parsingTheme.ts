import { parseColorObjectsFromVariables } from "./index"
import { isVariableAlias, isRgbaObject } from "./typeguards"
import { extractColorValues, camelCaseify } from "./helpers"

export function parseTheme(localVariables: Variable[]) {

    let theme = {
        colors: {},
        darkMode: {}
    }

    const colorVariables = localVariables.filter((variable) => variable.resolvedType === 'COLOR')
    const colorObjects = parseColorObjectsFromVariables(colorVariables, "css")

    for (let i = 0; i < colorObjects.length; i++) {
        const name = camelCaseify(colorObjects[i].cssKey)
        colorObjects[i].values.forEach((val, j) => {
            let baseValue = ''

            if (isVariableAlias(val)) { //
                
                const primitiveColor = colorObjects.find((variable) => {
                    return variable.originalId === val.id
                    })
                if (isRgbaObject(primitiveColor?.values[0])) {
                    const {r, g, b, a} = primitiveColor?.values[0] as RGBA
                    baseValue = `rgba(${r}, ${g}, ${b}, ${a})`
                } else {
                    const primCol = primitiveColor?.values[0] as VariableAlias
                    const primitiveTwo = colorObjects.find((variable) => {
                        return variable.originalId === primCol.id
                        })
                    if (isRgbaObject(primitiveTwo?.values[0])) {
                        const {r, g, b, a} = primitiveTwo?.values[0] as RGBA
                        baseValue = `rgba(${r}, ${g}, ${b}, ${a})`
                    } else {
                        const primTwo = primitiveTwo?.values[0] as VariableAlias
                        const primitiveThree = colorObjects.find((variable) => {
                        return variable.originalId === primTwo.id
                        })
                        if (isRgbaObject(primitiveThree?.values[0])) {
                            const {r, g, b, a} = primitiveThree?.values[0] as RGBA
                            baseValue = `rgba(${r}, ${g}, ${b}, ${a})`
                        }
                    }
                }
                if (j === 0) { // Primary mode (light mode))
                    theme.colors = {...theme.colors, [name]: baseValue}
                } else { // Secondary mode (dark mode)
                    theme.darkMode = {...theme.darkMode, [name]: baseValue}
                }
            }
        })
    }

    return JSON.stringify(theme)

}