figma.showUI(__html__, { width: 500, height: 600, themeColors: true });

interface Block {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'list';
  level?: number;
  text?: string;
  items?: string[];
  id: string;
}

// Font styles for each block type
const fontStyles = {
  h1: { size: 32, weight: 'Bold' as const },
  h2: { size: 24, weight: 'Semi Bold' as const },
  h3: { size: 18, weight: 'Semi Bold' as const },
  h4: { size: 16, weight: 'Medium' as const },
  h5: { size: 14, weight: 'Medium' as const },
  h6: { size: 14, weight: 'Medium' as const },
  body: { size: 16, weight: 'Regular' as const },
  list: { size: 16, weight: 'Regular' as const }
};

async function loadAllFonts() {
  const fontsToLoad = [
    { family: "Inter", style: "Regular" },
    { family: "Inter", style: "Medium" },
    { family: "Inter", style: "Semi Bold" },
    { family: "Inter", style: "Bold" }
  ];
  
  for (const font of fontsToLoad) {
    try {
      await figma.loadFontAsync(font);
    } catch (e) {
      console.log(`Could not load ${font.family} ${font.style}, will try alternatives`);
    }
  }
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'import-case-study') {
    try {
      // Parse JSON
      let blocks: Block[];
      try {
        blocks = JSON.parse(msg.data);
      } catch (parseError) {
        figma.notify('❌ Invalid JSON format. Please copy from Obsidian plugin.');
        console.error('JSON Parse Error:', parseError);
        return;
      }
      
      // Validate structure
      if (!Array.isArray(blocks) || blocks.length === 0) {
        figma.notify('❌ No blocks found in JSON');
        return;
      }
      
      // Load all fonts first
      await loadAllFonts();
      
      const nodes: SceneNode[] = [];
      let yOffset = 0;
      
      for (const block of blocks) {
        let textNode: TextNode | null = null;
        
        if (block.type === 'list') {
          // Handle both single list items and arrays (for backwards compatibility)
          textNode = figma.createText();
          
          let listText: string;
          if (block.items && block.items.length > 0) {
            // Old format: array of items
            listText = block.items.map(item => `• ${item}`).join('\n');
          } else if (block.text) {
            // New format: single item
            listText = `• ${block.text}`;
          } else {
            continue;
          }
          
          textNode.characters = listText;
          
          const style = fontStyles.list;
          textNode.fontSize = style.size;
          textNode.fontName = { family: "Inter", style: style.weight };
        
        } else if (block.text && block.text.trim()) {
          // Create heading or body text
          textNode = figma.createText();
          
          // Replace escaped newlines with actual newlines
          const cleanText = block.text.replace(/\\n/g, '\n');
          textNode.characters = cleanText;
          
          const style = fontStyles[block.type] || fontStyles.body;
          textNode.fontSize = style.size;
          textNode.fontName = { family: "Inter", style: style.weight };
        }
        
        if (textNode) {
          // Position
          textNode.x = 0;
          textNode.y = yOffset;
          
          // Set max width and auto-resize height
          textNode.resize(800, textNode.height);
          textNode.textAutoResize = "HEIGHT";
          
          // Add spacing based on type
          const spacingAfter = block.type.startsWith('h') ? 20 : 12;
          yOffset += textNode.height + spacingAfter;
          
          // Name the layer for easier organization
          textNode.name = `${block.type.toUpperCase()}: ${block.text?.substring(0, 30) || block.items?.[0]?.substring(0, 30) || 'Text'}`;
          
          nodes.push(textNode);
        }
      }
      
      if (nodes.length === 0) {
        figma.notify('❌ No text frames created. Check your JSON structure.');
        return;
      }
      
      // Select all created nodes
      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
      
      figma.notify(`✨ Created ${nodes.length} text frames from ${blocks.length} blocks!`);
      
    } catch (error) {
      figma.notify('❌ Error creating text frames. Check console for details.');
      console.error('Import Error:', error);
    }
  }
  
  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
