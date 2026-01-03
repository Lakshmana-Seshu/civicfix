require('dotenv').config();
const { getSLAForTicket } = require('./services/slaService');

const verifyFallback = async () => {
    console.log("--- Verifying SLA Fallback Logic ---");

    // Simulate a ticket with a weird issue that won't match the PDF
    const weirdTicket = {
        title: "Alien Spaceship Landing",
        department: { name: "Extraterrestrial Affairs" },
        aiAnalysis: {
            category: "Space Defense",
            issueType: "UFO Landing Permission"
        },
        createdAt: new Date()
    };

    console.log("Mock Ticket:", weirdTicket.aiAnalysis);

    try {
        const sla = await getSLAForTicket(weirdTicket);

        console.log("SLA Result:", JSON.stringify(sla, null, 2));

        if (sla.found && sla.slaReferenced.section.includes("Fallback")) {
            console.log("✅ SUCCESS: Fallback triggered correctly.");
        } else if (sla.found) {
            console.log("⚠️ INTERESTING: It actually found a RAG match?");
        } else {
            console.log("❌ FAILURE: Fallback did not return a result.");
        }

    } catch (e) {
        console.error("Test Error:", e);
    }
};

verifyFallback();
