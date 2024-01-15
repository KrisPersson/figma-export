
export function convertPercentageToRgb(rgbObject: RGBA) {
    const { r, g, b, a } = rgbObject;
    const rgbScaleLength = 255;
    const convertedObject: RGBA = {
        r: Math.floor(r * rgbScaleLength),
        g: Math.floor(g * rgbScaleLength),
        b: Math.floor(b * rgbScaleLength),
        a: a 
    };
    return convertedObject;
  }