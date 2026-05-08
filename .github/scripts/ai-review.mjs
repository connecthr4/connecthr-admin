import fs from "fs";

/* =======================
   Config
======================= */

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-1.5-flash";

const MAX_CHARS = 40000;

/* =======================
   Helpers
======================= */

function safeRead(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

async function callGemini(model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  return response.json();
}

/* =======================
   Main
======================= */

async function run() {
  const diffRaw = safeRead("diff.txt");
  const eslintRaw = safeRead("eslint-report.json");

  if (!diffRaw.trim()) {
    console.log("No changes found.");
    process.exit(0);
  }

  const diff = diffRaw.slice(0, MAX_CHARS);
  const eslintReport = eslintRaw.slice(0, MAX_CHARS);

  /* =======================
     AI Prompt
  ======================= */

  const prompt = `
You are a senior React Native engineer reviewing a pull request.

Focus ONLY on:
- Bugs
- Performance issues
- Security concerns
- React Native best practices
- TypeScript issues
- Memory leaks
- Async issues

DO NOT:
- Give formatting suggestions
- Mention lint issues unless critical
- Give generic praise
- Suggest unnecessary refactors

Return ONLY valid JSON array.

Example:
[
  {
    "file": "src/screens/Login.tsx",
    "line": 42,
    "severity": "warning",
    "comment": "Avoid storing sensitive tokens in AsyncStorage."
  }
]

IMPORTANT:
- Only review changed lines
- Only use files from diff
- Line numbers must exist in diff

DIFF:
${diff}

ESLINT:
${eslintReport}
`;

  console.log(`Running AI review using ${PRIMARY_MODEL}`);

  let aiData = await callGemini(PRIMARY_MODEL, prompt);

  /* =======================
     Fallback Model
  ======================= */

  if (aiData.error) {
    console.warn(`Primary model failed: ${aiData.error.message}`);

    aiData = await callGemini(FALLBACK_MODEL, prompt);
  }

  if (aiData.error) {
    console.error(
      "All Gemini models failed:",
      JSON.stringify(aiData.error, null, 2),
    );

    process.exit(1);
  }

  /* =======================
     Parse AI Response
  ======================= */

  const raw = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!raw) {
    console.log("No AI review generated.");
    process.exit(0);
  }

  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let reviews = [];

  try {
    reviews = JSON.parse(cleaned);
  } catch (err) {
    console.error("Invalid JSON returned by AI");
    console.error(cleaned);

    process.exit(1);
  }

  if (!reviews.length) {
    console.log("No review comments generated.");
    process.exit(0);
  }

  /* =======================
     GitHub Setup
  ======================= */

  const [owner, repo] = process.env.REPO.split("/");

  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };

  /* =======================
     Get PR Details
  ======================= */

  const prRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${process.env.PR_NUMBER}`,
    { headers },
  );

  const prData = await prRes.json();

  const commitId = prData.head.sha;

  /* =======================
     Create Review Comments
  ======================= */

  for (const review of reviews) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${process.env.PR_NUMBER}/comments`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            body: `## 🤖 AI Review

**Severity:** ${review.severity}

${review.comment}
`,
            commit_id: commitId,
            path: review.file,
            line: review.line,
            side: "RIGHT",
          }),
        },
      );

      const data = await response.json();

      if (data.message) {
        console.error(`Failed for ${review.file}:${review.line}`, data);

        continue;
      }

      console.log(`Created review for ${review.file}:${review.line}`);
    } catch (err) {
      console.error(
        `Error creating review for ${review.file}:${review.line}`,
        err,
      );
    }
  }

  console.log("AI review completed successfully.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
