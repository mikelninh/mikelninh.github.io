"""FastAPI endpoint contract: schema, input limits, and fail-closed source checks."""
import pytest
from fastapi.testclient import TestClient
from api import app
client=TestClient(app)
doc={"name":"Synthetic deck.pdf","pages":[{"number":2,"text":"ARR: €240k\nFunding ask: raising €2.4m\nFounders: two engineers"}]}
claim={"field":"arr","kind":"actual","value":"EUR:240000","source":"Synthetic deck.pdf","page":2,"quote":"ARR: €240k"}

def post(claims,docs=None):
    return client.post("/v1/verify",json={"docs":docs if docs is not None else [doc],"claims":claims})

def test_health_is_minimal():
    r=client.get("/health")
    assert r.status_code==200
    assert r.json()["status"]=="ok"
    assert r.headers["cache-control"]=="no-store"

def test_source_quote_and_normalised_amount_accepted():
    r=post([claim])
    assert r.status_code==200
    body=r.json()
    assert len(body["accepted"])==1
    assert body["rejected"]==[]
    assert body["external_actions"]==0
    assert body["human_review_required"] is True
    assert r.headers["cache-control"]=="no-store"

def test_hallucinated_quote_rejected():
    r=post([{**claim,"quote":"ARR: €500m","value":"EUR:500000000"}])
    assert r.status_code==200
    assert not r.json()["accepted"]
    assert r.json()["rejected"][0]["reason"]=="unverified_quote"

def test_wrong_number_rejected_even_with_real_excerpt():
    r=post([{**claim,"value":"EUR:100"}])
    assert r.json()["rejected"][0]["reason"]=="numeric_mismatch"

def test_wrong_document_name_or_page_rejected():
    assert post([{**claim,"source":"Other deck.pdf"}]).json()["rejected"][0]["reason"]=="unverified_quote"
    assert post([{**claim,"page":3}]).json()["rejected"][0]["reason"]=="unverified_quote"

def test_schema_blocks_extra_fields():
    r=post([{**claim,"investment_recommendation":"approve"}])
    assert r.status_code==422

def test_claim_count_and_document_limits():
    assert post([claim]*81).status_code==422
    assert post([],docs=[doc]*4).status_code==422

def test_empty_and_oversized_page_input():
    assert post([],docs=[{"name":"x","pages":[{"number":1,"text":""}]}]).status_code==422
    assert post([],docs=[{"name":"x","pages":[{"number":1,"text":"a"*30001}]}]).status_code==422

def test_reject_improper_page_shape_and_source():
    assert post([{**claim,"page":"2"}]).status_code==422
    assert post([],docs=[{"name":"","pages":doc["pages"]}]).status_code==422

def test_unknown_field_name_rejected():
    assert post([{**claim,"field":"investment_score"}]).status_code==422

def test_conflicting_source_claims_preserved_for_human_review():
    two={"name":"Updated memo.pdf","pages":[{"number":1,"text":"ARR: €180k"}]}
    c2={"field":"arr","kind":"actual","value":"EUR:180000","source":"Updated memo.pdf","page":1,"quote":"ARR: €180k"}
    body=post([claim,c2],docs=[doc,two]).json()
    assert len(body["accepted"])==2
    assert body["human_review_required"] is True

def test_repeated_claim_deduplicated():
    body=post([claim,claim]).json()
    assert len(body["accepted"])==1
