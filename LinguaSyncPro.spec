# -*- mode: python ; coding: utf-8 -*-

import os
from importlib.util import find_spec


def collect_optional_hiddenimports(*module_names):
    return [module_name for module_name in module_names if find_spec(module_name)]


include_local_ai = os.environ.get('LINGUASYNC_INCLUDE_LOCAL_AI', '1').strip().lower() not in {'0', 'false', 'no', 'off'}
optional_ai_modules = collect_optional_hiddenimports(
    'transformers',
    'torch',
    'sentencepiece',
    'jieba',
) if include_local_ai else []

excluded_modules = []
if not include_local_ai:
    excluded_modules = [
        'torch',
        'transformers',
        'jieba',
        'sentencepiece',
        'tokenizers',
        'safetensors',
        'hf_xet',
    ]

datas = [('frontend/dist', 'frontend/dist'), ('app.ico', '.')]
if os.path.isdir('webview2_fixed'):
    datas.append(('webview2_fixed', 'webview2_fixed'))


a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=['webview', 'clr'] + optional_ai_modules,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=excluded_modules,
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='LinguaSyncPro',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['app.ico'],
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='LinguaSyncPro',
)
