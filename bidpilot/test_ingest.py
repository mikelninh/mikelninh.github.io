import datetime as dt
import unittest
from unittest.mock import patch
from urllib.error import URLError

from ingest import as_codes, build_feed, first, normalise


def sample(number="123456-2026"):
    return {
        "publication-number": number,
        "notice-title": {"eng": ["AI software development"], "deu": ["Softwareentwicklung"]},
        "buyer-name": {"deu": ["Stadt Berlin"]},
        "buyer-country": "DEU",
        "publication-date": "2026-10-10+02:00",
        "deadline-receipt-tender-date-lot": {"LOT-0001": ["2026-11-10+01:00"]},
        "classification-cpv": ["72000000", "72200000", "72000000"],
    }


class IngestTests(unittest.TestCase):
    def test_multilingual_notice(self):
        n = normalise(sample())
        self.assertEqual(n["title"], "AI software development")
        self.assertEqual(n["buyer"], "Stadt Berlin")
        self.assertEqual(n["deadline"], "2026-11-10")
        self.assertEqual(n["cpv"], ["72000000", "72200000"])
        self.assertEqual(n["url"], "https://ted.europa.eu/en/notice/-/detail/123456-2026")

    def test_reject_invalid_records(self):
        self.assertIsNone(normalise({"publication-number": "javascript:evil", "notice-title": "a title"}))
        self.assertIsNone(normalise({"publication-number": "123456-2026", "notice-title": ""}))
        self.assertIsNone(normalise(None))

    def test_multiformat_extract(self):
        self.assertEqual(first({"fra": [], "deu": ["Hallo"]}), "Hallo")
        self.assertEqual(as_codes({"LOT-0001": ["72000000"], "LOT-0002": ["48000000"]}), ["72000000", "48000000"])

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
        self.assertEqual(feed["successful_queries"], 2)
        self.assertEqual(len(feed["notices"]), 1)
        self.assertEqual(len(feed["errors"]), 1)

    @patch("ingest.time.sleep", return_value=None)
    def test_no_overwrite_on_total_failure(self, _):
        def fail(_q):
            raise URLError("offline")
        with self.assertRaises(RuntimeError):
            build_feed(dt.date(2026, 10, 13), fail)

    @patch("ingest.time.sleep", return_value=None)
    def test_empty_valid_result_stays_empty(self, _):
        feed = build_feed(dt.date(2026, 10, 13), lambda _q: [])
        self.assertEqual(feed["notices"], [])
        self.assertEqual(feed["successful_queries"], 3)


if __name__ == "__main__":
    unittest.main()
