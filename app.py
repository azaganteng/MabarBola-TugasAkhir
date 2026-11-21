import csv
from pathlib import Path

from flask import Flask, jsonify, render_template, request


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "Dataset" / "dataset_futsal_sepakbola_jogja_sleman.csv"

app = Flask(__name__)


def load_fields():
    """Load venue data from the project CSV dataset."""
    with DATASET_PATH.open(encoding="utf-8-sig", newline="") as file:
        return [
            {
                **row,
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
            }
            for row in csv.DictReader(file)
        ]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/lapangan")
def fields_api():
    """Return fields, optionally filtered by type or search query."""
    fields = load_fields()
    jenis = request.args.get("jenis", "Semua").strip().lower()
    query = request.args.get("q", "").strip().lower()

    if jenis and jenis != "semua":
        fields = [
            field
            for field in fields
            if field["jenis"].lower() == jenis or field["jenis"].lower() == "keduanya"
        ]

    if query:
        fields = [
            field
            for field in fields
            if query in field["nama"].lower() or query in field["alamat"].lower()
        ]

    return jsonify(fields)


@app.errorhandler(FileNotFoundError)
def dataset_not_found(error):
    return jsonify(error="Dataset lapangan tidak ditemukan."), 500


if __name__ == "__main__":
    app.run(debug=True)
