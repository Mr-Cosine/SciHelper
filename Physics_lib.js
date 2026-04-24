export function openPhysWindow(outputLoc, parentWin) {
    if (document.getElementById('sci-phys')) return;
    
    var physWindow = document.createElement('div');
    physWindow.setAttribute('id', 'sci-phys');
    
    var physHeader = document.createElement('div');
    physHeader.setAttribute('id', 'sci-phys-header');
    physHeader.textContent = 'Physics Toolbox';
    physHeader.classList.add('no-select');

    var fnButtonContainer = document. createElement('div');
    fnButtonContainer.setAttribute('class', 'sci-phys-btncontainer');

    var btncolor = '#ba68c8';
    fnButtonContainer.appendChild(Btn('Element Look-Up', '🔎', btncolor, outputLoc));

    physWindow.appendChild(physHeader);
    physWindow.appendChild(fnButtonContainer);
    parentWin.appendChild(physWindow);

    return true;
}

export function closePhysWindow() {
    document.getElementById('sci-phys')?.remove();
    return false;
}

function createFnBtn_chem(name, symbol, color, id, state_chem, outputLoc) {
    var btn = document.createElement('button');
    btn.setAttribute('class', 'sci-chem-btn');
    btn.style.backgroundColor = '#f9f9f9'; // Default state
    btn.id = id;
    btn.color = color;

    // Use 'name' from arguments
    var labelSpan = document.createElement('span');
    labelSpan.textContent = name;
        
    var symbolSpan = document.createElement('span');
    symbolSpan.setAttribute('class', 'sci-chem-btn-symbol');
    symbolSpan.style.color = color;
    symbolSpan.textContent = symbol;

    btn.append(labelSpan, symbolSpan);

    btn.addEventListener('click', function() {
        if (id === 'elemSearch') {
            var existingWindow = document.getElementById('sci-chem-elem');
            if (!existingWindow) {openElemSearchWindow(outputLoc); state_chem.elemSearch = true;}
            else {existingWindow.remove(); state_chem.elemSearch = false;}
        }
        else if (id === 'molmCalc') {
            var existingWindow = document.getElementById('sci-chem-molm');
            if (!existingWindow) {openMolarMassWindow(outputLoc); state_chem.molmCalc = true;} 
            else {existingWindow.remove(); state_chem.molmCalc = false;}
        }
        else if (id === 'limCalc') {
            var existingWindow = document.getElementById('sci-chem-lim');
            if (!existingWindow) {openLimReagentWindow(); state_chem.limCalc = true;}
            else {existingWindow.remove(); state_chem.limCalc = false;}
        }
        else if (id === 'electroChem') {
            var existingWindow = document.getElementById('sci-chem-elec');
            if (!existingWindow) {openElectroChemWindow(outputLoc); state_chem.electroChem = true;}
            else {existingWindow.remove(); state_chem.electroChem = false;}
        }
        refreshBtnDisp(btn.className, state_chem);
    });

    return btn;
}