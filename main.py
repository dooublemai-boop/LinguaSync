import webview
import sys
import webbrowser
import os
import re
import json
import mimetypes
import threading
import time
import base64
import urllib.request
import urllib.error
import zipfile
import subprocess
import shutil
import logging
import importlib
from pathlib import Path

# ===================================================================
# 核心 AI 库依赖 (加入 jieba，解决中译英无反应的暗坑)
# ===================================================================
torch = None
MarianMTModel = None
MarianTokenizer = None
AutoTokenizer = None
AutoModelForSeq2SeqLM = None
AutoModelForCausalLM = None
jieba = None
LOCAL_AI_IMPORT_ATTEMPTED = False
LOCAL_AI_IMPORT_AVAILABLE = False


def is_local_ai_enabled():
    flag = os.environ.get('LINGUASYNC_INCLUDE_LOCAL_AI', '1').strip().lower()
    return flag not in {'0', 'false', 'no', 'off'}


def load_local_ai_dependencies():
    global torch, MarianMTModel, MarianTokenizer, AutoTokenizer, AutoModelForSeq2SeqLM, AutoModelForCausalLM, jieba
    global LOCAL_AI_IMPORT_ATTEMPTED, LOCAL_AI_IMPORT_AVAILABLE

    if not is_local_ai_enabled():
        return False

    if LOCAL_AI_IMPORT_ATTEMPTED:
        return LOCAL_AI_IMPORT_AVAILABLE

    LOCAL_AI_IMPORT_ATTEMPTED = True

    try:
        start_time = time.perf_counter()
        torch = importlib.import_module('torch')
        transformers = importlib.import_module('transformers')
        MarianMTModel = transformers.MarianMTModel
        MarianTokenizer = transformers.MarianTokenizer
        AutoTokenizer = transformers.AutoTokenizer
        AutoModelForSeq2SeqLM = transformers.AutoModelForSeq2SeqLM
        AutoModelForCausalLM = transformers.AutoModelForCausalLM
        jieba = importlib.import_module('jieba')
        LOCAL_AI_IMPORT_AVAILABLE = True
        logging.info('Local AI runtime loaded in %.2fs', time.perf_counter() - start_time)
        return True
    except ImportError as e:
        LOCAL_AI_IMPORT_AVAILABLE = False
        logging.warning('Local AI runtime unavailable: %s', e)
        return False


HAS_AI_LIBS = False

mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/svg+xml', '.svg')

APP_NAME = "LinguaSync Pro IDE" 
APP_DIR_NAME = "LinguaSyncPro"
MAJOR_VERSION = 2
MINOR_VERSION = 2  # 优化版本
BUILD_NUMBER = 1
FULL_APP_NAME = f"{APP_NAME} V{MAJOR_VERSION}.{MINOR_VERSION}.{BUILD_NUMBER}"

LANGUAGE_KEYWORDS = {
    'en': ['english', 'en'],
    'zh': ['simplified chinese', 'traditional chinese', 'chinese', 'simplified', 'traditional', 'zh'],
    'ja': ['japanese', 'ja'],
    'ko': ['korean', 'ko'],
    'ru': ['russian', 'ru'],
    'es': ['spanish', 'es'],
    'fr': ['french', 'fr'],
    'de': ['german', 'de'],
    'pt': ['portuguese', 'pt'],
    'it': ['italian', 'it'],
    'ar': ['arabic', 'ar'],
}

NLLB_LANGUAGE_CODES = {
    'en': 'eng_Latn',
    'zh': 'zho_Hans',
    'ja': 'jpn_Jpan',
    'ko': 'kor_Hang',
    'ru': 'rus_Cyrl',
    'es': 'spa_Latn',
    'fr': 'fra_Latn',
    'de': 'deu_Latn',
    'pt': 'por_Latn',
    'it': 'ita_Latn',
    'ar': 'arb_Arab',
}

MODEL_SPECS = {
    'opus-mt': {
        'repos': [
            {'repo_id': 'Helsinki-NLP/opus-mt-en-zh', 'path_name': 'Helsinki-NLP_opus-mt-en-zh'},
            {'repo_id': 'Helsinki-NLP/opus-mt-zh-en', 'path_name': 'Helsinki-NLP_opus-mt-zh-en'},
        ],
        'required_files': ['config.json', 'tokenizer_config.json'],
        'weight_files': ['model.safetensors', 'pytorch_model.bin'],
        'tokenizer_files': ['source.spm', 'target.spm', 'vocab.json'],
        'allow_patterns': ['*.json', '*.safetensors', '*.bin', '*.spm', '*.txt', '*.model'],
    },
    'nllb-200': {
        'repos': [
            {'repo_id': 'facebook/nllb-200-distilled-600M', 'path_name': 'facebook_nllb-200-distilled-600M'},
        ],
        'required_files': ['config.json', 'tokenizer_config.json'],
        'weight_files': ['model.safetensors', 'pytorch_model.bin'],
        'tokenizer_files': ['tokenizer.json'],
        'allow_patterns': ['*.json', '*.safetensors', '*.bin', '*.model'],
    },
    'qwen-1.5b': {
        'repos': [
            {'repo_id': 'Qwen/Qwen2.5-1.5B', 'path_name': 'Qwen_Qwen2.5-1.5B'},
        ],
        'required_files': ['config.json', 'tokenizer_config.json'],
        'weight_files': ['model.safetensors', 'pytorch_model.bin'],
        'tokenizer_files': ['tokenizer.json'],
        'allow_patterns': ['*.json', '*.safetensors', '*.bin', '*.model'],
    },
}

def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath(os.path.dirname(__file__)), relative_path)

def get_base_path():
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    return os.path.abspath(os.path.dirname(__file__))

def get_user_app_dir():
    root = os.environ.get('LOCALAPPDATA') or os.environ.get('APPDATA') or os.path.expanduser('~')
    app_dir = os.path.join(root, APP_DIR_NAME)
    os.makedirs(app_dir, exist_ok=True)
    return app_dir

def get_data_dir():
    base = get_user_app_dir() if getattr(sys, 'frozen', False) else get_base_path()
    data_dir = os.path.join(base, 'data')
    os.makedirs(data_dir, exist_ok=True)
    return data_dir

def get_model_dir():
    base = get_user_app_dir() if getattr(sys, 'frozen', False) else get_base_path()
    model_dir = os.path.join(base, 'models')
    os.makedirs(model_dir, exist_ok=True)
    return model_dir

def get_log_file():
    log_dir = os.path.join(get_user_app_dir(), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    return os.path.join(log_dir, 'startup.log')

def get_bundled_webview2_dir():
    runtime_root = Path(get_resource_path('webview2_fixed'))
    if not runtime_root.exists():
        return None

    direct_exe = runtime_root / 'msedgewebview2.exe'
    if direct_exe.exists():
        return str(runtime_root)

    for candidate in runtime_root.rglob('msedgewebview2.exe'):
        return str(candidate.parent)
    return None

def setup_logging():
    logging.basicConfig(
        filename=get_log_file(),
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
        encoding='utf-8'
    )
    logging.info('Application bootstrapping started')

# ===================================================================
# 核心修复：定义新老两个版本的数据路径
# ===================================================================
HISTORY_FILE = os.path.join(get_data_dir(), 'history.json')
OLD_HISTORY_FILE = os.path.join(get_base_path(), 'history.json')
FLAG_FILE = os.path.join(get_data_dir(), 'first_run.flag')
OLD_FLAG_FILE = os.path.join(get_base_path(), 'first_run.flag')

def get_logo_html():
    icon_path = get_resource_path('app.ico')
    if os.path.exists(icon_path):
        try:
            with open(icon_path, 'rb') as f:
                b64_data = base64.b64encode(f.read()).decode('utf-8')
                return f'<img src="data:image/x-icon;base64,{b64_data}" width="36" height="36" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />'
        except:
            pass
    return '<svg class="logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>'


def get_app_icon_data_uri():
    icon_path = get_resource_path('app.ico')
    if not os.path.exists(icon_path):
        return None

    try:
        with open(icon_path, 'rb') as f:
            b64_data = base64.b64encode(f.read()).decode('utf-8')
        return f'data:image/x-icon;base64,{b64_data}'
    except Exception:
        return None


def detect_language_code(label):
    normalized = (label or '').strip().lower()
    for language_code, keywords in LANGUAGE_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return language_code
    return None


def get_model_spec(model_id):
    return MODEL_SPECS.get(model_id)


def get_model_repo_path(repo_entry):
    return os.path.join(get_model_dir(), repo_entry['path_name'])


def is_model_repo_complete(repo_entry, base_path=None):
    model_path = base_path or get_model_repo_path(repo_entry)
    if not os.path.isdir(model_path):
        return False

    spec = next((spec for spec in MODEL_SPECS.values() if repo_entry in spec['repos']), None)
    if spec is None:
        return False

    required_files = all(os.path.exists(os.path.join(model_path, name)) for name in spec['required_files'])
    has_weight_file = any(os.path.exists(os.path.join(model_path, name)) for name in spec['weight_files'])
    has_tokenizer_file = any(os.path.exists(os.path.join(model_path, name)) for name in spec['tokenizer_files'])
    return required_files and has_weight_file and has_tokenizer_file


def is_model_complete(model_id):
    spec = get_model_spec(model_id)
    if not spec:
        return False
    return all(is_model_repo_complete(repo_entry) for repo_entry in spec['repos'])


def fix_taskbar_click(window_title):
    if sys.platform == 'win32':
        import ctypes
        try:
            hwnd = ctypes.windll.user32.FindWindowW(None, window_title)
            if hwnd:
                GWL_STYLE = -16
                WS_MINIMIZEBOX = 0x00020000
                style = ctypes.windll.user32.GetWindowLongW(hwnd, GWL_STYLE)
                ctypes.windll.user32.SetWindowLongW(hwnd, GWL_STYLE, style | WS_MINIMIZEBOX)
        except Exception as e:
            pass

def setup_tray(api_instance):
    try:
        import pystray
        from PIL import Image, ImageDraw

        def create_image():
            image = Image.new('RGB', (64, 64), color = (10, 10, 12))
            d = ImageDraw.Draw(image)
            d.rectangle((16, 16, 48, 48), fill=(2, 132, 199))
            return image

        icon_path = get_resource_path('app.ico')
        if os.path.exists(icon_path):
            icon_image = Image.open(icon_path)
        else:
            icon_image = create_image()
            
        def on_show(icon, item):
            if api_instance.main_window:
                api_instance.main_window.restore()
                api_instance.main_window.show()

        def on_exit(icon, item):
            icon.stop()
            os._exit(0)

        menu = pystray.Menu(
            pystray.MenuItem('显示窗口 (Show)', on_show, default=True),
            pystray.MenuItem('退出 (Exit)', on_exit)
        )
        
        icon = pystray.Icon("LinguaSync", icon_image, "LinguaSync Pro", menu)
        icon.run()
    except ImportError:
        pass


class Api:
    def __init__(self):
        self.is_pinned = False
        self.main_window = None
        self.splash_window = None
        self.is_ready = False
        self.splash_closed = False 
        self.lock = threading.Lock() 
        self.model_cache = {}
        self.download_states = {}

    def set_windows(self, main_win, splash_win):
        self.main_window = main_win
        self.splash_window = splash_win

    def get_app_version(self): 
        return FULL_APP_NAME

    def get_capabilities(self):
        return {
            'local_ai': is_local_ai_enabled(),
        }

    def get_app_icon_data(self):
        return get_app_icon_data_uri()

    def get_local_model_statuses(self):
        statuses = {}
        for model_id in MODEL_SPECS:
            statuses[model_id] = {
                'status': 'ready' if is_model_complete(model_id) else 'none',
                'progress': 100 if is_model_complete(model_id) else 0,
            }
        return statuses

    def toggle_pin(self):
        if self.main_window:
            self.is_pinned = not self.is_pinned
            def _set_on_top():
                time.sleep(0.05)
                try:
                    self.main_window.on_top = self.is_pinned
                except:
                    pass
            threading.Thread(target=_set_on_top, daemon=True).start()
            return self.is_pinned
        return False

    def minimize(self): 
        if self.main_window: 
            try: self.main_window.minimize()
            except: pass

    def toggle_maximize(self): 
        if self.main_window: 
            try: self.main_window.toggle_fullscreen()
            except: pass

    def close(self): 
        if self.main_window: 
            try: self.main_window.destroy()
            except: pass
            os._exit(0)

    def resize_window(self, width, height):
        if self.main_window: 
            try: self.main_window.resize(int(width), int(height))
            except: pass
    
    # ===================================================================
    # 【修复点】首次运行检测 - 智能兼容老版本位置
    # ===================================================================
    def check_first_run(self):
        if os.path.exists(OLD_FLAG_FILE) and not os.path.exists(FLAG_FILE):
            try:
                shutil.copy(OLD_FLAG_FILE, FLAG_FILE)
            except: pass
            
        if not os.path.exists(FLAG_FILE):
            try:
                with open(FLAG_FILE, 'w') as f: f.write('done')
                return True
            except: pass
        return False

    def check_downloaded_models(self):
        return [model_id for model_id in MODEL_SPECS if is_model_complete(model_id)]

    def pause_model_download(self, model_id):
        if model_id in self.download_states:
            self.download_states[model_id]['status'] = 'paused'

    def resume_model_download(self, model_id):
        if model_id in self.download_states:
            self.download_states[model_id]['status'] = 'downloading'

    def cancel_model_download(self, model_id):
        if model_id in self.download_states:
            self.download_states[model_id]['status'] = 'cancelled'

    def download_local_model(self, model_id):
        def _task():
            if not load_local_ai_dependencies():
                if self.main_window: self.main_window.evaluate_js(f"alert('缺少AI依赖！请检查打包环境。')")
                return
            
            repos = []
            if model_id == 'opus-mt':
                repos = ["Helsinki-NLP/opus-mt-en-zh", "Helsinki-NLP/opus-mt-zh-en"]
            elif model_id == 'nllb-200':
                repos = ["facebook/nllb-200-distilled-600M"]
            elif model_id == 'qwen-1.5b':
                repos = ["Qwen/Qwen2.5-1.5B"]
                
            self.download_states[model_id] = {'status': 'downloading', 'progress': 0}
            total_repos = len(repos)

            try:
                for i, repo in enumerate(repos):
                    save_path = os.path.join(get_model_dir(), repo.replace("/", "_"))
                    os.makedirs(save_path, exist_ok=True)
                    
                    base_prog = (i / total_repos) * 100
                    
                    def _progress_sim():
                        p = base_prog
                        target = base_prog + (100 / total_repos) * 0.95
                        while p < target:
                            state = self.download_states.get(model_id, {})
                            if state.get('status') == 'cancelled': break
                            
                            while state.get('status') == 'paused':
                                time.sleep(1)
                                state = self.download_states.get(model_id, {})
                                if state.get('status') == 'cancelled': break
                                
                            time.sleep(1.5)
                            p += max(0.5, (target - p) / 20)
                            if p > target: p = target
                            
                            state['progress'] = min(99, int(p))
                            if self.main_window and state.get('status') != 'cancelled':
                                self.main_window.evaluate_js(f"if(window.updateModelProgress) window.updateModelProgress('{model_id}', {state['progress']}, '{state['status']}')")

                    prog_thread = threading.Thread(target=_progress_sim, daemon=True)
                    prog_thread.start()
                    
                    if model_id == 'nllb-200' or model_id == 'qwen-1.5b':
                        AutoTokenizer.from_pretrained(repo).save_pretrained(save_path)
                        AutoModelForSeq2SeqLM.from_pretrained(repo).save_pretrained(save_path)
                    else:
                        MarianTokenizer.from_pretrained(repo).save_pretrained(save_path)
                        MarianMTModel.from_pretrained(repo).save_pretrained(save_path)
                    
                    state = self.download_states.get(model_id, {})
                    if state.get('status') == 'cancelled':
                        shutil.rmtree(save_path, ignore_errors=True)
                        return

                state = self.download_states.get(model_id, {})
                if state.get('status') != 'cancelled':
                    state['progress'] = 100
                    state['status'] = 'ready'
                    if self.main_window: 
                        self.main_window.evaluate_js(f"if(window.updateModelProgress) window.updateModelProgress('{model_id}', 100, 'ready')")
                        
            except Exception as e:
                state = self.download_states.get(model_id, {})
                state['status'] = 'error'
                if self.main_window: self.main_window.evaluate_js(f"console.error('部署失败: {str(e)}'); if(window.updateModelProgress) window.updateModelProgress('{model_id}', 0, 'none');")

        threading.Thread(target=_task, daemon=True).start()
        return True

    def download_local_model(self, model_id):
        spec = get_model_spec(model_id)
        if spec is None:
            return False

        def emit_progress(progress, status):
            state = self.download_states.setdefault(model_id, {'status': status, 'progress': progress})
            state['status'] = status
            state['progress'] = int(progress)
            if self.main_window:
                self.main_window.evaluate_js(
                    f"if(window.updateModelProgress) window.updateModelProgress('{model_id}', {int(progress)}, '{status}')"
                )

        def simulate_progress(start_progress, target_progress, stop_event):
            progress = start_progress
            while not stop_event.is_set() and progress < target_progress:
                state = self.download_states.get(model_id, {})
                if state.get('status') == 'cancelled':
                    return
                if state.get('status') == 'paused':
                    time.sleep(0.5)
                    continue
                time.sleep(1)
                progress = min(target_progress, progress + max(1, int((target_progress - progress) / 6) or 1))
                emit_progress(progress, state.get('status', 'downloading'))

        def _task():
            if is_model_complete(model_id):
                emit_progress(100, 'ready')
                return

            try:
                from huggingface_hub import snapshot_download
            except ImportError:
                emit_progress(0, 'none')
                if self.main_window:
                    self.main_window.evaluate_js("alert('缺少模型下载组件，请检查打包环境。')")
                return

            emit_progress(1, 'downloading')
            total_repos = len(spec['repos'])

            try:
                for index, repo_entry in enumerate(spec['repos']):
                    final_path = get_model_repo_path(repo_entry)
                    temp_path = f"{final_path}.partial"

                    if is_model_repo_complete(repo_entry):
                        emit_progress(int(((index + 1) / total_repos) * 100), 'downloading')
                        continue

                    shutil.rmtree(temp_path, ignore_errors=True)
                    if os.path.isdir(final_path) and not is_model_repo_complete(repo_entry):
                        shutil.rmtree(final_path, ignore_errors=True)

                    start_progress = int((index / total_repos) * 100) + 1
                    target_progress = min(95, int(((index + 0.9) / total_repos) * 100))
                    stop_event = threading.Event()
                    progress_thread = threading.Thread(
                        target=simulate_progress,
                        args=(start_progress, target_progress, stop_event),
                        daemon=True,
                    )
                    progress_thread.start()

                    logging.info('Downloading model repo %s to %s', repo_entry['repo_id'], temp_path)
                    snapshot_download(
                        repo_entry['repo_id'],
                        local_dir=temp_path,
                        allow_patterns=spec['allow_patterns'],
                        max_workers=4,
                    )

                    stop_event.set()
                    progress_thread.join(timeout=1)

                    if not is_model_repo_complete(repo_entry, temp_path):
                        raise RuntimeError(f"模型文件不完整: {repo_entry['repo_id']}")

                    shutil.rmtree(final_path, ignore_errors=True)
                    shutil.move(temp_path, final_path)
                    emit_progress(int(((index + 1) / total_repos) * 100), 'downloading')

                emit_progress(100, 'ready')
                logging.info('Model %s is ready', model_id)
            except Exception as e:
                logging.exception('Model deployment failed for %s: %s', model_id, e)
                for repo_entry in spec['repos']:
                    shutil.rmtree(f"{get_model_repo_path(repo_entry)}.partial", ignore_errors=True)
                emit_progress(0, 'none')
                if self.main_window:
                    self.main_window.evaluate_js(
                        f"console.error('部署失败: {str(e)}'); if(window.updateModelProgress) window.updateModelProgress('{model_id}', 0, 'none');"
                    )

        threading.Thread(target=_task, daemon=True).start()
        return True

    def translate_local(self, text, model_id, src_l, tgt_l):
        if not load_local_ai_dependencies(): return "[环境错误] 缺少 AI 运行库组件"
        try:
            s = detect_language_code(src_l)
            t = detect_language_code(tgt_l)

            if not s or not t:
                return "[错误] 当前本地引擎无法识别所选语言，请切换在线翻译或其他本地引擎。"
            if s == t: return text
            
            device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
            
            lines = text.split('\n')
            valid_lines = [l for l in lines if l.strip()]
            
            if not valid_lines:
                return text
            
            res_valid = []
            
            if model_id == 'opus-mt':
                if {s, t} - set(['en', 'zh']):
                    return "[错误] Opus-MT 当前仅支持中英互译，请切换到 NLLB-200 引擎。"
                repo_id = f"Helsinki-NLP_opus-mt-{s}-{t}"
                model_path = os.path.join(get_model_dir(), repo_id)
                if not os.path.exists(model_path):
                    return f"[错误] 模型 '{repo_id}' 不存在，请重新下载。"
                
                if repo_id not in self.model_cache:
                    tk = MarianTokenizer.from_pretrained(model_path)
                    md = MarianMTModel.from_pretrained(model_path).to(device)
                    self.model_cache[repo_id] = (tk, md)
                
                tk, md = self.model_cache[repo_id]
                
                inputs = tk(valid_lines, return_tensors="pt", padding=True, truncation=True).to(device)
                with torch.no_grad():
                    outputs = md.generate(**inputs, max_length=512)
                res_valid = [tk.decode(out, skip_special_tokens=True) for out in outputs]
                
            elif model_id == 'nllb-200':
                repo_id = "facebook_nllb-200-distilled-600M"
                model_path = os.path.join(get_model_dir(), repo_id)
                if not os.path.exists(model_path):
                    return f"[错误] 模型 NLLB-200 不存在，请重新下载。"
                
                if repo_id not in self.model_cache:
                    tk = AutoTokenizer.from_pretrained(model_path)
                    md = AutoModelForSeq2SeqLM.from_pretrained(model_path).to(device)
                    self.model_cache[repo_id] = (tk, md)
                
                tk, md = self.model_cache[repo_id]
                
                src_lang_code = NLLB_LANGUAGE_CODES.get(s)
                tgt_lang_code = NLLB_LANGUAGE_CODES.get(t)
                if not src_lang_code or not tgt_lang_code:
                    return "[错误] NLLB-200 当前不支持所选语言组合。"
                
                tk.src_lang = src_lang_code
                inputs = tk(valid_lines, return_tensors="pt", padding=True, truncation=True).to(device)

                lang_code_to_id = getattr(tk, 'lang_code_to_id', None)
                if isinstance(lang_code_to_id, dict):
                    forced_bos_token_id = lang_code_to_id[tgt_lang_code]
                else:
                    forced_bos_token_id = tk.convert_tokens_to_ids(tgt_lang_code)
                with torch.no_grad():
                    outputs = md.generate(**inputs, forced_bos_token_id=forced_bos_token_id, max_length=512)
                res_valid = [tk.decode(out, skip_special_tokens=True) for out in outputs]
                
            elif model_id == 'qwen-1.5b':
                repo_id = "Qwen_Qwen2.5-1.5B"
                model_path = os.path.join(get_model_dir(), repo_id)
                if not os.path.exists(model_path):
                    return "[错误] 模型 Qwen2.5-1.5B 不存在，请重新下载。"

                if repo_id not in self.model_cache:
                    tk = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
                    md = AutoModelForCausalLM.from_pretrained(model_path, trust_remote_code=True).to(device)
                    if tk.pad_token_id is None:
                        tk.pad_token_id = tk.eos_token_id
                    self.model_cache[repo_id] = (tk, md)

                tk, md = self.model_cache[repo_id]
                prompt = (
                    f"You are a professional translator.\n"
                    f"Translate the following text from {src_l} to {tgt_l}.\n"
                    "Keep the exact line count and line breaks.\n"
                    "Output only the translated text.\n\n"
                    f"{text}"
                )

                if hasattr(tk, 'apply_chat_template'):
                    messages = [
                        {'role': 'system', 'content': 'You are a professional translator. Output only the translated text.'},
                        {'role': 'user', 'content': prompt},
                    ]
                    input_text = tk.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
                else:
                    input_text = prompt

                inputs = tk(input_text, return_tensors="pt").to(device)
                input_length = inputs['input_ids'].shape[-1]
                with torch.no_grad():
                    outputs = md.generate(
                        **inputs,
                        max_new_tokens=max(256, min(2048, len(text) * 4)),
                        do_sample=False,
                        pad_token_id=tk.pad_token_id,
                        eos_token_id=tk.eos_token_id,
                    )

                generated = tk.decode(outputs[0][input_length:], skip_special_tokens=True).strip()
                return generated or "[错误] Qwen 本地翻译未生成结果。"

            else:
                return f"[错误] 暂不支持直接运行该模型: {model_id}"
                
            final_res = []
            v_idx = 0
            for l in lines:
                if l.strip():
                    final_res.append(res_valid[v_idx])
                    v_idx += 1
                else:
                    final_res.append("")
                    
            return "\n".join(final_res)
            
        except Exception as e:
            return f"[翻译异常]: {str(e)}"

    def app_is_ready(self):
        with self.lock:
            if self.is_ready: 
                return True
            self.is_ready = True
        logging.info('App marked as ready')

        if self.splash_window: 
            try:
                self.splash_window.evaluate_js('if(window.completeLoading) window.completeLoading()')
                self.splash_window.hide()
            except Exception as e:
                logging.exception('Failed to update splash progress UI: %s', e)

        def _close_hidden_splash():
            self.close_splash()

        threading.Thread(target=_close_hidden_splash, daemon=True).start()

        if self.main_window: 
            try: 
                self.main_window.show()
                fix_taskbar_click(FULL_APP_NAME)
            except Exception as e:
                logging.exception('Failed to show main window: %s', e)

        return True

    def close_splash(self):
        with self.lock:
            if self.splash_closed:
                return
            self.splash_closed = True
            
        if self.splash_window: 
            try: 
                self.splash_window.destroy()
            except Exception as e: 
                logging.exception('Failed to destroy splash window: %s', e)
            self.splash_window = None

    # ===================================================================
    # 【核心修复】历史记录加载 - 自动检测并迁移根目录遗留的旧数据
    # ===================================================================
    def load_history(self):
        # 兼容逻辑：如果根目录有 history.json，且新目录下没有，自动做一次无损迁移
        if os.path.exists(OLD_HISTORY_FILE) and not os.path.exists(HISTORY_FILE):
            try:
                shutil.copy(OLD_HISTORY_FILE, HISTORY_FILE)
                # 为防止下次误读，将老文件备份改名
                os.rename(OLD_HISTORY_FILE, OLD_HISTORY_FILE + '.bak')
            except Exception as e:
                print(f"数据迁移失败: {e}")

        # 正常读取新目录的数据
        if os.path.exists(HISTORY_FILE):
            try:
                with open(HISTORY_FILE, 'r', encoding='utf-8') as f: return json.load(f)
            except: pass
        return []

    def save_history(self, history_list):
        try:
            with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
                json.dump(history_list, f, ensure_ascii=False, indent=2)
            return True
        except: return False

    def open_url(self, url):
        if url: webbrowser.open(url)


SPLASH_HTML = """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    body { background-color: #0a0a0c; background-image: radial-gradient(circle at 50% 0%, #1e293b 0%, #0a0a0c 80%); color: #e2e8f0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; -webkit-app-region: drag; user-select: none; border: 1px solid #2a2d3d; border-radius: 12px; box-sizing: border-box; overflow: hidden; }
    .logo { font-size: 28px; font-weight: 800; color: #e2e8f0; margin-bottom: 25px; display:flex; align-items:center; gap:12px; letter-spacing: -0.5px;}
    .progress-wrapper { width: 220px; margin-top: 10px; }
    .progress-bar { width: 100%; height: 4px; background-color: #1e293b; border-radius: 4px; overflow: hidden; position: relative; }
    .progress-fill { height: 100%; width: 0%; background-color: #0284c7; border-radius: 4px; transition: width 0.1s ease-out; box-shadow: 0 0 10px #0284c780; }
    .status-row { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: #64748b; font-weight: 500; }
    .version { position: absolute; bottom: 16px; font-size: 11px; color: #475569; letter-spacing: 1px;}
  </style>
</head>
<body>
  <div class="logo">
    __LOGO_HTML__
    __APP_NAME__
  </div>
  <div class="progress-wrapper">
    <div class="progress-bar"><div class="progress-fill" id="fill"></div></div>
    <div class="status-row">
      <span id="msg">正在加载核心引擎...</span>
      <span id="pct">0%</span>
    </div>
  </div>
  <div class="version">__APP_VERSION__ (AI Engine Edition)</div>
  <script>
    let p = 0;
    const fill = document.getElementById('fill');
    const pct = document.getElementById('pct');
    const msg = document.getElementById('msg');
    const msgs = ['加载本地配置...', '初始化 AI 模型...', '读取核心模块...', '正在渲染界面...'];
    
    const interval = setInterval(() => {
        p += Math.random() * 20 + 10; 
        if(p >= 95) p = 95;
        fill.style.width = p + '%';
        pct.innerText = Math.floor(p) + '%';
        if(p > 20 && p <= 50) msg.innerText = msgs[1];
        if(p > 50 && p <= 80) msg.innerText = msgs[2];
        if(p > 80) msg.innerText = msgs[3];
    }, 40);

    window.completeLoading = () => {
        clearInterval(interval);
        fill.style.transition = 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        fill.style.width = '100%';
        pct.innerText = '100%';
        msg.innerText = '加载完成';
    };
  </script>
</body>
</html>
"""
SPLASH_HTML = SPLASH_HTML.replace("__APP_NAME__", APP_NAME)\
                         .replace("__APP_VERSION__", f"V{MAJOR_VERSION}.{MINOR_VERSION}.{BUILD_NUMBER}")\
                         .replace("__LOGO_HTML__", get_logo_html())

def get_main_url():
    if getattr(sys, 'frozen', False):
        return Path(get_resource_path(os.path.join('frontend', 'dist', 'index.html'))).resolve().as_uri()
    return 'http://localhost:5173/'

def start_webview(ready_callback=None):
    bundled_runtime_dir = get_bundled_webview2_dir()
    if bundled_runtime_dir:
        os.environ['WEBVIEW2_BROWSER_EXECUTABLE_FOLDER'] = bundled_runtime_dir
        logging.info('Using bundled WebView2 Fixed Version Runtime: %s', bundled_runtime_dir)
    else:
        os.environ.pop('WEBVIEW2_BROWSER_EXECUTABLE_FOLDER', None)
        logging.info('No bundled WebView2 Fixed Version Runtime found')

    try:
        logging.info('Starting pywebview with edgechromium')
        webview.start(
            func=ready_callback,
            gui='edgechromium',
            debug=False,
            private_mode=True,
            storage_path=get_user_app_dir(),
        )
    except Exception as e:
        logging.exception('edgechromium startup failed: %s', e)
        logging.info('Retrying pywebview with automatic GUI selection')
        webview.start(
            func=ready_callback,
            gui=None,
            debug=False,
            private_mode=True,
            storage_path=get_user_app_dir(),
        )

if __name__ == '__main__':
    setup_logging()
    os.chdir(get_base_path()) 
    logging.info('Base path: %s', get_base_path())
    logging.info('User data dir: %s', get_data_dir())
    logging.info('User model dir: %s', get_model_dir())
    
    api = Api()
    main_url = get_main_url()
    logging.info('Main URL: %s', main_url)
    
    main_win = webview.create_window(title=FULL_APP_NAME, url=main_url, width=1400, height=850, min_size=(1024, 768), js_api=api, frameless=True, hidden=True, easy_drag=False, text_select=True)
    splash_win = webview.create_window(title='Loading', html=SPLASH_HTML, width=420, height=260, frameless=True, on_top=True, background_color='#0a0a0c', js_api=api)
    api.set_windows(main_win, splash_win)
    main_win.events.closed += lambda: os._exit(0)
    
    threading.Thread(target=setup_tray, args=(api,), daemon=True).start()
    
    def watchdog_task():
        time.sleep(2)
        if not api.is_ready:
            logging.warning('Frontend readiness callback timed out; forcing main window display')
            try:
                api.app_is_ready()
            except Exception as e:
                logging.exception('Watchdog failed to force main window display: %s', e)
        else:
            api.close_splash()
            
    threading.Thread(target=watchdog_task, daemon=True).start()
    start_webview(api.app_is_ready)
