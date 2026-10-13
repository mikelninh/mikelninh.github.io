import datetime as dt
import io
import json
import unittest
from unittest.mock import patch
from urllib.error import URLError

from ingest import (
    as_codes, build_feed, classify, deadlines_from, first,
    normalise, retrieve, PAGE_SIZE,
)


def sample(number="123456-2026", kind="cn-standard"):
    return {
        "publication-number": number,
        "notice-title": {"eng": ["AI software development"], "deu": ["Softwareentwicklung"]},
        "buyer-name": {"deu": ["Stadt Berlin"]},
        "buyer-country": "DEU",
        "publication-date": "2026-10-10+02:00",
        "notice-type": kind,
        "deadline-receipt-tender-date-lot": {
            "LOT-0002": ["2026-11-15+01:00"],
            "LOT-0001": ["2026-11-10+01:00"],
        },
        "deadline-receipt-request-date-lot": {"LOT-0001": ["2026-10-30+01:00"]},
        "classification-cpv": ["72000000", "72200000", "72000000"],
    }


class IngestTests(unittest.TestCase):
    def test_multilingual_notice_and_lots(self):
        n = normalise(sample())
        self.assertEqual(n["title"], "AI software development")
        self.assertEqual(n["buyer"], "Stadt Berlin")
        self.assertEqual(n["deadline"], "2026-10-30")
        self.assertEqual(n["stage"], "competition")
        self.assertEqual(n["notice_type"], "cn-standard")
        self.assertEqual(len(n["deadlines"]), 3)
        self.assertEqual(n["deadlines"][0]["kind"], "participation")
        self.assertEqual(n["deadlines"][1]["lot"], "LOT-0001")
        self.assertEqual(n["cpv"], ["72000000", "72200000"])
        self.assertEqual(n["url"], "https://ted.europa.eu/en/notice/-/detail/123456-2026")

    def test_notice_classification(self):
        for code in ["cn-standard", "cn-social", "pin-cfc-standard", "qu-sy"]:
            self.assertEqual(classify(code), "competition")
        for code in ["can-standard", "can-modif", "compl"]:
            self.assertEqual(classify(code), "result")
        self.assertEqual(classify("pin-only"), "planning")
        self.assertEqual(classify(""), "unknown")
        self.assertEqual(classify("future-new-type"), "unknown")

    def test_no_fabricated_deadlines(self):
        n = normalise({**sample(), "deadline-receipt-tender-date-lot": None,
                       "deadline-receipt-request-date-lot": None})
        self.assertEqual(n["deadline"], "")
        self.assertEqual(n["deadlines"], [])
        self.assertEqual(deadlines_from({"LOT-1": ["2026-13-88"]}, "tender"), [])

    def test_reject_invalid_records(self):
        self.assertIsNone(normalise({"publication-number": "javascript:evil", "notice-title": "a title"}))
        self.assertIsNone(normalise({"publication-number": "123456-2026", "notice-title": ""}))
        self.assertIsNone(normalise(None))

    def test_multiformat_extract(self):
        self.assertEqual(first({"fra": [], "deu": ["Hallo"]}), "Hallo")
        self.assertEqual(as_codes({"LOT-0001": ["72000000"], "LOT-0002": ["48000000"]}),
                         ["72000000", "48000000"])

    @patch("ingest.time.sleep", return_value=None)
    def test_merge_and_partial_failure(self, _):
        calls = 0
        def fake(_query):
            nonlocal calls
            calls += 1
            if calls == 2:
                raise URLError("temporary")
            return [sample(), sample()]
        feed = build_feed(dt.date(2026, 10, 13), fake)
        self.assertEqual(feed["schema"], 2)
        self.assertEqual(feed["successful_queries"], 2)
        self.assertEqual(len(feed["notices"]), 1)
        self.assertEqual(len(feed["errors"]), 1)

    @patch("ingest.time.sleep", return_value=None)
    def test_no_overwrite_on_total_failure(self, _):
        with self.assertRaises(RuntimeError):
            build_feed(dt.date(2026, 10, 13), lambda _q: (_ for _ in ()).throw(URLError("offline")))

    @patch("ingest.time.sleep", return_value=None)
    def test_empty_valid_result_stays_empty(self, _):
        feed = build_feed(dt.date(2026, 10, 13), lambda _q: [])
        self.assertEqual(feed["notices"], [])

    @patch("ingest.time.sleep", return_value=None)
    def test_pagination(self, _):
        requests = []
        def opener(req, timeout):
            data = json.loads(req.data)
            requests.append(data)
            batch = [sample(str(i + 100000) + "-2026") for i in range(PAGE_SIZE)] if data["page"] == 1 else [sample()]
            return io.BytesIO(json.dumps({"notices": batch}).encode())
        results = retrieve("my query", open_url=opener)
        self.assertEqual(len(results), PAGE_SIZE + 1)
        self.assertEqual([x["page"] for x in requests], [1, 2])
        self.assertIn("notice-type", requests[0]["fields"])
        self.assertIn("deadline-receipt-request-date-lot", requests[0]["fields"])

    @patch("ingest.time.sleep", return_value=None)
    def test_no_silent_partial_pagination(self, _):
        def opener(req, timeout):
            if json.loads(req.data)["page"] == 2:
                raise URLError("down")
            return io.BytesIO(json.dumps({"notices": [sample()] * PAGE_SIZE}).encode())
        with self.assertRaises(URLError):
            retrieve("my query", open_url=opener)


if __name__ == "__main__":
    unittest.main()
