class ChatBot {
    constructor() {
        this.messages = [];
        this.isOpen = false;
        this.websiteContent = this.cleanWebsiteContent(document.documentElement.innerText);
        // Define section keywords with variations
        this.sectionKeywords = {
            about: {
                selector: '#about',
                keywords: ['about garegin', 'background', 'introduction'],
            },
            timeline: {
                selector: '#timeline',
                keywords: [
                    'timeline',
                    'career',
                    'journey',
                    'experience',
                    'work',
                    'job',
                    'employment',
                    'history',
                    'skills',
                    'technologies',
                    'tech stack',
                    'technical skills',
                    'programming',
                ],
            },
            certifications: {
                selector: '#certifications',
                keywords: ['certifications', 'certificates', 'certification', 'certified'],
            },
            projects: {
                selector: '#projects',
                keywords: ['projects', 'work', 'applications', 'project'],
            },
            contact: {
                selector: '#contact',
                keywords: ['contact', 'reach', 'message', 'email'],
            },
        };
        this.funnyIntros = [
            "Hey there! 👋 I'm Garegin's digital mini-me, here to help you explore his awesome portfolio!",
            "Welcome! 🚀 I'm Garegin's AI assistant, and I know all his secrets (well, the professional ones anyway)!",
            "Hi! I'm the friendly AI that Garegin built to chat with awesome people like you! How can I help?",
            "Greetings! 🌟 I'm your guide to all things Garegin - think of me as his portfolio's tour guide!",
            "Hello! I'm Garegin's AI sidekick, ready to help you discover his amazing work and skills!",
        ];
        this.createChatInterface();
        this.initializeEventListeners();
    }

    createChatInterface() {
        // Create chat button
        const chatButton = document.createElement('button');
        chatButton.id = 'chat-button';
        chatButton.innerHTML = '💬';
        document.body.appendChild(chatButton);

        // Create chat container
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chat-container';
        chatContainer.innerHTML = `
            <div class="chat-header">
                <span>Chat with Garegin's Assistant</span>
                <button class="close-chat">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input-container">
                <input type="text" placeholder="Type your message..." id="chat-input">
                <button id="send-message">Send</button>
            </div>
        `;
        document.body.appendChild(chatContainer);
    }

    initializeEventListeners() {
        const chatButton = document.getElementById('chat-button');
        const chatContainer = document.getElementById('chat-container');
        const closeButton = document.querySelector('.close-chat');
        const sendButton = document.getElementById('send-message');
        const chatInput = document.getElementById('chat-input');

        chatButton.addEventListener('click', () => this.toggleChat());
        closeButton.addEventListener('click', () => this.toggleChat());
        sendButton.addEventListener('click', () => this.sendMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChat() {
        const chatContainer = document.getElementById('chat-container');
        this.isOpen = !this.isOpen;
        chatContainer.classList.toggle('open');

        if (this.isOpen && this.messages.length === 0) {
            this.sendWelcomeMessage();
        }
    }

    sendWelcomeMessage() {
        const randomIntro = this.funnyIntros[Math.floor(Math.random() * this.funnyIntros.length)];
        this.addMessage(randomIntro, 'bot');
    }

    detectSection(message) {
        const lowercaseMsg = message.toLowerCase();
        for (const [section, data] of Object.entries(this.sectionKeywords)) {
            // Check if any of the section's keywords are present in the message
            if (data.keywords.some((keyword) => lowercaseMsg.includes(keyword))) {
                return { section, selector: data.selector };
            }
        }
        return null;
    }

    scrollToSection(selector) {
        const section = document.querySelector(selector);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }

    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();

        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        chatInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');

            // Check if message references a section and scroll after a short delay
            const sectionMatch = this.detectSection(message);
            if (sectionMatch) {
                setTimeout(() => {
                    this.scrollToSection(sectionMatch.selector);
                }, 1000); // Delay for 1 second to make it feel natural
            }
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTypingIndicator();
            this.addMessage(
                "I apologize, but I'm having trouble connecting right now. Please try again later.",
                'bot'
            );
        }
    }

    addMessage(text, sender) {
        const messagesContainer = document.querySelector('.chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        this.messages.push({ text, sender });
    }

    showTypingIndicator() {
        const messagesContainer = document.querySelector('.chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML =
            '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    cleanWebsiteContent(content) {
        return content
            .replace(/\*\*/g, '') // Remove markdown-style formatting
            .replace(/\[|\]/g, '') // Remove square brackets
            .replace(/`/g, '') // Remove backticks
            .replace(/\*|_/g, '') // Remove single asterisks and underscores
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/\n+/g, '\n') // Normalize line breaks
            .trim();
    }

    async getAIResponse(userMessage) {
        const systemPrompt = `You are Garegin Mazmanyan's AI assistant. Use this information about him to help website visitors:
        ${this.websiteContent}

        Be friendly, professional, and helpful. You can guide users through the website, tell them about Garegin's skills, experience, and projects.

        Important formatting rules:
        - Never use markdown formatting (like **text** or [text])
        - When mentioning project names or titles, use them without any special formatting
        - Use natural language and avoid unnecessary punctuation
        - Keep responses concise but informative
        - When referring to sections, mention that you're taking them there (e.g., "Let me show you Garegin's projects...")

        Example: Instead of "**CSC110 Coding Platform**", say "CSC110 Coding Platform"`;

        try {
            const response = await fetch('https://deepseek-proxy.garegin-ma.workers.dev', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...this.messages.map((msg) => ({
                            role: msg.sender === 'user' ? 'user' : 'assistant',
                            content: msg.text,
                        })),
                        { role: 'user', content: userMessage },
                    ],
                    max_tokens: 500,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error calling Deepseek API:', error);
            throw error;
        }
    }
}

// Initialize chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add chatbot CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/chatbot.css';
    document.head.appendChild(link);

    // Initialize chatbot
    new ChatBot();
});
