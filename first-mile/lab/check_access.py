#!/usr/bin/env python3
"""Read-only OpenAI API model availability preflight. No token-generation charges."""
import json
import os
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError
models=["gpt-6-luna","gpt-6.1-sol","gpt-6-astra"]
key=os.environ.get("OPENAI_API_KEY")
if not key:
 print("OpenAI API key missing: cannot check model availability.")
 raise SystemExit(2)
req=Request("https://api.openai.com/v1/models",headers={"Authorization":"Bearer "+key})
try:
 with urlopen(req,timeout=30) as r:
  data=json.load(r)
 available={x.get("id") for x in data.get("data",[]) if isinstance(x,dict)}
 for model in models:
  print(model+": "+("LISTED" if model in available else "NOT LISTED — may not be accessible"))
 print("No completion tokens used. Being listed does not guarantee Responses API permission.")
except HTTPError as e:
 print("Could not list API models (HTTP "+str(e.code)+").")
 raise SystemExit(2)
except URLError:
 print("Could not contact the OpenAI API.")
 raise SystemExit(2)
