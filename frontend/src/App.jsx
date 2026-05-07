import { useState, useEffect, useRef, useMemo } from 'react';

const ignoreError = (error) => { void error; };
const getPlatformCredentials = (config, platform = config.platform) => (config.apiKeys && config.apiKeys[platform]) || {};

// =========================================================================
// 1. 图标库与配置常量 
// =========================================================================
const Icons = {
  Home: ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  History: ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>,
  Coffee: ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>,
  CheckCircle2: ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>,
  Copy: ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Trash2: ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  RefreshCw: ({size=20, className="", onClick}) => <svg width={size} height={size} onClick={onClick} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  Zap: ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Bot: ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>,
  Pin: ({size=16, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.68V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.68a2 2 0 0 1-1.11 1.87l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>,
  Minus: ({size=16, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" x2="19" y1="12" y2="12"/></svg>,
  Square: ({size=14, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>,
  X: ({size=16, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>,
  ChevronDown: ({size=16, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  FileText: ({size=16, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>,
  Edit3: ({size=16, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  ShieldCheck: ({size=16, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  Sun: ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon: ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  ExternalLink: ({size=16, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>,
  Columns3: ({size=16, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>,
  Cpu: ({size=20, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  Download: ({size=16, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Box: ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  PlayCircle: ({size=16, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>,
  Pause: ({size=16, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Sparkles: ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
};

const SUPPORTED_LANGUAGES = [
  "英语 (English)", "中文(简体) - Simplified Chinese", "中文(繁体) - Traditional Chinese",
  "日语 (Japanese)", "韩语 (Korean)", "俄语 (Russian)", "西班牙语 (Spanish)", "法语 (French)",
  "德语 (German)", "葡萄牙语 (Portuguese)", "意大利语 (Italian)", "阿拉伯语 (Arabic)"
];

const BAIDU_LANG_MAP = {
  "英语 (English)": "en", "中文(简体) - Simplified Chinese": "zh", "中文(繁体) - Traditional Chinese": "cht",
  "日语 (Japanese)": "jp", "韩语 (Korean)": "kor", "俄语 (Russian)": "ru",
  "西班牙语 (Spanish)": "spa", "法语 (French)": "fra", "德语 (German)": "de",
  "葡萄牙语 (Portuguese)": "pt", "意大利语 (Italian)": "it", "阿拉伯语 (Arabic)": "ara"
};

const API_DEFAULTS = {
  "本地离线模型 (Local)": { endpoint: "local://internal", modelName: "opus-mt", url: "", isNMT: true, limit: 9999999 },
  "百度翻译 API": { endpoint: "https://fanyi-api.baidu.com/api/trans/vip/translate", modelName: "N/A", url: "https://api.fanyi.baidu.com/manage/developer", isNMT: true, limit: 1000000 },
  "DeepL (Free API)": { endpoint: "https://api-free.deepl.com/v2/translate", modelName: "N/A", url: "https://www.deepl.com/pro-api", isNMT: true, limit: 500000 },
  "Google 翻译 API": { endpoint: "https://translation.googleapis.com/language/translate/v2", modelName: "N/A", url: "https://console.cloud.google.com/apis/api/translate.googleapis.com/credentials", isNMT: true, limit: 500000 },
  "腾讯翻译 (TMT)": { endpoint: "https://tmt.tencentcloudapi.com/", modelName: "N/A", url: "https://console.cloud.tencent.com/tmt", isNMT: true, limit: 5000000 },
  "DeepSeek": { endpoint: "https://api.deepseek.com/chat/completions", modelName: "deepseek-chat", url: "https://platform.deepseek.com/api_keys", isNMT: false, limit: 0 },
  "智谱 GLM": { endpoint: "https://open.bigmodel.cn/api/paas/v4/chat/completions", modelName: "glm-4", url: "https://open.bigmodel.cn/usercenter/apikeys", isNMT: false, limit: 0 },
  "硅基流动 (Qwen)": { endpoint: "https://api.siliconflow.cn/v1/chat/completions", modelName: "qwen2.5-7b", url: "https://cloud.siliconflow.cn/account/ak", isNMT: false, limit: 0 },
  "自定义配置 (Custom)": { endpoint: "", modelName: "", url: "", isNMT: false, limit: 0 }
};
const LOCAL_PLATFORM = "本地离线模型 (Local)";
const DEFAULT_ONLINE_PLATFORM = "DeepSeek";
const SUPPORTED_MODELS = Object.keys(API_DEFAULTS);

const LOCAL_MODELS_INFO = [
    { id: 'opus-mt', name: 'Opus-MT (Helsinki)', size: '约 120 MB', isNMT: true, desc: '极速推荐：轻量级神经机器翻译模型，专注于中英互译，CPU 毫秒级响应，适合日常极速翻译。' },
    { id: 'nllb-200', name: 'NLLB-200 (Meta)', size: '约 1.2 GB', isNMT: true, desc: '质量优先：Meta 开源的多语言大模型，支持 200+ 语言互译，翻译质量逼近商业 API。' },
    { id: 'qwen-1.5b', name: 'Qwen2.5-1.5B (千问)', size: '约 850 MB', isNMT: false, desc: '全能旗舰：阿里云开源的端侧流式大语言模型，支持复杂长文本翻译与润色，需较好硬件支持。' }
];

const getLangShortName = (fullName) => fullName ? fullName.split(' ')[0] : '';

// 【修复 2】补充缺失的语言自动检测函数
const detectLanguage = (text) => {
  if (!text) return "英语 (English)";
  if (/[\u0800-\u4e00]/.test(text) && /[\u3040-\u30ff]/.test(text)) return "日语 (Japanese)";
  if (/[\uac00-\ud7af]/.test(text)) return "韩语 (Korean)";
  if (/[\u0400-\u04FF]/.test(text)) return "俄语 (Russian)";
  if (/[\u4e00-\u9fa5]/.test(text)) return "中文(简体) - Simplified Chinese";
  if (/[a-zA-Z]/.test(text)) return "英语 (English)";
  return "英语 (English)"; 
};

const loadScript = (url) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = url; script.onload = resolve; script.onerror = reject;
        document.head.appendChild(script);
    });
};

const fetchBaiduJSONP = (url, signal) => {
    return new Promise((resolve, reject) => {
        const callbackName = 'baidu_cb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        const script = document.createElement('script');
        const cleanup = () => { delete window[callbackName]; if (document.body.contains(script)) document.body.removeChild(script); };
        if (signal) signal.addEventListener('abort', () => { cleanup(); reject(new DOMException('Aborted by user', 'AbortError')); });
        window[callbackName] = (data) => { cleanup(); resolve(data); };
        script.src = url + '&callback=' + callbackName;
        script.onerror = () => { cleanup(); reject(new Error('请求被拦截 (可能是跨域限制或无网络连接)')); };
        document.body.appendChild(script);
    });
};

const DEFAULT_SOURCE_PLACEHOLDER = '在此粘贴文本...\n✨ 系统会自动识别日韩俄中等语言！\n\n提示：\n直接粘贴，即刻触发极速翻译。\n（你也可以手动锁定顶部的源语言设置）';
const DEFAULT_TARGET_PLACEHOLDER = '系统翻译结果将在此显示...\n单击文本可选中并与原文联动，再次单击可进入编辑模式修改。';
const DEFAULT_VALID_PLACEHOLDER = '此处将显示回译结果...\n用于结合高亮对比查看目标语言是否存在歧义。';

// =========================================================================
// 2. 独立小组件
// =========================================================================

function FirstRunModal({ isOpen, onClose, onDeploy }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-md no-drag transition-colors animate-backdrop">
      <div className="bg-white dark:bg-[#121212] border border-[#0284c7]/30 rounded-2xl w-[480px] shadow-2xl flex flex-col p-8 relative transition-colors animate-modal-pop">
        <div className="w-16 h-16 bg-[#0284c7]/10 dark:bg-[#0284c7]/20 border border-[#0284c7]/30 rounded-full flex items-center justify-center mx-auto mb-5 text-[#0284c7]">
          <Icons.Sparkles size={32} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-3">欢迎使用 LinguaSync Pro</h3>
        <p className="text-[15px] text-slate-600 dark:text-[#a1a1aa] text-center mb-8 leading-relaxed">
          检测到您是首次启动。是否需要立即在本地部署翻译模型？<br/>
          部署后即可享受<strong className="text-slate-800 dark:text-white">完全离线、零延迟、绝对隐私</strong>的翻译体验。
        </p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#2a2d3d] dark:hover:bg-[#3f3f46] text-slate-700 dark:text-white rounded-xl font-medium transition-colors">
            暂不部署，使用 API
          </button>
          <button onClick={onDeploy} className="flex-1 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl font-medium shadow-lg shadow-[#0284c7]/30 transition-colors flex items-center justify-center gap-2">
            <Icons.Download size={18} /> 立即部署 (推荐)
          </button>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!text) return;
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(() => showSuccess()).catch(() => fallbackCopy(text)); } 
    else fallbackCopy(text);
  };
  const fallbackCopy = (textToCopy) => {
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy; textArea.style.position = "fixed"; textArea.style.left = "-999999px"; textArea.style.top = "-999999px";
    document.body.appendChild(textArea); textArea.focus(); textArea.select();
    try { document.execCommand('copy'); showSuccess(); } catch (error) { ignoreError(error); }
    document.body.removeChild(textArea);
  };
  const showSuccess = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="relative flex items-center justify-center">
        <button onClick={handleCopy} title="复制内容" className={`p-1.5 rounded transition-all duration-200 ${copied ? 'text-[#10b981] bg-[#10b981]/10' : 'text-slate-500 hover:text-slate-800 dark:text-[#64748b] dark:hover:text-[#e2e8f0] hover:bg-slate-200 dark:hover:bg-[#2a2d3d]'}`}>
            {copied ? <Icons.CheckCircle2 size={16} /> : <Icons.Copy size={16} />}
        </button>
        {copied && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-black text-white text-xs px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap z-[100] animate-modal-pop pointer-events-none">复制成功</div>}
    </div>
  );
}

function SmartTextArea({ id, value, onChange, placeholder, fontSize, readOnly, activeBox, setActiveBox, selectionRange, onSelectionChange, className = "", isStreaming = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredLine, setHoveredLine] = useState(null);
  const textareaRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => { if (isEditing && textareaRef.current) textareaRef.current.focus(); }, [isEditing]);
  const handleScroll = (e) => { if (bgRef.current) { bgRef.current.scrollTop = e.target.scrollTop; bgRef.current.scrollLeft = e.target.scrollLeft; } };

  const [start, end] = selectionRange || [0, 0];
  const isHighlighting = end > start;
  const isMeActive = activeBox === id;

  const lines = useMemo(() => {
    if (!value) return [];
    const parts = value.split('\n'); let offset = 0;
    return parts.map((text, index) => {
        const lineStart = offset; const lineEnd = offset + text.length; offset += text.length + 1; 
        return { index, text, start: lineStart, end: lineEnd };
    });
  }, [value]);

  const handleLineClick = (lineStart, lineEnd) => {
    if (isMeActive && start === lineStart && end === lineEnd) { if(!readOnly) setIsEditing(true); } 
    else { setActiveBox(id); onSelectionChange(id, lineStart, lineEnd); }
  };

  const handleTextareaSelect = (e) => { setActiveBox(id); onSelectionChange(id, e.target.selectionStart, e.target.selectionEnd); };
  const commonCss = "p-5 font-mono leading-relaxed whitespace-pre-wrap break-words text-left absolute inset-0 w-full h-full overflow-y-auto";

  const handleMouseMoveInTextarea = (e) => {
     if (!value) return;
     const lineHeight = fontSize * 1.625; const rect = e.target.getBoundingClientRect();
     const y = e.clientY - rect.top + e.target.scrollTop - 20; const index = Math.floor(y / lineHeight);
     if (index >= 0 && index < lines.length) { if (hoveredLine !== index) setHoveredLine(index); } 
     else { if (hoveredLine !== null) setHoveredLine(null); }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden no-drag ${className}`} style={{ WebkitAppRegion: 'no-drag' }}>
        {value && (
            <div ref={bgRef} className={`${commonCss} z-0 pointer-events-none ${isEditing ? 'text-transparent' : 'text-slate-800 dark:text-[#a1a1aa]'} ${isStreaming ? 'typing-cursor' : ''} [&::-webkit-scrollbar]:hidden`} style={{ fontSize: `${fontSize}px`, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                {lines.map(line => {
                    const isLineExactlySelected = start === line.start && end === line.end;
                    const isPartiallySelected = !isLineExactlySelected && isHighlighting && ((start >= line.start && start <= line.end) || (end >= line.start && end <= line.end) || (start <= line.start && end >= line.end));
                    let content = line.text;
                    const markTextClass = isEditing ? 'text-transparent' : 'text-slate-900 dark:text-white';
                    
                    if (isHighlighting && start <= line.end && end >= line.start && !isLineExactlySelected) {
                        const overlapStart = Math.max(0, start - line.start);
                        const overlapEnd = Math.min(line.text.length, end - line.start);
                        content = ( <>{line.text.substring(0, overlapStart)}<mark className={`bg-[#0284c7]/40 dark:bg-[#0284c7]/50 rounded-[2px] transition-colors ${markTextClass}`}>{line.text.substring(overlapStart, overlapEnd)}</mark>{line.text.substring(overlapEnd)}</> );
                    } else if (isLineExactlySelected) {
                        content = <mark className={`bg-[#0284c7]/40 dark:bg-[#0284c7]/50 rounded-[2px] transition-colors ${markTextClass}`}>{line.text}</mark>;
                    }
                    const isHovered = hoveredLine === line.index && !isLineExactlySelected && !isPartiallySelected;
                    return ( <div key={line.index} className={`transition-colors duration-150 rounded-[2px] ${isHovered ? 'bg-slate-200/60 dark:bg-[#2a2d3d]/60' : ''}`}>{content}{line.text === '' && <span className="inline-block w-px h-[1em]"></span>}</div> );
                })}
            </div>
        )}

        {isEditing || !value ? (
            <textarea
                ref={textareaRef}
                className={`${commonCss} bg-transparent outline-none resize-none z-10 ${!value ? 'text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-[#a1a1aa] selection:bg-[#0284c7]/40 dark:selection:bg-[#0284c7]/50 selection:text-slate-900 dark:selection:text-white'} placeholder-slate-400 dark:placeholder-slate-500 focus:placeholder-slate-200 dark:focus:placeholder-[#2a2d3d] transition-colors duration-300`}
                style={{ fontSize: `${fontSize}px`, WebkitAppRegion: 'no-drag', userSelect: 'text' }} value={value} onChange={(e) => onChange && onChange(e)} onSelect={handleTextareaSelect} onScroll={handleScroll} onMouseMove={handleMouseMoveInTextarea} onMouseLeave={() => setHoveredLine(null)} onBlur={() => { if(value) setIsEditing(false); }} placeholder={placeholder} readOnly={readOnly}
            />
        ) : (
            <div className={`${commonCss} z-10 text-transparent no-drag`} style={{ fontSize: `${fontSize}px`, WebkitAppRegion: 'no-drag', userSelect: 'text' }} onClick={() => { if(!readOnly) setIsEditing(true); }} onScroll={handleScroll}>
                {lines.map(line => (
                    <div key={`fg-${line.index}`} className="cursor-pointer" onMouseEnter={() => { if (hoveredLine !== line.index) setHoveredLine(line.index); }} onMouseLeave={() => setHoveredLine(null)} onClick={(e) => { e.stopPropagation(); handleLineClick(line.start, line.end); }} title={readOnly ? "单击选中整块文本联动" : "单击选中，再次单击进入编辑模式"}>{line.text}{line.text === '' && <span className="inline-block w-px h-[1em]"></span>}</div>
                ))}
            </div>
        )}
    </div>
  );
}

function SponsorModal({ isOpen, onClose, onSponsor }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 dark:bg-black/60 backdrop-blur-sm no-drag transition-colors animate-backdrop">
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2a2d3d] rounded-xl w-[440px] shadow-2xl flex flex-col p-8 relative transition-colors animate-modal-pop"><button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#2a2d3d] transition-colors"><Icons.X size={18} className="text-slate-400 dark:text-[#a1a1aa] hover:text-slate-800 dark:hover:text-white"/></button><div className="w-14 h-14 bg-slate-50 dark:bg-[#161824] border border-slate-200 dark:border-[#2a2d3d] rounded-full flex items-center justify-center mx-auto mb-5 text-[#0284c7]"><Icons.Coffee size={28} /></div><h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-3">如果您觉得好用，可以请作者喝杯咖啡 ☕</h3><p className="text-sm text-slate-500 dark:text-[#a1a1aa] text-center mb-8">您的支持是我持续迭代和优化的最大动力!</p><button onClick={onSponsor} className="w-full py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"><Icons.Zap size={18} /> 前往爱发电赞助 (Afdian)</button></div>
    </div>
  );
}

function LanguageSelect({ value, onChange, options, isAuto }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-flex items-center flex-1 min-w-0">
      <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full cursor-pointer text-slate-800 dark:text-[#e2e8f0] text-sm font-semibold truncate hover:text-[#0284c7] transition-colors">
         <span className="truncate flex items-center gap-1.5">{value}{isAuto && <span className="text-[10px] bg-[#0284c7]/10 text-[#0284c7] px-1 rounded border border-[#0284c7]/20 font-normal tracking-wide shrink-0">AUTO</span>}</span>
      </div>
      {isOpen && ( <><div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)}></div><div className="absolute top-8 left-[-10px] w-64 rounded-xl shadow-2xl bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-[#2a2d3d] py-1 z-[70] max-h-[400px] overflow-y-auto animate-dropdown">{options.map(opt => <div key={opt} onClick={() => {onChange(opt); setIsOpen(false);}} className={`cursor-pointer px-4 py-2.5 text-sm text-slate-700 dark:text-[#e2e8f0] hover:bg-slate-50 dark:hover:bg-[#2a2d3d] ${value === opt ? 'bg-slate-100 dark:bg-[#1e212b]' : ''}`}>{opt}</div>)}</div></> )}
    </div>
  );
}

function FontSizeSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative z-50">
      <div onClick={() => setIsOpen(!isOpen)} className="flex items-center border border-slate-200 dark:border-[#2a2d3d] text-slate-600 dark:text-[#a1a1aa] rounded px-2 py-0.5 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-[#2a2d3d] transition-colors">{value} <Icons.ChevronDown size={12} className="ml-1"/></div>
      {isOpen && ( <><div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)}></div><div className="absolute top-full right-0 mt-1 w-16 bg-white dark:bg-[#161824] border border-slate-200 dark:border-[#2a2d3d] rounded shadow-xl py-1 z-[70] animate-dropdown">{options.map(opt => <div key={opt} onClick={() => {onChange(opt); setIsOpen(false);}} className={`cursor-pointer px-3 py-1.5 text-xs text-slate-700 dark:text-[#e2e8f0] hover:bg-slate-100 dark:hover:bg-[#2a2d3d] text-center ${value === opt ? 'text-[#0284c7]' : ''}`}>{opt}</div>)}</div></> )}
    </div>
  );
}

function ConfigModal({ isOpen, ...props }) {
  if (!isOpen) return null;

  const { config } = props;
  const activeCreds = getPlatformCredentials(config);
  const modalKey = [
    config.platform,
    config.endpoint,
    config.modelName,
    activeCreds.apiKey || '',
    activeCreds.appId || '',
  ].join('::');

  return <ConfigModalContent key={modalKey} {...props} />;
}

function ConfigModalContent({ onClose, config, onSave, platforms, onOpenUrl, onSwitchToModelHub }) {
  const initialCreds = getPlatformCredentials(config);
  const [platform, setPlatform] = useState(config.platform); 
  const [endpoint, setEndpoint] = useState(config.endpoint); 
  const [apiKey, setApiKey] = useState(initialCreds.apiKey || ''); 
  const [appId, setAppId] = useState(initialCreds.appId || ''); 
  const [modelName, setModelName] = useState(config.modelName); 
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);

  const currentUrl = API_DEFAULTS[platform]?.url;
  const isBaidu = platform === '百度翻译 API';
  const isLocalEngine = platform === '本地离线模型 (Local)';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 dark:bg-black/60 backdrop-blur-sm no-drag transition-colors animate-backdrop">
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2a2d3d] rounded-xl w-[520px] shadow-2xl flex flex-col overflow-hidden transition-colors animate-modal-pop">
        
        <div className="flex justify-between items-center p-6 pb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">翻译接口配置</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#2a2d3d] transition-colors"><Icons.X size={20}/></button>
        </div>

        <div className="px-6 py-2 space-y-6">
          <div>
            <label className="text-sm text-slate-600 dark:text-[#a1a1aa] mb-2 block">1. 快速选择引擎平台</label>
            <div className="relative">
              <div onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)} className={`w-full bg-slate-50 dark:bg-[#0a0a0c] border ${isPlatformDropdownOpen ? 'border-[#0284c7]' : 'border-slate-200 dark:border-[#2a2d3d]'} text-slate-800 dark:text-white text-base rounded-lg p-3 flex justify-between items-center cursor-pointer transition-colors`}>
                  {platform} <Icons.ChevronDown size={18} className="text-slate-500 dark:text-[#64748b]" />
              </div>
              
              {isPlatformDropdownOpen && (
                  <>
                  <div className="fixed inset-0 z-[110]" onClick={() => setIsPlatformDropdownOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#2a2d3d] rounded-lg shadow-xl z-[120] py-1 max-h-[260px] overflow-y-auto animate-dropdown">
                      {platforms.map(p => (
                          <div key={p} onClick={() => { 
                              setPlatform(p); 
                              const d = API_DEFAULTS[p]; 
                              setEndpoint(d.endpoint); 
                              setModelName(d.modelName); 
                              const creds = getPlatformCredentials(config, p);
                              setApiKey(creds.apiKey || ''); 
                              setAppId(creds.appId || ''); 
                              setIsPlatformDropdownOpen(false); 
                          }} className={`px-4 py-2.5 text-sm text-slate-700 dark:text-[#e2e8f0] hover:bg-slate-50 dark:hover:bg-[#2a2d3d] cursor-pointer ${platform === p ? 'bg-slate-100 dark:bg-[#2a2d3d]' : ''}`}>
                              <span className="flex items-center gap-2">
                                {p === '本地离线模型 (Local)' && <Icons.Cpu size={14} className="text-[#0284c7]"/>}
                                {p}
                              </span>
                          </div>
                      ))}
                  </div>
                  </>
              )}
            </div>
            {currentUrl && !isLocalEngine && (
              <div className="mt-2 text-right">
                <button onClick={() => onOpenUrl(currentUrl)} className="text-xs text-[#0284c7] hover:text-[#0369a1] inline-flex items-center gap-1 transition-colors" title={`在浏览器中打开 ${platform} API 申请页`}>前往获取 {platform} API 密钥 <Icons.ExternalLink size={12} /></button>
              </div>
            )}
          </div>

          {isLocalEngine ? (
             <div className="p-5 bg-[#0284c7]/5 border border-[#0284c7]/20 rounded-xl space-y-3">
                 <div className="flex items-center gap-3 text-[#0284c7]">
                     <Icons.Cpu size={24} />
                     <span className="font-semibold text-lg">本地引擎免配置</span>
                 </div>
                 <p className="text-sm text-slate-600 dark:text-[#a1a1aa] leading-relaxed pt-1">
                     本地离线模型运行于您的本机硬件，<strong className="text-slate-800 dark:text-white">保护绝对隐私且不消耗任何在线费用</strong>。<br/>
                     无需填写 API 密钥或请求地址。
                 </p>
                 <div className="pt-3">
                    <button 
                        onClick={() => { onClose(); onSwitchToModelHub(); }}
                        className="w-full py-2.5 bg-white dark:bg-[#1e212b] border border-[#0284c7]/30 hover:border-[#0284c7] text-[#0284c7] rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
                    >
                        前往【模型中心】管理本地模型
                    </button>
                 </div>
             </div>
          ) : (
             <div className="p-5 bg-slate-50 dark:bg-[#161824] border border-slate-200 dark:border-[#2a2d3d] rounded-xl space-y-5 transition-colors">
               <div>
                 <label className="text-sm text-slate-600 dark:text-[#a1a1aa] mb-2 block">API 请求链接 (Endpoint)</label>
                 <input className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#2a2d3d] rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#0284c7] font-mono transition-colors" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
               </div>
               
               {isBaidu && (
                  <div>
                    <label className="text-sm text-slate-600 dark:text-[#a1a1aa] mb-2 block">APP ID (应用 ID)</label>
                    <input className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#2a2d3d] rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#0284c7] font-mono transition-colors" value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="填入在平台申请的 App ID" />
                  </div>
               )}

               <div>
                 <label className="text-sm text-slate-600 dark:text-[#a1a1aa] mb-2 block">API Key / 密钥</label>
                 <input type="password" className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#2a2d3d] rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#0284c7] font-mono transition-colors" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="填入 API 密钥以激活翻译" />
               </div>
               
               {!isBaidu && (
                   <div>
                     <label className="text-sm text-slate-600 dark:text-[#a1a1aa] mb-2 block">Model (模型)</label>
                     <input className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#2a2d3d] rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#0284c7] font-mono transition-colors" value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="对于传统机器翻译，此项可留空" />
                   </div>
               )}
             </div>
          )}
        </div>
        
        <div className="p-6 pt-4 flex justify-end gap-3">
          <button className="px-6 py-2.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors" onClick={onClose}>取消</button>
          <button className="px-6 py-2.5 text-sm bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg transition-colors" onClick={() => onSave({ platform, endpoint, modelName, apiKeys: { ...(config.apiKeys || {}), [platform]: { apiKey, appId } } })}>保存配置</button>
        </div>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) { return <button onClick={onClick} title={label} className={`group relative p-3 rounded-xl flex justify-center items-center transition-all duration-200 ${ active ? 'bg-[#0284c7] text-white shadow-[0_0_15px_rgba(2,132,199,0.3)]' : 'text-slate-500 hover:text-slate-800 dark:hover:text-[#e2e8f0] hover:bg-slate-100 dark:hover:bg-[#2a2d3d]/50' }`}>{icon}</button>; }
function StatCard({ title, value, desc, statusColor, isClickable, onClick, wrapperClass, hoverClass }) { return (<div onClick={onClick} className={`bg-white dark:bg-[#111218] border border-slate-200 dark:border-[#2a2d3d] rounded-xl py-2.5 px-4 flex flex-col relative transition-all duration-300 ease-out ${isClickable ? 'cursor-pointer' : ''} ${hoverClass || ''} ${wrapperClass || ''}`}>{statusColor && <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl transition-colors duration-300" style={{ backgroundColor: statusColor }}></div>}<div className="text-[11px] text-slate-500 dark:text-[#64748b] mb-1 ml-1">{title}</div><div className="text-sm font-semibold text-slate-800 dark:text-[#e2e8f0] mb-0.5 ml-1">{value}</div><div className="text-[11px] text-slate-400 dark:text-[#52525b] ml-1">{desc}</div></div>); }
function PanelHeader({ title, badge, badgeColor, rightElement, icon }) { return (<div className="h-12 bg-slate-50 dark:bg-[#161824] border-b border-slate-200 dark:border-[#2a2d3d] flex items-center justify-between px-5 select-none shrink-0 transition-colors"><div className="flex items-center gap-2">{icon}<span className="text-sm font-semibold text-slate-800 dark:text-[#e2e8f0]">{title}</span>{badge && <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ml-1 ${badgeColor}`}>{badge}</span>}</div><div className="flex items-center text-slate-500 dark:text-[#64748b] gap-2">{rightElement}</div></div>); }

// =========================================================================
// 3. 核心 App 组件
// =========================================================================
function App() {
  const [appTitle, setAppTitle] = useState('LinguaSync Pro IDE'); 
  const [appIcon, setAppIcon] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [hasLocalAI, setHasLocalAI] = useState(true);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const [activeTab, setActiveTab] = useState('home');
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [backText, setBackText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [fontSize, setFontSize] = useState(14); 
  const [sourceLang, setSourceLang] = useState(SUPPORTED_LANGUAGES[0]); 
  const [targetLang, setTargetLang] = useState(SUPPORTED_LANGUAGES[1]); 
  const [isAutoSource, setIsAutoSource] = useState(true);
  
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [isFirstRunModalOpen, setIsFirstRunModalOpen] = useState(false);
  
  const [panelWidths, setPanelWidths] = useState([33.3, 33.4, 33.3]);
  const mainPanelsRef = useRef(null);

  const lastTargetRef = useRef('');
  const lastValidationRef = useRef('');

  const [historyList, setHistoryList] = useState([]);
  
  const [localModelsStatus, setLocalModelsStatus] = useState({
      'opus-mt': { status: 'none', progress: 0 },
      'nllb-200': { status: 'none', progress: 0 },
      'qwen-1.5b': { status: 'none', progress: 0 }
  });

  const availablePlatforms = useMemo(
    () => hasLocalAI ? SUPPORTED_MODELS : SUPPORTED_MODELS.filter((platform) => platform !== LOCAL_PLATFORM),
    [hasLocalAI]
  );

  useEffect(() => {
    window.updateModelProgress = (modelId, progress, status) => {
        setLocalModelsStatus(prev => {
            const current = prev[modelId] || { status: 'none', progress: 0 };
            return {
                ...prev,
                [modelId]: { ...current, progress, status: status || current.status }
            };
        });
    };
    return () => { 
        delete window.updateModelProgress; 
    };
  }, []);

  useEffect(() => {
    let isInit = false;
    
    const initApp = async () => {
        if (isInit) return;
        if (window.pywebview && window.pywebview.api) {
            isInit = true; 
            
            try { await window.pywebview.api.app_is_ready(); } catch(e) { console.error("通知后端就绪失败:", e); }
            
            try {
                const title = await window.pywebview.api.get_app_version();
                if (title) setAppTitle(title);
            } catch (error) { ignoreError(error); }

            try {
                const iconData = await window.pywebview.api.get_app_icon_data?.();
                if (iconData) setAppIcon(iconData);
            } catch (error) { ignoreError(error); }
             
            try {
                const data = await window.pywebview.api.load_history();
                if (data && Array.isArray(data)) setHistoryList(data);
            } catch (error) { ignoreError(error); }

            try {
                const capabilities = await window.pywebview.api.get_capabilities?.();
                const localAIEnabled = capabilities?.local_ai !== false;
                setHasLocalAI(localAIEnabled);

                const isFirst = await window.pywebview.api.check_first_run();
                if (isFirst && localAIEnabled) { setIsFirstRunModalOpen(true); }
                
                if (localAIEnabled) {
                    const backendStatuses = await window.pywebview.api.get_local_model_statuses?.();
                    if (backendStatuses && typeof backendStatuses === 'object') {
                        setLocalModelsStatus((prev) => ({
                            ...prev,
                            ...backendStatuses,
                        }));
                    } else {
                        const downloadedModels = await window.pywebview.api.check_downloaded_models();
                        if (downloadedModels && downloadedModels.length > 0) {
                            setLocalModelsStatus(prev => {
                                const updated = { ...prev };
                                downloadedModels.forEach(modelId => {
                                    if (updated[modelId]) updated[modelId] = { status: 'ready', progress: 100 };
                                });
                                return updated;
                            });
                        }
                    }
                }
            } catch(e) {
                console.error("模型状态初始化失败", e);
            }
        }
    };

    if (window.pywebview && window.pywebview.api) {
        initApp();
    } else {
        window.addEventListener('pywebviewready', initApp);
        const fallbackTimer = setInterval(() => {
            if (window.pywebview && window.pywebview.api) {
                clearInterval(fallbackTimer);
                initApp();
            }
        }, 250);
        return () => {
            window.removeEventListener('pywebviewready', initApp);
            clearInterval(fallbackTimer);
        };
    }
  }, []);

  const syncHistoryToFile = (newList) => {
      setHistoryList(newList);
      if (window.pywebview?.api?.save_history) {
          window.pywebview.api.save_history(newList);
      }
  };

  const addHistory = (source, target, tokens) => {
      if (!source || !source.trim() || !target || !target.trim()) return;
      // 【修复 1】补全三元运算符漏掉的 : ''
      const title = source.trim().substring(0, 30).replace(/\n/g, ' ') + (source.length > 30 ? '...' : '');
      const pad = (n) => n < 10 ? '0' + n : n;
      const d = new Date();
      const timeStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      const newItem = { id: Date.now(), title, time: timeStr, tokens, source, target };
      const updated = [newItem, ...historyList].slice(0, 50);
      syncHistoryToFile(updated);
  };

  const loadHistoryItem = (item) => {
      setSourceText(item.source);
      setTargetText(item.target);
      setBackText(''); 
      lastTargetRef.current = ''; 
      setActiveTab('home');
  };

  // 【修复 3】增加本地数据的深度合并合并保护，防止缺少 apiKeys 导致崩溃
  const [appConfig, setAppConfig] = useState(() => {
    const defaultConfig = {
      platform: LOCAL_PLATFORM, 
      endpoint: API_DEFAULTS[LOCAL_PLATFORM].endpoint, 
      modelName: API_DEFAULTS[LOCAL_PLATFORM].modelName, 
      apiKeys: { "百度翻译 API": { appId: '', apiKey: '' } } 
    };
    try {
        const stored = localStorage.getItem('lingua_sync_config');
        if (stored) {
            const parsed = JSON.parse(stored);
            return { 
                ...defaultConfig, 
                ...parsed, 
                apiKeys: { ...defaultConfig.apiKeys, ...(parsed.apiKeys || {}) } 
            };
        }
    } catch(e) { console.error("加载配置失败", e); }
    return defaultConfig;
  });

  useEffect(() => {
    try {
        localStorage.setItem('lingua_sync_config', JSON.stringify(appConfig));
    } catch(e) { console.error("保存配置失败", e); }
  }, [appConfig]);

  useEffect(() => {
    if (hasLocalAI) return;

    if (activeTab === 'models') {
      setActiveTab('home');
    }

    if (isFirstRunModalOpen) {
      setIsFirstRunModalOpen(false);
    }

    if (appConfig.platform === LOCAL_PLATFORM) {
      setAppConfig((prev) => ({
        ...prev,
        platform: DEFAULT_ONLINE_PLATFORM,
        endpoint: API_DEFAULTS[DEFAULT_ONLINE_PLATFORM].endpoint,
        modelName: API_DEFAULTS[DEFAULT_ONLINE_PLATFORM].modelName,
      }));
    }
  }, [hasLocalAI, activeTab, appConfig.platform, isFirstRunModalOpen]);

  const [usageStats, setUsageStats] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('lingua_sync_usage')) || {};
      const currentMonth = new Date().toISOString().slice(0, 7); 
      if (stored.month !== currentMonth) {
        const freshStats = { month: currentMonth };
        localStorage.setItem('lingua_sync_usage', JSON.stringify(freshStats));
        return freshStats;
      }
      return stored;
    } catch (error) {
      ignoreError(error);
      return { month: new Date().toISOString().slice(0, 7) };
    }
  });

  const typingTimerRef = useRef(null);
  const targetTypingTimerRef = useRef(null); 
  const abortControllerRef = useRef(null);
  const [activeBox, setActiveBox] = useState(null);
  const [selections, setSelections] = useState({ source: [0, 0], target: [0, 0], validation: [0, 0] });

  const prepareTextForLLM = (text) => text.split('\n').map(line => line.trim() === '' ? '[KEEP_EMPTY_LINE]' : line).join('\n');
  const restoreTextFromLLM = (text) => text.replace(/^```[a-z]*\n/im, '').replace(/\n```$/im, '').replace(/\[KEEP_EMPTY_LINE\]/g, '');

  const triggerValidationOnly = async (textToValidate, config = appConfig, isFromSource = false) => {
    if (!textToValidate.trim()) return;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsValidating(true);

    if (isFromSource) {
        lastTargetRef.current = '';
        lastValidationRef.current = '';
    }
    
    if (config.platform === '本地离线模型 (Local)') {
        try {
            if (window.pywebview && window.pywebview.api) {
                const backRes = await window.pywebview.api.translate_local(textToValidate, config.modelName, targetLang, sourceLang);
                setBackText(backRes);
                lastTargetRef.current = textToValidate;
                lastValidationRef.current = backRes;
            } else {
                setBackText(`[本地引擎调用失败]: 未连接到后端`);
            }
        } catch(e) {
            setBackText(`[本地引擎调用失败]: ${e.message}`);
        }
        setIsValidating(false);
        return;
    }

    let isPartial = false;
    let prefixLen = 0;
    let suffixLen = 0;
    
    const oldLines = lastTargetRef.current.split('\n');
    const oldValLines = lastValidationRef.current.split('\n');
    const newLines = textToValidate.split('\n');

    if (oldLines.length > 0 && oldLines.length === oldValLines.length && lastValidationRef.current.trim() !== '') {
        while (prefixLen < oldLines.length && prefixLen < newLines.length && oldLines[prefixLen] === newLines[prefixLen]) {
            prefixLen++;
        }
        while (suffixLen < oldLines.length - prefixLen && suffixLen < newLines.length - prefixLen && oldLines[oldLines.length - 1 - suffixLen] === newLines[newLines.length - 1 - suffixLen]) {
            suffixLen++;
        }
        if (prefixLen > 0 || suffixLen > 0) isPartial = true;
    }

    let textToSend = textToValidate;
    if (isPartial) {
        const changedNewLines = newLines.slice(prefixLen, newLines.length - suffixLen);
        if (changedNewLines.length === 0) { setIsValidating(false); return; }
        textToSend = changedNewLines.join('\n');
    } else {
        setBackText(''); 
    }

    const creds = (config.apiKeys && config.apiKeys[config.platform]) || {};
    
    if (config.platform === '百度翻译 API') {
        const { appId, apiKey: key } = creds;
        if (!appId || !key) {
            setBackText(`[系统提示]：配置不完整。请填写百度的 AppID 和 密钥。`);
            setIsValidating(false); return;
        }
        const cleanAppId = appId.trim(); const cleanKey = key.trim();
        try {
            await loadScript('https://cdn.staticfile.net/blueimp-md5/2.19.0/js/md5.min.js');
            const salt = (new Date).getTime();
            const sign = window.md5(cleanAppId + textToSend + salt + cleanKey);
            const fromLang = BAIDU_LANG_MAP[targetLang] || 'auto';
            const toLang = BAIDU_LANG_MAP[sourceLang] || 'en';
            const url = `${config.endpoint}?q=${encodeURIComponent(textToSend)}&from=${fromLang}&to=${toLang}&appid=${cleanAppId}&salt=${salt}&sign=${sign}`;

            const data = await fetchBaiduJSONP(url, signal);
            if (data.error_code) throw new Error(data.error_msg || `ErrorCode: ${data.error_code}`);
            
            const resultText = data.trans_result.map(item => item.dst).join('\n');
            let finalResult = resultText;
            if (isPartial) {
                finalResult = [ ...oldValLines.slice(0, prefixLen), resultText, ...oldValLines.slice(oldValLines.length - suffixLen) ].join('\n');
            }
            setBackText(finalResult);
            lastTargetRef.current = textToValidate;
            lastValidationRef.current = finalResult;
        } catch (err) {
            if (err.name !== 'AbortError') setBackText(`[百度 API 报错]: ${err.message}`);
        } finally {
            setIsValidating(false);
        }
        return;
    }
    
    const apiKey = creds.apiKey || (typeof creds === 'string' ? creds : null);
    if (!apiKey) {
        setBackText(`[系统提示]：请配置 API Key 以激活。`);
        setIsValidating(false); return;
    }
    try {
        const backSystemPrompt = `You are a translator. Target Language: ${getLangShortName(sourceLang)}. \nCRITICAL RULES:\n1. Keep exact line count, structure, and indentation.\n2. Keep ALL '[KEEP_EMPTY_LINE]' tags.\nOutput ONLY the translated text without any conversational filler.`;
        const backResponse = await fetch(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: config.modelName, messages: [ { role: 'system', content: backSystemPrompt }, { role: 'user', content: prepareTextForLLM(textToSend) } ], temperature: 0.1, stream: true }),
            signal
        });
        if (!backResponse.ok) throw new Error(`回译请求失败: ${backResponse.status}`);
        const backReader = backResponse.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let backResult = ""; let backBuffer = ""; let lastBackRenderTime = Date.now();
        while (true) {
            const { done, value } = await backReader.read();
            if (done) break;
            backBuffer += decoder.decode(value, { stream: true });
            const lines = backBuffer.split('\n'); backBuffer = lines.pop();
            let chunkHasNewBackText = false;
            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const data = JSON.parse(line.substring(6));
                        const delta = data.choices[0]?.delta?.content || "";
                        if (delta) { backResult += delta; chunkHasNewBackText = true; }
                    } catch (error) { ignoreError(error); }
                }
            }
            if (chunkHasNewBackText) {
                const now = Date.now();
                if (now - lastBackRenderTime > 50) { 
                    const currentFragment = restoreTextFromLLM(backResult);
                    let displayResult = currentFragment;
                    if (isPartial) { displayResult = [ ...oldValLines.slice(0, prefixLen), currentFragment, ...oldValLines.slice(oldValLines.length - suffixLen) ].join('\n'); }
                    setBackText(displayResult);
                    lastBackRenderTime = now; 
                }
            }
        }
        const finalFragment = restoreTextFromLLM(backResult);
        let finalResult = finalFragment;
        if (isPartial) { finalResult = [ ...oldValLines.slice(0, prefixLen), finalFragment, ...oldValLines.slice(oldValLines.length - suffixLen) ].join('\n'); }
        setBackText(finalResult);
        lastTargetRef.current = textToValidate;
        lastValidationRef.current = finalResult;
    } catch (err) {
        if (err.name !== 'AbortError') setBackText(prev => prev ? prev + `\n\n[API 异常]: ${err.message}` : `[错误]: ${err.message}`);
    } finally {
        setIsValidating(false);
    }
  };

  const triggerTranslation = async (textToTranslate = sourceText, config = appConfig) => {
    if (!textToTranslate.trim()) return;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsTranslating(true);
    setIsValidating(false);
    setTargetText('');
    setBackText('');

    if (config.platform === '本地离线模型 (Local)') {
        try {
            if (window.pywebview && window.pywebview.api) {
                const result = await window.pywebview.api.translate_local(textToTranslate, config.modelName, sourceLang, targetLang);
                setTargetText(result);
                setIsTranslating(false);
                if (result.trim() && !result.includes('[错误]') && !result.includes('[环境错误]')) {
                    addHistory(textToTranslate, result, textToTranslate.length);
                    await triggerValidationOnly(result, config, true);
                }
            } else {
                setTargetText(`[本地引擎调用失败]: 未连接到后端接口。`);
                setIsTranslating(false);
            }
        } catch(e) {
            setTargetText(`[本地引擎异常]: ${e.message}`);
            setIsTranslating(false);
        }
        return;
    }

    const creds = (config.apiKeys && config.apiKeys[config.platform]) || {};
    
    if (config.platform === '百度翻译 API') {
        const { appId, apiKey: key } = creds;
        if (!appId || !key) {
            setTargetText(`[系统提示]：您需要填写百度的 AppID 和 密钥 🔑。\n\n请点击左上角的配置面板补全信息。`);
            setIsTranslating(false); return;
        }

        const cleanAppId = appId.trim();
        const cleanKey = key.trim();

        try {
            await loadScript('https://cdn.staticfile.net/blueimp-md5/2.19.0/js/md5.min.js');
            const salt = (new Date).getTime();
            const sign = window.md5(cleanAppId + textToTranslate + salt + cleanKey);
            
            const fromLang = BAIDU_LANG_MAP[sourceLang] || 'auto';
            const toLang = BAIDU_LANG_MAP[targetLang] || 'zh';
            const url = `${config.endpoint}?q=${encodeURIComponent(textToTranslate)}&from=${fromLang}&to=${toLang}&appid=${cleanAppId}&salt=${salt}&sign=${sign}`;

            const data = await fetchBaiduJSONP(url, signal);
            
            if (data.error_code) throw new Error(data.error_msg || `ErrorCode: ${data.error_code}`);
            
            const resultText = data.trans_result.map(item => item.dst).join('\n');
            setTargetText(resultText);
            setIsTranslating(false); 
            
            setUsageStats(prev => {
                const newStats = { ...prev, [config.platform]: (prev[config.platform] || 0) + textToTranslate.length };
                localStorage.setItem('lingua_sync_usage', JSON.stringify(newStats));
                return newStats;
            });
            
            if (resultText.trim()) addHistory(textToTranslate, resultText, textToTranslate.length);

            await triggerValidationOnly(resultText, config, true);
        } catch (err) {
            if (err.name !== 'AbortError') setTargetText(`[百度 API 报错]: ${err.message}`);
            setIsTranslating(false);
            setIsValidating(false);
        }
        return; 
    }

    const apiKey = creds.apiKey || (typeof creds === 'string' ? creds : null);
    if (!apiKey) {
        setTargetText(`[系统提示]：您还没有配置 ${config.platform} 的 API Key 🔑。`);
        setIsTranslating(false); return;
    }
    try {
        const safeText = prepareTextForLLM(textToTranslate);
        const systemPrompt = `You are a translator. Target Language: ${getLangShortName(targetLang)}. \nCRITICAL RULES:\n1. Keep exact line count, structure, and indentation.\n2. Keep ALL '[KEEP_EMPTY_LINE]' tags.\n3. If input is JSON/Code, translate ONLY the values.\nOutput ONLY the translated text without any conversational filler.`;
        const response = await fetch(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: config.modelName, messages: [ { role: 'system', content: systemPrompt }, { role: 'user', content: safeText } ], temperature: 0.1, stream: true }),
            signal
        });
        if (!response.ok) throw new Error(`请求失败: ${response.status}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let translatedResult = ""; let buffer = ""; let lastRenderTime = Date.now();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n'); buffer = lines.pop(); 
            let chunkHasNewText = false;
            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const data = JSON.parse(line.substring(6));
                        const delta = data.choices[0]?.delta?.content || "";
                        if (delta) { translatedResult += delta; chunkHasNewText = true; }
                    } catch (error) { ignoreError(error); }
                }
            }
            if (chunkHasNewText) {
                const now = Date.now();
                if (now - lastRenderTime > 50) { setTargetText(restoreTextFromLLM(translatedResult)); lastRenderTime = now; }
            }
        }
        
        const finalTranslated = restoreTextFromLLM(translatedResult);
        setTargetText(finalTranslated);
        setIsTranslating(false); 
        
        setUsageStats(prev => {
            const newStats = { ...prev, [config.platform]: (prev[config.platform] || 0) + textToTranslate.length };
            localStorage.setItem('lingua_sync_usage', JSON.stringify(newStats));
            return newStats;
        });

        if (finalTranslated.trim()) addHistory(textToTranslate, finalTranslated, textToTranslate.length);

        await triggerValidationOnly(finalTranslated, config, true);
    } catch (err) {
        if (err.name !== 'AbortError') setTargetText(prev => prev ? prev + `\n\n[API 异常]: ${err.message}` : `[错误]: ${err.message}`);
        setIsTranslating(false); setIsValidating(false);
    }
  };

  const handleSourceChange = (e) => {
    const text = e.target.value;
    setSourceText(text);
    if (isAutoSource && text.trim()) {
        const detected = detectLanguage(text);
        if (detected !== sourceLang) setSourceLang(detected);
    }
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (!text.trim()) { 
        setTargetText(''); setBackText(''); 
        setIsTranslating(false); setIsValidating(false);
        setIsAutoSource(true); return; 
    }
    typingTimerRef.current = setTimeout(() => { triggerTranslation(text, appConfig); }, 400);
  };

  const handleTargetChange = (e) => {
    const text = e.target.value;
    setTargetText(text);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (targetTypingTimerRef.current) clearTimeout(targetTypingTimerRef.current);
    if (!text.trim()) { 
        setBackText(''); setIsValidating(false); setIsTranslating(false); return; 
    }
    targetTypingTimerRef.current = setTimeout(() => { triggerValidationOnly(text, appConfig, false); }, 800); 
  };

  const handleClear = () => { 
      setSourceText(''); setTargetText(''); setBackText(''); 
      lastTargetRef.current = ''; lastValidationRef.current = '';
      if (abortControllerRef.current) abortControllerRef.current.abort();
      setIsTranslating(false); setIsValidating(false); setIsAutoSource(true);
  };

  const handleSelectionChange = (id, start, end) => {
    const texts = { source: sourceText, target: targetText, validation: backText };
    const initiatorText = texts[id] || '';
    if (start === end || initiatorText.length === 0) { setSelections({ source: [0, 0], target: [0, 0], validation: [0, 0] }); return; }
    const getMappedRange = (targetId) => {
        const targetStr = texts[targetId] || '';
        if (!targetStr) return [0, 0];
        const mapOffset = (offset) => {
            if (offset <= 0) return 0;
            if (offset >= initiatorText.length) return targetStr.length;
            const sourceLines = initiatorText.split('\n');
            const targetLines = targetStr.split('\n');
            let currentOffset = 0; let lineIdx = 0; let colIdx = 0;
            for (let i = 0; i < sourceLines.length; i++) {
                const lineLen = sourceLines[i].length;
                if (currentOffset + lineLen >= offset) { lineIdx = i; colIdx = offset - currentOffset; break; }
                currentOffset += lineLen + 1;
            }
            if (lineIdx >= sourceLines.length) { lineIdx = sourceLines.length - 1; colIdx = sourceLines[lineIdx].length; }
            const targetLineIdx = Math.min(lineIdx, targetLines.length - 1);
            let targetOffset = 0;
            for (let i = 0; i < targetLineIdx; i++) targetOffset += targetLines[i].length + 1;
            const sourceLineLen = sourceLines[lineIdx].length;
            const targetLineLen = targetLines[targetLineIdx].length;
            let targetCol = 0;
            if (sourceLineLen > 0) {
                const sourceMatch = sourceLines[lineIdx].match(/^(\s*)/);
                const targetMatch = targetLines[targetLineIdx].match(/^(\s*)/);
                const sourceIndent = sourceMatch ? sourceMatch[1].length : 0;
                const targetIndent = targetMatch ? targetMatch[1].length : 0;
                if (colIdx <= sourceIndent) targetCol = Math.min(colIdx, targetIndent);
                else {
                    const sourceContentLen = sourceLineLen - sourceIndent;
                    const targetContentLen = Math.max(0, targetLineLen - targetIndent);
                    const ratio = sourceContentLen > 0 ? (colIdx - sourceIndent) / sourceContentLen : 0;
                    targetCol = targetIndent + Math.floor(ratio * targetContentLen);
                }
            }
            return Math.min(targetOffset + targetCol, targetStr.length);
        };
        const mappedStart = mapOffset(start);
        const mappedEnd = mapOffset(end);
        return [Math.min(mappedStart, mappedEnd), Math.max(mappedStart, mappedEnd)];
    };
    const newSelections = { source: [0, 0], target: [0, 0], validation: [0, 0] };
    newSelections[id] = [start, end];
    if (id === 'source') { newSelections.target = getMappedRange('target'); newSelections.validation = [0, 0]; } 
    else if (id === 'validation') { newSelections.target = getMappedRange('target'); newSelections.source = [0, 0]; } 
    else if (id === 'target') { newSelections.source = getMappedRange('source'); newSelections.validation = getMappedRange('validation'); }
    setSelections(newSelections);
  };

  const windowControl = async (action) => { if(window.pywebview && window.pywebview.api) { try { await window.pywebview.api[action](); } catch(e) { ignoreError(e); } } };
  
  const handleTogglePin = async () => { 
      if(window.pywebview && window.pywebview.api) { 
          try { 
              const res = await window.pywebview.api.toggle_pin(); 
              setTimeout(() => setIsPinned(res), 50); 
          } catch(e) { ignoreError(e); } 
      } else { 
          setTimeout(() => setIsPinned(!isPinned), 50); 
      } 
  };

  const openExternalLink = (url) => { if (!url) return; if(window.pywebview && window.pywebview.api) window.pywebview.api.open_url(url); else window.open(url, '_blank'); };

  const handlePanelResize = (index, e) => {
      e.preventDefault();
      e.stopPropagation(); 

      const startX = e.screenX;
      const startWidths = [...panelWidths];
      const containerWidth = mainPanelsRef.current.getBoundingClientRect().width;
      
      const handleMouseMove = (e) => {
          const deltaX = e.screenX - startX;
          const deltaPercent = (deltaX / containerWidth) * 100;
          let newWidths = [...startWidths];
          const MIN_PERCENT = 15; 
          
          if (index === 0) {
              newWidths[0] = startWidths[0] + deltaPercent;
              newWidths[1] = startWidths[1] - deltaPercent;
              if (newWidths[0] < MIN_PERCENT) { const diff = MIN_PERCENT - newWidths[0]; newWidths[0] = MIN_PERCENT; newWidths[1] -= diff; }
              if (newWidths[1] < MIN_PERCENT) { const diff = MIN_PERCENT - newWidths[1]; newWidths[1] = MIN_PERCENT; newWidths[0] -= diff; }
          } else if (index === 1) {
              newWidths[1] = startWidths[1] + deltaPercent;
              newWidths[2] = startWidths[2] - deltaPercent;
              if (newWidths[1] < MIN_PERCENT) { const diff = MIN_PERCENT - newWidths[1]; newWidths[1] = MIN_PERCENT; newWidths[2] -= diff; }
              if (newWidths[2] < MIN_PERCENT) { const diff = MIN_PERCENT - newWidths[2]; newWidths[2] = MIN_PERCENT; newWidths[1] -= diff; }
          }
          setPanelWidths(newWidths);
      };

      const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = 'default';
      };

      document.body.style.cursor = 'col-resize';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
  };

  const handleWindowResizeMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const startX = e.screenX;
      const startY = e.screenY;
      const startWidth = window.innerWidth;
      const startHeight = window.innerHeight;

      const handleMouseMove = (e) => {
          const newWidth = Math.max(1024, startWidth + (e.screenX - startX));
          const newHeight = Math.max(768, startHeight + (e.screenY - startY));
          if (window.pywebview && window.pywebview.api) {
              window.pywebview.api.resize_window(newWidth, newHeight);
          }
      };

      const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = 'default';
      };

      document.body.style.cursor = 'nwse-resize';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
  };

  // 部署控制函数
  const handleDownloadModel = (modelId) => {
      setLocalModelsStatus(prev => ({ ...prev, [modelId]: { status: 'downloading', progress: 0 } }));
      if (window.pywebview && window.pywebview.api) {
          window.pywebview.api.download_local_model(modelId);
      }
  };

  const handlePauseModel = (modelId) => {
      setLocalModelsStatus(prev => ({ ...prev, [modelId]: { ...prev[modelId], status: 'paused' } }));
      if (window.pywebview && window.pywebview.api) window.pywebview.api.pause_model_download(modelId);
  };

  const handleResumeModel = (modelId) => {
      setLocalModelsStatus(prev => ({ ...prev, [modelId]: { ...prev[modelId], status: 'downloading' } }));
      if (window.pywebview && window.pywebview.api) window.pywebview.api.resume_model_download(modelId);
  };

  const handleCancelModel = (modelId) => {
      setLocalModelsStatus(prev => ({ ...prev, [modelId]: { status: 'none', progress: 0 } }));
      if (window.pywebview && window.pywebview.api) window.pywebview.api.cancel_model_download(modelId);
  };

  const checkIsModelReady = () => {
      const platform = appConfig.platform;
      const creds = (appConfig.apiKeys && appConfig.apiKeys[platform]) || {};
      if (platform === '本地离线模型 (Local)') {
          return localModelsStatus[appConfig.modelName]?.status === 'ready'; 
      }
      if (platform === '百度翻译 API') return creds.appId?.trim().length > 0 && creds.apiKey?.trim().length > 0;
      if (platform === '自定义配置 (Custom)') return appConfig.endpoint?.trim().length > 0 && creds.apiKey?.trim().length > 0;
      return creds.apiKey?.trim().length > 0;
  };
  
  const isModelReady = checkIsModelReady();
  const indicatorColorClass = isModelReady ? 'bg-[#10b981]' : 'bg-[#ef4444]';
  const indicatorPingClass = isModelReady ? 'bg-[#10b981]' : 'bg-[#ef4444]';
  
  const sourceShort = getLangShortName(sourceLang);
  const targetShort = getLangShortName(targetLang);
  
  const currentPlatformInfo = API_DEFAULTS[appConfig.platform] || {};
  const isNMTMode = currentPlatformInfo.isNMT;
  const currentMonthlyLimit = currentPlatformInfo.limit || 0;
  const usedAmount = usageStats[appConfig.platform] || 0;
  
  const isLocalEngine = appConfig.platform === '本地离线模型 (Local)';
  const usageCardTitle = isLocalEngine ? "本地计算 (完全免费)" : (isNMTMode ? `${appConfig.platform.split(' ')[0]} 当月已用字符` : "估算 Token 消耗 (本地)");
  const usageCardValue = isLocalEngine ? "不限额" : usedAmount.toLocaleString();
  const usageCardDesc = isLocalEngine ? "离线处理，保障隐私安全" : (isNMTMode 
      ? (usedAmount <= currentMonthlyLimit ? `免费额度剩余: 约 ${(currentMonthlyLimit - usedAmount).toLocaleString()} 字符` : "⚠️ 免费额度已超限")
      : "注：大模型按 Token 计费，此处仅为本地估算字数");
      
  const badgeTitle = isLocalEngine ? "LOCAL ENGINE" : (isNMTMode ? "FAST NMT" : "STREAM");
  const badgeColor = isLocalEngine ? "bg-[#10b981]/20 text-[#10b981]" : (isNMTMode ? "bg-[#3b82f6]/20 text-[#3b82f6]" : "bg-[#059669]/20 text-[#10b981]");
  const currentStatusColor = isTranslating ? "#3b82f6" : (isValidating ? "#8b5cf6" : (isModelReady ? "#10b981" : "#ef4444"));
  const currentStatusText = isTranslating ? "正向翻译中..." : (isValidating ? "二次回译中..." : (isModelReady ? "空闲就绪" : "配置缺失或未部署"));

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-[#0a0a0c] text-slate-600 dark:text-[#a1a1aa] font-sans overflow-hidden transition-colors duration-300 relative">
      
      <div className={`h-10 bg-white dark:bg-[#141621] border-b border-slate-200 dark:border-[#2a2d3d] flex items-center justify-between px-4 pywebview-drag-region shrink-0 z-50 relative transition-all duration-300 ${isPinned ? 'hidden' : 'flex'}`}>
        <div className="flex items-center gap-3 text-sm font-medium text-slate-800 dark:text-[#e2e8f0] no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
           {appIcon ? <img src={appIcon} alt="LinguaSync Pro" className="w-4 h-4 rounded-sm object-contain" /> : <Icons.Bot size={16} className="text-[#0284c7]" />} 
           {appTitle}
        </div>
        <div className="flex items-center gap-2 no-drag">
          <button onClick={handleTogglePin} title={isPinned ? "取消置顶" : "置顶窗口 (沉浸模式)"} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-[#2a2d3d] text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
             <Icons.Pin size={14} className={`transition-colors duration-300 ${isPinned ? "fill-[#0284c7] text-[#0284c7]" : "text-slate-400"}`} />
          </button>
          <button onClick={() => windowControl('minimize')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-[#2a2d3d] text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"><Icons.Minus /></button>
          <button onClick={() => windowControl('toggle_maximize')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-[#2a2d3d] text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"><Icons.Square /></button>
          <button onClick={() => windowControl('close')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-[#ef4444] text-slate-400 hover:text-red-500 dark:hover:text-white transition-colors"><Icons.X /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        <div className={`bg-white dark:bg-[#141621] border-r border-slate-200 dark:border-[#2a2d3d] flex flex-col items-center py-4 z-20 shrink-0 transition-all duration-300 ${isPinned ? 'w-0 opacity-0 overflow-hidden border-none' : 'w-16 opacity-100'}`}>
          <div className="flex flex-col gap-4 w-full px-2 mt-2">
            <NavItem icon={<Icons.Home size={22} />} label="主页" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavItem icon={<Icons.History size={22} />} label="历史记录" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            {hasLocalAI && <NavItem icon={<Icons.Cpu size={22} />} label="本地引擎管理 (Model Hub)" active={activeTab === 'models'} onClick={() => setActiveTab('models')} />}
            <div className="w-8 h-px bg-slate-200 dark:bg-[#2a2d3d] mx-auto my-1"></div>
            <NavItem icon={isDark ? <Icons.Sun size={22} /> : <Icons.Moon size={22} />} label={isDark ? "切换亮色模式" : "切换暗色模式"} active={false} onClick={() => setIsDark(!isDark)} />
            <NavItem icon={<Icons.Coffee size={22} />} label="赞助支持" active={isSponsorModalOpen} onClick={() => setIsSponsorModalOpen(true)} />
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0a0a0c] overflow-hidden relative transition-colors">
          {activeTab === 'home' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              <div className={`grid grid-cols-4 gap-4 p-4 pb-0 z-10 shrink-0 transition-all duration-300 ${isPinned ? 'hidden' : 'grid'}`}>
                <StatCard title="当前模型 (点击配置)" value={<div className="flex items-center gap-2"><div className="relative flex h-2 w-2 shrink-0"><span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${indicatorPingClass} opacity-75`}></span><span className={`relative inline-flex rounded-full h-2 w-2 ${indicatorColorClass}`}></span></div><span className="truncate">{appConfig.platform}</span><Icons.ChevronDown size={14} className="text-slate-500 shrink-0" /></div>} desc={isLocalEngine ? '完全离线推理' : (isNMTMode ? 'NMT 极速模式' : (appConfig.modelName || '未指定模型'))} isClickable={true} onClick={() => setIsConfigModalOpen(true)} statusColor="#3b82f6" hoverClass="hover:-translate-y-[1px] hover:shadow-md hover:border-[#3b82f6]/40 hover:z-20" />
                <StatCard title="源语言 / 目标语言" value={<div className="flex items-center gap-2 w-full"><LanguageSelect value={sourceLang} onChange={(val) => { setSourceLang(val); setIsAutoSource(false); }} options={SUPPORTED_LANGUAGES} isAuto={isAutoSource} /><span className="text-slate-400 shrink-0 text-xs">⇌</span><LanguageSelect value={targetLang} onChange={setTargetLang} options={SUPPORTED_LANGUAGES} /></div>} desc={isLocalEngine ? "本地算力支持" : (isNMTMode ? "神经机器翻译网络激活" : "流式打字机效果: 已开启")} statusColor="#f59e0b" wrapperClass="z-20" hoverClass="hover:-translate-y-[1px] hover:shadow-md hover:border-[#f59e0b]/40 hover:z-30" />
                <StatCard title={usageCardTitle} value={usageCardValue} desc={usageCardDesc} statusColor="#8b5cf6" hoverClass="hover:-translate-y-[1px] hover:shadow-md hover:border-[#8b5cf6]/40 hover:z-20" />
                <StatCard title="系统状态" value={currentStatusText} desc={isTranslating || isValidating ? (isLocalEngine ? "本地 GPU/CPU 计算中..." : (isNMTMode ? "API 秒传中..." : "Stream SSE 传输中")) : "底层渲染架构: 三层验证态"} statusColor={currentStatusColor} hoverClass={`hover:-translate-y-[1px] hover:shadow-md hover:z-20`} />
              </div>

              <div className={`flex-1 overflow-hidden z-0 transition-all duration-300 ${isPinned ? 'p-2' : 'p-4'}`}>
                <div className="flex flex-row h-full" ref={mainPanelsRef}>
                  <div style={{ flex: `${panelWidths[0]} 1 0%` }} className="flex flex-col relative bg-white dark:bg-[#111218] border border-slate-200 dark:border-[#2a2d3d] rounded-xl overflow-hidden shadow-sm min-w-0 transition-colors duration-200 hover:border-[#3b82f6]/50">
                    <PanelHeader 
                      icon={<Icons.FileText size={16} className="text-[#3b82f6]"/>} 
                      title={`Source (${sourceShort})`} 
                      rightElement={
                        <div className="flex items-center gap-1">
                          <button onClick={() => setPanelWidths([33.3, 33.4, 33.3])} title="恢复均等宽度布局" className="p-1.5 rounded transition-colors text-slate-500 hover:text-slate-800 dark:text-[#64748b] dark:hover:text-[#e2e8f0] hover:bg-slate-200 dark:hover:bg-[#2a2d3d]"><Icons.Columns3 size={16} /></button>
                          <div className="w-px h-4 bg-slate-300 dark:bg-[#3f3f46] mx-1"></div>
                          <CopyButton text={sourceText} />
                        </div>
                      } 
                    />
                    <div className="flex-1 relative flex flex-col no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
                      <SmartTextArea id="source" value={sourceText} onChange={handleSourceChange} placeholder={DEFAULT_SOURCE_PLACEHOLDER} fontSize={fontSize} activeBox={activeBox} setActiveBox={setActiveBox} selectionRange={selections.source} onSelectionChange={handleSelectionChange} />
                      <div className="absolute bottom-3 right-3 text-xs text-slate-500 dark:text-[#64748b] flex items-center gap-3 bg-white/80 dark:bg-[#111218]/80 backdrop-blur rounded px-2 py-1 z-20">
                        <button className="hover:text-slate-800 dark:hover:text-[#e2e8f0] flex items-center gap-1 transition-colors pointer-events-auto" onClick={() => triggerTranslation()} title="重新请求"><Icons.RefreshCw size={14} className={isTranslating || isValidating ? "animate-spin text-[#0284c7]" : ""} /> 刷新</button>
                        <button className="hover:text-slate-800 dark:hover:text-[#e2e8f0] flex items-center gap-1 transition-colors pointer-events-auto" onClick={handleClear}><Icons.Trash2 size={14}/> 清空</button>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="w-4 shrink-0 flex items-center justify-center cursor-col-resize group no-drag mx-0.5 rounded-md hover:bg-slate-200/50 dark:hover:bg-[#2a2d3d]/50 transition-colors" 
                    style={{ WebkitAppRegion: 'no-drag' }}
                    onMouseDown={(e) => handlePanelResize(0, e)}
                  >
                    <div className="h-8 w-1 rounded-full bg-slate-300 dark:bg-[#3f3f46] group-hover:bg-[#0284c7] transition-colors"></div>
                  </div>

                  <div style={{ flex: `${panelWidths[1]} 1 0%` }} className="flex flex-col relative bg-white dark:bg-[#111218] border border-slate-200 dark:border-[#2a2d3d] rounded-xl overflow-hidden shadow-sm min-w-0 transition-colors duration-200 hover:border-[#10b981]/50">
                    <PanelHeader icon={<Icons.Edit3 size={16} className="text-[#10b981]"/>} title={`Target Edit (${targetShort})`} badge={badgeTitle} badgeColor={badgeColor} rightElement={<div className="flex items-center gap-2"><FontSizeSelect value={fontSize} onChange={setFontSize} options={[12, 13, 14, 15, 16, 18, 20]} /><div className="w-px h-4 bg-slate-300 dark:bg-[#3f3f46]"></div><CopyButton text={targetText} /></div>} />
                    <div className="flex-1 relative flex flex-col no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
                      <SmartTextArea id="target" value={targetText} onChange={handleTargetChange} placeholder={DEFAULT_TARGET_PLACEHOLDER} fontSize={fontSize} activeBox={activeBox} setActiveBox={setActiveBox} selectionRange={selections.target} onSelectionChange={handleSelectionChange} isStreaming={isTranslating && !isNMTMode} />
                      {isTranslating && <div className="absolute top-2 right-4 text-xs font-semibold text-[#10b981] animate-pulse z-20 pointer-events-none tracking-wider">GENERATING...</div>}
                    </div>
                  </div>

                  <div 
                    className="w-4 shrink-0 flex items-center justify-center cursor-col-resize group no-drag mx-0.5 rounded-md hover:bg-slate-200/50 dark:hover:bg-[#2a2d3d]/50 transition-colors" 
                    style={{ WebkitAppRegion: 'no-drag' }}
                    onMouseDown={(e) => handlePanelResize(1, e)}
                  >
                    <div className="h-8 w-1 rounded-full bg-slate-300 dark:bg-[#3f3f46] group-hover:bg-[#0284c7] transition-colors"></div>
                  </div>

                  <div style={{ flex: `${panelWidths[2]} 1 0%` }} className="flex flex-col relative bg-white dark:bg-[#111218] border border-slate-200 dark:border-[#2a2d3d] rounded-xl overflow-hidden shadow-sm min-w-0 transition-colors duration-200 hover:border-[#8b5cf6]/50">
                     <PanelHeader icon={<Icons.ShieldCheck size={16} className="text-[#8b5cf6]"/>} title={`Validation (${sourceShort})`} badge="AUTO SYNC" badgeColor="bg-[#8b5cf6]/20 text-[#8b5cf6]" rightElement={<CopyButton text={backText} />} />
                     <div className="flex-1 relative flex flex-col no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
                       <SmartTextArea id="validation" value={backText} placeholder={DEFAULT_VALID_PLACEHOLDER} readOnly={true} fontSize={fontSize} activeBox={activeBox} setActiveBox={setActiveBox} selectionRange={selections.validation} onSelectionChange={handleSelectionChange} isStreaming={isValidating && !isNMTMode} />
                       {isValidating && <div className="absolute top-2 right-4 text-xs font-semibold text-[#8b5cf6] animate-pulse z-20 pointer-events-none tracking-wider">VALIDATING...</div>}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
             <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-[#e2e8f0] flex items-center gap-3"><Icons.History size={26} className="text-[#10b981]" /> 历史记录</h2>
                        {historyList.length > 0 && ( <button onClick={() => syncHistoryToFile([])} className="text-sm px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">清空全部记录</button> )}
                    </div>
                    
                    {historyList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-[#64748b]">
                            <Icons.History size={48} className="mb-4 opacity-50" />
                            <p>暂无翻译记录</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {historyList.map((item) => (
                                <div key={item.id} className="p-4 bg-white dark:bg-[#161824] border border-slate-200 dark:border-[#2a2d3d] rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#1e2130] transition-colors group cursor-pointer" onClick={() => loadHistoryItem(item)}>
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981] shrink-0"><Icons.CheckCircle2 size={20} /></div>
                                        <div className="min-w-0 pr-4">
                                            <div className="text-slate-800 dark:text-[#e2e8f0] font-medium text-base mb-1 truncate">{item.title}</div>
                                            <div className="text-sm text-slate-500 dark:text-[#64748b]">{item.time}</div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-sm text-slate-600 dark:text-[#a1a1aa] mb-1">{item.tokens} Chars</div>
                                        <button className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 -mr-2" onClick={(e) => { e.stopPropagation(); syncHistoryToFile(historyList.filter(h => h.id !== item.id)); }}>删除</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
             </div>
          )}

          {hasLocalAI && activeTab === 'models' && (
             <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col mb-8">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-[#e2e8f0] flex items-center gap-3 mb-2"><Icons.Box size={28} className="text-[#0284c7]" /> 本地引擎管理</h2>
                        <p className="text-slate-500 dark:text-[#64748b] text-sm">将大语言模型下载至本地，实现完全离线、零延迟且保护绝对隐私的极速翻译。支持部署过程实时暂停和取消。</p>
                    </div>

                    <div className="space-y-5">
                        {LOCAL_MODELS_INFO.map(model => {
                            const currentStatus = localModelsStatus[model.id];
                            const isDownloading = currentStatus.status === 'downloading';
                            const isPaused = currentStatus.status === 'paused';
                            const isReady = currentStatus.status === 'ready';
                            const progress = currentStatus.progress;
                            const isCurrentEngine = appConfig.platform === '本地离线模型 (Local)' && appConfig.modelName === model.id;

                            return (
                                <div key={model.id} className="p-5 bg-white dark:bg-[#161824] border border-slate-200 dark:border-[#2a2d3d] rounded-xl flex flex-col transition-colors relative overflow-hidden group hover:shadow-md">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isReady ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-slate-100 dark:bg-[#1e212b] text-slate-400 dark:text-[#64748b]'}`}>
                                                {isReady ? <Icons.CheckCircle2 size={24} /> : <Icons.Cpu size={24} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <h3 className="text-lg font-bold text-slate-800 dark:text-[#e2e8f0]">{model.name}</h3>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 dark:bg-[#2a2d3d] text-slate-500 dark:text-[#a1a1aa]">{model.size}</span>
                                                    {model.isNMT ? (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20">FAST NMT</span>
                                                    ) : (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20">LLM CORE</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-[#8b96a5] leading-relaxed max-w-2xl">{model.desc}</p>
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex flex-col items-end justify-center min-w-[200px]">
                                            {(isDownloading || isPaused) ? (
                                                <div className="flex flex-col items-end w-full gap-3">
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="text-xs text-slate-400">{isPaused ? '已暂停部署' : '正在获取模型权重...'}</span>
                                                        <span className={`text-sm font-semibold ${isPaused ? 'text-amber-500' : 'text-[#0284c7]'}`}>{progress}%</span>
                                                    </div>
                                                    
                                                    <div className="absolute bottom-0 left-0 h-1.5 bg-slate-200 dark:bg-[#2a2d3d] w-full">
                                                        <div className={`h-full ${isPaused ? 'bg-amber-500' : 'bg-[#0284c7]'} transition-all duration-300 ease-out`} style={{ width: `${progress}%` }}></div>
                                                    </div>

                                                    <div className="flex items-center gap-2 relative z-10 w-full justify-end">
                                                        {isPaused ? (
                                                            <button onClick={() => handleResumeModel(model.id)} className="px-3 py-1.5 rounded-md bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 transition-colors flex items-center gap-1.5 text-xs font-semibold" title="恢复"><Icons.PlayCircle size={14} /> 恢复</button>
                                                        ) : (
                                                            <button onClick={() => handlePauseModel(model.id)} className="px-3 py-1.5 rounded-md bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 text-xs font-semibold" title="暂停"><Icons.Pause size={14} /> 暂停</button>
                                                        )}
                                                        <button onClick={() => handleCancelModel(model.id)} className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center gap-1.5 text-xs font-semibold" title="取消"><Icons.X size={14} /> 取消</button>
                                                    </div>
                                                </div>
                                            ) : isReady ? (
                                                isCurrentEngine ? (
                                                    <div className="flex items-center gap-1.5 text-[#10b981] font-medium text-sm px-4 py-2 bg-[#10b981]/10 rounded-lg">
                                                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span></span>
                                                        引擎运行中
                                                    </div>
                                                ) : (
                                                    <button onClick={() => {
                                                        setAppConfig(prev => ({...prev, platform: '本地离线模型 (Local)', modelName: model.id}));
                                                        setActiveTab('home');
                                                    }} className="px-5 py-2 text-sm bg-white dark:bg-[#1e212b] border border-[#10b981]/50 text-[#10b981] hover:bg-[#10b981] hover:text-white rounded-lg transition-colors flex items-center gap-1.5">
                                                        <Icons.PlayCircle size={16} /> 设为当前引擎
                                                    </button>
                                                )
                                            ) : (
                                                <button onClick={() => handleDownloadModel(model.id)} className="px-5 py-2 text-sm bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
                                                    <Icons.Download size={16} /> 下载部署
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
             </div>
          )}
        </div>
        
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-white/95 dark:bg-[#141621]/95 backdrop-blur-md p-2 px-3 rounded-2xl shadow-2xl border border-slate-200 dark:border-[#2a2d3d] transition-all duration-500 ${isPinned ? 'opacity-100 pointer-events-auto translate-y-0 scale-100' : 'opacity-0 pointer-events-none translate-y-10 scale-95'}`}>
          <div className="pywebview-drag-region absolute inset-0 w-full h-full rounded-2xl cursor-move"></div>
          <div className="flex flex-col items-center justify-center px-2 no-drag relative z-10 pointer-events-none">
              <span className="text-[13px] font-bold text-slate-700 dark:text-[#e2e8f0] tracking-widest">沉浸模式</span>
              <span className="text-[10px] text-slate-400 font-medium">按住此处拖拽</span>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-[#2a2d3d] relative z-10 pointer-events-none"></div>
          <button 
            onClick={handleTogglePin} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors no-drag relative z-10 shadow-sm"
            title="取消置顶 (退出沉浸模式)"
          >
            <Icons.Pin size={16} className="fill-current" />
          </button>
        </div>

      </div>

      <FirstRunModal
        isOpen={hasLocalAI && isFirstRunModalOpen}
        onClose={() => setIsFirstRunModalOpen(false)}
        onDeploy={() => {
            setIsFirstRunModalOpen(false);
            setAppConfig(prev => ({...prev, platform: '本地离线模型 (Local)', modelName: 'opus-mt'}));
            setActiveTab('models');
            handleDownloadModel('opus-mt');
        }}
      />
      
      <ConfigModal 
        isOpen={isConfigModalOpen} 
        onClose={() => setIsConfigModalOpen(false)} 
        config={appConfig} 
        onSave={(newConfig) => { setAppConfig(newConfig); setIsConfigModalOpen(false); }} 
        platforms={availablePlatforms} 
        onOpenUrl={openExternalLink} 
        onSwitchToModelHub={() => setActiveTab(hasLocalAI ? 'models' : 'home')}
      />
      
      <SponsorModal isOpen={isSponsorModalOpen} onClose={() => setIsSponsorModalOpen(false)} onSponsor={() => { openExternalLink('https://ifdian.net/a/dooublemai'); setIsSponsorModalOpen(false); }} />

      <div 
        className="absolute bottom-0 right-0 w-6 h-6 z-[9999] flex items-end justify-end p-1.5 opacity-60 cursor-nwse-resize hover:opacity-100 transition-opacity no-drag"
        style={{ WebkitAppRegion: 'no-drag' }}
        onMouseDown={handleWindowResizeMouseDown}
        title="按住拖动以缩放窗口"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-slate-400 dark:text-[#52525b] pointer-events-none">
          <path d="M11 1L1 11M11 6L6 11M11 11L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

    </div>
  );
}

export default App;
