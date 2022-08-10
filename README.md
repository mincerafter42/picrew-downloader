# Archived
If this extension is not working, and you want Picrew-downloading functionality, please go to the [Picrew Downloader bookmarklet](https://mincerafter42.github.io/picrew-download-bookmarklet/). It's like the extension, but it's two bookmarklets.

Original description follows.

---

## Picrew Downloader
A Chromium/Firefox extension that adds two buttons to Picrew image makers:
- A button to download the currently visible layers as an OpenRaster file.
- A button to download the entire image maker as an OpenRaster file (resulting files can be quite large)

Also includes a poor attempt at me documenting the innards of the image makers' variables.  
Was previously hosted on my blog. [Previous commit history](https://github.com/mincerafter42/mincerafter42.github.io/commits/main/assets/Picrew%20Downloader%20(Chromium%20or%20Firefox%20extension).zip)  
Somebody suggested I make it its own GitHub repository so here it is.

Uses [JSZip](https://github.com/Stuk/jszip) under its MIT license.

### Installation instructions for Chromium
Go to <chrome://extensions>. Enable Developer Mode. Click Load Unpacked and select an uncompressed folder containing these files. You can disable Developer Mode now if you want.

### Installation instructions for Firefox
Go to <about:addons>. Click the gear and select Install add-on from file. Select an .xpi file containing these files.
