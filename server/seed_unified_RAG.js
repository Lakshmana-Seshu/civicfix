const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
require('dotenv').config();

const { extractSLAFromText, extractDepartmentDataFromText, embedText } = require('./services/geminiService');
const { upsertSLAVectors, upsertDepartmentVectors } = require('./services/pineconeService');

const log = (msg) => {
    console.log(msg);
    // Optional: Log to file if needed
    // fs.appendFileSync(path.join(__dirname, 'seed_unified_log.txt'), msg + '\n');
};

const seedUnifiedRAG = async () => {
    try {
        log("--- UNIFIED RAG SEEDING STARTED ---");

        const pdfPath = path.join(__dirname, 'SLA_Dept-roles.pdf');
        if (!fs.existsSync(pdfPath)) {
            log(`ERROR: PDF NOT FOUND at ${pdfPath}`);
            return;
        }

        log("Reading PDF...");
        const dataBuffer = fs.readFileSync(pdfPath);

        // Use pdf-parse for text extraction
        const data = await pdf(dataBuffer);
        const rawText = data.text;

        if (!rawText || rawText.length < 50) {
            log("ERROR: Extracted text is too short or empty.");
            return;
        }

        log(`Extracted ${rawText.length} characters. Starting analysis...`);

        // --- PART 1: SLA Extraction ---
        log("\n--- Processing SLA Data ---");
        const slaItems = await extractSLAFromText(rawText);

        if (slaItems && slaItems.length > 0) {
            log(`Identified ${slaItems.length} SLA policies.`);
            const slaVectors = [];

            for (const item of slaItems) {
                // log(`Processing SLA: ${item.issueType}...`);
                const textToEmbed = `${item.category} - ${item.issueType}: ${item.text} (${item.sectionReference})`;
                const embedding = await embedText(textToEmbed);

                if (embedding) {
                    slaVectors.push({
                        id: `SLA-UNIFIED-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                        values: embedding,
                        metadata: {
                            category: item.category,
                            issueType: item.issueType,
                            sectionReference: item.sectionReference,
                            slaDuration: item.slaDuration,
                            slaUnit: item.slaUnit,
                            text: item.text,
                            source: 'SLA_Dept-roles.pdf'
                        }
                    });
                }
            }

            if (slaVectors.length > 0) {
                log(`Upserting ${slaVectors.length} SLA vectors...`);
                await upsertSLAVectors(slaVectors);
                log("SLA Upsert Complete.");
            }
        } else {
            log("WARN: No SLA items extracted.");
        }

        // --- PART 2: Department Role Extraction ---
        log("\n--- Processing Department Roles ---");
        const deptItems = await extractDepartmentDataFromText(rawText);

        if (deptItems && deptItems.length > 0) {
            log(`Identified ${deptItems.length} Department Roles.`);
            const deptVectors = [];

            for (const item of deptItems) {
                // log(`Processing Dept: ${item.departmentName}...`);
                const textToEmbed = `${item.departmentName} handles: ${item.handledIssues.join(', ')}. ${item.summary}. Common phrases: ${item.examplePhrases?.join(', ') || ''}`;
                const embedding = await embedText(textToEmbed);

                if (embedding) {
                    deptVectors.push({
                        id: `DEPT-UNIFIED-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                        values: embedding,
                        metadata: {
                            departmentName: item.departmentName,
                            handledIssues: item.handledIssues,
                            summary: item.summary,
                            textVal: textToEmbed,
                            source: 'SLA_Dept-roles.pdf'
                        }
                    });
                }
            }

            if (deptVectors.length > 0) {
                log(`Upserting ${deptVectors.length} Department vectors...`);
                await upsertDepartmentVectors(deptVectors);
                log("Department Upsert Complete.");
            }
        } else {
            log("WARN: No Department items extracted.");
        }

        log("\n--- UNIFIED SEEDING COMPLETED SUCCESSFULY ---");

    } catch (error) {
        console.error("Critical Seeding Error:", error);
    }
};

seedUnifiedRAG();
