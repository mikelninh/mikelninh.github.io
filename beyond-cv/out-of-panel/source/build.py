from pathlib import Path
import re

P = Path(__file__).parent


def exports_map(spec):
    result = []
    for item in spec.split(','):
        parts = re.split(r'\s+as\s+', item.strip())
        source = parts[0]
        public = parts[1] if len(parts) == 2 else source
        result.append(public + ':' + source)
    return ','.join(result)


def portable_three():
    """Convert the two pinned ESM distributions into isolated lazy scopes.

    There is no runtime CDN, eval, bundler or network dependency. Keep the
    original distributions and MIT licence alongside this reproducible build.
    """
    core = (P / 'vendor/three.core.min.js').read_text()
    module = (P / 'vendor/three.module.min.js').read_text()
    core_export = re.search(r'export\{([^}]+)\};\s*$', core)
    imports = re.search(r'import\{([^}]+)\}from[\"\']\./three.core.min.js[\"\'];', module)
    module_export = re.search(r'export\{([^}]+)\};\s*$', module)
    if not all([core_export, imports, module_export]):
        raise RuntimeError('Pinned Three.js distribution format changed')
    import_map = ','.join(
        ':'.join(re.split(r'\s+as\s+', item.strip()))
        for item in imports[1].split(',')
    )
    core_body = core[:core_export.start()]
    module_body = module[:module_export.start()]
    module_body = module_body.replace(imports[0], '')
    module_body = re.sub(r'export\{[^}]+\}from[\"\']\./three.core.min.js[\"\'];', '', module_body)
    return (
        '/* Three.js r180 · MIT · Copyright 2010–2025 Three.js Authors. */\n'
        'window.FirstLightThree=function(){\n'
        'const core=(()=>{\n' + core_body + '\nreturn {' + exports_map(core_export[1]) + '};})();\n'
        'return (()=>{const {' + import_map + '}=core;\n' + module_body +
        '\nreturn {...core,' + exports_map(module_export[1]) + '};})();\n};\n'
    )


(P / 'vendor/three-r180.js').write_text(portable_three())
h = (P / 'index.html').read_text()
for css in ['style.css', 'wonder.css', 'journey.css']:
    h = h.replace(f'<link rel="stylesheet" href="{css}">', '<style>\n' + (P / css).read_text() + '\n</style>')
for js in ['assets.js', 'coin.js', 'app.js', 'wonder.js', 'vendor/three-r180.js', 'journey.js']:
    h = h.replace(f'<script src="{js}"></script>', '<script>\n' + (P / js).read_text().replace('</script', '<\\/script') + '\n</script>')
(P / 'OUT-OF-PANEL-05.html').write_text(h)
(P.parent / 'index.html').write_text(h)
print('Built OUT OF PANEL 0.5:', len(h), 'characters')
