const fs = require('fs');
const path = require('path');
// const pdf = require('pdf-parse'); // Removed due to bugs
require('dotenv').config(); // Explicit load

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(path.join(__dirname, 'seed_debug_out.txt'), msg + '\n');
}

log("--- SEEDING STARTED ---");
log("Google Key Present: " + !!process.env.GOOGLE_API_KEY);
log("Pinecone Key Present: " + !!process.env.PINECONE_API_KEY);

const { extractDepartmentDataFromText, embedText, parsePDFWithGemini } = require('./services/geminiService');
const { upsertDepartmentVectors } = require('./services/pineconeService');

const seedDepartmentCharter = async () => {
    try {
        log("Reading Department Charter PDF...");
        const pdfPath = path.join(__dirname, 'CivicFix_Department_Responsibility_Charter.pdf');

        if (!fs.existsSync(pdfPath)) {
            log("ERROR: PDF NOT FOUND at " + pdfPath);
            return;
        }

        const dataBuffer = fs.readFileSync(pdfPath);

        log("Parsing PDF with Gemini...");
        const rawText = await parsePDFWithGemini(dataBuffer);

        if (!rawText || rawText.length < 50) {
            log("ERROR: Failed to extract text from PDF or text too short.");
            log("Raw Text: " + rawText);
            return;
        }

        log(`Extracted ${rawText.length} characters. Analyzing with Gemini...`);

        // Extract structured data
        const deptItems = await extractDepartmentDataFromText(rawText);

        if (!deptItems || deptItems.length === 0) {
            log("ERROR: No Department items extracted.");
            // Log raw response if possible? 
            return;
        }

        log(`Identified ${deptItems.length} Departments.`);

        const vectors = [];

        for (const item of deptItems) {
            log(`Processing: ${item.departmentName}...`);
            const textToEmbed = `${item.departmentName} handles: ${item.handledIssues.join(', ')}. ${item.summary}. Common phrases: ${item.examplePhrases?.join(', ') || ''}`;
            const embedding = await embedText(textToEmbed);

            if (embedding) {
                vectors.push({
                    id: `DEPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    values: embedding,
                    metadata: {
                        departmentName: item.departmentName,
                        handledIssues: item.handledIssues,
                        summary: item.summary,
                        textVal: textToEmbed
                    }
                });
            }
        }

        if (vectors.length > 0) {
            log(`Upserting ${vectors.length} vectors to namespace 'department-charter'...`);
            await upsertDepartmentVectors(vectors);
            log("Department Charter Seeding Complete!");
        } else {
            log("WARN: No vectors generated.");
        }

    } catch (error) {
        log("ERROR in seedDepartmentCharter: " + error.message);
        log(error.stack);
    }
};

seedDepartmentCharter();

