const JUDGE0_API = "https://ce.judge0.com";
const PISTON_API = "https://emkc.org/api/v2/piston";
const JUDGE0_STATUS_DONE = 2;

const LANGUAGE_CONFIG = {
  javascript: {
    judge0Id: 63,
    judge0Name: "JavaScript (Node.js)",
    piston: { language: "javascript", version: "18.15.0" },
  },
  python: {
    judge0Id: 71,
    judge0Name: "Python (3",
    piston: { language: "python", version: "3.10.0" },
  },
  java: {
    judge0Id: 62,
    judge0Name: "Java (OpenJDK",
    piston: { language: "java", version: "15.0.2" },
  },
};

let judge0LanguagesPromise;

/**
 * @param {string} language
 * @param {string} code
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code) {
  const languageConfig = LANGUAGE_CONFIG[language];

  if (!languageConfig) {
    return {
      success: false,
      error: `Unsupported language: ${language}`,
    };
  }

  try {
    return await executeWithJudge0(languageConfig, code);
  } catch (judge0Error) {
    try {
      return await executeWithPiston(languageConfig.piston, language, code);
    } catch (pistonError) {
      return {
        success: false,
        error: judge0Error.message || pistonError.message || "Failed to execute code",
      };
    }
  }
}

async function executeWithJudge0(languageConfig, code) {
  const languageId = languageConfig.judge0Id || (await getJudge0LanguageId(languageConfig.judge0Name));

  const createResponse = await fetch(`${JUDGE0_API}/submissions?base64_encoded=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language_id: languageId,
      source_code: code,
      stdin: "",
    }),
  });

  if (!createResponse.ok) {
    throw new Error(`Judge0 request failed with status ${createResponse.status}`);
  }

  const { token } = await createResponse.json();

  if (!token) {
    throw new Error("Judge0 did not return a submission token");
  }

  for (let attempt = 0; attempt < 12; attempt += 1) {
    await delay(1200);

    const resultResponse = await fetch(`${JUDGE0_API}/submissions/${token}?base64_encoded=false`);

    if (!resultResponse.ok) {
      throw new Error(`Judge0 result check failed with status ${resultResponse.status}`);
    }

    const result = await resultResponse.json();
    const statusId = result.status?.id;

    if (statusId <= JUDGE0_STATUS_DONE) continue;

    const output = result.stdout || result.compile_output || result.stderr || result.message || "";

    if (statusId === 3) {
      return {
        success: true,
        output: output || "No output",
      };
    }

    return {
      success: false,
      output: result.stdout || "",
      error: output || "Code execution failed",
    };
  }

  throw new Error("Judge0 execution timed out");
}

async function getJudge0LanguageId(languageNamePrefix) {
  if (!judge0LanguagesPromise) {
    judge0LanguagesPromise = fetch(`${JUDGE0_API}/languages`).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Judge0 language lookup failed with status ${response.status}`);
      }

      return response.json();
    });
  }

  const languages = await judge0LanguagesPromise;
  const match = languages.find((entry) => entry.name.startsWith(languageNamePrefix));

  if (!match) {
    throw new Error(`Judge0 does not support ${languageNamePrefix}`);
  }

  return match.id;
}

async function executeWithPiston(languageConfig, language, code) {
  const response = await fetch(`${PISTON_API}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language: languageConfig.language,
      version: languageConfig.version,
      files: [
        {
          name: `main.${getFileExtension(language)}`,
          content: code,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Piston request failed with status ${response.status}`);
  }

  const data = await response.json();
  const output = data.run?.output || "";
  const stderr = data.run?.stderr || "";

  if (stderr) {
    return {
      success: false,
      output,
      error: stderr,
    };
  }

  return {
    success: true,
    output: output || "No output",
  };
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getFileExtension(language) {
  const extensions = {
    javascript: "js",
    python: "py",
    java: "java",
  };

  return extensions[language] || "txt";
}
