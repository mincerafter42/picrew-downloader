async function download(nuxt, allLayers) { // function to download (in ORA format I guess?)
	console.log(nuxt);
	const state = nuxt.state; // buncha data is stored here.
	const localSettings = JSON.parse(localStorage["picrew.local.data."+state.imageMakerId]); // user's local settings for this image maker
	const baseURL = state.config.baseUrl||"https://picrew.me";
	
	let imageCount = 0;
	if (allLayers) for (const item of Object.values(state.commonImages)) for (const layer of Object.values(item)) for (const colour of Object.values(layer)) imageCount++; // count total number of images needed to fetch
	else for (const item in localSettings) imageCount++; // this is total number if downloading only selected
	
	let ora = new JSZip(); // OpenRaster Format.
	ora.file("mimetype","image/openraster", {compression: "STORE"}); // create required mimetype file
	let stack = document.implementation.createDocument(null,"image"); // stack, which can be manipulated and converted to XML
	let image = stack.getElementsByTagName("image")[0]; // `image` element, root
	image.setAttribute("w",state.config.w);
	image.setAttribute("h",state.config.h);
	image.setAttribute("version", "0.0.3"); // look i dunno if this is the right version but it's the version from the example in the ora spec
	
	let layers = []; // we need to sort the layers
	for (const part of Object.values(state.config.pList)) { // iterate the parts (need to put them in `layers` in order)
	
		for (const layer of Object.values(part.lyrs)) { // parts can have multiple layers
		
			let partStack = stack.createElement("stack"); // create a stack (for the part)
			partStack.setAttribute("name", part.pNm);
			partStack.setAttribute("x",part.x);
			partStack.setAttribute("y",part.y);
			// need to put colour layers in the part stack (egads alternating terminology between picrew and ora may get confusing)
			
			for (const item of Object.values(part.items)) { // iterate through items
			
				let itemStack = stack.createElement("stack"); // create a stack (for item, will go in part stack)
				for (const colour of Object.values(state.config.cpList[part.cpId])) { // iterate through colours
					
					let colourStack = stack.createElement("stack");
					const partSettings = localSettings[part.pId]; // user's settings for this part
					const itemActive = partSettings.itmId==item.itmId&&partSettings.cId==colour.cId
					if ((allLayers||itemActive)&&state.commonImages[item.itmId]&&state.commonImages[item.itmId][layer]&&state.commonImages[item.itmId][layer][colour.cId]) { // check image is in dataset
						const url = new URL(state.commonImages[item.itmId][layer][colour.cId].url, baseURL); // url of image to fetch
						const fileName = allLayers ? layer+'_'+part.pNm.replace('/','_')+'/'+item.itmId+'/'+colour.cd+'.png' : url.pathname.split("/").reverse()[0]; // name of file
						await fetch(url,{keepalive:true}).then(response=>response.arrayBuffer()).then(buffer=>ora.folder("data").file(fileName, buffer)) // fetch resource at given URL (synchronously)
						
						let layerElem = stack.createElement("layer"); // layer element
						layerElem.setAttribute("src","data/"+fileName);
						
						if (itemActive) { // if user is using current colour and item
							if (allLayers) {
								layerElem.setAttribute("x", partSettings.xCnt); // set x and y (no rotation in ora though)
								layerElem.setAttribute("y", partSettings.yCnt);
							} else {
								layerElem.setAttribute("x", partSettings.xCnt+part.x);
								layerElem.setAttribute("y", partSettings.yCnt+part.y);
							}
						} else layerElem.setAttribute("visibility", "hidden"); // if user is not using current colour and item, add them but hidden
						
						if (allLayers) partStack.appendChild(layerElem);
						else {layerElem.setAttribute("name",part.pNm);layers[state.config.lyrList[layer]] = layerElem;} // layer is appended to colour stack (or part stack if only shown parts)
						console.log(--imageCount+" unprocessed images");
					}
					if (colourStack.children.length) itemStack.appendChild(colourStack);
				}
				if (itemStack.children.length) partStack.appendChild(itemStack); // item stack is appended to part stack
			}
			if (allLayers) layers[state.config.lyrList[layer]] = partStack; // part stack is inserted in correct location in layers
		}
	}
	let rootStack = stack.createElement("stack");
	image.appendChild(rootStack)
	layers.reverse(); // ora layers stack oppositely
	for (let layer=0;layer<layers.length;layer++) { // iterate through now complete `layers` (has to be in order)
		if (layers[layer]!=undefined) rootStack.appendChild(layers[layer]);
	}
	ora.file("stack.xml",new XMLSerializer().serializeToString(stack), {compression:"DEFLATE"}); // adds completed stack to ora
	const renderedImage = document.getElementById("my-canvas-object"); // already rendered image (good for thumbnails & such)
	ora.file("mergedimage.png",renderedImage.toDataURL().slice(22),{base64:true}); // add required mergedImage.png
	// going to create a smaller canvas for the required thumbnail
	const canvasScale = 256/Math.max(state.config.w, state.config.h); // scaling factor of canvas to match required thumbnail size
	let thumbCanvas = document.createElement("canvas");
	const scaledHeight = Math.floor(state.config.h * canvasScale), scaledWidth = Math.floor(state.config.w * canvasScale);
	thumbCanvas.width = scaledWidth;
	thumbCanvas.height = scaledHeight;
	thumbCanvas.getContext("2d").drawImage(renderedImage,0,0,scaledWidth,scaledHeight);
	ora.file("Thumbnails/thumbnail.png",thumbCanvas.toDataURL().slice(22),{base64:true});
	
	ora.generateAsync({type:"blob", mimeType:"image/openraster"}, metadata=>{console.log(metadata.percent+"% generated")} )
	.then(oraBlob=>{
		const blobUrl = URL.createObjectURL(oraBlob); // create a URL for the blob
//		if (typeof browser !== "undefined") { // firefox has the wackiest blob shenanigans going on
			let oraLink = document.createElement("a"); // i didn't want to have to resort to this, but any other method i tried on firefox failed
			oraLink.href = blobUrl;
			oraLink.download = state.imageMakerId +".ora";
			oraLink.target = "_blank";
			oraLink.hidden = true;
			document.body.appendChild(oraLink);
			oraLink.click();
			document.body.removeChild(oraLink)
			URL.revokeObjectURL(blobUrl);
//		}
//		else chrome.runtime.sendMessage({url: blobUrl, filename: state.imageMakerId +".ora"}); // send download message
	})
}

let nuxtGetter = document.createElement("script");
nuxtGetter.innerText = "window.addEventListener('message',event=>{if (event.source==window&&typeof event.data=='boolean') window.postMessage([window.__NUXT__, event.data],'*')})"; // create a script to sent the window.__NUXT__ object
document.body.appendChild(nuxtGetter);

window.addEventListener("message",event=>{if (event.source==window && typeof event.data=="object") download(...event.data)}); // if received nuxt, download nuxt

const downloadButton = document.createElement("button"); // creating the download button
downloadButton.innerText = "Download current state";
downloadButton.className = "imagemaker_complete_btn"; // convenient class that already exists
downloadButton.type = "button"; // semantic
downloadButton.style.bottom = "44px"
downloadButton.addEventListener("click", ()=>{window.postMessage(false,"*")});
document.body.appendChild(downloadButton); // add to end

const downloadAllButton = document.createElement("button");
downloadAllButton.innerText = "Download entire maker";
downloadAllButton.className = "imagemaker_complete_btn";
downloadAllButton.type = "button";
downloadAllButton.addEventListener("click", ()=>{window.postMessage(true,"*")});
document.body.appendChild(downloadAllButton);


