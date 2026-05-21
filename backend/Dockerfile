# "While you were learning docker tutorials in your basement, Morty, I was
# *bzrp* containerizing the cromulon empire on a Tuesday. Python 3.12 in
# here because 3.14 wheels don't exist in this dimension yet." — Terl
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
