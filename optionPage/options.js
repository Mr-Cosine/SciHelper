let domains = [];

async function loadDomains() {
    const result = await browser.storage.sync.get('enabledDomains');
    domains = result.enabledDomains || [];
    renderList();
}

function renderList() {
    const list = document.getElementById('domainList');
    if (!list) return;
    list.innerHTML = '';
    domains.forEach(domain => {
        const li = document.createElement('li');
        li.textContent = domain;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'remove-btn';
        removeBtn.onclick = () => removeDomain(domain);
        li.appendChild(removeBtn);
        list.appendChild(li);
    });
}

async function addDomain() {
    const input = document.getElementById('domainInput');
    let domain = input.value.trim().toLowerCase();
    if (!domain) return;
    if (!domains.includes(domain)) {
        domains.push(domain);
        await browser.storage.sync.set({ enabledDomains: domains });
        renderList();
        showStatus(`Added ${domain}`);
    } 
    else {
        showStatus(`${domain} already exists.`, 'red');
    }
    input.value = '';
}

async function removeDomain(domain) {
    domains = domains.filter(d => d !== domain);
    await browser.storage.sync.set({ enabledDomains: domains });
    renderList();
    showStatus(`Removed ${domain}`);
}

function showStatus(msg, color = 'green') {
    let statusDiv = document.getElementById('status');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'status';
        document.body.appendChild(statusDiv);
    }
    statusDiv.textContent = msg;
    statusDiv.style.color = color;
    setTimeout(() => { statusDiv.textContent = ''; }, 2000);
}

loadDomains();

document.getElementById('addBtn').addEventListener('click', () => addDomain());