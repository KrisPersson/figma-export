
figma.showUI(__html__);
figma.ui.resize(500, 500)
figma.ui.onmessage = msg => {
  
  const nodes: SceneNode[] = [];
  const localCollections = figma.variables.getLocalVariableCollections();

  const localVariables = msg.type !== 'all' ? figma.variables.getLocalVariables(msg.type.toUpperCase()) : figma.variables.getLocalVariables(); // argument optional to filter by variabel-type, for example "STRING"

  console.log(localVariables)
    
  // figma.closePlugin();
};
