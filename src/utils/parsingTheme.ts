import { parseColorObjectsFromVariables, parseFloatsObjectsFromVariables } from "./index"
import { isVariableAlias } from "./typeguards"
import { camelCaseify, getModeNameByModeId, findPrimitiveFloatValue, arrayToPath, applyPathToObject, findPrimitiveColorValue, getAllTextNodes, evaluateTextNodes } from "./helpers"

export function parseTheme(localVariables: Variable[]) {
    const localCollections = figma.variables.getLocalVariableCollections()

    let theme = {
        breakpoint: {
            Sm: "@media (min-width: 600px)",
            LtSm: "@media (max-width: 599px)",
            Md: "@media (min-width: 900px)",
            LtMd: "@media (max-width: 899px)",
            Lg: "@media (min-width: 1200px)",
            LtLg: "@media (max-width: 1199px)",
        },
        colors: {},
        darkMode: {},
        font: {}
    }

    // ---- COLORS ----

    const colorVariables = localVariables.filter((variable) => variable.resolvedType === 'COLOR')
    const colorObjects = parseColorObjectsFromVariables(colorVariables, "css")

    for (let i = 0; i < colorObjects.length; i++) {
        const name = camelCaseify(colorObjects[i].cssKey)
        colorObjects[i].values.forEach((val, j) => {
            let baseValue = ''

            if (isVariableAlias(val)) {
                
                baseValue = findPrimitiveColorValue(colorObjects, val) as string

                if (j === 0) { // Primary mode (light mode))
                    theme.colors = {...theme.colors, [name]: baseValue}
                } else { // Secondary mode (dark mode)
                    theme.darkMode = {...theme.darkMode, [name]: baseValue}
                }
            }
        })
    }

    // ---- NUMBERS ----

    const floatVariables = localVariables.filter((variable) => variable.resolvedType === 'FLOAT')
    const floatObjects = parseFloatsObjectsFromVariables(floatVariables, "css")
    const filteredFloatObjects = floatObjects.filter(obj => isVariableAlias(obj.values[0]))

    for (let i = 0; i < filteredFloatObjects.length; i++) {
        const { groupAndName } = filteredFloatObjects[i]
        filteredFloatObjects[i].values.forEach((val, j) => {
            const { modeName } = getModeNameByModeId(filteredFloatObjects[i].valueIdentifiers[j], localCollections)
            const path = arrayToPath([...groupAndName, modeName.toLowerCase()])
            const primitiveVal = findPrimitiveFloatValue(floatObjects, val)
            applyPathToObject(theme, path, primitiveVal as string);
        })
    }

    // ---- FONTS ----
    const currentPage = figma.currentPage
    const textNodes = getAllTextNodes(currentPage)
    const font = evaluateTextNodes(textNodes)

    theme.font = {...font}

    return JSON.stringify(theme)

}