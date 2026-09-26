const codeInput = document.getElementById("codeInput");
const reviewStatus = document.getElementById("reviewStatus");

async function reviewCode() {

    const code = codeInput.value.trim();
    const language = document.getElementById("language").value;

    if (!code) {
        alert("Please enter some code first.");
        return;
    }

    // Change UI while AI is working
    reviewStatus.textContent = "Analyzing...";

    document.getElementById("score").textContent = "...";

    document.getElementById("scoreText").textContent =
        "AI is analyzing your code.";

    document.getElementById("bugResult").textContent =
        "Checking for bugs and errors...";

    document.getElementById("qualityResult").textContent =
        "Analyzing code quality...";

    document.getElementById("suggestionResult").textContent =
        "Generating suggestions...";


    try {

        // Send code to our backend
        const response = await fetch("http://127.0.0.1:5000/api/review", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                code: code,
                language: language
            })
        });


        // Check if backend returned an error
        if (!response.ok) {
            throw new Error("Server error");
        }


        // Get AI response
        const result = await response.json();


        // -------------------------
        // SCORE
        // -------------------------

        document.getElementById("score").textContent =
            result.score ?? "--";

        document.getElementById("scoreText").textContent =
            result.scoreExplanation ||
            "AI-generated code quality score.";


        // -------------------------
        // BUGS & ERRORS
        // -------------------------

        if (result.bugs && result.bugs.length > 0) {

            document.getElementById("bugResult").innerHTML =
                result.bugs
                    .map(bug => `• ${bug}`)
                    .join("<br>");

        } else {

            document.getElementById("bugResult").textContent =
                "No major bugs detected.";
        }


        // -------------------------
        // CODE QUALITY
        // -------------------------

        document.getElementById("qualityResult").textContent =
            result.quality ||
            "No quality analysis available.";


        // -------------------------
        // SUGGESTIONS
        // -------------------------

        if (
            result.suggestions &&
            result.suggestions.length > 0
        ) {

            document.getElementById("suggestionResult").innerHTML =
                result.suggestions
                    .map(suggestion => `• ${suggestion}`)
                    .join("<br>");

        } else {

            document.getElementById("suggestionResult").textContent =
                "No additional suggestions.";
        }


        // Review completed
        reviewStatus.textContent = "Completed";


    } catch (error) {

        console.error("Review Error:", error);

        reviewStatus.textContent = "Error";

        document.getElementById("score").textContent = "--";

        document.getElementById("scoreText").textContent =
            "Unable to analyze the code.";

        document.getElementById("bugResult").textContent =
            "Could not connect to the AI reviewer.";

        document.getElementById("qualityResult").textContent =
            "Please check that the backend is running.";

        document.getElementById("suggestionResult").textContent =
            "Try again after starting the server.";

    }
}


// -------------------------
// CLEAR CODE
// -------------------------

function clearCode() {

    codeInput.value = "";

    document.getElementById("score").textContent = "--";

    document.getElementById("scoreText").textContent =
        "Submit your code for analysis";

    document.getElementById("bugResult").textContent =
        "No analysis yet.";

    document.getElementById("qualityResult").textContent =
        "Waiting for review.";

    document.getElementById("suggestionResult").textContent =
        "AI suggestions will appear here.";

    reviewStatus.textContent = "Ready";
}