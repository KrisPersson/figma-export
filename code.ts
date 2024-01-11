function convertPercentageToRgb(rgbObject: { r: number, g: number, b: number, a: number  }) {
  const { r, g, b, a } = rgbObject;
  const rgbScaleLength = 255;
  const convertedObject = {
      r: r * rgbScaleLength,
      g: g * rgbScaleLength,
      b: b * rgbScaleLength,
      a: a * rgbScaleLength
  };
  return convertedObject;
}

figma.showUI(__html__);
figma.ui.resize(500, 300)
figma.ui.onmessage = msg => {

  console.log(convertPercentageToRgb({ r: 0.9176470637321472, g: 0.34117648005485535, b: 0.4313725531101227, a: 1  }))
  
  // const nodes: SceneNode[] = [];
  // const localCollections = figma.variables.getLocalVariableCollections();

  const localVariables = msg.type !== 'all' ? figma.variables.getLocalVariables(msg.type.toUpperCase()) : figma.variables.getLocalVariables(); // argument optional to filter by variabel-type, for example "STRING"

  console.log(localVariables)
    
  // figma.closePlugin();
};
