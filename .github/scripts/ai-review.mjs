import fs from 'fs';

/* =======================
   Config
======================= */

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

const MAX_CHARS = 40000;

/* =======================
   Helpers
======================= */

function safeRead(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

async function callGemini(model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          message: data?.error?.message || 'Unknown Gemini API error',
          status: response.status,
        },
      };
    }

    return data;
  } catch (err) {
    return {
      error: {
        message: err.message || 'Network request failed',
      },
    };
  }
}

/* =======================
   Main
======================= */

async function run() {
  const diffRaw = safeRead('diff.txt');
  const eslintRaw = safeRead('eslint-report.json');

  if (!diffRaw.trim()) {
    console.log('No changes found.');
    process.exit(0);
  }

  const diff = diffRaw.slice(0, MAX_CHARS);
  const eslintReport = eslintRaw.slice(0, MAX_CHARS);

  /* =======================
     AI Prompt
  ======================= */

  const prompt = `
You are a senior Next.js + React + TypeScript engineer reviewing a pull request.

Your task is to review ONLY the changed code from the provided git diff.

Focus ONLY on:
- Bugs
- Runtime issues
- Next.js best practices
- React performance issues
- Security concerns
- TypeScript issues
- Hydration problems
- Server vs Client Component mistakes
- Async/data fetching issues
- Memory leaks
- Accessibility issues (only critical ones)
- Incorrect React hooks usage
- SEO issues in Next.js
- App Router best practices
- API route/security issues
- Suspicious state management issues

DO NOT:
- Give formatting suggestions
- Mention lint/prettier issues unless critical
- Give generic praise
- Suggest unnecessary refactors
- Comment on unchanged code
- Suggest micro optimizations
- Repeat ESLint errors unless they are severe

Next.js specific checks:
- Detect unnecessary "use client"
- Detect server component misuse
- Detect client component misuse
- Detect async client component issues
- Detect improper data fetching
- Detect missing loading/error handling
- Detect improper caching/revalidation
- Detect hydration mismatch risks
- Detect large client bundle risks
- Detect insecure API usage
- Detect environment variable exposure
- Detect improper metadata usage
- Detect missing key props
- Detect improper image/font optimization
- Detect route handler mistakes

Return ONLY valid JSON array.

Example:
[
  {
    "file": "src/app/login/page.tsx",
    "line": 42,
    "severity": "warning",
    "comment": "This client component performs async data fetching directly during render which can cause hydration inconsistencies.",
    "suggestion": "Move the data fetching to a Server Component or fetch the data inside useEffect.",
    "code": "useEffect(() => { fetchData(); }, []);"
  }
]

Rules:
- Only review changed lines
- Only use files from diff
- Line numbers must exist in diff
- Keep comments short and actionable
- Use severity values: "info", "warning", or "critical"
- Every review must include a short fix suggestion
- Suggestions must be actionable
- Keep suggestions concise
- Do not generate full refactors
- Do not suggest formatting fixes
- Include a minimal code suggestion when possible
- Keep code snippets under 10 lines
- Do not hallucinate fixes
- Only suggest fixes relevant to the changed code
- If unsure, do not generate a suggestion
- If no issues are found, return []

DIFF:
${diff}

ESLINT:
${eslintReport}
`;

  /* =======================
     Run AI Review
  ======================= */

  let aiData = null;

  for (const model of MODELS) {
    console.log(`Running AI review using ${model}`);

    aiData = await callGemini(model, prompt);

    if (!aiData.error) {
      console.log(`Success with ${model}`);
      break;
    }

    console.warn(`${model} failed: ${aiData.error.message}`);
  }

  if (!aiData || aiData.error) {
    console.error('All Gemini models failed:', JSON.stringify(aiData?.error || {}, null, 2));

    process.exit(1);
  }

  /* =======================
     Parse AI Response
  ======================= */

  const raw = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!raw) {
    console.log('No AI review generated.');
    process.exit(0);
  }

  const cleaned = raw
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  let reviews = [];

  try {
    reviews = JSON.parse(cleaned);

    if (!Array.isArray(reviews)) {
      throw new Error('AI response is not an array');
    }
  } catch (err) {
    console.error('Invalid JSON returned by AI');
    console.error(cleaned);

    process.exit(1);
  }

  if (!reviews.length) {
    console.log('No review comments generated.');
    process.exit(0);
  }

  /* =======================
     GitHub Setup
  ======================= */

  const [owner, repo] = process.env.REPO.split('/');

  const headers = {
    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  /* =======================
     Get PR Details
  ======================= */

  const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${process.env.PR_NUMBER}`, {
    headers,
  });

  const prData = await prRes.json();

  if (!prRes.ok) {
    console.error('Failed to fetch PR details');
    console.error(JSON.stringify(prData, null, 2));

    process.exit(1);
  }

  const commitId = prData.head.sha;

  /* =======================
     Create Review Comments
  ======================= */

  for (const review of reviews) {
    try {
      if (!review.file || !review.line || !review.comment) {
        console.warn('Skipping invalid review object:', review);
        continue;
      }

      const reviewBody = `## 🤖 AI Review

**Severity:** ${review.severity || 'info'}

### Issue
${review.comment}

${
  review.suggestion
    ? `### Suggested Fix
${review.suggestion}
`
    : ''
}

${
  review.code
    ? `### Example Code
\`\`\`ts
${review.code}
\`\`\`
`
    : ''
}
`;

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${process.env.PR_NUMBER}/comments`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            body: reviewBody,
            commit_id: commitId,
            path: review.file,
            line: review.line,
            side: 'RIGHT',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(`Failed for ${review.file}:${review.line}`, JSON.stringify(data, null, 2));

        continue;
      }

      console.log(`Created review for ${review.file}:${review.line}`);
    } catch (err) {
      console.error(`Error creating review for ${review.file}:${review.line}`, err);
    }
  }

  console.log('AI review completed successfully.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
