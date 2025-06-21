const text = `
  Salamander can grow its tail, legs, or hands after they are cut off.
  This regeneration is possible due to their stem-cell-rich tissues.
  Some geckos share similar genes, allowing them to regrow tails.
  Scorpions, unlike salamanders, cannot regenerate but can survive without food for up to a year.
  Salamanders are studied in regenerative medicine for this unique ability.

  Einstein was born in 1879.
  Russell was both a philosopher and a mathematician.
  Frogs undergo metamorphosis from tadpole to adult.
`;

const verbGroups = {
  "how": ["can", "regenerate", "regrow", "grow", "able", "regeneration"],
  "can": ["can", "could", "able", "capable"],
  "does": ["does", "is", "can", "could"]
};

function search() {
  const q = document.getElementById("question").value.toLowerCase();
  const result = document.getElementById("result");
  result.innerHTML = '';

  if (!q || q.length < 3) {
    result.innerText = "Please ask a valid question.";
    return;
  }

  const patterns = extractPatterns(q);
  const mainWord = extractMainSubject(q);
  const verbIntent = detectVerbIntent(q);

  const sentences = text.split(/[.!?]\s+/);
  let matches = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    const lower = sentence.toLowerCase();

    const verbMatch = verbGroups[verbIntent] || [];
    const verbFound = verbMatch.some(v => lower.includes(v));
    const subjectFound = lower.includes(mainWord);

    if (subjectFound && verbFound) {
      let matchScore = 0;
      for (let pat of patterns) {
        if (lower.includes(pat)) matchScore++;
      }

      const next = sentences[i + 1] || "";
      const fullAnswer = sentence + ". " + (next.includes(mainWord) || next.includes("this") ? next : "");

      matches.push({
        sentence: fullAnswer,
        score: matchScore
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    result.innerHTML = "<p>No relevant answer found.</p>";
  } else {
    result.innerHTML = "<strong>Answer:</strong><ul>" +
      matches.slice(0, 3).map(m => `<li>${highlight(m.sentence, patterns)}</li>`).join('') +
      "</ul>";
  }
}

function extractPatterns(q) {
  const stopWords = ["what", "when", "where", "why", "who", "how", "does", "is", "are", "did", "do", "was", "were", "can", "could", "should", "the", "a", "an", "to", "in", "on", "at", "for", "of", "and", "with", "after", "they", "get", "by", "his", "their", "again"];
  return q.split(/\s+/).filter(w => !stopWords.includes(w));
}

function extractMainSubject(q) {
  const knownSubjects = ["salamander", "gecko", "scorpion", "einstein", "russell", "frogs"];
  for (let w of q.split(/\s+/)) {
    if (knownSubjects.includes(w)) return w;
  }
  return q.split(/\s+/).find(w => w.length > 4) || "unknown";
}

function detectVerbIntent(q) {
  if (q.startsWith("how")) return "how";
  if (q.startsWith("can")) return "can";
  if (q.startsWith("does") || q.startsWith("do")) return "does";
  return "how";
}

function highlight(text, keywords) {
  let result = text;
  keywords.forEach(k => {
    const re = new RegExp(`(${k})`, "gi");
    result = result.replace(re, '<span class="highlight">$1</span>');
  });
  return result;
}
