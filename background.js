browser.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'openOptions') {
        browser.runtime.openOptionsPage();
    }
    else if (msg.action === 'openContact') {
        const subject = encodeURIComponent("SciHelper Feedback");
        const body = encodeURIComponent("Please describe your issue or suggestion:\n");
        const mailtoUrl = `mailto:a95sun@uwaterloo.ca?subject=${subject}&body=${body}`;
        browser.tabs.create({ url: mailtoUrl });
    }
});

const DEFAULT_DOMAIN = [
    "https://docs.google.com/document/*",
    "https://texteditor.cn/"
];

async function initDefaultDomains() {
    const result = await browser.storage.sync.get('enabledDomains');
    if (!result.enabledDomains || result.enabledDomains.length === 0) {
        await browser.storage.sync.set({ enabledDomains: DEFAULT_DOMAIN });
    }
}

let enabledDomains = [];

async function loadDomains() {
    const result = await browser.storage.sync.get('enabledDomains');
    enabledDomains = result.enabledDomains || [];
}

function patternToRegex(pattern) {
    let regexStr = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    regexStr = regexStr.replace(/\*/g, '.*');
    return new RegExp('^' + regexStr + '$');
}

function urlMatchesAny(url) {
    return enabledDomains.some(pattern => patternToRegex(pattern).test(url));
}

async function injectInto(tabId) {
    try {
        await browser.tabs.executeScript(tabId, { file: "SciHelper_lib.js" });
        await browser.tabs.executeScript(tabId, { file: "resources.js" });
        await browser.tabs.executeScript(tabId, { file: "Chemistry_lib.js" });
        await browser.tabs.executeScript(tabId, { file: "General_lib.js" });
        await browser.tabs.executeScript(tabId, { file: "Physics_lib.js" });
        await browser.tabs.executeScript(tabId, { file: "SciHelper.js" });
        await browser.tabs.executeScript(tabId, { file: "katex/katex.min.js"});

        await browser.tabs.insertCSS(tabId, { file: "style.css" });
        await browser.tabs.insertCSS(tabId, { file: "style_chem.css" });
        await browser.tabs.insertCSS(tabId, { file: "style_phys.css" });
        await browser.tabs.insertCSS(tabId, { file: "style_gen.css" });
        await browser.tabs.insertCSS(tabId, { file: "katex/katex.min.css"});

        console.log("Injected into tab", tabId);
    } catch (err) {
        console.error("Injection failed for tab", tabId, err);
    }
}

async function initialize() {
    await initDefaultDomains();
    await loadDomains();
    console.log("Background ready. Domains:", enabledDomains);

    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
            if (urlMatchesAny(tab.url)) {
                injectInto(tabId);
            }
        }
    });

    const tabs = await browser.tabs.query({});
    for (let tab of tabs) {
        if (tab.url && tab.url.startsWith('http') && urlMatchesAny(tab.url)) {
            injectInto(tab.id);
        }
    }

    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && changes.enabledDomains) {
            loadDomains();
        }
    });
}

initialize();