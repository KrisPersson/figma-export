function convertPercentageToRgb(rgbObject: RGBA) {
  const { r, g, b, a } = rgbObject;
  const rgbScaleLength = 255;
  const convertedObject = {
      r: Math.floor(r * rgbScaleLength),
      g: Math.floor(g * rgbScaleLength),
      b: Math.floor(b * rgbScaleLength),
      a: a 
  };
  return convertedObject;
}

figma.showUI(__html__);
figma.ui.resize(500, 300)
figma.ui.onmessage = msg => {

  
  // const nodes: SceneNode[] = [];
  // const localCollections = figma.variables.getLocalVariableCollections();

  const localVariables = msg.type !== 'all' ? figma.variables.getLocalVariables(msg.type.toUpperCase()) : figma.variables.getLocalVariables(); // argument optional to filter by variabel-type, for example "STRING"
  console.log(localVariables[0].name.split('/'))

  const parsedColorObjects = localVariables.map(variable => {
    const identifier = '1:0'
    const groupAndColorName = variable.name.split('/')
    return {
      label: groupAndColorName[0],
      name: groupAndColorName[groupAndColorName.length - 1],
      rgba: convertPercentageToRgb(variable.valuesByMode[identifier] as RGBA) 
    }
  })
  console.log(parsedColorObjects)
    
  // figma.closePlugin();
};
