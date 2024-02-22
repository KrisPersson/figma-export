export type TParsedColorObject = {
  group: string
  name: string
  values: (RGBA | VariableAlias)[]
  originalId: string
  cssKey: string
  weight: string
}

export type TParsedFloatObject = {
  group: string
  name: string
  values: (string | VariableAlias)[]
  valueIdentifiers: string[]
  originalId: string
  cssKey: string
  cssUnit?: TCssUnit
  groupAndName: string[]
}

export type TParsedStringObject = {
  group: string
  name: string
  value: string | VariableAlias
  originalId: string
  cssKey: string
}

export type TDeviceBreakPoints = {
  mobile?: string
  tablet?: string
  laptop?: string
  desktop?: string
  widescreen?: string
}

export type TMediaQueriesMap = {
  [device: string]: {
    keyValuePairs: string[]
  }
}

export type TmqEvaluationResult = {
  [device: string]: string
}

export type TCssUnit = 'px' | 'rem' | '%' | 'em' | string

export type TChosenOutputFormat = 'css' | 'sass'
