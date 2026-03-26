from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


def generate_checklist(description: str) -> list[str]:
    """Simulated external AI skill using keyword-based checklist generation."""
    text = (description or "").lower()
    items: list[str] = []

    def add(item: str) -> None:
        if item not in items:
            items.append(item)

    if "api" in text:
        add("Create endpoint")
        add("Validate data")
        add("Test API")

    if any(keyword in text for keyword in ["login", "auth", "authentication"]):
        add("Implement authentication")

    if any(keyword in text for keyword in ["ui", "screen", "page", "frontend"]):
        add("Design interface")
        add("Build UI components")

    if any(keyword in text for keyword in ["database", "db", "sql"]):
        add("Design schema")
        add("Implement data layer")

    if any(keyword in text for keyword in ["bug", "fix", "issue"]):
        add("Reproduce issue")
        add("Implement fix")
        add("Regression test")

    if not items:
        items = [
            "Break down requirements",
            "Implement task",
            "Test functionality",
            "Review and finalize",
        ]

    return items


@app.route("/")
def index():
    return render_template("index.html")


@app.post("/api/checklist")
def checklist_api():
    payload = request.get_json(silent=True) or {}
    description = str(payload.get("description", ""))
    checklist = generate_checklist(description)
    return jsonify({"checklist": checklist})


if __name__ == "__main__":
    app.run(debug=True)
