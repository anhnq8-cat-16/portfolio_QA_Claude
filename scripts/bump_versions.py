"""Bump every ?v=N cache-busting query string in bold/index.html and bold/admin.html.

Run this after editing style.css, main.js, content.json/js, admin.js, or admin.css —
anything referenced with a ?v= tag — so browsers pick up the new file instead of a
cached copy. index.html's tags are all synced to one shared next number (its existing
convention); admin.html's tags are bumped independently, one per referenced file.

    python3 scripts/bump_versions.py
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def bump_shared(path):
    """All ?v=N tags in the file move to the same new max+1 value."""
    with open(path, encoding="utf-8") as f:
        text = f.read()
    nums = [int(n) for n in re.findall(r"\?v=(\d+)", text)]
    if not nums:
        return None
    next_v = max(nums) + 1
    updated = re.sub(r"\?v=\d+", "?v=" + str(next_v), text)
    with open(path, "w", encoding="utf-8") as f:
        f.write(updated)
    return next_v


def bump_independent(path):
    """Each distinct referenced file's ?v=N is bumped on its own, independently."""
    with open(path, encoding="utf-8") as f:
        text = f.read()

    def repl(m):
        return m.group(1) + "?v=" + str(int(m.group(2)) + 1)

    updated, count = re.subn(r"([\w./-]+\.(?:css|js))\?v=(\d+)", repl, text)
    with open(path, "w", encoding="utf-8") as f:
        f.write(updated)
    return count


if __name__ == "__main__":
    idx = os.path.join(ROOT, "bold", "index.html")
    admin = os.path.join(ROOT, "bold", "admin.html")

    v = bump_shared(idx)
    print(f"bold/index.html -> all tags now ?v={v}")

    n = bump_independent(admin)
    print(f"bold/admin.html -> bumped {n} tag(s) independently")
