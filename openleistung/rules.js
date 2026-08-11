export const RULESET_VERSION = "but-lunch-demo-2026.08";

export const BENEFIT_LABELS = {
  sgb2: "Bürgergeld / Leistungen nach SGB II",
  sgb12: "Sozialhilfe nach SGB XII",
  wohngeld: "Wohngeld",
  kiz: "Kinderzuschlag",
  asylblg: "Leistungen nach dem AsylbLG",
  low_income: "Niedriges Einkommen ohne genannten Leistungsbezug",
  none: "Keine dieser Leistungen"
};

const VERIFIED_BENEFITS = new Set(["sgb2", "sgb12", "wohngeld", "kiz", "asylblg"]);

export function evaluateEligibility(input) {
  const age = Number(input.childAge);
  const grade = Number(input.grade);
  if (!input.attendsSchool) {
    return result("not_eligible", "Das Kind besucht laut Angabe keine Schule.", "human_review");
  }
  if (!Number.isFinite(age) || age < 0 || age >= 25) {
    return result("not_eligible", "Die Altersvoraussetzung der Demonstrationsregel ist nicht erfüllt.", "human_review");
  }
  if (input.jurisdiction === "BE" && grade >= 1 && grade <= 6) {
    return result("eligible", "In diesem Berliner Demonstrationsfall ist das Mittagessen in den Klassen 1 bis 6 allgemein kostenfrei.", "universal_primary");
  }
  if (VERIFIED_BENEFITS.has(input.benefit)) {
    return result("eligible", `Der angegebene Leistungsbezug (${BENEFIT_LABELS[input.benefit]}) ist im Demo-Regelwerk anspruchsbegründend.`, "benefit_verified");
  }
  if (input.benefit === "low_income") {
    return result("needs_review", "Möglicher Anspruch aufgrund niedrigen Einkommens. Eine Fachkraft muss Zuständigkeit und Nachweise prüfen.", "income_review");
  }
  return result("needs_review", "Aus den Angaben ergibt sich kein automatischer positiver Hinweis. Eine Beratung kann weitere Ansprüche prüfen.", "no_direct_match");
}

function result(status, explanation, reasonCode) {
  return {
    status,
    explanation,
    reasonCode,
    rulesetVersion: RULESET_VERSION,
    legalReferences: [
      "§ 28 Abs. 6 SGB II",
      "§ 34 Abs. 6 SGB XII",
      "Bildungs- und Teilhabepaket – Demonstrationsmodell"
    ],
    requiresHumanDecision: true
  };
}

export function buildEvidencePlan(input, registry = {}) {
  return [
    evidence("identity", "Identität der antragstellenden Person", registry.identityVerified, registry.identityVerified ? "eID-Demo" : "Manuelle Angabe"),
    evidence("school", "Schulbesuch und Klassenstufe", registry.schoolVerified, registry.schoolVerified ? "Schulregister-Demo" : "Schulbestätigung"),
    evidence("benefit", "Anspruchsbegründender Leistungsbezug", registry.benefitVerified, registry.benefitVerified ? "NOOTS-Demoabruf" : "Aktueller Bescheid"),
    evidence("meal", "Teilnahme am gemeinschaftlichen Mittagessen", registry.mealVerified, registry.mealVerified ? "Schuldaten-Demo" : "Bestätigung der Schule")
  ];
}

function evidence(id, label, verified = false, source = "") {
  return { id, label, verified: Boolean(verified), source, required: true };
}

export function createApplicationId(now = new Date(), random = Math.random) {
  const year = now.getUTCFullYear();
  const suffix = Math.floor(random() * 900000 + 100000);
  return `OL-BE-${year}-${suffix}`;
}

export const ALLOWED_TRANSITIONS = {
  draft: ["submitted"],
  submitted: ["in_review", "needs_information"],
  in_review: ["approved", "needs_information", "rejected"],
  needs_information: ["submitted", "in_review"],
  approved: ["notified"],
  rejected: ["notified"],
  notified: []
};

export function transitionCase(current, next) {
  if (!ALLOWED_TRANSITIONS[current]?.includes(next)) {
    throw new Error(`Invalid case transition: ${current} -> ${next}`);
  }
  return next;
}

export function completionScore(evidencePlan) {
  if (!evidencePlan.length) return 0;
  return Math.round((evidencePlan.filter(item => item.verified).length / evidencePlan.length) * 100);
}
