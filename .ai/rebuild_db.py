"""
rebuild_db.py — full DB builder for the Intelligence System.
Reads all context/*.md files and inserts them into .ai/knowledge.db (SQLite).
Run directly: python .ai/rebuild_db.py
"""
import sqlite3, os, re
from datetime import datetime

PROJ = os.environ.get("CLAUDE_PROJECT_DIR", os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(PROJ, ".ai", "knowledge.db")
CONTEXT_DIR = os.path.join(PROJ, "context")


def init_db(conn):
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS context_docs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL UNIQUE,
            title TEXT,
            content TEXT,
            word_count INTEGER,
            updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS context_sections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id INTEGER REFERENCES context_docs(id),
            heading TEXT,
            content TEXT,
            level INTEGER
        );
        CREATE VIRTUAL TABLE IF NOT EXISTS context_fts
            USING fts5(filename, title, content, content='context_docs', content_rowid='id');
    """)
    conn.commit()


def parse_sections(text):
    sections = []
    current_heading = None
    current_level = 0
    current_lines = []
    for line in text.splitlines():
        m = re.match(r'^(#{1,6})\s+(.*)', line)
        if m:
            if current_heading is not None:
                sections.append((current_heading, current_level, "\n".join(current_lines).strip()))
            current_heading = m.group(2).strip()
            current_level = len(m.group(1))
            current_lines = []
        else:
            current_lines.append(line)
    if current_heading is not None:
        sections.append((current_heading, current_level, "\n".join(current_lines).strip()))
    return sections


def get_title(text, filename):
    for line in text.splitlines():
        m = re.match(r'^#\s+(.*)', line)
        if m:
            return m.group(1).strip()
    return filename.replace(".md", "").replace("-", " ").title()


def main():
    if not os.path.exists(CONTEXT_DIR):
        print(f"[rebuild_db] context/ dir not found at {CONTEXT_DIR}")
        return

    conn = sqlite3.connect(DB_PATH)
    init_db(conn)

    docs_processed = 0
    for fname in sorted(os.listdir(CONTEXT_DIR)):
        if not fname.endswith(".md"):
            continue
        fpath = os.path.join(CONTEXT_DIR, fname)
        with open(fpath, encoding="utf-8") as f:
            content = f.read()

        title = get_title(content, fname)
        word_count = len(content.split())
        updated_at = datetime.fromtimestamp(os.path.getmtime(fpath)).isoformat()

        # Upsert doc
        conn.execute("""
            INSERT INTO context_docs (filename, title, content, word_count, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(filename) DO UPDATE SET
                title=excluded.title,
                content=excluded.content,
                word_count=excluded.word_count,
                updated_at=excluded.updated_at
        """, (fname, title, content, word_count, updated_at))

        doc_id = conn.execute("SELECT id FROM context_docs WHERE filename=?", (fname,)).fetchone()[0]

        # Replace sections
        conn.execute("DELETE FROM context_sections WHERE doc_id=?", (doc_id,))
        for heading, level, sec_content in parse_sections(content):
            conn.execute(
                "INSERT INTO context_sections (doc_id, heading, content, level) VALUES (?, ?, ?, ?)",
                (doc_id, heading, sec_content, level)
            )

        docs_processed += 1

    # Rebuild FTS index
    conn.execute("INSERT INTO context_fts(context_fts) VALUES('rebuild')")
    conn.commit()
    conn.close()

    print(f"[rebuild_db] Done — {docs_processed} docs indexed into {DB_PATH}")


if __name__ == "__main__":
    main()
