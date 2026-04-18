type ChatTurn = { role: 'user' | 'model'; text: string };
type Lang = 'ko' | 'en';

type Kind = 'personal' | 'business' | 'collaboration' | 'networking' | 'recruiter';

const KIND_ORDER: Kind[] = ['personal', 'business', 'collaboration', 'networking', 'recruiter'];
const CORP_REQUIRED_KINDS: ReadonlySet<Kind> = new Set(['recruiter', 'business']);

const FREE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.jp', 'yahoo.co.kr', 'ymail.com',
  'naver.com', 'daum.net', 'hanmail.net', 'nate.com', 'kakao.com',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com',
  'proton.me', 'protonmail.com', 'pm.me',
  'yandex.com', 'yandex.ru',
  'mail.com', 'mail.ru', 'gmx.com', 'gmx.de',
  'zoho.com', 'fastmail.com', 'tutanota.com',
  'qq.com', '163.com', '126.com', 'sina.com', 'sohu.com',
]);

function isFreeEmail(email: string): boolean {
  const parts = email.toLowerCase().split('@');
  return parts.length === 2 && FREE_EMAIL_DOMAINS.has(parts[1]);
}

const KIND_LABELS: Record<Lang, Record<Kind, string>> = {
  ko: {
    personal: '개인 문의',
    business: '비즈니스 / 외주',
    collaboration: '협업 / 파트너십',
    networking: '네트워킹',
    recruiter: '헤드헌팅 / 채용',
  },
  en: {
    personal: 'Personal inquiry',
    business: 'Business / Consulting',
    collaboration: 'Collaboration / Partnership',
    networking: 'Networking',
    recruiter: 'Recruiting / Hiring',
  },
};

const STRINGS: Record<Lang, {
  title: string;
  greeting: string;
  placeholder: string;
  connectionError: string;
  submittedPlaceholder: string;
  privacy: string;
  newChat: string;
  langToggleLabel: string;
  inputTooLong: string;
  formTitle: string;
  formName: string;
  formNamePlaceholder: string;
  formEmail: string;
  formEmailPlaceholder: string;
  formKind: string;
  formSummary: string;
  formSummaryPlaceholder: string;
  formCancel: string;
  formSend: string;
  formInvalidEmail: string;
  formInvalidSummary: string;
  formInvalidName: string;
  formRequireCorpEmail: string;
  sending: string;
  forwardingToSecretary: string;
}> = {
  ko: {
    title: 'AI Assistant',
    greeting: '안녕하세요. 주인님에게 전달할 용건을 알려주세요.',
    placeholder: '용건을 입력하세요...',
    connectionError: '연결 오류. 다시 시도해주세요.',
    submittedPlaceholder: '전달 완료 — 새 대화를 시작해주세요.',
    privacy: '대화는 접선 스크리닝용으로 AI에 전송됩니다.',
    newChat: '새 대화',
    langToggleLabel: 'EN',
    inputTooLong: '메시지가 너무 깁니다 (2000자 이하).',
    formTitle: '연락 정보',
    formName: '이름 / 회사',
    formNamePlaceholder: '이름 또는 회사명',
    formEmail: '이메일',
    formEmailPlaceholder: 'you@example.com',
    formKind: '분류',
    formSummary: '용건 요약',
    formSummaryPlaceholder: '간단히 적어주세요.',
    formCancel: '취소',
    formSend: '전송',
    formInvalidEmail: '올바른 이메일을 입력해주세요.',
    formInvalidSummary: '용건을 15자 이상 구체적으로 입력해주세요.',
    formInvalidName: '이름/회사를 정확히 입력해주세요.',
    formRequireCorpEmail: '채용/업무 문의는 회사 이메일을 사용해주세요. 개인 메일(gmail 등)은 받지 않습니다.',
    sending: '전송 중...',
    forwardingToSecretary: '중간비서님에게 전달했습니다. 답변을 기다려주세요.',
  },
  en: {
    title: 'AI Assistant',
    greeting: "Hello. Please tell me what you'd like to convey to the owner.",
    placeholder: 'Type your message...',
    connectionError: 'Connection error. Please try again.',
    submittedPlaceholder: 'Sent — please start a new chat.',
    privacy: 'Messages are sent to an AI for contact screening.',
    newChat: 'New chat',
    langToggleLabel: 'KO',
    inputTooLong: 'Message is too long (max 2000 characters).',
    formTitle: 'Contact details',
    formName: 'Name / Company',
    formNamePlaceholder: 'Your name or company',
    formEmail: 'Email',
    formEmailPlaceholder: 'you@example.com',
    formKind: 'Category',
    formSummary: 'Summary',
    formSummaryPlaceholder: 'Briefly describe your request.',
    formCancel: 'Cancel',
    formSend: 'Send',
    formInvalidEmail: 'Please enter a valid email.',
    formInvalidSummary: 'Please describe your request in at least 15 meaningful characters.',
    formInvalidName: 'Please enter a valid name/company.',
    formRequireCorpEmail: 'Please use your company email for recruiting/business inquiries. Free providers (gmail, etc.) are not accepted.',
    sending: 'Sending...',
    forwardingToSecretary: 'Forwarded to the mid secretary. Please wait for a response.',
  },
};

function escapeHtml(s: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return s.replace(/[&<>"']/g, (c) => map[c]);
}

function renderMarkdown(text: string): string {
  let s = escapeHtml(text);
  s = s.replace(/`([^`\n]+)`/g, '<code style="background:#0a0e14;padding:1px 5px;border-radius:3px;color:#e0e8f0;font-size:12px;">$1</code>');
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<i>$2</i>');
  s = s.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" style="color:#72b3e8;text-decoration:underline;">$1</a>');
  s = s.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#72b3e8;text-decoration:underline;">$1</a>');
  s = s.replace(/\n/g, '<br>');
  return s;
}

export class AIChatModal {
  private overlay: HTMLDivElement;
  private panel: HTMLDivElement;
  private messagesArea: HTMLDivElement;
  private inputField: HTMLInputElement;
  private inputArea!: HTMLDivElement;
  private sendBtn!: HTMLButtonElement;
  private langBtn!: HTMLButtonElement;
  private newChatBtn!: HTMLButtonElement;
  private privacyNote!: HTMLDivElement;
  private formArea!: HTMLDivElement;
  private formTitleEl!: HTMLDivElement;
  private formNameLabel!: HTMLDivElement;
  private formNameInput!: HTMLInputElement;
  private formEmailLabel!: HTMLDivElement;
  private formEmailInput!: HTMLInputElement;
  private formKindLabel!: HTMLDivElement;
  private formKindSelect!: HTMLSelectElement;
  private formSummaryLabel!: HTMLDivElement;
  private formSummaryInput!: HTMLTextAreaElement;
  private formCancelBtn!: HTMLButtonElement;
  private formSendBtn!: HTMLButtonElement;
  private formErrorEl!: HTMLDivElement;
  private visible = false;
  private busy = false;
  private submitted = false;
  private formVisible = false;
  private history: ChatTurn[] = [];
  private lang: Lang;
  private static readonly ENDPOINT = 'https://noc-folio-agent.lynnij.workers.dev/';
  private static readonly LANG_KEY = 'noc-chat-lang';

  constructor(_parentOverlay: HTMLElement) {
    const stored = (typeof localStorage !== 'undefined' ? localStorage.getItem(AIChatModal.LANG_KEY) : null) as Lang | null;
    this.lang = stored === 'ko' || stored === 'en' ? stored : (navigator.language?.toLowerCase().startsWith('ko') ? 'ko' : 'en');

    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 12px;
      pointer-events: auto;
    `;
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.panel = document.createElement('div');
    this.panel.style.cssText = `
      width: 100%;
      max-width: 420px;
      max-height: min(80vh, 640px);
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

    const header = document.createElement('div');
    header.style.cssText = `
      padding: 12px 16px;
      background: #161b22;
      border-bottom: 1px solid #283040;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    `;

    const titleArea = document.createElement('span');
    titleArea.style.cssText = 'display: flex; align-items: center; gap: 8px;';
    titleArea.innerHTML = `
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
    `;

    const headerActions = document.createElement('span');
    headerActions.style.cssText = 'display: flex; align-items: center; gap: 8px;';

    this.newChatBtn = document.createElement('button');
    this.newChatBtn.style.cssText = `
      background: transparent;
      border: 1px solid #283040;
      border-radius: 4px;
      color: #959da5;
      padding: 3px 8px;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      cursor: pointer;
      display: none;
    `;
    this.newChatBtn.addEventListener('mouseenter', () => { this.newChatBtn.style.color = '#e0e8f0'; this.newChatBtn.style.borderColor = '#61c777'; });
    this.newChatBtn.addEventListener('mouseleave', () => { this.newChatBtn.style.color = '#959da5'; this.newChatBtn.style.borderColor = '#283040'; });
    this.newChatBtn.addEventListener('click', () => this.resetChat());

    this.langBtn = document.createElement('button');
    this.langBtn.style.cssText = `
      background: transparent;
      border: 1px solid #283040;
      border-radius: 4px;
      color: #959da5;
      padding: 3px 8px;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      cursor: pointer;
    `;
    this.langBtn.addEventListener('mouseenter', () => { this.langBtn.style.color = '#e0e8f0'; this.langBtn.style.borderColor = '#61c777'; });
    this.langBtn.addEventListener('mouseleave', () => { this.langBtn.style.color = '#959da5'; this.langBtn.style.borderColor = '#283040'; });
    this.langBtn.addEventListener('click', () => this.toggleLang());

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

    headerActions.appendChild(this.newChatBtn);
    headerActions.appendChild(this.langBtn);
    headerActions.appendChild(closeBtn);
    header.appendChild(titleArea);
    header.appendChild(headerActions);

    this.messagesArea = document.createElement('div');
    this.messagesArea.style.cssText = `
      padding: 16px;
      flex: 1;
      overflow-y: auto;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #0a0e14;
    `;

    this.inputArea = document.createElement('div');
    this.inputArea.style.cssText = `
      padding: 12px 16px;
      border-top: 1px solid #283040;
      display: flex;
      gap: 8px;
      background: #0c1018;
    `;

    this.inputField = document.createElement('input');
    this.inputField.type = 'text';
    this.inputField.maxLength = 2000;
    this.inputField.style.cssText = `
      flex: 1;
      min-width: 0;
      background: #161b22;
      border: 1px solid #283040;
      border-radius: 4px;
      color: #d6dbe0;
      padding: 8px 12px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      outline: none;
    `;
    this.inputField.addEventListener('focus', () => { this.inputField.style.borderColor = '#61c777'; });
    this.inputField.addEventListener('blur', () => { this.inputField.style.borderColor = '#283040'; });
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });

    this.sendBtn = document.createElement('button');
    this.sendBtn.textContent = '▶';
    this.sendBtn.style.cssText = `
      background: #1a2a1a;
      border: 1px solid #61c777;
      border-radius: 4px;
      color: #61c777;
      padding: 8px 14px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
      flex-shrink: 0;
    `;
    this.sendBtn.addEventListener('mouseenter', () => {
      if (this.busy || this.submitted) return;
      this.sendBtn.style.background = '#243a24';
      this.sendBtn.style.borderColor = '#71d787';
    });
    this.sendBtn.addEventListener('mouseleave', () => {
      this.sendBtn.style.background = '#1a2a1a';
      this.sendBtn.style.borderColor = '#61c777';
    });
    this.sendBtn.addEventListener('click', () => this.handleSend());

    this.inputArea.appendChild(this.inputField);
    this.inputArea.appendChild(this.sendBtn);

    this.buildFormArea();

    this.privacyNote = document.createElement('div');
    this.privacyNote.style.cssText = `
      padding: 6px 16px 10px;
      background: #0c1018;
      color: #5a6470;
      font-size: 10px;
      text-align: center;
      border-top: 1px solid #161b22;
    `;

    this.panel.appendChild(header);
    this.panel.appendChild(this.messagesArea);
    this.panel.appendChild(this.inputArea);
    this.panel.appendChild(this.formArea);
    this.panel.appendChild(this.privacyNote);
    this.overlay.appendChild(this.panel);
    document.body.appendChild(this.overlay);

    this.applyLangLabels();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.visible) this.close();
    });
  }

  open(): void {
    this.visible = true;
    this.overlay.style.display = 'flex';
    this.resetChat();
  }

  close(): void {
    this.visible = false;
    this.overlay.style.display = 'none';
  }

  isVisible(): boolean {
    return this.visible;
  }

  private buildFormArea(): void {
    this.formArea = document.createElement('div');
    this.formArea.style.cssText = `
      padding: 14px 16px 12px;
      border-top: 1px solid #283040;
      background: #0c1018;
      display: none;
      flex-direction: column;
      gap: 8px;
      animation: nocChatSlideIn 0.25s ease-out;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes nocChatSlideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);

    this.formTitleEl = document.createElement('div');
    this.formTitleEl.style.cssText = 'color:#61c777;font-weight:bold;font-size:12px;margin-bottom:4px;';

    const labelStyle = 'color:#959da5;font-size:11px;margin-top:4px;';
    const fieldStyle = `
      background: #161b22;
      border: 1px solid #283040;
      border-radius: 4px;
      color: #d6dbe0;
      padding: 7px 10px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    `;

    this.formNameLabel = document.createElement('div');
    this.formNameLabel.style.cssText = labelStyle;
    this.formNameInput = document.createElement('input');
    this.formNameInput.type = 'text';
    this.formNameInput.maxLength = 200;
    this.formNameInput.style.cssText = fieldStyle;

    this.formEmailLabel = document.createElement('div');
    this.formEmailLabel.style.cssText = labelStyle;
    this.formEmailInput = document.createElement('input');
    this.formEmailInput.type = 'email';
    this.formEmailInput.maxLength = 200;
    this.formEmailInput.style.cssText = fieldStyle;

    this.formKindLabel = document.createElement('div');
    this.formKindLabel.style.cssText = labelStyle;
    this.formKindSelect = document.createElement('select');
    this.formKindSelect.style.cssText = fieldStyle;
    KIND_ORDER.forEach((k) => {
      const opt = document.createElement('option');
      opt.value = k;
      this.formKindSelect.appendChild(opt);
    });

    this.formSummaryLabel = document.createElement('div');
    this.formSummaryLabel.style.cssText = labelStyle;
    this.formSummaryInput = document.createElement('textarea');
    this.formSummaryInput.maxLength = 1000;
    this.formSummaryInput.rows = 3;
    this.formSummaryInput.style.cssText = fieldStyle + 'resize:vertical;min-height:60px;';

    this.formErrorEl = document.createElement('div');
    this.formErrorEl.style.cssText = 'color:#e27272;font-size:11px;margin-top:2px;min-height:14px;';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;margin-top:6px;';

    this.formCancelBtn = document.createElement('button');
    this.formCancelBtn.style.cssText = `
      background: transparent;
      border: 1px solid #283040;
      border-radius: 4px;
      color: #959da5;
      padding: 7px 14px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      cursor: pointer;
    `;
    this.formCancelBtn.addEventListener('click', () => this.hideForm());

    this.formSendBtn = document.createElement('button');
    this.formSendBtn.style.cssText = `
      background: #1a2a1a;
      border: 1px solid #61c777;
      border-radius: 4px;
      color: #61c777;
      padding: 7px 18px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      cursor: pointer;
      font-weight: bold;
    `;
    this.formSendBtn.addEventListener('click', () => this.handleFormSubmit());

    btnRow.appendChild(this.formCancelBtn);
    btnRow.appendChild(this.formSendBtn);

    this.formArea.appendChild(this.formTitleEl);
    this.formArea.appendChild(this.formNameLabel);
    this.formArea.appendChild(this.formNameInput);
    this.formArea.appendChild(this.formEmailLabel);
    this.formArea.appendChild(this.formEmailInput);
    this.formArea.appendChild(this.formKindLabel);
    this.formArea.appendChild(this.formKindSelect);
    this.formArea.appendChild(this.formSummaryLabel);
    this.formArea.appendChild(this.formSummaryInput);
    this.formArea.appendChild(this.formErrorEl);
    this.formArea.appendChild(btnRow);
  }

  private showForm(kind: Kind, summary: string): void {
    this.formVisible = true;
    this.formNameInput.value = '';
    this.formEmailInput.value = '';
    this.formSummaryInput.value = summary;
    this.formKindSelect.value = KIND_ORDER.includes(kind) ? kind : 'personal';
    this.formErrorEl.textContent = '';
    this.applyLangLabels();
    this.inputArea.style.display = 'none';
    this.formArea.style.display = 'flex';
    setTimeout(() => this.formEmailInput.focus(), 250);
  }

  private hideForm(): void {
    this.formVisible = false;
    this.formArea.style.display = 'none';
    this.inputArea.style.display = 'flex';
    if (!this.submitted) this.inputField.focus();
  }

  private async handleFormSubmit(): Promise<void> {
    if (this.busy) return;
    const email = this.formEmailInput.value.trim();
    const summary = this.formSummaryInput.value.trim();
    const name = this.formNameInput.value.trim();
    const kind = this.formKindSelect.value as Kind;

    const emailMatch = email.match(/^([^\s@]+)@([^\s@]+)\.([^\s@]{2,})$/);
    const emailOk =
      !!emailMatch &&
      emailMatch[1].length >= 2 && !/^(.)\1*$/.test(emailMatch[1]) &&
      emailMatch[2].length >= 2 && !/^(.)\1*$/.test(emailMatch[2]);
    if (!emailOk) {
      this.formErrorEl.textContent = this.t('formInvalidEmail');
      this.formEmailInput.focus();
      return;
    }
    const summaryCompact = summary.replace(/\s+/g, '');
    const distinctChars = new Set(summaryCompact).size;
    if (
      summary.length < 15 ||
      distinctChars < 5 ||
      !/[a-zA-Z가-힣]{2,}/.test(summary) ||
      /(.)\1{3,}/.test(summary)
    ) {
      this.formErrorEl.textContent = this.t('formInvalidSummary');
      this.formSummaryInput.focus();
      return;
    }
    if (name && (name.length < 2 || /^(.)\1*$/.test(name) || /(.)\1{3,}/.test(name))) {
      this.formErrorEl.textContent = this.t('formInvalidName');
      this.formNameInput.focus();
      return;
    }
    if (CORP_REQUIRED_KINDS.has(kind) && isFreeEmail(email)) {
      this.formErrorEl.textContent = this.t('formRequireCorpEmail');
      this.formEmailInput.focus();
      return;
    }

    this.formErrorEl.textContent = '';
    this.setFormBusy(true);
    this.hideForm();
    this.addMessage('ai', this.t('forwardingToSecretary'));
    const thinking = this.addTypingIndicator();

    try {
      const res = await fetch(AIChatModal.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          lang: this.lang,
          contact: { email, kind, name: name || undefined, summary },
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        submitted?: boolean;
        rejected?: boolean;
        error?: string;
      };
      thinking.remove();

      if (data.submitted) {
        this.addMessage('ai', data.reply ?? '');
        this.history.push({ role: 'model', text: data.reply ?? '' });
        this.submitted = true;
        this.newChatBtn.style.display = 'inline-block';
        this.setBusy(false);
      } else if (data.rejected) {
        this.addMessage('ai', data.reply ?? this.t('connectionError'));
        this.history.push({ role: 'model', text: data.reply ?? '' });
        this.busy = false;
        this.showForm(kind, summary);
        this.formNameInput.value = name;
        this.formEmailInput.value = email;
        this.setFormBusy(false);
      } else {
        this.addMessage('ai', data.reply ?? data.error ?? this.t('connectionError'));
        this.busy = false;
        this.showForm(kind, summary);
        this.formNameInput.value = name;
        this.formEmailInput.value = email;
        this.setFormBusy(false);
      }
    } catch {
      thinking.remove();
      this.addMessage('ai', this.t('connectionError'));
      this.busy = false;
      this.showForm(kind, summary);
      this.formNameInput.value = name;
      this.formEmailInput.value = email;
      this.setFormBusy(false);
    }
  }

  private setFormBusy(busy: boolean): void {
    this.busy = busy;
    this.formSendBtn.disabled = busy;
    this.formCancelBtn.disabled = busy;
    this.formSendBtn.style.opacity = busy ? '0.5' : '1';
    this.formSendBtn.style.cursor = busy ? 'not-allowed' : 'pointer';
    this.formSendBtn.textContent = busy ? this.t('sending') : this.t('formSend');
  }

  private t(key: keyof typeof STRINGS['ko']): string {
    return STRINGS[this.lang][key];
  }

  private toggleLang(): void {
    this.lang = this.lang === 'ko' ? 'en' : 'ko';
    try { localStorage.setItem(AIChatModal.LANG_KEY, this.lang); } catch {}
    this.applyLangLabels();
    if (this.history.length === 0) {
      this.messagesArea.innerHTML = '';
      this.addMessage('ai', this.t('greeting'));
    }
  }

  private applyLangLabels(): void {
    this.inputField.placeholder = this.submitted ? this.t('submittedPlaceholder') : this.t('placeholder');
    this.langBtn.textContent = this.t('langToggleLabel');
    this.newChatBtn.textContent = this.t('newChat');
    this.privacyNote.textContent = this.t('privacy');
    this.formTitleEl.textContent = this.t('formTitle');
    this.formNameLabel.textContent = this.t('formName');
    this.formNameInput.placeholder = this.t('formNamePlaceholder');
    this.formEmailLabel.textContent = this.t('formEmail');
    this.formEmailInput.placeholder = this.t('formEmailPlaceholder');
    this.formKindLabel.textContent = this.t('formKind');
    this.formSummaryLabel.textContent = this.t('formSummary');
    this.formSummaryInput.placeholder = this.t('formSummaryPlaceholder');
    this.formCancelBtn.textContent = this.t('formCancel');
    this.formSendBtn.textContent = this.t('formSend');
    const kindLabels = KIND_LABELS[this.lang];
    Array.from(this.formKindSelect.options).forEach((opt) => {
      opt.textContent = kindLabels[opt.value as Kind];
    });
  }

  private resetChat(): void {
    this.messagesArea.innerHTML = '';
    this.inputField.value = '';
    this.history = [];
    this.submitted = false;
    this.formVisible = false;
    this.formArea.style.display = 'none';
    this.inputArea.style.display = 'flex';
    this.newChatBtn.style.display = 'none';
    this.setBusy(false);
    this.applyLangLabels();
    this.addMessage('ai', this.t('greeting'));
    setTimeout(() => this.inputField.focus(), 100);
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
    if (isAI) {
      msg.innerHTML = renderMarkdown(text);
    } else {
      msg.textContent = text;
    }
    this.messagesArea.appendChild(msg);
    this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
  }

  private async handleSend(): Promise<void> {
    if (this.busy || this.submitted) return;
    const text = this.inputField.value.trim();
    if (!text) return;
    if (text.length > 2000) {
      this.addMessage('ai', this.t('inputTooLong'));
      return;
    }

    this.addMessage('user', text);
    this.history.push({ role: 'user', text });
    this.inputField.value = '';
    this.setBusy(true);

    const thinking = this.addTypingIndicator();

    try {
      const res = await fetch(AIChatModal.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: this.history, lang: this.lang }),
      });
      const data = (await res.json()) as {
        reply?: string;
        submitted?: boolean;
        form?: { kind: Kind; summary: string };
        error?: string;
      };
      thinking.remove();
      const reply = data.reply ?? data.error ?? this.t('connectionError');
      this.addMessage('ai', reply);
      this.history.push({ role: 'model', text: reply });
      if (data.form) {
        this.showForm('personal', data.form.summary);
      }
      if (data.submitted) {
        this.submitted = true;
        this.newChatBtn.style.display = 'inline-block';
      }
    } catch {
      thinking.remove();
      this.addMessage('ai', this.t('connectionError'));
    } finally {
      this.setBusy(false);
      if (!this.submitted) this.inputField.focus();
    }
  }

  private setBusy(busy: boolean): void {
    this.busy = busy;
    const locked = busy || this.submitted;
    this.inputField.disabled = locked;
    this.sendBtn.disabled = locked;
    this.sendBtn.style.opacity = locked ? '0.4' : '1';
    this.sendBtn.style.cursor = locked ? 'not-allowed' : 'pointer';
    this.inputField.placeholder = this.submitted ? this.t('submittedPlaceholder') : this.t('placeholder');
  }

  private addTypingIndicator(): HTMLDivElement {
    const msg = document.createElement('div');
    msg.style.cssText = `
      padding: 8px 12px;
      border-radius: 6px;
      align-self: flex-start;
      background: #121a24;
      color: #61c777;
      border: 1px solid #1c2e1c;
    `;
    msg.textContent = '...';
    this.messagesArea.appendChild(msg);
    this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    return msg;
  }
}
