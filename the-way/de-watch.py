#!/usr/bin/env python3
"""Germany Lab: bounded public source checks. Does not publish changes or infer legal status."""
import datetime,hashlib,html.parser,json,re,sys,urllib.request,urllib.parse
from pathlib import Path
ROOT=Path(__file__).parent
data=json.loads((ROOT/"de-lab-data.json").read_text())
sources=[
("Bevölkerung",data["metrics"][0]["source"],["Baden-Württemberg","2025"]),
("Wahlbeteiligung",data["metrics"][1]["source"],["Berlin","2025"]),
("Armutsgefährdung",data["metrics"][2]["source"],["Landesmedian","2024"]),
("Lebenserwartung",data["metrics"][3]["source"],["2022/24","Berlin"]),
("Berlin Bezirke",data["berlin"]["source"],["Treptow-Köpenick","15.312"]),
("MiLoV5","https://www.gesetze-im-internet.de/milov5/__1.html",["13,90","14,60"]),
("RegG","https://www.gesetze-im-internet.de/regg/BJNR239500993.html",["Deutschlandticket"]),
("Kiezfonds","https://www.berlin.de/rathausblock-fk/mitmachen/kiezfonds/",["Kiezfonds"])]
allowed={urllib.parse.urlparse(u).hostname for _,u,_ in sources}
class Safe(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        p=urllib.parse.urlparse(newurl)
        if p.scheme!="https" or p.hostname not in allowed:raise ValueError("unexpected redirect")
        return super().redirect_request(req,fp,code,msg,headers,newurl)
class Parser(html.parser.HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=True);self.parts=[];self.skip=0
    def handle_starttag(self,t,a):
        if t in ("script","style"):self.skip+=1
    def handle_endtag(self,t):
        if t in ("script","style") and self.skip:self.skip-=1
    def handle_data(self,t):
        if not self.skip:self.parts.append(t)
def main():
    old={}
    prior=ROOT/"de-watch-report.json"
    if prior.exists():old={x["url"]:x.get("textSha256") for x in json.loads(prior.read_text())["sources"]}
    results=[]
    for name,url,markers in sources:
        row={"name":name,"url":url,"ok":False,"needsReview":True}
        try:
            req=urllib.request.Request(url,headers={"User-Agent":"THE-WAY-Research/2.0 public source check"})
            with urllib.request.build_opener(Safe()).open(req,timeout=12) as res:
                raw=res.read(3000001)
                if len(raw)>3000000:raise ValueError("size bound")
                p=Parser();p.feed(raw.decode(res.headers.get_content_charset() or "utf-8",errors="replace"))
            text=" ".join(" ".join(p.parts).split())
            digest=hashlib.sha256(text.encode()).hexdigest()
            matches=[m for m in markers if m in text]
            changed=old.get(url)!=digest if old.get(url) else None
            row.update(ok=True,textSha256=digest,markersFound=matches,markersExpected=markers,changedSincePublished=changed,needsReview=changed is not False or len(matches)!=len(markers),note="Initial baseline or changed source requires review; marker presence is not full data validation.")
        except Exception as e:row["error"]=type(e).__name__
        results.append(row)
    report={"checkedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),"sources":results,"publicationApproved":False,"method":"Read-only retrieval, visible text fingerprint and marker checks. Comparison against last manually published baseline, not a full parliamentary feed or automatic data ingestion."}
    Path(sys.argv[1]).write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print("DE_WATCH_RECEIPT "+json.dumps(report,ensure_ascii=True,separators=(",",":")))
if __name__=="__main__":main()
