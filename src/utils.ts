import { TTokenObject } from "./types";

export function convertPercentageToRgb(rgbObject: RGBA) {
    const { r, g, b, a } = rgbObject;
    const rgbScaleLength = 255;
    const convertedObject = {
        r: Math.floor(r * rgbScaleLength),
        g: Math.floor(g * rgbScaleLength),
        b: Math.floor(b * rgbScaleLength),
        a: Number(a.toFixed(2))
    };
    return {...convertedObject};
}

export function extractRoleFromWeight(weight: number) {
    switch (weight) {
        case 900:
            return "dark"
        case 700:
            return "contrast"
        case 500:
            return "base"
        case 300:
            return "element"
        case 100:
            return "bg"
        case 0:
            return "light"
        default:
            throw new Error("No case matched at function extractRoleFromWeight")
    }
}

export function isRgbaObject(obj: any): obj is RGBA {
    return obj.r && obj.g && obj.b && obj.a
}
export function isTokenObject(obj: any): obj is TTokenObject {
    return obj.id && obj.type
}