function openChemWindow() {
    if (document.getElementById('sci-chempanel')) return;
    
    var chemWindow = document.createElement('div');
    chemWindow.setAttribute('id', 'sci-chempanel');
    
    var chemHeader = document.createElement('div');
    chemHeader.setAttribute('id', 'sci-chempanel-header');
    chemHeader.textContent = 'Chemistry Toolbox';

    var searchBox = document.createElement('input');
    searchBox.placeholder = 'Search element...';
    
    var resultsArea = document.createElement('div');
    resultsArea.id = 'sci-chempanel-results';

    searchBox.addEventListener('input', function() {
        var query = searchBox.value.toLowerCase();
        while(resultsArea.firstChild) { resultsArea.removeChild(resultsArea.firstChild); }

        if (!query) return;

        var found = elements.filter(el => 
            el.name.toLowerCase().includes(query) || 
            el.symbol.toLowerCase().includes(query)
        );

        found.forEach(element => {
            
            var row = document.createElement('div');
            row.setAttribute('class', 'sci-chempanel-elem-row');
    
            var symbol = document.createElement("div");
            symbol.classList.add('sci-chempanel-elem-row-symbol');
            symbol.textContent = element.atomicNumber + '\t' + element.symbol;
                
            var info = document.createElement("div");
            info.classList.add('sci-chempanel-elem-row-name');
            info.textContent = element.name + '\t(' + element.molarMass + ' u)';

            row.appendChild(symbol);
            row.appendChild(info);
            resultsArea.appendChild(row);
        });
    });

    chemWindow.append(chemHeader, searchBox, resultsArea);
    document.body.appendChild(chemWindow);
    makeDraggable(chemHeader, chemWindow);
    searchBox.focus;

    return chemWindow; // Return this so the main program can track it
}