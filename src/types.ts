
export type TParsedColorObject = { group: string, name: string, value: RGBA | VariableAlias, originalId: string, cssKey: string, weight: string }

export type TParsedFloatObject = { group: string, name: string, value: number, originalId: string, cssKey: string, cssUnit: TCssUnit }

export type TCssUnit = 'px' | 'rem' | '%' | 'em' | string