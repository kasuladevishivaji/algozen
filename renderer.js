const analyzeScreenBtn = document.getElementById('analyze-screen-btn');
const analyzeFileBtn = document.getElementById('analyze-file-btn');
const chatWindow = document.getElementById('chat-window');
const actionButtons = document.getElementById('action-buttons');
const loadingState = document.getElementById('loading-state');
const userDescriptionInput = document.getElementById('user-description');
const sourcesModal = document.getElementById('sources-modal');
const sourcesList = document.getElementById('sources-list');
const closeModalBtn = document.getElementById('close-modal-btn');

analyzeScreenBtn.addEventListener('click', async () => {
    const sources = await window.electronAPI.getScreenSources();
    sourcesList.innerHTML = ''; 
    sources.forEach(source => {
        const sourceDiv = document.createElement('div');
        sourceDiv.className = 'border-2 border-slate-200 rounded-lg p-2 cursor-pointer hover:border-cyan-500 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center bg-slate-50';
        sourceDiv.innerHTML = `
            <img src="${source.thumbnail.toDataURL()}" class="w-full h-28 object-cover rounded-md mb-2 shadow-sm">
            <p class="text-xs font-medium text-slate-700 truncate w-full">${source.name}</p>
        `;
        sourceDiv.onclick = () => {
            selectSource(source);
            sourcesModal.classList.add('hidden');
        };
        sourcesList.appendChild(sourceDiv);
    });
    sourcesModal.classList.remove('hidden');
});

analyzeFileBtn.addEventListener('click', async () => {
    const file = await window.electronAPI.openFile();
    if (file) {
        const userDescription = userDescriptionInput.value.trim();
        displayUserMessage(`Analyzing file: <strong>${file.path}</strong>`, userDescription);
        setLoading(true);
        try {
            const analysis = await analyzeCodeWithGemini(file.content, userDescription);
            displayBotMessage(analysis);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }
});

closeModalBtn.addEventListener('click', () => sourcesModal.classList.add('hidden'));

async function selectSource(source) {
    const userDescription = userDescriptionInput.value.trim();
    displayUserMessage(`Analyzing screenshot of <strong>${source.name}</strong>`, userDescription);
    setLoading(true);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: source.id } }
        });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            stream.getTracks().forEach(track => track.stop());
            const imageBase64 = canvas.toDataURL('image/png').split(',')[1];
            analyzeImageWithGemini(imageBase64, userDescription);
        };
    } catch (e) {
        handleError(e, "Failed to capture screen. Please ensure permissions are granted.");
        setLoading(false);
    }
}

function getDSAPrompt(userRequest) {
    let basePrompt = `You are an expert DSA (Data Structures and Algorithms) tutor named AlgoZen. Your goal is to provide a clear, helpful, and structured analysis.
Follow this structure for your answer:
1.  **Concept & Logic:** Start with a clear, step-by-step explanation of the concept or algorithm.
2.  **Code Implementation/Correction:** Provide a well-commented code implementation in Python. If the user provided code, correct it.
3.  **Complexity Analysis:** Analyze the Time and Space Complexity (Big O notation).
4.  **Edge Cases:** Briefly mention important edge cases.

Format your response using Markdown for readability (headings, bold text, lists, and code blocks).`;

    if (userRequest) {
        return `${basePrompt}\n\nThe user has a specific request: "${userRequest}". Address this request in your analysis.`;
    }
    return basePrompt;
}

async function analyzeImageWithGemini(base64ImageData, userDescription) {
    const prompt = getDSAPrompt(userDescription);
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: "image/png", data: base64ImageData } }] }]
    };
    try {
        const analysis = await callGeminiAPI(payload);
        displayBotMessage(analysis);
    } catch (error) {
        handleError(error);
    } finally {
        setLoading(false);
    }
}

async function analyzeCodeWithGemini(fileContent, userDescription) {
    const prompt = getDSAPrompt(userDescription) + `\n\n--- USER'S CODE ---\n${fileContent}`;
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
    return await callGeminiAPI(payload);
}

async function callGeminiAPI(payload) {
    const apiKey = "";
    if (!apiKey) throw new Error("API key is not set. Please add it to renderer.js.");
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
    const result = await response.json();
    if (result.candidates && result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
    } else {
        throw new Error("Received an empty or invalid response from the API.");
    }
}

function setLoading(isLoading) {
    const buttons = document.getElementById('action-buttons').querySelector('.flex');
    buttons.classList.toggle('hidden', isLoading);
    loadingState.classList.toggle('hidden', !isLoading);
}

function displayUserMessage(mainText, description) {
    const el = document.createElement('div');
    el.className = 'message flex justify-end items-start gap-3';
    let descriptionHtml = description ? `<p class="mt-2 text-xs text-slate-200 italic">"${description}"</p>` : '';
    el.innerHTML = `
        <div class="bg-gradient-to-br from-blue-500 to-cyan-400 text-white p-3 rounded-lg shadow-md max-w-xl">
            <p class="font-semibold text-sm">${mainText}</p>
            ${descriptionHtml}
        </div>`;
    chatWindow.appendChild(el);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    userDescriptionInput.value = '';
}

function displayBotMessage(message) {
    const el = document.createElement('div');
    el.className = 'message flex items-start gap-3';
    el.innerHTML = `
        <div class="bg-slate-900 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-md max-w-2xl prose prose-slate prose-sm">${marked.parse(message)}</div>`;
    chatWindow.appendChild(el);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function handleError(error, customMessage) {
    console.error(error);
    const errorMessage = customMessage || error.message;
    displayBotMessage(`**Error:** ${errorMessage}`);
}

window.onload = () => {
    displayBotMessage("Hello! I'm **AlgoZen**. How can I help you with Data Structures or Algorithms today?");
};