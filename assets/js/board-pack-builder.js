/**
 * Board Pack Builder Logic
 * Handles the 5-step wizard state, persistence, and UI rendering.
 */

// State Management (Initializing with defaults)
const defaultState = {
    step: 1,
    meetingDetails: {
        cicName: '',
        companyNumber: '',
        meetingDate: new Date().toISOString().split('T')[0], // Today YYYY-MM-DD
        meetingTime: '10:00',
        location: 'Zoom / Video Conference',
        template: 'regular' // regular, agm, special
    },
    attendance: {
        directors: [
            { id: 1, name: 'Chairperson', role: 'Director', status: 'present' },
            { id: 2, name: 'Treasurer', role: 'Director', status: 'present' }
        ],
        observers: [],
        quorumMet: true
    },
    agenda: [
        { id: 'std-1', title: 'Apologies for Absence', type: 'info', duration: 2, fixed: true },
        { id: 'std-2', title: 'Declarations of Interest', type: 'info', duration: 2, fixed: true },
        { id: 'std-3', title: 'Minutes of Previous Meeting', type: 'decision', duration: 5, fixed: true }
    ],
    decisions: [] // Will store extra details for 'decision' type items
};

// Load from LocalStorage or use Default
let state = JSON.parse(localStorage.getItem('boardPackState')) || defaultState;

// DOM Elements
const elements = {
    steps: document.querySelectorAll('.step-card'),
    progressSteps: document.querySelectorAll('.progress-step'),
    btnNext: document.getElementById('btn-next'),
    btnBack: document.getElementById('btn-back'),
    autoSaveIndicator: document.getElementById('auto-save-indicator')
};

// --- Initialization ---
function init() {
    console.log("Initializing Board Pack Builder...");
    renderStep(state.step);
    updateProgressUI();

    // Global Event Listeners
    elements.btnNext.addEventListener('click', () => changeStep(1));
    elements.btnBack.addEventListener('click', () => changeStep(-1));
}

// --- Navigation Logic ---
function changeStep(direction) {
    const newStep = state.step + direction;
    if (newStep < 1 || newStep > 5) return;

    // TODO: Add Validation before proceeding
    state.step = newStep;
    saveState();
    renderStep(state.step);
    updateProgressUI();
}

function updateProgressUI() {
    elements.progressSteps.forEach(stepEl => {
        const stepNum = parseInt(stepEl.dataset.step);
        stepEl.classList.remove('active', 'completed');

        if (stepNum === state.step) {
            stepEl.classList.add('active');
        } else if (stepNum < state.step) {
            stepEl.classList.add('completed');
            // Add checkmark visual?
        }
    });

    // Button States
    elements.btnBack.style.visibility = state.step === 1 ? 'hidden' : 'visible';
    elements.btnNext.innerHTML = state.step === 5 ?
        'Generate Pack <i class="fas fa-magic" style="margin-left:0.5rem"></i>' :
        'Next Step <i class="fas fa-arrow-right" style="margin-left:0.5rem"></i>';
}

function saveState() {
    localStorage.setItem('boardPackState', JSON.stringify(state));

    // visual feedback
    const originalText = elements.autoSaveIndicator.innerHTML;
    elements.autoSaveIndicator.style.opacity = '1';
    setTimeout(() => {
        elements.autoSaveIndicator.style.opacity = '0.7';
    }, 1000);
}

// --- Step Rendering Logic ---
function renderStep(step) {
    // Hide all steps
    elements.steps.forEach(el => el.classList.remove('active'));

    // Show current step container
    const currentStepEl = document.getElementById(`step-${step}`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');

        // Dynamically inject content based on step
        switch (step) {
            case 1: renderStep1(currentStepEl); break;
            case 2: renderStep2(currentStepEl); break;
            case 3: renderStep3(currentStepEl); break;
            case 4: renderStep4(currentStepEl); break;
            case 5: renderStep5(currentStepEl); break;
        }
    }
}

// --- Step 1: Basics ---
function renderStep1(container) {
    container.innerHTML = `
        <h2 class="text-xl font-bold mb-6 text-white">Meeting Details</h2>
        <div class="grid" style="display:grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div class="form-group">
                <label class="form-label">CIC Name</label>
                <input type="text" class="form-input" value="${state.meetingDetails.cicName}" 
                    oninput="updateMeetingDetails('cicName', this.value)" placeholder="e.g. Youth Forward CIC">
            </div>
            <div class="form-group">
                <label class="form-label">Company Number</label>
                <input type="text" class="form-input" value="${state.meetingDetails.companyNumber}" 
                    oninput="updateMeetingDetails('companyNumber', this.value)" placeholder="e.g. 12345678">
            </div>
            <div class="form-group">
                <label class="form-label">Meeting Date</label>
                <input type="date" class="form-input" value="${state.meetingDetails.meetingDate}" 
                    oninput="updateMeetingDetails('meetingDate', this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">Start Time</label>
                <input type="time" class="form-input" value="${state.meetingDetails.meetingTime}" 
                    oninput="updateMeetingDetails('meetingTime', this.value)">
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
                <label class="form-label">Location</label>
                <input type="text" class="form-input" value="${state.meetingDetails.location}" 
                    oninput="updateMeetingDetails('location', this.value)">
            </div>
        </div>
    `;
}

function updateMeetingDetails(key, value) {
    state.meetingDetails[key] = value;
    saveState();
}

// --- Step 2: Attendance ---
function renderStep2(container) {
    container.innerHTML = `
        <h2 class="text-xl font-bold mb-4 text-white">Attendance Tracking</h2>
        
        <div class="quorum-banner ${state.attendance.quorumMet ? '' : 'warning'}">
            <i class="fas ${state.attendance.quorumMet ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            Current Quorum Status: <strong>${state.attendance.quorumMet ? 'Quorate' : 'Not Quorate'}</strong>
            <span style="margin-left:auto; font-size: 0.8rem; opacity: 0.8;">Need >50% of directors</span>
        </div>

        <div class="attendance-grid-header">
            <div>Name</div>
            <div>Role</div>
            <div>Status</div>
            <div></div>
        </div>
        <div id="directors-list">
            ${state.attendance.directors.map((d, index) => renderDirectorRow(d, index)).join('')}
        </div>
        
        <button class="btn btn-secondary mt-4 w-full" onclick="addDirector()">
            <i class="fas fa-plus"></i> Add Director / Observer
        </button>
    `;
}

function renderDirectorRow(person, index) {
    return `
        <div class="attendance-row">
            <input type="text" class="form-input" value="${person.name}" onchange="updatePerson(${index}, 'name', this.value)">
            <select class="form-select" onchange="updatePerson(${index}, 'role', this.value)">
                <option value="Director" ${person.role === 'Director' ? 'selected' : ''}>Director</option>
                <option value="Observer" ${person.role === 'Observer' ? 'selected' : ''}>Observer</option>
                <option value="Secretary" ${person.role === 'Secretary' ? 'selected' : ''}>Secretary</option>
            </select>
            <select class="form-select" onchange="updatePerson(${index}, 'status', this.value)">
                <option value="present" ${person.status === 'present' ? 'selected' : ''}>Present</option>
                <option value="apologies" ${person.status === 'apologies' ? 'selected' : ''}>Apologies</option>
                <option value="absent" ${person.status === 'absent' ? 'selected' : ''}>Absent</option>
            </select>
            <button class="btn-icon text-secondary hover:text-red-500" onclick="removePerson(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

// Helper methods for state updates (global scope for simplicity in this prototype)
window.updateMeetingDetails = updateMeetingDetails;
window.updatePerson = (index, key, value) => {
    state.attendance.directors[index][key] = value;
    // Recalculate Quorum Logic would go here
    saveState();
};
window.addDirector = () => {
    state.attendance.directors.push({ name: 'New Person', role: 'Director', status: 'present' });
    renderStep(2); // Re-render to show new row
    saveState();
};


// --- Helper: Quorum Calculation ---
function calculateQuorum() {
    const directors = state.attendance.directors.filter(p => p.role === 'Director');
    const presentDirectors = directors.filter(d => d.status === 'present');
    const quorumRequired = Math.ceil(directors.length / 2); // Simple majority rule for now, ideally strictly > 2

    // CIC Model Articles often require 2 directors minimum
    const isQuorate = presentDirectors.length >= Math.max(2, quorumRequired);

    state.attendance.quorumMet = isQuorate;

    // If we are currently on step 2, re-render the banner
    if (state.step === 2) {
        const banner = document.querySelector('.quorum-banner');
        if (banner) {
            banner.className = `quorum-banner ${isQuorate ? '' : 'warning'}`;
            banner.innerHTML = `
                <i class="fas ${isQuorate ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                Current Quorum Status: <strong>${isQuorate ? 'Quorate' : 'Not Quorate'}</strong>
                <span style="margin-left:auto; font-size: 0.8rem; opacity: 0.8;">
                    ${presentDirectors.length}/${directors.length} Directors Present (Min: ${Math.max(2, quorumRequired)})
                </span>
            `;
        }
    }
}

// Override the window helper
window.updatePerson = (index, key, value) => {
    state.attendance.directors[index][key] = value;
    calculateQuorum(); // Recalculate immediately
    saveState();
};
window.removePerson = (index) => {
    state.attendance.directors.splice(index, 1);
    renderStep(2);
    calculateQuorum();
    saveState();
};


// --- Step 3: Agenda Builder ---
function renderStep3(container) {
    let totalTime = state.agenda.reduce((acc, item) => acc + (item.duration || 0), 0);

    container.innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-white">Agenda Builder</h2>
            <div class="text-secondary text-sm">
                Total Time: <strong class="text-white">${totalTime} mins</strong>
            </div>
        </div>

        <div class="agenda-list" id="agenda-container">
            ${state.agenda.map((item, index) => renderAgendaItem(item, index)).join('')}
        </div>

        <div class="mt-6 p-4" style="background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px dashed var(--bp-border-dark);">
            <h4 class="text-sm font-bold text-secondary mb-3 uppercase tracking-wider">Add New Item</h4>
            <div class="flex gap-2">
                <input type="text" id="new-item-title" class="form-input" placeholder="Item Title (e.g. CEO Report)" style="flex:2">
                <select id="new-item-type" class="form-select" style="flex:1">
                    <option value="info">Info</option>
                    <option value="discussion">Discussion</option>
                    <option value="decision">Decision</option>
                </select>
                <input type="number" id="new-item-time" class="form-input" placeholder="Min" style="width: 80px;" value="10">
                <button class="btn btn-primary" onclick="addAgendaItem()">
                    <i class="fas fa-plus"></i> Add
                </button>
            </div>
        </div>
    `;

    // Initialize Drag and Drop
    setupDragAndDrop();
}

function renderAgendaItem(item, index) {
    const badgeClass = item.type === 'decision' ? 'badge-decision' : (item.type === 'discussion' ? 'badge-discussion' : 'badge-info');

    return `
        <div class="agenda-item" draggable="true" data-index="${index}">
            <div class="drag-handle"><i class="fas fa-grip-vertical"></i></div>
            <div class="agenda-content">
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-white">${item.title}</span>
                    <span class="agenda-badge ${badgeClass}">${item.type}</span>
                </div>
                <div class="text-xs text-secondary">
                    <i class="far fa-clock"></i> ${item.duration} mins 
                    ${item.presenter ? `| <i class="far fa-user"></i> ${item.presenter}` : ''}
                </div>
            </div>
            ${!item.fixed ? `
            <button class="btn-icon text-secondary hover:text-red-500" onclick="removeAgendaItem(${index})">
                <i class="fas fa-times"></i>
            </button>` : '<span class="text-xs text-secondary italic mr-2">Fixed</span>'}
        </div>
    `;
}

// --- Drag & Drop Logic ---
function setupDragAndDrop() {
    const draggables = document.querySelectorAll('.agenda-item');
    const container = document.getElementById('agenda-container');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
            // Update State Order
            updateAgendaOrder();
        });
    });

    container.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.agenda-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateAgendaOrder() {
    const newOrder = [];
    const itemElements = document.querySelectorAll('.agenda-item');

    itemElements.forEach(el => {
        const oldIndex = parseInt(el.dataset.index);
        newOrder.push(state.agenda[oldIndex]);
    });

    // state.agenda = newOrder; // This causes issues because indices change. 
    // Better strategy: construct new array based on DOM order

    // Correction: We need to pull from the state based on the ID or original index carefully.
    // Ideally, we'd use IDs, but for now we used index. 
    // Let's re-map safely.

    // Actually, simply mapping by the DOM elements' initial index works IF we didn't mutate the DOM recklessly.
    // But since we moved DOM nodes, the dataset.index is still the OLD index.
    const reorderedAgenda = [];
    itemElements.forEach(el => {
        const originalIndex = parseInt(el.dataset.index);
        reorderedAgenda.push(state.agenda[originalIndex]);
    });

    state.agenda = reorderedAgenda;
    saveState();
    renderStep(3); // Re-render to update indices
}

// Global Agenda Actions
window.addAgendaItem = () => {
    const title = document.getElementById('new-item-title').value;
    const type = document.getElementById('new-item-type').value;
    const time = parseInt(document.getElementById('new-item-time').value) || 10;

    if (!title) return; // Simple validation

    state.agenda.push({
        id: 'custom-' + Date.now(),
        title: title,
        type: type,
        duration: time,
        presenter: 'Chair' // Default
    });

    saveState();
    renderStep(3);
};

window.removeAgendaItem = (index) => {
    state.agenda.splice(index, 1);
    saveState();
    renderStep(3);
};


// --- Step 4: Decision Details ---
function renderStep4(container) {
    // Filter agenda for 'decision' items
    const decisionsNeeded = state.agenda.filter(item => item.type === 'decision');

    if (decisionsNeeded.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-check-circle text-green" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h2 class="text-xl font-bold text-white">No Decisions Required</h2>
                <p class="text-secondary">Your agenda currently has no items marked as 'Decision'. You can skip this step.</p>
            </div>
        `;
        return;
    }

    let html = `
        <h2 class="text-xl font-bold mb-6 text-white">Decision Details</h2>
        <p class="text-secondary mb-6">Flesh out the details for your decision items to generate robust board papers.</p>
    `;

    decisionsNeeded.forEach((item, index) => {
        // Find existing decision data or create new
        const decisionData = state.decisions.find(d => d.agendaItemId === item.id) || {};

        html += `
            <div class="mb-8 p-6" style="background: rgba(255,255,255,0.03); border-radius: 0.75rem; border: 1px solid var(--bp-border-dark);">
                <h3 class="font-bold text-lg text-amber mb-4"><span class="text-secondary text-sm font-normal uppercase tracking-wide mr-2">Item:</span> ${item.title}</h3>
                
                <div class="grid grid-cols-1 gap-4">
                    <div class="form-group">
                        <label class="form-label">Decision Required</label>
                        <textarea class="form-input" rows="2" placeholder="What exactly is the board being asked to decide?"
                            onchange="updateDecision('${item.id}', 'decisionText', this.value)">${decisionData.decisionText || ''}</textarea>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">Financial Impact</label>
                            <input type="text" class="form-input" placeholder="e.g. £5,000 cost / Neutral"
                                value="${decisionData.financialImpact || ''}"
                                onchange="updateDecision('${item.id}', 'financialImpact', this.value)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Key Risk</label>
                            <input type="text" class="form-input" placeholder="e.g. Reputational / Operational"
                                value="${decisionData.risks || ''}"
                                onchange="updateDecision('${item.id}', 'risks', this.value)">
                        </div>
                    </div>
                     <div class="form-group">
                        <label class="form-label">Recommendation</label>
                         <input type="text" class="form-input" placeholder="e.g. Approve the proposal"
                                value="${decisionData.recommendation || ''}"
                                onchange="updateDecision('${item.id}', 'recommendation', this.value)">
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

window.updateDecision = (agendaId, key, value) => {
    let decision = state.decisions.find(d => d.agendaItemId === agendaId);
    if (!decision) {
        decision = { agendaItemId: agendaId };
        state.decisions.push(decision);
    }
    decision[key] = value;
    saveState();
};

// --- Step 5: Review & Generate ---
function renderStep5(container) {
    const meeting = state.meetingDetails;
    const duration = state.agenda.reduce((acc, i) => acc + (i.duration || 0), 0);

    container.innerHTML = `
        <div class="text-center mb-10">
            <h2 class="text-2xl font-bold text-white mb-2">Ready to Generate?</h2>
            <p class="text-secondary">Review your board pack details below.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="p-6 bg-slate-900 border border-slate-700 rounded-xl">
                <h4 class="text-secondary uppercase text-xs font-bold tracking-wider mb-4">Meeting Summary</h4>
                <div class="space-y-2">
                    <div class="flex justify-between"><span class="text-slate-400">CIC:</span> <span class="text-white font-medium">${meeting.cicName}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Date:</span> <span class="text-white font-medium">${meeting.meetingDate}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Time:</span> <span class="text-white font-medium">${meeting.meetingTime}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Est. Duration:</span> <span class="text-white font-medium">${duration} mins</span></div>
                </div>
            </div>

            <div class="p-6 bg-slate-900 border border-slate-700 rounded-xl">
                <h4 class="text-secondary uppercase text-xs font-bold tracking-wider mb-4">Pack Contents</h4>
                 <ul class="text-sm space-y-2 text-slate-300">
                    <li><i class="fas fa-check text-green mr-2"></i> Formal Agenda</li>
                    <li><i class="fas fa-check text-green mr-2"></i> Attendance Register & Quorum Check</li>
                    <li><i class="fas fa-check text-green mr-2"></i> ${state.agenda.filter(i => i.type === 'decision').length} Decision Paper(s)</li>
                    <li><i class="fas fa-check text-green mr-2"></i> Minutes Template</li>
                    <li><i class="fas fa-check text-green mr-2"></i> Action Tracker</li>
                </ul>
            </div>
        </div>

        <div class="flex justify-center">
            <button class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.1rem;" onclick="generatePackProxy()">
                Generate Board Pack <i class="fas fa-rocket ml-2"></i>
            </button>
        </div>
    `;
}

// Mock API Call for Generation
window.generatePackProxy = async () => {
    const btn = document.querySelector('.btn-primary');
    const originalText = btn.innerHTML;

    // 1. UI Loading State
    btn.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-2"></i> Generating...`;
    btn.disabled = true;

    // 2. Prepare Payload (Simulating what we'd send to backend)
    const payload = {
        meetingDetails: state.meetingDetails,
        attendance: state.attendance,
        agenda: state.agenda,
        decisions: state.decisions,
        generatedAt: new Date().toISOString()
    };

    console.log("🚀 GENERATING BOARD PACK PAYLOAD:", payload);

    // 3. Fake Delay
    await new Promise(r => setTimeout(r, 2000));

    // 4. Success UI
    document.querySelector('.wizard-container').innerHTML = `
        <div class="text-center py-12 animation-fade-in">
            <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-900/30 text-green-500 mb-6">
                <i class="fas fa-check text-4xl"></i>
            </div>
            <h2 class="text-3xl font-bold text-white mb-4">Board Pack Generated!</h2>
            <p class="text-secondary max-w-md mx-auto mb-8">
                Your board pack for <strong>${state.meetingDetails.cicName}</strong> is ready. 
                The ZIP file contains your Agenda, Decision Papers, and Minute Templates.
            </p>
            
            <div class="flex justify-center gap-4">
                <button class="btn btn-primary" onclick="alert('Downloading ZIP...')">
                    <i class="fas fa-download mr-2"></i> Download ZIP
                </button>
                <button class="btn btn-secondary" onclick="location.reload()">
                    Create Another
                </button>
            </div>
            
            <div class="mt-12 p-4 bg-slate-900 rounded text-left max-w-lg mx-auto overflow-hidden">
                <p class="text-xs text-slate-500 uppercase font-bold mb-2">Developer Log (Payload):</p>
                <pre class="text-xs text-green-400 font-mono overflow-x-auto">${JSON.stringify(payload, null, 2)}</pre>
            </div>
        </div>
    `;

    // Clear State? Maybe not, allow them to edit if they reload.
};

// Start App
document.addEventListener('DOMContentLoaded', init);
