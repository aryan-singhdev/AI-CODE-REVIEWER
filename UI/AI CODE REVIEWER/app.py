from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get Gemini API key
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is missing in .env file")

# Gemini client
client = genai.Client(api_key=API_KEY)


@app.route("/api/review", methods=["POST"])
def review_code():

        try:
            # Get data from frontend
            data = request.get_json()

            code = data.get("code", "")
            language = data.get("language", "Python")

            if not code.strip():
                return jsonify({
                    "error": "No code provided"
                }), 400

            # AI prompt
            prompt = f'''
You are an expert software engineer and code reviewer.

Review the following {language} code carefully.

CODE:
{code}

Analyze the code for:
- Bugs and errors
- Code quality
- Readability
- Efficiency
- Security
- Best practices

Give a score from 0 to 100.

Return ONLY valid JSON in this exact format:

{{
    "score": 0,
    "scoreExplanation": "Short explanation of the score",
    "bugs": [
        "Bug or error found"
    ],
    "quality": "Short code quality analysis",
    "suggestions": [
        "Suggestion 1",
        "Suggestion 2"
    ]
}}

If there are no bugs, return an empty bugs array.

Do not invent bugs that do not exist.
'''

            # Send code to Gemini
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt
            )

            ai_text = response.text.strip()

            # Remove Markdown code fences if Gemini adds them
            if ai_text.startswith("```"):
                ai_text = ai_text.replace("```json", "")
                ai_text = ai_text.replace("```", "")
                ai_text = ai_text.strip()

            # Convert AI response into JSON
            result = json.loads(ai_text)

            # Keep score between 0 and 100
            score = int(result.get("score", 0))
            result["score"] = max(0, min(100, score))

            return jsonify(result)

        except json.JSONDecodeError:
            return jsonify({
                "error": "AI returned an invalid JSON response."
            }), 500

        except Exception as e:
            print("ERROR:", e)

            return jsonify({
                "error": str(e)
            }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)