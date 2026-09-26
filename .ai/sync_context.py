"""
sync_context.py — incremental sync for the Intelligence System.
Updates only the docs that have changed since the last DB write.
Run directly: python .ai/sync_context.py
"""
import sqlite3, os, re
from datetime import datetime

PROJ = os.environ.get("CLAUDE_PROJECT_DIR", os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(PROJ, ".ai", "knowledge.db")
CONTEXT_DIR = os.path.join(PROJ, "context")


def main():
    if not os.path.exists(DB_PATH):
        # Fall back to full rebuild if DB missing
        rebuild = os.path.join(PROJ, ".ai", "rebuild_db.py")
        if os.path.exists(rebuild):
            import subprocess, sys
            subprocess.run([sys.executable, rebuild], cwd=PROJ)
        return

    conn = sqlite3.connect(DB_PATH)

    updated = 0
    for fname in sorted(os.listdir(CONTEXT_DIR)):
        if not fname.endswith(".md"):
            continue
        fpath = os.path.join(CONTEXT_DIR, fname)
        file_mtime = datetime.fromtimestamp(os.path.getmtime(fpath)).isoformat()

        row = conn.execute(
            "SELECT id, updated_at FROM context_docs WHERE filename=?", (fname,)
        ).fetchone()

        if row and row[1] >= file_mtime:
            continue  # Up to date

        with open(fpath, encoding="utf-8") as f:
            content = f.read()

        # Extract title
        title = fname.replace(".md", "").replace("-", " ").title()
        for line in content.splitlines():
            m = re.match(r'^#\s+(.*)', line)
            if m:
                title = m.group(1).strip()
                break

        word_count = len(content.split())

        if row:
            conn.execute(
                "UPDATE context_docs SET title=?, content=?, word_count=?, updated_at=? WHERE id=?",
                (title, content, word_count, file_mtime, row[0])
            )
            doc_id = row[0]
        else:
            conn.execute(
                "INSERT INTO context_docs (filename, title, content, word_count, updated_at) VALUES (?, ?, ?, ?, ?)",
                (fname, title, content, word_count, file_mtime)
            )
            doc_id = conn.execute("SELECT id FROM context_docs WHERE filename=?", (fname,)).fetchone()[0]

        conn.execute("DELETE FROM context_sections WHERE doc_id=?", (doc_id,))
        # Simple section extraction
        current_heading, current_level, current_lines = None, 0, []
        for line in content.splitlines():
            m = re.match(r'^(#{1,6})\s+(.*)', line)
            if m:
                if current_heading:
                    conn.execute(
                        "INSERT INTO context_sections (doc_id, heading, content, level) VALUES (?, ?, ?, ?)",
                        (doc_id, current_heading, "\n".join(current_lines).strip(), current_level)
                    )
                current_heading = m.group(2).strip()
                current_level = len(m.group(1))
                current_lines = []
            else:
                current_lines.append(line)
        if current_heading:
            conn.execute(
                "INSERT INTO context_sections (doc_id, heading, content, level) VALUES (?, ?, ?, ?)",
                (doc_id, current_heading, "\n".join(current_lines).strip(), current_level)
            )

        updated += 1

    if updated:
        conn.execute("INSERT INTO context_fts(context_fts) VALUES('rebuild')")

    conn.commit()
    conn.close()
    print(f"[sync_context] {updated} doc(s) synced")


if __name__ == "__main__":
    main()
