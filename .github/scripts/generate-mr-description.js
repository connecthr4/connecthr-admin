import fs from 'fs';

/* ==========================================================================
 * Configuration
 * ========================================================================== */

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

const MAX_DIFF_CHARS = 50000;
const MAX_FILES_CHARS = 10000;
const TEMPERATURE = 0.2;

/* ==========================================================================
 * Helpers
 * ========================================================================== */

function safeRead(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function truncate(value, max) {
  if (!value) return '';

  return value.length > max ? value.slice(0, max) : value;
}

async function callGemini(model, prompt) {
  const url =
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent` +
    `?key=${process.env.GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],

        generationConfig: {
          temperature: TEMPERATURE,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          status: response.status,
          message: data?.error?.message ?? 'Unknown Gemini API error',
        },
      };
    }

    return data;
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown network error',
      },
    };
  }
}

/* ==========================================================================
 * Prompt Builder
 * ========================================================================== */

function buildPrompt(diff, files) {
  return `
You are a Staff Frontend Engineer reviewing a Next.js enterprise application.

The project uses:

- Next.js App Router
- React 19
- TypeScript
- Server Components
- Client Components
- Server Actions
- Route Handlers
- Zustand
- React Hook Form
- Zod
- Storybook
- SCSS Modules
- Enterprise Architecture

Your responsibility is to generate a professional Pull Request description.

Return ONLY markdown.

Do not wrap the response inside code fences.

Use EXACTLY the following structure.

## Summary

Write 2-4 concise sentences explaining:

- the overall purpose
- the feature or improvement
- why the change exists

Do not mention implementation details here.

----------------------------------------------------

## What Changed

Provide a concise bullet list describing ONLY meaningful implementation changes.

Good examples

- Added reusable API client.
- Implemented server-side authentication flow.
- Added employee management feature.
- Introduced centralized API configuration.
- Added Zod validation.
- Created reusable form components.
- Implemented authentication middleware.

Avoid mentioning

- formatting
- import ordering
- renaming variables
- prettier
- eslint fixes

unless they are the primary purpose of the PR.

----------------------------------------------------

## Files Changed

List every changed file.

Example

- src/lib/api/client.ts - Added reusable HTTP client.
- src/lib/api/errors.ts - Added centralized API error hierarchy.
- src/lib/api/types.ts - Added shared request and response types.

Keep every explanation short.

----------------------------------------------------

Rules

- Return ONLY markdown.
- Do NOT invent functionality.
- Do NOT guess.
- Use ONLY the supplied diff.
- Ignore whitespace-only changes.
- Ignore formatting-only changes.
- Group related changes together.
- Prefer feature-level explanations over implementation details.
- Mention reusable components if they were introduced.
- Mention API layer changes if applicable.
- Mention authentication changes if applicable.
- Mention routing changes if applicable.
- Mention UI components if applicable.
- Mention shared utilities if applicable.
- Mention performance improvements if applicable.

Changed Files

${files}

Git Diff

${diff}
`;
}

/* ==========================================================================
 * AI Description Generator
 * ========================================================================== */

async function generateDescription() {
  const diffRaw = safeRead('diff.txt');
  const filesRaw = safeRead('files.txt');

  if (!diffRaw.trim()) {
    console.log('No changes detected.');
    process.exit(0);
  }

  const diff = truncate(diffRaw, MAX_DIFF_CHARS);
  const files = truncate(filesRaw, MAX_FILES_CHARS);

  const prompt = buildPrompt(diff, files);

  let aiData = null;

  for (const model of MODELS) {
    console.log(`Trying ${model}...`);

    aiData = await callGemini(model, prompt);

    if (!aiData.error) {
      console.log(`Success using ${model}`);
      break;
    }

    console.warn(`${model} failed: ${aiData.error.message}`);
  }

  if (!aiData || aiData.error) {
    console.error('All Gemini models failed.', JSON.stringify(aiData?.error ?? {}, null, 2));

    process.exit(1);
  }

  const markdown = aiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!markdown) {
    console.log('Gemini returned an empty response.');
    process.exit(0);
  }

  return markdown;
}

/* ==========================================================================
 * GitHub Helpers
 * ========================================================================== */

async function getPullRequest(owner, repo, prNumber, headers) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;

  const response = await fetch(url, {
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Failed to fetch Pull Request.');
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  return data;
}

function buildNewBody(existingBody, generatedDescription) {
  const aiSection = `<!-- AI:START -->

${generatedDescription}

<!-- AI:END -->`;

  if (existingBody.includes('<!-- AI:START -->') && existingBody.includes('<!-- AI:END -->')) {
    return existingBody.replace(/<!-- AI:START -->[\s\S]*<!-- AI:END -->/, aiSection);
  }

  if (!existingBody.trim()) {
    return aiSection;
  }

  return `${aiSection}

---

${existingBody}`;
}

async function updatePullRequest(owner, repo, prNumber, body, headers) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;

  const response = await fetch(url, {
    method: 'PATCH',

    headers,

    body: JSON.stringify({
      body,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Failed to update Pull Request.');
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log('Pull Request updated successfully.');
}

/* ==========================================================================
 * Validation
 * ========================================================================== */

function validateEnvironment() {
  const required = ['GEMINI_API_KEY', 'GITHUB_TOKEN', 'REPO', 'PR_NUMBER'];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);

    process.exit(1);
  }
}

/* ==========================================================================
 * Main
 * ========================================================================== */

async function run() {
  validateEnvironment();

  console.log('');
  console.log('========================================');
  console.log(' AI Pull Request Description Generator ');
  console.log('========================================');
  console.log('');

  const markdown = await generateDescription();

  const [owner, repo] = process.env.REPO.split('/');

  const headers = {
    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  console.log('Fetching Pull Request...');

  const pullRequest = await getPullRequest(owner, repo, process.env.PR_NUMBER, headers);

  const existingBody = pullRequest.body ?? '';

  console.log('Preparing updated description...');

  const newBody = buildNewBody(existingBody, markdown);

  console.log('Updating Pull Request...');

  await updatePullRequest(owner, repo, process.env.PR_NUMBER, newBody, headers);

  console.log('');
  console.log('========================================');
  console.log(' Pull Request updated successfully ');
  console.log('========================================');
  console.log('');
}

run().catch((error) => {
  console.error('');
  console.error('Unexpected Error');
  console.error(error instanceof Error ? error.stack : error);
  console.error('');

  process.exit(1);
});
