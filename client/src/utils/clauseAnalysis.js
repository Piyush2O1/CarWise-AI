export const normalizeText = (value) =>
  String(value || "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const splitSentences = (text) =>
  String(text || "")
    .split(/[\.\?\!\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

export const matchPattern = (text, pattern) => {
  if (!text) return false;
  if (Array.isArray(pattern)) {
    return pattern.every((part) => text.includes(part));
  }
  return text.includes(pattern);
};

export const findSentenceMatches = (text, patterns) => {
  const sentences = splitSentences(text);
  return sentences.filter((sentence) =>
    Array.isArray(patterns)
      ? patterns.some((pattern) => matchPattern(sentence, pattern))
      : matchPattern(sentence, patterns)
  );
};

const mandatoryInsuranceCompulsionPatterns = [
  "must maintain insurance",
  "must keep the vehicle insured",
  "must keep the vehicle insured at all times",
  "vehicle must be insured",
  "vehicle must be insured at all times",
  "must insure the vehicle",
  "shall insure the vehicle",
  "shall maintain insurance",
  "required to maintain insurance",
  "required to insure the vehicle",
  "mandatory insurance",
  "compulsory insurance",
  "insurance is compulsory",
  "insurance is required",
  "insurance coverage is mandatory",
  "maintain comprehensive insurance",
  "maintain insurance coverage",
  "keep insurance policy in force",
  "must obtain and maintain insurance",
  "must procure and maintain insurance",
  "shall procure and maintain insurance",
  "must maintain comprehensive insurance",
  "insured at all times",
  "during the loan tenure",
  "lender name to be endorsed",
  "endorse the lender",
  "endorse lender",
  "lender's name endorsed",
  "lender name endorsed",
];

const mandatoryInsuranceOptionalPatterns = [
  "insurance is optional",
  "insurance is not mandatory",
  "not mandatory insurance",
  "no mandatory insurance",
  "optional insurance",
  "insurance may be chosen by borrower",
  "insurance may be chosen by the borrower",
  "borrower may choose the insurer",
  "borrower may choose insurer",
  "insurer can be chosen by borrower",
  "insurer may be selected by borrower",
  "insurance is voluntary",
  "insurance is not compulsory",
  "voluntary insurance",
];

const nonRefundableChargePatterns = [
  "non-refundable",
  "non refundable",
  "nonrefundable",
  "cannot be refunded",
  "not refundable",
  "strictly non-refundable",
  "strictly non refundable",
  "no refund",
  "no refund available",
  "upon cancellation",
  "on cancellation",
  "on loan closure",
  "upon loan closure",
  "cannot recover",
  "not recoverable",
  "not refundable upon cancellation",
  "not refundable on cancellation",
  "not refundable upon closure",
  "not refundable on closure",
];

export const clauseDefinitions = {
  latePaymentPenalty: {
    positive: ["late payment", "late fee", "late penalty", "overdue payment", "delayed payment"],
    lowRisk: ["rbi guidelines", "reserve bank of india", "as per rbi", "as per guidelines", "standard banking rate", "standard banking charges", "regulator-approved banking charges"],
    safe: ["no late payment", "no late fee", "no late penalty", "without late payment", "no penalty for late payment", "zero late charges", "no late payment charges"],
    negation: ["no ", "not ", "nil", "without ", "optional", "free", "refundable", "allowed", "permitted", "waived", "zero "],
  },
  foreclosureCharges: {
    positive: ["foreclosure", "repossession", "repossession fee", "foreclosure charges"],
    lowRisk: ["subject to notice", "only after notice", "after legal notice", "with prior notice", "with notice", "legal notice", "rbi guidelines"],
    safe: ["no foreclosure", "no repossession", "nil foreclosure", "without foreclosure", "without repossession", "no foreclosure charges"],
    negation: ["no ", "not ", "nil", "without ", "optional", "free", "refundable", "allowed", "permitted", "waived"],
  },
  mandatoryInsuranceClause: {
    positive: [["insurance", "mandatory"], ["insurance", "required"], ["must", "insurance"], ["compulsory", "insurance"], ["maintain", "insurance"], ["insure", "vehicle"], "mandatory insurance", "insurance required", "must insure", "must maintain insurance", "insurance is compulsory", "insurance coverage is mandatory"],
    lowRisk: ["standard banking rate", "rbi guidelines"],
    safe: [],
    negation: ["no ", "not ", "nil", "without ", "optional", "free", "refundable", "allowed", "permitted", "waived"],
  },
  mandatoryPackages: {
    positive: ["mandatory package", "mandatory packages", "add-on package", "add on package", "mandatory add-on", "mandatory accessories", "add-on accessories"],
    lowRisk: [],
    safe: ["no mandatory", "optional", "not mandatory", "without mandatory", "no compulsory package", "packages are optional"],
    negation: ["no ", "not ", "nil", "without ", "optional", "free", "refundable", "allowed", "permitted", "waived"],
  },
  vehicleRepossessionClause: {
    positive: ["repossession", "repossess", "vehicle repossession", "repo"],
    lowRisk: ["subject to notice", "only after notice", "after legal notice", "with prior notice", "with notice", "legal notice", "after 30 days", "consecutive emi defaults"],
    safe: ["no repossession", "not repossessed", "without repossession", "allowed only after", "only after", "requires prior notice", "after legal procedures"],
    negation: ["no ", "not ", "nil", "without ", "optional", "free", "refundable", "allowed", "permitted", "waived"],
  },
  arbitrationClause: {
    positive: ["arbitration", "arbitrator", "arbitration clause"],
    lowRisk: ["mutually appointed arbitrator", "mutually appointed", "mutually agreed", "mutual arbitration", "standard banking rate"],
    safe: ["mutually agreed arbitration", "mutually appointed arbitration", "mutual arbitration"],
    negation: ["no ", "not ", "nil", "without ", "optional", "free", "refundable", "allowed", "permitted", "waived"],
  },
  nonRefundableCharges: {
    positive: ["non-refundable", "non refundable", "nonrefundable"],
    lowRisk: ["refundable", "partially refundable", "100% refundable"],
    safe: ["refundable", "100% refundable", "refundable if returned"],
    negation: ["no ", "not ", "nil", "without ", "optional", "free", "refundable", "allowed", "permitted", "waived"],
  },
  hiddenCharges: {
    positive: ["hidden charge", "hidden fee", "undisclosed fee", "undisclosed charge", "additional charge", "extra charge"],
    lowRisk: ["refundable", "free of charge", "no hidden fee", "no hidden charge", "zero hidden charges"],
    safe: ["no hidden", "no hidden charge", "no hidden fee", "no hidden charges", "no undisclosed", "free of hidden charges", "zero hidden charges", "customer friendly"],
    negation: ["no ", "not ", "nil", "without ", "optional", "free", "refundable", "allowed", "permitted", "waived"],
  },
  partPrepaymentRestrictions: {
    positive: ["prepayment not allowed", "no prepayment", "prepayment restriction", "prepayment penalty", "partial prepayment"],
    lowRisk: ["standard banking rate", "as per rbi", "as per guidelines", "late payment charges as per rbi"],
    safe: ["prepayment allowed", "part prepayment allowed", "allowed anytime", "prepayment is allowed", "partial prepayment allowed", "prepayment may be made"],
    negation: ["no ", "not ", "nil", "without ", "optional", "free", "refundable", "allowed", "permitted", "waived"],
  },
  jurisdictionClause: {
    positive: ["jurisdiction", "governing law", "venue"],
    lowRisk: ["borrower's city", "borrowers city", "local courts", "competent courts in", "home city"],
    safe: ["competent courts in the borrower's city", "borrower's city", "borrowers city", "local courts", "in borrower's city", "home city jurisdiction"],
    negation: ["no ", "not ", "nil", "without ", "optional", "free", "refundable", "allowed", "permitted", "waived"],
  },
};

export const classifyClauseStatus = (clauseKey, text, presentFlag) => {
  const normalized = normalizeText(text);
  const definition = clauseDefinitions[clauseKey] || clauseDefinitions.hiddenCharges;

  const positiveSentences = findSentenceMatches(normalized, definition.positive);
  const safeSentences = findSentenceMatches(normalized, definition.safe);
  const lowRiskSentences = findSentenceMatches(normalized, definition.lowRisk);
  const negationSentences = findSentenceMatches(normalized, definition.negation);

  if (clauseKey === "mandatoryInsuranceClause") {
    const hasCompulsoryInsuranceSignal = mandatoryInsuranceCompulsionPatterns.some((pattern) => normalized.includes(pattern));
    const hasOptionalInsuranceSignal = mandatoryInsuranceOptionalPatterns.some((pattern) => normalized.includes(pattern));

    if (hasCompulsoryInsuranceSignal) return "DETECTED";
    if (hasOptionalInsuranceSignal) return "NOT DETECTED";
  }

  if (clauseKey === "nonRefundableCharges") {
    const hasNonRefundableSignal = nonRefundableChargePatterns.some((pattern) => normalized.includes(pattern));
    if (hasNonRefundableSignal) return "DETECTED";
    if (presentFlag === true) return "DETECTED";
    if (presentFlag === false) return "NOT DETECTED";
  }

  if (positiveSentences.length > 0) {
    const positiveSentence = positiveSentences[0];
    const sentenceHasSafe = safeSentences.some((sentence) => positiveSentence === sentence || positiveSentence.includes(sentence));
    const sentenceHasNegation = negationSentences.some((sentence) => positiveSentence === sentence || positiveSentence.includes(sentence));
    const sentenceHasLowRisk = lowRiskSentences.some((sentence) => positiveSentence === sentence || positiveSentence.includes(sentence));

    if (sentenceHasSafe) return "SAFE";
    if (sentenceHasNegation) return "NOT DETECTED";
    if (sentenceHasLowRisk) return "LOW RISK";
    return "DETECTED";
  }

  if (safeSentences.length > 0) return "SAFE";
  if (presentFlag === true) return "DETECTED";
  if (presentFlag === false) return "NOT DETECTED";
  return "Information Not Found";
};

export const getRiskStatus = (clauseKey, text, presentFlag) =>
  classifyClauseStatus(clauseKey, text, presentFlag);

export const scoreFromStatus = (status, basePoints) => {
  if (status === "DETECTED") return basePoints;
  if (status === "LOW RISK") return Math.round(basePoints * 0.5);
  return 0;
};

export const detectHiddenCharges = (an, extractedText = "") => {
  const found = [];
  const text = normalizeText(extractedText || an.summary || "");

  const knownKeys = [
    { key: "dealerHandlingCharges", label: "Dealer Convenience Fee" },
    { key: "documentationCharges", label: "Documentation Charges" },
    { key: "accountMaintenanceCharges", label: "Account Maintenance Charges" },
    { key: "smsCharges", label: "SMS Charges" },
    { key: "loanClosureCharges", label: "Loan Closure Charges" },
    { key: "processingFees", label: "Processing Charges" },
    { key: "deliveryCharges", label: "Delivery Charges" },
    { key: "smartCardCharges", label: "Smart Card Charges" },
  ];

  const parseHiddenItem = (raw) => {
    const normalized = normalizeText(raw);
    const recurring = /monthly|annual|yearly|per month|per annum/.test(normalized);
    const nonRefundable = /non[- ]?refundable|no refund|strictly non[- ]?refundable/.test(normalized);
    const mandatory = /mandatory|must be|required to purchase|only from lender/.test(normalized);
    return { name: raw.split(/[:,\-]/)[0].slice(0, 40), raw, recurring, nonRefundable, mandatory };
  };

  const ac = an.additionalCharges || {};
  knownKeys.forEach((k) => {
    const v = ac[k.key] ?? an.financials?.[k.key] ?? null;
    if (v) {
      found.push(parseHiddenItem(String(v)).name === k.label ? { ...parseHiddenItem(String(v)), name: k.label } : parseHiddenItem(String(v)));
    }
  });

  const hiddenList = an.hiddenCharges || an.hiddenRisks?.hiddenCharges || [];
  if (hiddenList) {
    if (Array.isArray(hiddenList)) {
      hiddenList.forEach((item) => {
        const raw = typeof item === "string" ? item : JSON.stringify(item || "");
        found.push(parseHiddenItem(raw));
      });
    } else if (typeof hiddenList === "object") {
      Object.entries(hiddenList).forEach(([k, v]) => {
        const raw = String(v);
        const item = parseHiddenItem(raw);
        found.push({ ...item, name: k });
      });
    }
  }

  const textPatterns = [
    "dealer convenience fee",
    "documentation fee",
    "documentation charge",
    "account maintenance",
    "account maintenance fee",
    "monthly subscription",
    "monthly subscription charge",
    "subscription fee",
    "closure charge",
    "loan closure",
    "processing fee",
    "processing charge",
    "delivery charge",
    "delivery fee",
    "smart card",
    "smart card charge",
    "administrative fee",
    "administrative charges",
    "mandatory service charge",
    "mandatory service fee",
    "service charge",
    "service fee",
    "annual fee",
    "monthly fee",
  ];

  textPatterns.forEach((pat) => {
    if (text.includes(pat) && !found.some((f) => normalizeText(f.name).includes(pat))) {
      found.push(parseHiddenItem(pat));
    }
  });

  return found;
};
