"""Fixed-year World Development Indicators snapshot; fail closed on missing pages."""
import json, pathlib, sys, urllib.request, datetime, math
BASE="https://api.worldbank.org/v2/"
IDS=("SP.DYN.LE00.IN","IT.NET.USER.ZS","NY.GDP.PCAP.PP.KD")
EU=set("AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE".split())
YEAR=2023
def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"Accept":"application/json","User-Agent":"THE-WAY-Research/1.0"}),timeout=30) as r:
        d=json.load(r)
    if not isinstance(d,list) or len(d)!=2 or not isinstance(d[1],list) or d[0]["pages"]!=1 or d[0]["total"]!=len(d[1]): raise ValueError("Incomplete response")
    return d[1]
def main(out):
    urls=[BASE+"country?format=json&per_page=400"]+[BASE+"country/all/indicator/"+k+"?format=json&date="+str(YEAR)+"&per_page=400" for k in IDS]
    countries={x["id"]:{"id":x["id"],"name":x["name"],"region":x["region"]["value"].strip(),"eu":x["id"] in EU,"values":{}} for x in fetch(urls[0]) if x["region"]["id"]!="NA" and x["region"]["value"]!="Aggregates" and len(x["id"])==3 and x["id"].isalpha()}
    if not EU.issubset(countries) or len(countries)<190: raise ValueError("Country catalog incomplete")
    coverage={}
    for k,url in zip(IDS,urls[1:]):
        seen=set()
        for row in fetch(url):
            if row["date"]!=str(YEAR) or row["indicator"]["id"]!=k: raise ValueError("Unexpected scope")
            code=row["countryiso3code"]
            if code not in countries: continue
            if code in seen: raise ValueError("Duplicate observation")
            seen.add(code);v=row["value"]
            if v is None: continue
            if not isinstance(v,(int,float)) or not math.isfinite(v) or v<0 or (k=="IT.NET.USER.ZS" and v>100) or (k=="SP.DYN.LE00.IN" and v>130): raise ValueError("Invalid observation")
            countries[code]["values"][k]=v
        coverage[k]=sum(k in c["values"] for c in countries.values())
        if coverage[k]<100: raise ValueError("Unexpectedly low coverage")
    snapshot={"schema":"the-way-world-v1","year":YEAR,"source":"World Bank World Development Indicators","retrievedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),"sources":urls,"coverage":coverage,"countries":list(countries.values())}
    pathlib.Path(out).write_text(json.dumps(snapshot,ensure_ascii=False),encoding="utf-8")
if __name__=="__main__":main(sys.argv[1])
