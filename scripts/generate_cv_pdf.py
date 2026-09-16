"""Generates NguyenQuyAnh-CV-VI.pdf and NguyenQuyAnh-CV-EN.pdf from data/content.json.
Run: python3 scripts/generate_cv_pdf.py
Requires: fpdf2 (pip install fpdf2)
"""
import json
import os
from fpdf import FPDF

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_REG = "/Library/Fonts/Tahoma.ttf"
FONT_BOLD = "/Library/Fonts/Tahoma Bold.ttf"
QR_PATH = os.path.join(ROOT, "assets", "cv", "qr-portfolio.png")
QR_LABEL = {"vi": "Xem Portfolio", "en": "View Portfolio"}

RED = (255, 49, 49)
INK = (23, 23, 23)
GRAY = (110, 110, 110)
LINE = (225, 225, 225)

with open(os.path.join(ROOT, "data", "content.json"), encoding="utf-8") as f:
    C = json.load(f)


def t(field, lang):
    """Resolve a bilingual {"vi":..,"en":..} field, or pass through plain strings."""
    if isinstance(field, dict) and "vi" in field and "en" in field:
        return field[lang]
    return field


class CV(FPDF):
    def header(self):
        pass

    def footer(self):
        lang = getattr(self, "lang", "vi")

        if os.path.exists(QR_PATH):
            qr_size = 11
            qr_x = self.w - self.r_margin - qr_size
            qr_y = self.h - 20
            self.image(QR_PATH, x=qr_x, y=qr_y, w=qr_size, h=qr_size)
            self.set_xy(self.l_margin, qr_y)
            self.set_font("Body", "", 7)
            self.set_text_color(*GRAY)
            self.cell(qr_x - self.l_margin - 2, qr_size, QR_LABEL.get(lang, QR_LABEL["vi"]), align="R")

        self.set_y(-12)
        self.set_font("Body", "", 8)
        self.set_text_color(*GRAY)
        page_label = f"{self.page_no()}"
        self.cell(0, 8, page_label, align="C")


def section_title(pdf: CV, label: str):
    pdf.ln(3)
    pdf.set_font("Body", "B", 11.5)
    pdf.set_text_color(*RED)
    pdf.cell(4)
    pdf.cell(0, 7, label.upper(), new_x="LMARGIN", new_y="NEXT")
    y = pdf.get_y() + 0.5
    pdf.set_draw_color(*LINE)
    pdf.set_line_width(0.4)
    pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y)
    pdf.ln(3)


def label_line(pdf: CV, label: str, value: str, indent=6, size=9.4):
    """One line/paragraph: '**Label:** value' using markdown bold, gray value."""
    pdf.set_x(pdf.l_margin + indent)
    pdf.set_font("Body", "", size)
    pdf.set_text_color(*INK)
    avail = pdf.w - pdf.r_margin - (pdf.l_margin + indent)
    pdf.multi_cell(avail, 5, f"**{label}:** {value}", new_x="LMARGIN", new_y="NEXT", markdown=True)


def bullet(pdf: CV, text: str, size=9.6):
    pdf.set_font("Body", "", size)
    pdf.set_text_color(*INK)
    indent = 6
    pdf.set_x(pdf.l_margin + indent)
    avail = pdf.w - pdf.r_margin - (pdf.l_margin + indent)
    pdf.set_font("Body", "B", size)
    pdf.set_text_color(*RED)
    dash_w = 4
    pdf.cell(dash_w, 5, "-")
    pdf.set_font("Body", "", size)
    pdf.set_text_color(*INK)
    pdf.set_x(pdf.l_margin + indent + dash_w)
    pdf.multi_cell(avail - dash_w, 5, text, new_x="LMARGIN", new_y="NEXT")


def build(lang: str, out_path: str):
    pdf = CV(format="A4")
    pdf.lang = lang
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.set_margins(18, 16, 18)
    pdf.add_font("Body", "", FONT_REG)
    pdf.add_font("Body", "B", FONT_BOLD)
    pdf.add_page()

    P = C["personal"]
    ui = C["ui"]

    # ---- Header ----
    pdf.set_font("Body", "B", 22)
    pdf.set_text_color(*INK)
    pdf.cell(0, 10, P["fullName"] if lang == "vi" else P["displayName"], new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Body", "B", 12)
    pdf.set_text_color(*RED)
    pdf.cell(0, 7, t(P["title"], lang), new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Body", "", 9.5)
    pdf.set_text_color(*GRAY)
    pdf.cell(0, 6, t(P["targetRole"], lang), new_x="LMARGIN", new_y="NEXT")

    pdf.ln(1)
    pdf.set_font("Body", "", 9.5)
    pdf.set_text_color(*INK)
    contact_line = f"{P['email']}   |   {P['phoneDisplay']}   |   {t(P['location'], lang)}   |   {P['linkedinLabel']}"
    pdf.cell(0, 6, contact_line, new_x="LMARGIN", new_y="NEXT")

    pdf.ln(1)
    pdf.set_draw_color(*RED)
    pdf.set_line_width(0.8)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())

    # ---- Summary ----
    section_title(pdf, C["about"]["heading"][lang] if lang == "vi" else "Professional Summary")
    pdf.set_font("Body", "", 9.8)
    pdf.set_text_color(*INK)
    summary = " ".join(t(p, lang) for p in C["about"]["paragraphs"])
    pdf.multi_cell(0, 5.2, summary, new_x="LMARGIN", new_y="NEXT")

    # ---- Experience ----
    section_title(pdf, C["experience"]["heading"][lang])
    for item in C["experience"]["items"]:
        pdf.set_font("Body", "B", 10.3)
        pdf.set_text_color(*INK)
        role_line = f"{t(item['role'], lang)} — {item['company']}"
        pdf.cell(0, 5.6, role_line, new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Body", "", 9)
        pdf.set_text_color(*GRAY)
        pdf.cell(0, 5, t(item["period"], lang), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(0.5)
        for b in item["bullets"]:
            bullet(pdf, t(b, lang))
        pdf.ln(2)

    # ---- Core competencies ----
    section_title(pdf, C["competencies"]["heading"][lang])
    for comp in C["competencies"]["items"]:
        sub = ", ".join(t(i, lang) for i in comp["items"])
        label_line(pdf, t(comp["title"], lang), sub)
        pdf.ln(0.5)

    # ---- Skills ----
    section_title(pdf, C["skills"]["heading"][lang])
    for cat in C["skills"]["categories"]:
        line = ", ".join(t(i, lang) for i in cat["items"])
        label_line(pdf, t(cat["label"], lang), line)
        pdf.ln(0.5)

    langs = ", ".join(f"{t(l['name'], lang)} ({t(l['level'], lang)})" for l in C["skills"]["languages"])
    lang_label = "Ngôn ngữ" if lang == "vi" else "Languages"
    label_line(pdf, lang_label, langs)

    # ---- Education ----
    section_title(pdf, C["education"]["heading"][lang])
    for sc in C["education"]["schools"]:
        pdf.set_font("Body", "B", 9.8)
        pdf.set_text_color(*INK)
        pdf.multi_cell(0, 5.2, t(sc["school"], lang), new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Body", "", 9.2)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(0, 5, f"{t(sc['program'], lang)} — {t(sc['period'], lang)}", new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(*INK)
        pdf.multi_cell(0, 5, t(sc["honor"], lang), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(1)

    cert_label = "Chứng chỉ" if lang == "vi" else "Certificates"
    certs = "; ".join(f"{t(c['name'], lang)} ({c['issuer']})" for c in C["education"]["certificates"])
    label_line(pdf, cert_label, certs, indent=0)

    pdf.output(out_path)
    print("wrote", out_path)


if __name__ == "__main__":
    out_dir = os.path.join(ROOT, "assets", "cv")
    os.makedirs(out_dir, exist_ok=True)
    build("vi", os.path.join(out_dir, "NguyenQuyAnh-CV-VI.pdf"))
    build("en", os.path.join(out_dir, "NguyenQuyAnh-CV-EN.pdf"))
