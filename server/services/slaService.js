const { embedText, estimateSLA } = require('./geminiService'); // Adjust import if needed
const { querySLA } = require('./pineconeService');

// Helper to calculate target date skipping weekends if needed (simplified for now)
const calculateTargetDate = (startDate, hours) => {
    const target = new Date(startDate);
    target.setHours(target.getHours() + hours);
    return target;
};

const getSLAForTicket = async (ticket) => {
    try {
        // 1. Construct query from ticket details
        const queryText = `${ticket.aiAnalysis?.category || ticket.department?.name} - ${ticket.aiAnalysis?.issueType || ticket.title}`;
        console.log(`Searching SLA for: ${queryText}`);

        // 2. Embed and Query Vector Store
        let matches = [];
        try {
            const embedding = await embedText(queryText);
            matches = await querySLA(embedding);
        } catch (e) {
            console.error("Vector Store Query Failed:", e);
        }

        if (!matches || matches.length === 0 || matches[0].score < 0.75) {
            console.warn(`RAG Match Weak/None (Score: ${matches[0]?.score}). Falling back to Gemini estimation.`);

            // FALLBACK: Pure LLM Estimation
            const category = ticket.aiAnalysis?.category || ticket.department?.name || "General";
            const issueType = ticket.aiAnalysis?.issueType || "Issue";

            const estimated = await estimateSLA(category, issueType);

            const resolutionDate = calculateTargetDate(new Date(ticket.createdAt || Date.now()), estimated.duration);

            return {
                found: true,
                slaReferenced: {
                    section: "AI Estimated Policy (Fallback)",
                    policyText: estimated.reasoning,
                    duration: estimated.duration,
                    unit: 'hours'
                },
                expectedResolutionDate: resolutionDate,
                explanation: `(Estimated) ${estimated.reasoning}`
            };
        }

        // 3. Get best match
        const bestMatch = matches[0];
        const slaData = bestMatch.metadata;
        console.log("Best SLA Match:", slaData.sectionReference);

        let explanation = `Based on the Citizen Charter ${slaData.sectionReference}, ${slaData.issueType} issues must be resolved within ${slaData.slaDuration} ${slaData.slaUnit}.`;

        // 5. Calculate Date
        const creationDate = new Date(ticket.createdAt || Date.now());
        const resolutionDate = calculateTargetDate(creationDate, slaData.slaDuration);

        return {
            found: true,
            slaReferenced: {
                section: slaData.sectionReference,
                policyText: slaData.text,
                duration: slaData.slaDuration,
                unit: slaData.slaUnit
            },
            expectedResolutionDate: resolutionDate,
            explanation: explanation
        };

    } catch (error) {
        console.error("SLA Retrieval Error:", error);
        return { found: false, error: error.message };
    }
};



module.exports = { getSLAForTicket };
