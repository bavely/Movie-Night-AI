const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");

loadLocalEnv(path.join(__dirname, ".env"));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

let openAIClientPromise;

function loadLocalEnv(envPath) {
    if (!fs.existsSync(envPath)) {
        return;
    }

    const envFile = fs.readFileSync(envPath, "utf8");
    for (const rawLine of envFile.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) {
            continue;
        }

        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) {
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();

        if (!key || process.env[key] !== undefined) {
            continue;
        }

        if (
            (value.startsWith("\"") && value.endsWith("\"")) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        process.env[key] = value;
    }
}

async function getAzureOpenAIClient() {
    if (!openAIClientPromise) {
        openAIClientPromise = (async () => {
            const [{ AIProjectClient }, { DefaultAzureCredential }] = await Promise.all([
                import("@azure/ai-projects"),
                import("@azure/identity"),
            ]);

            const endpoint =
                process.env.AZURE_AI_PROJECT_ENDPOINT ||
                process.env.NG_APP_AZURE_OPENAI_ENDPOINT;

            if (!endpoint) {
                throw new Error("Missing AZURE_AI_PROJECT_ENDPOINT or NG_APP_AZURE_OPENAI_ENDPOINT.");
            }

            const projectClient = new AIProjectClient(endpoint, new DefaultAzureCredential());
            return projectClient.getOpenAIClient();
        })();
    }

    try {
        return await openAIClientPromise;
    } catch (error) {
        openAIClientPromise = undefined;
        throw error;
    }
}

function getPublicAzureErrorMessage(error) {
    const message = error instanceof Error ? error.message : String(error ?? "");

    if (
        message.includes("ChainedTokenCredential authentication failed") ||
        message.includes("Azure CLI could not be found") ||
        message.includes("EnvironmentCredential is unavailable")
    ) {
        return "Azure authentication failed on the API server. Run az login on this machine, or set AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET for a service principal with access to the Foundry project.";
    }

    return message || "Unknown Azure AI Agent error.";
}

function buildMiaPrompt(userPrompt) {
    return [
        "You are MIA, a movie recommendation agent.",
        "Recommend movies for the user's request.",
        "Return only valid JSON. Do not include markdown, citations, links, or text outside the JSON object.",
        "The JSON object must match this exact shape:",
        "{\"movies\":[\"Movie Title 1\",\"Movie Title 2\",\"Movie Title 3\"],\"fullResponse\":\"Brief friendly explanation of why these movies fit.\"}",
        "Use 3 to 6 exact movie titles that can be searched in TMDB.",
        "Keep fullResponse under 600 characters.",
        `User request: ${userPrompt}`,
    ].join("\n");
}

app.post("/api/mia", async (req, res) => {
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
    }

    const agentName = process.env.AZURE_AI_AGENT_NAME || process.env.NG_AGENT_NAME;
    const agentVersion = process.env.AZURE_AI_AGENT_VERSION || process.env.NG_AGENT_VERSION;

    if (!agentName) {
        return res.status(500).json({ error: "Missing AZURE_AI_AGENT_NAME or NG_AGENT_NAME." });
    }

    let openAIClient;
    let conversation;

    try {
        openAIClient = await getAzureOpenAIClient();
        conversation = await openAIClient.conversations.create({
            items: [{ type: "message", role: "user", content: buildMiaPrompt(prompt) }],
        });

        const agentReference = {
            name: agentName,
            type: "agent_reference",
        };

        if (agentVersion) {
            agentReference.version = agentVersion;
        }

        const response = await openAIClient.responses.create(
            {
                conversation: conversation.id,
            },
            {
                body: { agent_reference: agentReference },
            },
        );

        return res.json({ outputText: response.output_text ?? "" });
    } catch (error) {
        console.error("Azure AI Agent request failed:", error);
        const details = getPublicAzureErrorMessage(error);

        return res.status(500).json({
            error: "Azure AI Agent request failed.",
            details: process.env.NODE_ENV === "production" ? undefined : details,
        });
    } finally {
        if (openAIClient && conversation?.id) {
            openAIClient.conversations.delete(conversation.id).catch((error) => {
                console.warn("Failed to delete Azure AI conversation:", error);
            });
        }
    }
});

app.use(express.static("./dist/movie-night/browser"));



app.use((req, res) => {
    res.sendFile(path.join(__dirname, "./dist/movie-night/browser/index.html"));
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
// [END app]

module.exports = app;
