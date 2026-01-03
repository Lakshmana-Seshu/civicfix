const { embedText } = require('./services/geminiService');
const { queryDepartmentCharter } = require('./services/pineconeService');

const verifyDept = async () => {
    try {
        const query = "Who handles garbage collection and waste management?";
        console.log(`Querying: "${query}"`);

        const embedding = await embedText(query);
        const results = await queryDepartmentCharter(embedding);

        console.log("\n--- Verification Results ---");
        if (results && results.length > 0) {
            results.forEach((res, i) => {
                console.log(`#${i + 1} Score: ${res.score.toFixed(4)}`);
                console.log(`   Dept: ${res.metadata.departmentName}`);
                console.log(`   Summary: ${res.metadata.summary}`);
            });
            console.log("\n✅ Test Passed: Found matches.");
        } else {
            console.log("❌ Test Failed: No results found.");
        }
    } catch (e) {
        console.error("Test Error:", e);
    }
};

verifyDept();
