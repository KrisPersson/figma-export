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

export function isRgbaObject(obj: any): obj is RGBA {
    return obj.r && obj.g && obj.b && obj.a
}
export function isTokenObject(obj: any): obj is TTokenObject {
    return obj.id && obj.type
}