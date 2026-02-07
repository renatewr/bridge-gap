// Show the UI
figma.showUI(__html__, { width: 300, height: 200 });

// Handle messages from the UI
figma.ui.onmessage = (msg: { type: string }) => {
	if (msg.type === "create-rectangle") {
		const rect = figma.createRectangle();
		rect.x = figma.viewport.center.x;
		rect.y = figma.viewport.center.y;
		rect.resize(100, 100);
		rect.fills = [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 1 } }];

		figma.currentPage.appendChild(rect);
		figma.currentPage.selection = [rect];
		figma.viewport.scrollAndZoomIntoView([rect]);

		figma.notify("Rectangle created!");
	}

	if (msg.type === "cancel") {
		figma.closePlugin();
	}
};
