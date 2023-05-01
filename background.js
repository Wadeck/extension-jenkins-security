console.info('[background.js] starting');

const browserAPI = typeof browser === 'undefined' ? chrome : browser;

const filter = {
    urls: ["*://github.com/*"]
};

browserAPI.webRequest.onCompleted.addListener(details => {
    if (details.type === 'main_frame') {
        console.info('[background.js] adding content.js for main_frame');
        browserAPI.scripting.executeScript({
            target: {tabId: details.tabId},
            files: ['content.js']
        });
    } else {
        console.info('[background.js] ignoring other requests');
    }
}, filter);