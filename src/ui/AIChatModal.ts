export class AIChatModal {
  private overlay: HTMLDivElement;
  private panel: HTMLDivElement;
  private messagesArea: HTMLDivElement;
  private inputField: HTMLInputElement;
  private visible = false;

  constructor(parentOverlay: HTMLElement) {
    // Fullscreen semi-transparent overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      pointer-events: auto;
    `;
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Chat panel
    this.panel = document.createElement('div');
    this.panel.style.cssText = `
      width: 420px;
      max-height: 80vh;
      background: #0c1018;
      border: 1px solid #283040;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #d6dbe0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 30px rgba(97, 199, 119, 0.1);
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 12px 16px;
      background: #161b22;
      border-bottom: 1px solid #283040;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    header.innerHTML = `
      <span style="display: flex; align-items: center; gap: 8px;">
        <svg width="16" height="16" viewBox="0 0 8 8" style="image-rendering: pixelated;">
          <rect x="1" y="0" width="6" height="1" fill="#61c777"/>
          <rect x="0" y="1" width="8" height="5" fill="#61c777"/>
          <rect x="2" y="2" width="1" height="2" fill="#0c1018"/>
          <rect x="5" y="2" width="1" height="2" fill="#0c1018"/>
          <rect x="2" y="6" width="1" height="1" fill="#61c777"/>
          <rect x="5" y="6" width="1" height="1" fill="#61c777"/>
          <rect x="1" y="7" width="2" height="1" fill="#61c777"/>
          <rect x="5" y="7" width="2" height="1" fill="#61c777"/>
        </svg>
        <span style="color: #61c777; font-weight: bold;">AI Assistant</span>
      </span>
    `;

    const closeBtn = document.createElement('span');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      color: #959da5;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      padding: 2px 4px;
    `;
    closeBtn.addEventListener('mouseenter', () => { closeBtn.style.color = '#e0e8f0'; });
    closeBtn.addEventListener('mouseleave', () => { closeBtn.style.color = '#959da5'; });
    closeBtn.addEventListener('click', () => this.close());
    header.appendChild(closeBtn);

    // Messages area
    this.messagesArea = document.createElement('div');
    this.messagesArea.style.cssText = `
      padding: 16px;
      flex: 1;
      overflow-y: auto;
      min-height: 200px;
      max-height: 400px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #0a0e14;
    `;

    // Input area
    const inputArea = document.createElement('div');
    inputArea.style.cssText = `
      padding: 12px 16px;
      border-top: 1px solid #283040;
      display: flex;
      gap: 8px;
      background: #0c1018;
    `;

    this.inputField = document.createElement('input');
    this.inputField.type = 'text';
    this.inputField.placeholder = 'Ask me anything...';
    this.inputField.style.cssText = `
      flex: 1;
      background: #161b22;
      border: 1px solid #283040;
      border-radius: 4px;
      color: #d6dbe0;
      padding: 8px 12px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      outline: none;
    `;
    this.inputField.addEventListener('focus', () => {
      this.inputField.style.borderColor = '#61c777';
    });
    this.inputField.addEventListener('blur', () => {
      this.inputField.style.borderColor = '#283040';
    });
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });

    const sendBtn = document.createElement('button');
    sendBtn.textContent = '▶';
    sendBtn.style.cssText = `
      background: #1a2a1a;
      border: 1px solid #61c777;
      border-radius: 4px;
      color: #61c777;
      padding: 8px 14px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
    `;
    sendBtn.addEventListener('mouseenter', () => {
      sendBtn.style.background = '#243a24';
      sendBtn.style.borderColor = '#71d787';
    });
    sendBtn.addEventListener('mouseleave', () => {
      sendBtn.style.background = '#1a2a1a';
      sendBtn.style.borderColor = '#61c777';
    });
    sendBtn.addEventListener('click', () => this.handleSend());

    inputArea.appendChild(this.inputField);
    inputArea.appendChild(sendBtn);

    this.panel.appendChild(header);
    this.panel.appendChild(this.messagesArea);
    this.panel.appendChild(inputArea);
    this.overlay.appendChild(this.panel);
    document.body.appendChild(this.overlay);

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.visible) this.close();
    });
  }

  open(): void {
    this.visible = true;
    this.overlay.style.display = 'flex';
    this.messagesArea.innerHTML = '';
    this.inputField.value = '';
    this.addMessage('ai', 'Hello! Feel free to ask anything about Dongha Geum.');
    setTimeout(() => this.inputField.focus(), 100);
  }

  close(): void {
    this.visible = false;
    this.overlay.style.display = 'none';
  }

  isVisible(): boolean {
    return this.visible;
  }

  private addMessage(sender: 'ai' | 'user', text: string): void {
    const msg = document.createElement('div');
    const isAI = sender === 'ai';
    msg.style.cssText = `
      padding: 8px 12px;
      border-radius: 6px;
      max-width: 85%;
      line-height: 1.5;
      word-break: break-word;
      align-self: ${isAI ? 'flex-start' : 'flex-end'};
      background: ${isAI ? '#121a24' : '#162030'};
      color: ${isAI ? '#61c777' : '#72b3e8'};
      border: 1px solid ${isAI ? '#1c2e1c' : '#1c2840'};
    `;
    msg.textContent = text;
    this.messagesArea.appendChild(msg);
    this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
  }

  private handleSend(): void {
    const text = this.inputField.value.trim();
    if (!text) return;
    this.addMessage('user', text);
    this.inputField.value = '';
    // Stub response
    setTimeout(() => {
      this.addMessage('ai', 'AI integration is coming soon. Please contact coralmux@gmail.com for now.');
    }, 400);
  }
}
