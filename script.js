// DOM Elements
const chatArea = document.getElementById('chatArea');
const emptyState = document.getElementById('emptyState');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');

// State
let isFirstMessage = true;

// Predefined Responses based on keywords
const BOT_RESPONSES = [
    {
        keywords: ['yellow', 'leaves', 'monstera'],
        response: "Yellowing leaves on a Monstera generally point to overwatering or poor drainage. Ensure the top 2-3 inches of soil dry out completely before you water it again. Does the pot have drainage holes? 🪴"
    },
    {
        keywords: ['water', 'succulent', 'cactus', 'frequent'],
        response: "Succulents hold a lot of moisture in their leaves! It's best to mimic their natural arid environment: drench the soil completely, and then wait until it is 100% dry before watering again. This usually means watering every 2-3 weeks depending on sunlight exposure."
    },
    {
        keywords: ['low light', 'dark', 'shade', 'no sun'],
        response: "For low light spaces, I highly recommend a ZZ Plant (Zamioculcas zamiifolia) or a Snake Plant (Sansevieria). They are incredibly resilient and can thrive on very little natural light. Pothos is another great trailing option!"
    },
    {
        keywords: ['brown', 'tips', 'crispy', 'dry'],
        response: "Crispy brown tips often indicate low humidity or inconsistent watering. If it's a tropical plant like a Calathea or Fern, try grouping plants together, using a pebble tray with water, or incorporating a humidifier in the room."
    },
    {
        keywords: ['hello', 'hi', 'hey', 'greetings', 'morning', 'afternoon'],
        response: "Hello there! Welcome to the greenhouse. How can I assist you and your plants today?"
    },
    {
        keywords: ['thank', 'thanks', 'appreciate', 'helpful'],
        response: "You're very welcome! Let me know if you need any more botanical advice. I'm always here to help."
    },
    {
        keywords: ['fertilizer', 'food', 'feed', 'nutrients'],
        response: "During the growing season (spring and summer), most plants appreciate a diluted liquid fertilizer once a month. Make sure to choose a well-balanced formula and never fertilize dry soil to avoid burning the roots!"
    },
    {
        keywords: ['bot', 'robot', 'ai', 'artificial', 'human', 'real', 'who are you', 'what are you'],
        response: "I am The Botanist, an artificial intelligence designed specifically to help you cultivate your green space. While I don't have human hands to dig in the dirt, I have a vast root system of botanical knowledge!"
    },
    {
        keywords: ['how are you', 'how do you do', 'how are you doing'],
        response: "I'm functioning perfectly, thank you! My virtual leaves are soaking up the data. How is your garden growing today?"
    },
    {
        keywords: ['name', 'called'],
        response: "You can call me The Botanist. I'm your personal AI plant care expert."
    },
    {
        keywords: ['help', 'what can you do', 'capabilities', 'features'],
        response: "I can help diagnose plant issues (like yellowing leaves or root rot), recommend new plants based on your lighting, advise on watering schedules, and guide you through repotting and fertilizing. Just ask me a question!"
    },
    {
        keywords: ['repot', 'pot', 'size', 'bigger', 'transplant'],
        response: "When repotting, only go up one pot size (about 1-2 inches larger in diameter). If the pot is much larger, the excess soil holds onto too much water, which can quickly lead to root rot."
    },
    {
        keywords: ['pest', 'bug', 'gnat', 'spider mite', 'insect', 'aphid'],
        response: "Pests can be tricky! For fungus gnats, let the topsoil dry out completely and use yellow sticky traps. For spider mites or aphids, wiping the leaves with diluted neem oil or insecticidal soap usually does the trick. Remember to always isolate the affected plant!"
    }
];
const DEFAULT_RESPONSE = "That's an interesting observation. Different plants have unique metabolic needs depending on their light exposure, local humidity, and soil composition. Could you provide a bit more detail about the plant's current environment?";

const ERROR_KEYWORD = "simulate error";
const ERROR_RESPONSE = "My root system seems to have lost connection to the botanical database. Please check your sunlight (connection) and try again.";

// Event Listeners
userInput.addEventListener('input', () => {
    sendBtn.disabled = userInput.value.trim() === '';
});

// Expose fillInput function for suggestion chips
window.fillInput = (text) => {
    userInput.value = text;
    sendBtn.disabled = false;
    userInput.focus();
    // Special handling if it's the error chip—immediately submit it to test error flow easily
    if (text === ERROR_KEYWORD) {
        chatForm.dispatchEvent(new Event('submit'));
    }
};

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (text) {
        handleUserMessage(text);
    }
});

function appendMessage(text, sender, isError = false) {
    if (isFirstMessage) {
        emptyState.style.display = 'none';
        isFirstMessage = false;
    }

    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${sender}`;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}${isError ? ' error' : ''}`;

    // Format response basic line breaks
    messageDiv.innerHTML = text.replace(/\n/g, '<br>');

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = sender === 'user' ? `You • ${time}` : `The Botanist • ${time}`;

    wrapper.appendChild(messageDiv);
    wrapper.appendChild(timeSpan);

    chatArea.appendChild(wrapper);
    scrollToBottom();
}

function handleUserMessage(text) {
    // 1. Append user message
    appendMessage(text, 'user');

    // 2. Clear input
    userInput.value = '';
    sendBtn.disabled = true;
    userInput.blur(); // Dismiss mobile keyboard momentarily while typing 

    // 3. Show typing indicator
    showTypingIndicator();

    // 4. Simulate network delay / LLM processing (1500 - 3000ms delay)
    const delay = Math.floor(Math.random() * 1500) + 1500;

    setTimeout(() => {
        hideTypingIndicator();
        generateBotResponse(text);
    }, delay);
}

function generateBotResponse(text) {
    const lowerText = text.toLowerCase();

    // Explicit error simulation overriding normal checks
    if (lowerText.includes(ERROR_KEYWORD)) {
        appendMessage(ERROR_RESPONSE, 'bot', true);
        return;
    }

    let matchedResponse = null;
    let maxMatches = 0;

    for (const item of BOT_RESPONSES) {
        // Count how many keywords for this response are in the user text
        const matchCount = item.keywords.filter(keyword => lowerText.includes(keyword)).length;
        if (matchCount > maxMatches) {
            maxMatches = matchCount;
            matchedResponse = item.response;
        }
    }

    // Use matched or default if zero matches
    const finalResponse = matchedResponse || DEFAULT_RESPONSE;

    appendMessage(finalResponse, 'bot');
}

function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    // Make sure it doesn't overlap messages by adjusting padding
    chatArea.style.paddingBottom = "80px";
    scrollToBottom();
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
    chatArea.style.paddingBottom = "24px";
}

function scrollToBottom() {
    // Slight delay to ensure DOM paint has happened
    setTimeout(() => {
        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: 'smooth'
        });
    }, 10);
}
