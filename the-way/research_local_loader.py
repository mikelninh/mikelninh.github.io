import importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location("research_local",Path(__file__).parent/"research-local.py")
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
ask=mod.ask
MODEL=mod.MODEL
