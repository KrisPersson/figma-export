import { TParsedFloatObject, TMediaQueriesMap, TmqEvaluationResult } from "../types"
import { isVariableAlias } from "./typeguards"

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
          return val
        }
    })
    return result
}

export function evaluatePresentViewports(cssMediaQueries: TMediaQueriesMap) {

    const mobile = cssMediaQueries.mobile.keyValuePairs.length > 0
    const tablet = cssMediaQueries.tablet.keyValuePairs.length > 0
    const laptop = cssMediaQueries.laptop.keyValuePairs.length > 0
    const desktop = cssMediaQueries.desktop.keyValuePairs.length > 0
    const widescreen = cssMediaQueries.widescreen.keyValuePairs.length > 0

    let result: TmqEvaluationResult = {}

    const arr = [mobile, tablet, laptop, desktop, widescreen]

    if (arr.every(vp => vp)) {
        result = {
        mobile: '@media (max-width: 599px)',
        tablet: '@media (min-width: 600px) and (max-width: 1039px)',
        laptop: '@media (min-width: 1040px) and (max-width: 1439px)',
        desktop: '@media (min-width: 1440px) and (max-width: 1919px)',
        widescreen: '@media (min-width: 1920px)'
        }
    } else {
        if (tablet) {
            result = {mobile: '@media (max-width: 599px)', tablet: '@media (min-width: 600px) and (max-width: 1039px)'}
            if (laptop && desktop) result = {...result, laptop: '@media (min-width: 1040px) and (max-width: 1439px)', desktop: '@media (min-width: 1440px)'}
            else if (laptop && !desktop) result = {...result, laptop: '@media (min-width: 1040px)'}
            else result = {...result, desktop: '@media (min-width: 1040px)'}
        
        } else {
            result = {mobile: '@media (max-width: 799px)', desktop: '@media (min-width: 800px)'}
        }
    }

    return result
}

export function parseMediaQueries(cssMediaQueries: TMediaQueriesMap, evaluatedMQs: TmqEvaluationResult) {

    const evMqKeys = Object.keys(evaluatedMQs)

    const mappedKeys = evMqKeys.map(mqKey => {
        return `${evaluatedMQs[mqKey]} {\n${cssMediaQueries[mqKey].keyValuePairs.reduce((acc, cur) => { return acc + '\t' + cur + ';\n'}, '')}};\n`
    })
    return mappedKeys
}