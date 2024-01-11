
figma.showUI(__html__);

figma.ui.onmessage = msg => {
  
  if (msg.type === 'all') {
    const nodes: SceneNode[] = [];
    const localCollections = figma.variables.getLocalVariableCollections();
    const localVariables = figma.variables.getLocalVariables('COLOR'); // argument optional to filter by variabel-type, for example "STRING"

    console.log(localVariables)
    
  }

  figma.closePlugin();
};
