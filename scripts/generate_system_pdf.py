#!/usr/bin/env python3
"""
Advaita VOICE Hub — Master System Documentation PDF Generator
Uses Cairo and PangoCairo for vector typography, complex text shaping,
tables, headers/footers, and executive layout.
"""

import os
import re
import sys
import cairo
import gi

gi.require_version('Pango', '1.0')
gi.require_version('PangoCairo', '1.0')
from gi.repository import Pango, PangoCairo
from PIL import Image

PAGE_WIDTH = 595.28   # A4 Width in points
PAGE_HEIGHT = 841.89  # A4 Height in points
MARGIN_LEFT = 48.0
MARGIN_RIGHT = 48.0
MARGIN_TOP = 52.0
MARGIN_BOTTOM = 60.0
CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
MAX_Y = PAGE_HEIGHT - MARGIN_BOTTOM

# Executive Color Palette (Tailwind Amber & Slate inspired)
COLOR_PRIMARY = (0.85, 0.47, 0.02)      # Amber 600
COLOR_PRIMARY_DARK = (0.71, 0.33, 0.04) # Amber 700
COLOR_ACCENT = (0.05, 0.59, 0.41)       # Emerald 600
COLOR_TEXT_MAIN = (0.06, 0.09, 0.16)    # Slate 900
COLOR_TEXT_MUTED = (0.39, 0.45, 0.55)   # Slate 500
COLOR_BG_CARD = (0.97, 0.98, 0.99)      # Slate 50
COLOR_BORDER = (0.89, 0.91, 0.94)       # Slate 200
COLOR_CODE_BG = (0.08, 0.11, 0.18)      # Slate 900
COLOR_CODE_TEXT = (0.93, 0.95, 0.98)    # Slate 100

class PDFGenerator:
    def __init__(self, output_path):
        self.output_path = output_path

    def draw_running_header_footer(self, cr, page_num, total_pages, section_title=""):
        if page_num == 1:
            return  # Skip cover page

        cr.save()
        # Running Header Left: Document Name
        cr.set_source_rgb(*COLOR_TEXT_MUTED)
        layout_left = PangoCairo.create_layout(cr)
        layout_left.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans 7"))
        layout_left.set_text("ADVAITA VOICE HUB — COMPLETE SYSTEM MANUAL", -1)
        layout_left.set_width(int(230 * Pango.SCALE))
        cr.move_to(MARGIN_LEFT, 26)
        PangoCairo.show_layout(cr, layout_left)

        # Running Header Right: Current Section
        if section_title:
            layout_sec = PangoCairo.create_layout(cr)
            layout_sec.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans Bold 7"))
            layout_sec.set_text(section_title[:42].upper(), -1)
            layout_sec.set_alignment(Pango.Alignment.RIGHT)
            layout_sec.set_width(int(245 * Pango.SCALE))
            cr.move_to(PAGE_WIDTH - MARGIN_RIGHT - 245, 26)
            PangoCairo.show_layout(cr, layout_sec)

        # Header Rule
        cr.set_source_rgb(*COLOR_BORDER)
        cr.set_line_width(0.6)
        cr.move_to(MARGIN_LEFT, 38)
        cr.line_to(PAGE_WIDTH - MARGIN_RIGHT, 38)
        cr.stroke()

        # Running Footer Rule
        cr.move_to(MARGIN_LEFT, PAGE_HEIGHT - 40)
        cr.line_to(PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 40)
        cr.stroke()

        # Footer Text (Left)
        cr.set_source_rgb(*COLOR_TEXT_MUTED)
        layout_foot = PangoCairo.create_layout(cr)
        layout_foot.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans 7.5"))
        layout_foot.set_text("Advaita VOICE Technology Division • University of Chittagong", -1)
        cr.move_to(MARGIN_LEFT, PAGE_HEIGHT - 30)
        PangoCairo.show_layout(cr, layout_foot)

        # Footer Page Number (Right)
        layout_pg = PangoCairo.create_layout(cr)
        layout_pg.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans Bold 8"))
        layout_pg.set_text(f"Page {page_num} of {total_pages}", -1)
        layout_pg.set_alignment(Pango.Alignment.RIGHT)
        layout_pg.set_width(int(CONTENT_WIDTH * Pango.SCALE))
        cr.move_to(MARGIN_LEFT, PAGE_HEIGHT - 30)
        PangoCairo.show_layout(cr, layout_pg)

        cr.restore()

    def draw_cover_page(self, cr):
        cr.save()
        # Decorative Top Banner
        pattern = cairo.LinearGradient(0, 0, PAGE_WIDTH, 14)
        pattern.add_color_stop_rgb(0.0, 0.85, 0.47, 0.02)  # Amber 600
        pattern.add_color_stop_rgb(1.0, 0.71, 0.33, 0.04)  # Amber 700
        cr.set_source(pattern)
        cr.rectangle(0, 0, PAGE_WIDTH, 14)
        cr.fill()

        # Sacred Lotus / Logo
        logo_path = 'public/logo.png'
        if os.path.exists(logo_path):
            try:
                img = Image.open(logo_path).convert('RGBA')
                img.thumbnail((120, 120))
                tmp_logo = 'scratch_logo_cover.png'
                img.save(tmp_logo)
                img_surface = cairo.ImageSurface.create_from_png(tmp_logo)
                w = img_surface.get_width()
                cr.set_source_surface(img_surface, (PAGE_WIDTH - w)/2, 75)
                cr.paint()
                if os.path.exists(tmp_logo):
                    os.remove(tmp_logo)
            except Exception as e:
                print("Logo render exception:", e)

        # Title
        y = 215
        cr.set_source_rgb(*COLOR_PRIMARY_DARK)
        layout = PangoCairo.create_layout(cr)
        layout.set_font_description(Pango.FontDescription("Montserrat, Adwaita Sans Bold 26"))
        layout.set_text("ADVAITA VOICE HUB", -1)
        layout.set_alignment(Pango.Alignment.CENTER)
        layout.set_width(int(CONTENT_WIDTH * Pango.SCALE))
        cr.move_to(MARGIN_LEFT, y)
        PangoCairo.show_layout(cr, layout)

        y += 40
        cr.set_source_rgb(*COLOR_TEXT_MAIN)
        layout = PangoCairo.create_layout(cr)
        layout.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans SemiBold 12"))
        layout.set_text("Vedic Ashram Management, Operational Automation & Spiritual Analytics Ecosystem", -1)
        layout.set_alignment(Pango.Alignment.CENTER)
        layout.set_width(int(CONTENT_WIDTH * Pango.SCALE))
        cr.move_to(MARGIN_LEFT, y)
        PangoCairo.show_layout(cr, layout)
        w_sub, h_sub = layout.get_pixel_size()

        # Version Badge
        y += h_sub + 16
        badge_text = "PRODUCTION EDITION — VERSION 12.0.0"
        badge_layout = PangoCairo.create_layout(cr)
        badge_layout.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans Bold 8.5"))
        badge_layout.set_text(badge_text, -1)
        bw, bh = badge_layout.get_pixel_size()
        bx = (PAGE_WIDTH - (bw + 24)) / 2
        
        cr.set_source_rgb(0.99, 0.95, 0.88) # Light amber
        cr.rectangle(bx, y, bw + 24, bh + 10)
        cr.fill()
        cr.set_source_rgb(*COLOR_PRIMARY)
        cr.set_line_width(1)
        cr.rectangle(bx, y, bw + 24, bh + 10)
        cr.stroke()

        cr.set_source_rgb(*COLOR_PRIMARY_DARK)
        cr.move_to(bx + 12, y + 5)
        PangoCairo.show_layout(cr, badge_layout)

        # Divider line
        y += bh + 28
        cr.set_source_rgb(*COLOR_BORDER)
        cr.set_line_width(1)
        cr.move_to(MARGIN_LEFT + 80, y)
        cr.line_to(PAGE_WIDTH - MARGIN_RIGHT - 80, y)
        cr.stroke()

        # Metadata Card
        y += 24
        card_w = CONTENT_WIDTH
        card_h = 154
        cr.set_source_rgb(*COLOR_BG_CARD)
        cr.rectangle(MARGIN_LEFT, y, card_w, card_h)
        cr.fill()
        cr.set_source_rgb(*COLOR_BORDER)
        cr.set_line_width(1)
        cr.rectangle(MARGIN_LEFT, y, card_w, card_h)
        cr.stroke()

        # Left Accent Border
        cr.set_source_rgb(*COLOR_PRIMARY)
        cr.rectangle(MARGIN_LEFT, y, 4, card_h)
        cr.fill()

        meta_items = [
            ("Lead Engineer & Architect:", "Gian Juti Tripura (gianjuti.csecu@gmail.com)"),
            ("Academic Affiliation:", "Dept. of Computer Science & Engineering, University of Chittagong"),
            ("Spiritual Partner:", "Advaita VOICE & ISKCON Youth Forum (IYF)"),
            ("Current Release Package:", "Advaita-VOICE-Hub-v12.apk (Android Target SDK 34)"),
            ("Deployment Targets:", "Cross-Platform Progressive Web App (PWA) & Standalone Android APK"),
            ("Date of Publication:", "September 2026")
        ]

        my = y + 12
        for label, val in meta_items:
            cr.set_source_rgb(*COLOR_PRIMARY_DARK)
            l_layout = PangoCairo.create_layout(cr)
            l_layout.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans Bold 8.5"))
            l_layout.set_text(label, -1)
            cr.move_to(MARGIN_LEFT + 16, my)
            PangoCairo.show_layout(cr, l_layout)

            cr.set_source_rgb(*COLOR_TEXT_MAIN)
            v_layout = PangoCairo.create_layout(cr)
            v_layout.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans 8.5"))
            v_layout.set_text(val, -1)
            v_layout.set_width(int((card_w - 185) * Pango.SCALE))
            cr.move_to(MARGIN_LEFT + 172, my)
            PangoCairo.show_layout(cr, v_layout)
            vw, vh = v_layout.get_pixel_size()
            my += max(vh, 16) + 4

        # Executive Abstract Quote
        y += card_h + 26
        cr.set_source_rgb(0.98, 0.98, 0.99)
        cr.rectangle(MARGIN_LEFT, y, CONTENT_WIDTH, 68)
        cr.fill()
        cr.set_source_rgb(0.85, 0.88, 0.92)
        cr.set_line_width(0.8)
        cr.rectangle(MARGIN_LEFT, y, CONTENT_WIDTH, 68)
        cr.stroke()
        cr.set_source_rgb(*COLOR_ACCENT)
        cr.rectangle(MARGIN_LEFT, y, 3.5, 68)
        cr.fill()

        abstract_text = (
            "\"Advaita VOICE Hub completely digitizes ashram operations for the University of Chittagong spiritual "
            "community. Incorporating deterministic cyclical seva rotation, emergency difficulty-balanced allocations, "
            "real-time sadhana & disciplinary auto-strikes, and dynamic dining hall financial ledgers.\""
        )
        ab_layout = PangoCairo.create_layout(cr)
        ab_layout.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans Italic 8.5"))
        ab_layout.set_text(abstract_text, -1)
        ab_layout.set_width(int((CONTENT_WIDTH - 28) * Pango.SCALE))
        cr.set_source_rgb(*COLOR_TEXT_MAIN)
        cr.move_to(MARGIN_LEFT + 16, y + 12)
        PangoCairo.show_layout(cr, ab_layout)

        # Bottom Stamp
        cr.set_source_rgb(*COLOR_TEXT_MUTED)
        b_layout = PangoCairo.create_layout(cr)
        b_layout.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans 7.8"))
        b_layout.set_text("Advaita VOICE Technology Division • Official Engineering Documentation • All Rights Reserved", -1)
        b_layout.set_alignment(Pango.Alignment.CENTER)
        b_layout.set_width(int(CONTENT_WIDTH * Pango.SCALE))
        cr.move_to(MARGIN_LEFT, PAGE_HEIGHT - 42)
        PangoCairo.show_layout(cr, b_layout)

        cr.restore()

def parse_markdown_blocks(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    lines = text.split('\n')
    blocks = []
    i = 0
    n = len(lines)

    in_code = False
    code_lang = ""
    code_lines = []

    in_table = False
    table_rows = []

    skipping_frontmatter_and_toc = True

    while i < n:
        line = lines[i]

        # Skip top frontmatter and markdown TOC until we hit Section 1
        if skipping_frontmatter_and_toc:
            if line.strip().startswith('## 1. Executive Summary'):
                skipping_frontmatter_and_toc = False
            else:
                i += 1
                continue

        # Fenced code block
        if line.strip().startswith('```'):
            if in_code:
                blocks.append({
                    'type': 'code',
                    'lang': code_lang,
                    'content': '\n'.join(code_lines)
                })
                in_code = False
                code_lines = []
            else:
                code_lang = line.strip()[3:].strip()
                in_code = True
                code_lines = []
            i += 1
            continue

        if in_code:
            code_lines.append(line)
            i += 1
            continue

        # Markdown Table Detection
        if '|' in line and line.strip().startswith('|') and line.strip().endswith('|'):
            stripped = line.strip()
            if re.match(r'^\|(\s*:?-+:?\s*\|)+$', stripped):
                i += 1
                continue
            cells = [c.strip() for c in stripped.split('|')[1:-1]]
            if not in_table:
                in_table = True
                table_rows = [cells]
            else:
                table_rows.append(cells)
            i += 1
            continue
        else:
            if in_table:
                blocks.append({
                    'type': 'table',
                    'rows': table_rows
                })
                in_table = False
                table_rows = []

        stripped = line.strip()
        if not stripped:
            i += 1
            continue

        # Headings
        if stripped.startswith('### '):
            blocks.append({'type': 'h3', 'text': stripped[4:].strip()})
        elif stripped.startswith('## '):
            blocks.append({'type': 'h2', 'text': stripped[3:].strip()})
        elif stripped.startswith('# '):
            blocks.append({'type': 'h1', 'text': stripped[2:].strip()})
        elif stripped == '---':
            blocks.append({'type': 'hr'})
        elif stripped.startswith('* ') or stripped.startswith('- '):
            blocks.append({'type': 'bullet', 'text': stripped[2:].strip()})
        elif re.match(r'^\d+\.\s+', stripped):
            match = re.match(r'^\d+\.\s+(.*)$', stripped)
            blocks.append({'type': 'number', 'text': match.group(1).strip()})
        elif stripped.startswith('> '):
            blocks.append({'type': 'quote', 'text': stripped[2:].strip()})
        else:
            blocks.append({'type': 'p', 'text': stripped})

        i += 1

    if in_table and table_rows:
        blocks.append({'type': 'table', 'rows': table_rows})

    return blocks

def clean_inline_md(text):
    t = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    t = re.sub(r'\*(.*?)\*', r'\1', t)
    t = re.sub(r'`(.*?)`', r'\1', t)
    t = re.sub(r'\[(.*?)\]\((.*?)\)', r'\1', t)
    return t

class Renderer:
    def __init__(self, output_path, blocks):
        self.output_path = output_path
        self.blocks = blocks
        self.generator = PDFGenerator(output_path)
        self.total_pages = 1

    def measure_or_draw_block(self, cr, block, y, draw=True):
        btype = block['type']

        if btype == 'h1':
            text = clean_inline_md(block['text'])
            layout = PangoCairo.create_layout(cr)
            layout.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans Bold 14"))
            layout.set_text(text, -1)
            layout.set_width(int(CONTENT_WIDTH * Pango.SCALE))
            w, h = layout.get_pixel_size()
            total_h = h + 16
            if draw:
                cr.set_source_rgb(*COLOR_PRIMARY_DARK)
                cr.move_to(MARGIN_LEFT, y + 4)
                PangoCairo.show_layout(cr, layout)
                cr.set_source_rgb(*COLOR_PRIMARY)
                cr.rectangle(MARGIN_LEFT, y + total_h - 4, CONTENT_WIDTH, 1.5)
                cr.fill()
            return total_h

        elif btype == 'h2':
            text = clean_inline_md(block['text'])
            layout = PangoCairo.create_layout(cr)
            layout.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans Bold 11.5"))
            layout.set_text(text, -1)
            layout.set_width(int(CONTENT_WIDTH * Pango.SCALE))
            w, h = layout.get_pixel_size()
            total_h = h + 12
            if draw:
                cr.set_source_rgb(*COLOR_TEXT_MAIN)
                cr.move_to(MARGIN_LEFT, y + 3)
                PangoCairo.show_layout(cr, layout)
            return total_h

        elif btype == 'h3':
            text = clean_inline_md(block['text'])
            layout = PangoCairo.create_layout(cr)
            layout.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans Bold 9.8"))
            layout.set_text(text, -1)
            layout.set_width(int(CONTENT_WIDTH * Pango.SCALE))
            w, h = layout.get_pixel_size()
            total_h = h + 8
            if draw:
                cr.set_source_rgb(*COLOR_PRIMARY_DARK)
                cr.move_to(MARGIN_LEFT, y + 2)
                PangoCairo.show_layout(cr, layout)
            return total_h

        elif btype == 'p':
            text = clean_inline_md(block['text'])
            layout = PangoCairo.create_layout(cr)
            layout.set_font_description(Pango.FontDescription("Noto Sans, Liberation Sans 8.8"))
            layout.set_text(text, -1)
            layout.set_width(int(CONTENT_WIDTH * Pango.SCALE))
            layout.set_spacing(int(3 * Pango.SCALE))
            w, h = layout.get_pixel_size()
            total_h = h + 6
            if draw:
                cr.set_source_rgb(*COLOR_TEXT_MAIN)
                cr.move_to(MARGIN_LEFT, y)
                PangoCairo.show_layout(cr, layout)
            return total_h

        elif btype == 'bullet':
            text = clean_inline_md(block['text'])
            layout = PangoCairo.create_layout(cr)
            layout.set_font_description(Pango.FontDescription("Noto Sans, Liberation Sans 8.8"))
            layout.set_text(text, -1)
            layout.set_width(int((CONTENT_WIDTH - 16) * Pango.SCALE))
            w, h = layout.get_pixel_size()
            total_h = h + 5
            if draw:
                cr.set_source_rgb(*COLOR_PRIMARY)
                cr.arc(MARGIN_LEFT + 5, y + 6, 2.0, 0, 2 * 3.14159)
                cr.fill()
                cr.set_source_rgb(*COLOR_TEXT_MAIN)
                cr.move_to(MARGIN_LEFT + 14, y)
                PangoCairo.show_layout(cr, layout)
            return total_h

        elif btype == 'number':
            text = clean_inline_md(block['text'])
            layout = PangoCairo.create_layout(cr)
            layout.set_font_description(Pango.FontDescription("Noto Sans, Liberation Sans 8.8"))
            layout.set_text(text, -1)
            layout.set_width(int((CONTENT_WIDTH - 16) * Pango.SCALE))
            w, h = layout.get_pixel_size()
            total_h = h + 5
            if draw:
                cr.set_source_rgb(*COLOR_TEXT_MAIN)
                cr.move_to(MARGIN_LEFT + 14, y)
                PangoCairo.show_layout(cr, layout)
            return total_h

        elif btype == 'quote':
            text = clean_inline_md(block['text'])
            layout = PangoCairo.create_layout(cr)
            layout.set_font_description(Pango.FontDescription("Noto Sans, Liberation Sans Italic 8.5"))
            layout.set_text(text, -1)
            layout.set_width(int((CONTENT_WIDTH - 24) * Pango.SCALE))
            w, h = layout.get_pixel_size()
            total_h = h + 14
            if draw:
                cr.set_source_rgb(*COLOR_BG_CARD)
                cr.rectangle(MARGIN_LEFT, y, CONTENT_WIDTH, total_h)
                cr.fill()
                cr.set_source_rgb(*COLOR_PRIMARY)
                cr.rectangle(MARGIN_LEFT, y, 3, total_h)
                cr.fill()
                cr.set_source_rgb(*COLOR_TEXT_MAIN)
                cr.move_to(MARGIN_LEFT + 12, y + 7)
                PangoCairo.show_layout(cr, layout)
            return total_h

        elif btype == 'hr':
            total_h = 12
            if draw:
                cr.set_source_rgb(*COLOR_BORDER)
                cr.set_line_width(0.6)
                cr.move_to(MARGIN_LEFT, y + 6)
                cr.line_to(PAGE_WIDTH - MARGIN_RIGHT, y + 6)
                cr.stroke()
            return total_h

        elif btype == 'code':
            lines = block['content'].split('\n')
            total_h = len(lines) * 11 + 14
            if draw:
                cr.set_source_rgb(*COLOR_CODE_BG)
                cr.rectangle(MARGIN_LEFT, y, CONTENT_WIDTH, total_h)
                cr.fill()
                cr.set_source_rgb(0.2, 0.25, 0.35)
                cr.set_line_width(0.6)
                cr.rectangle(MARGIN_LEFT, y, CONTENT_WIDTH, total_h)
                cr.stroke()

                cy = y + 7
                cr.set_source_rgb(*COLOR_CODE_TEXT)
                for cl in lines:
                    layout = PangoCairo.create_layout(cr)
                    layout.set_font_description(Pango.FontDescription("Liberation Mono, Adwaita Mono 7.2"))
                    layout.set_text(cl[:95], -1)
                    cr.move_to(MARGIN_LEFT + 10, cy)
                    PangoCairo.show_layout(cr, layout)
                    cy += 11
            return total_h

        elif btype == 'table':
            rows = block['rows']
            if not rows:
                return 0
            cols = len(rows[0])
            col_w = CONTENT_WIDTH / cols
            row_heights = []

            for r_idx, row in enumerate(rows):
                max_rh = 16
                for cell in row:
                    layout = PangoCairo.create_layout(cr)
                    font_name = "Montserrat, Liberation Sans Bold 8" if r_idx == 0 else "Noto Sans, Liberation Sans 7.8"
                    layout.set_font_description(Pango.FontDescription(font_name))
                    layout.set_text(clean_inline_md(cell), -1)
                    layout.set_width(int((col_w - 10) * Pango.SCALE))
                    cw, ch = layout.get_pixel_size()
                    if ch + 8 > max_rh:
                        max_rh = ch + 8
                row_heights.append(max_rh)

            total_h = sum(row_heights) + 4

            if draw:
                ty = y
                for r_idx, row in enumerate(rows):
                    rh = row_heights[r_idx]
                    if r_idx == 0:
                        cr.set_source_rgb(0.93, 0.95, 0.98)
                    elif r_idx % 2 == 1:
                        cr.set_source_rgb(1.0, 1.0, 1.0)
                    else:
                        cr.set_source_rgb(0.97, 0.98, 0.99)
                    cr.rectangle(MARGIN_LEFT, ty, CONTENT_WIDTH, rh)
                    cr.fill()

                    cr.set_source_rgb(*COLOR_BORDER)
                    cr.set_line_width(0.6)
                    cr.rectangle(MARGIN_LEFT, ty, CONTENT_WIDTH, rh)
                    cr.stroke()

                    for c_idx, cell in enumerate(row):
                        layout = PangoCairo.create_layout(cr)
                        font_name = "Montserrat, Liberation Sans Bold 8" if r_idx == 0 else "Noto Sans, Liberation Sans 7.8"
                        layout.set_font_description(Pango.FontDescription(font_name))
                        layout.set_text(clean_inline_md(cell), -1)
                        layout.set_width(int((col_w - 10) * Pango.SCALE))
                        
                        if r_idx == 0:
                            cr.set_source_rgb(*COLOR_PRIMARY_DARK)
                        else:
                            cr.set_source_rgb(*COLOR_TEXT_MAIN)

                        cr.move_to(MARGIN_LEFT + c_idx * col_w + 5, ty + 4)
                        PangoCairo.show_layout(cr, layout)

                    ty += rh
            return total_h

        return 0

    def render_all_pages(self, cr, surface, total_pages, is_simulation=False):
        # Page 1: Cover
        if not is_simulation:
            print("Rendering Page 1: Executive Cover Page...")
            self.generator.draw_cover_page(cr)
        surface.show_page()

        # Page 2: Table of Contents
        if not is_simulation:
            print("Rendering Page 2: Executive Table of Contents...")
            self.render_toc_page(cr, 2, total_pages)
        surface.show_page()

        page_num = 3
        current_y = MARGIN_TOP
        current_sec_title = "1. Executive Summary & Institutional Mission"

        for block in self.blocks:
            if block['type'] == 'h2':
                current_sec_title = clean_inline_md(block['text'])

            # Measure first WITHOUT drawing
            bh = self.measure_or_draw_block(cr, block, current_y, draw=False)

            # Orphan prevention: If heading and not enough room for content, advance page
            if block['type'] in ['h1', 'h2'] and (current_y + bh + 45 > MAX_Y):
                if not is_simulation:
                    self.generator.draw_running_header_footer(cr, page_num, total_pages, current_sec_title)
                surface.show_page()
                page_num += 1
                current_y = MARGIN_TOP

            # Normal page overflow check
            elif current_y + bh > MAX_Y:
                if not is_simulation:
                    self.generator.draw_running_header_footer(cr, page_num, total_pages, current_sec_title)
                surface.show_page()
                page_num += 1
                current_y = MARGIN_TOP

            # Draw block on the current (or newly advanced) page
            if not is_simulation:
                self.measure_or_draw_block(cr, block, current_y, draw=True)
            current_y += bh

        if not is_simulation:
            self.generator.draw_running_header_footer(cr, page_num, total_pages, current_sec_title)
        surface.show_page()

        return page_num

    def run(self):
        print("Starting 2-Pass Exact PDF Compilation...")
        
        # Pass 1: Exact simulation on /dev/null
        devnull_surface = cairo.PDFSurface('/dev/null', PAGE_WIDTH, PAGE_HEIGHT)
        devnull_cr = cairo.Context(devnull_surface)
        exact_page_count = self.render_all_pages(devnull_cr, devnull_surface, total_pages=1, is_simulation=True)
        devnull_surface.finish()
        self.total_pages = exact_page_count
        print(f"Pass 1 Complete: Exact Page Count = {self.total_pages}")

        # Pass 2: Production Render with exact total_pages
        surface = cairo.PDFSurface(self.output_path, PAGE_WIDTH, PAGE_HEIGHT)
        cr = cairo.Context(surface)
        final_pages = self.render_all_pages(cr, surface, total_pages=self.total_pages, is_simulation=False)
        surface.finish()
        print(f"Pass 2 Complete: Rendered {final_pages} pages to {self.output_path}")

    def render_toc_page(self, cr, page_num, total_pages):
        self.generator.draw_running_header_footer(cr, page_num, total_pages, "Table of Contents")

        y = MARGIN_TOP + 10
        cr.set_source_rgb(*COLOR_PRIMARY_DARK)
        layout = PangoCairo.create_layout(cr)
        layout.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans Bold 16"))
        layout.set_text("Table of Contents & System Structure", -1)
        cr.move_to(MARGIN_LEFT, y)
        PangoCairo.show_layout(cr, layout)

        y += 24
        cr.set_source_rgb(*COLOR_PRIMARY)
        cr.rectangle(MARGIN_LEFT, y, CONTENT_WIDTH, 1.5)
        cr.fill()

        y += 18
        toc_items = [
            ("1. Executive Summary & Institutional Mission", "Operational context, problems solved, and enterprise ecosystem abstract."),
            ("2. High-Level System Architecture", "Decoupled C4 context, React 19 view layer, Supabase PostgreSQL, and Capacitor bridge."),
            ("3. Technology Stack & Architectural Rationalization", "TypeScript 6, Vite 8, Tailwind CSS, jsPDF, OneSignal, and Oxlint analysis."),
            ("4. Relational Database Schema & Data Models", "Comprehensive table specifications: members, services, overrides, sadhana, and meals."),
            ("5. Core Algorithmic Engines & Formulations", "Modulo rotation formula, dynamic fallback shift, emergency difficulty balancing, and auto-strikes."),
            ("6. Complete Functional Module Breakdown", "Deep dive into all 16+ pages including HubHome, Seva Roster, Sadhana, Meals, and Library."),
            ("7. Security, Governance & Role-Based Access", "Authentication, 5-tier access model (ADMIN, MANAGER, COUNSELOR, MEMBER), and RLS."),
            ("8. Cross-Platform Native Android & PWA", "Capacitor 6 native plugins, hardware haptics, Workbox caching, and offline sync."),
            ("9. Build Automation, CI/CD & Deployment", "Production Vite bundling, Gradle APK compilation, and Vercel cloud distribution."),
            ("10. WhatsApp Unicode Broadcasting Standards", "Standardized Unicode announcement templates for daily rosters and verdict reports."),
            ("11. Troubleshooting, Operations & FAQ", "Operational edge cases: extreme absences, account linking, leap years, and guest billing.")
        ]

        for title, desc in toc_items:
            cr.set_source_rgb(*COLOR_BG_CARD)
            cr.rectangle(MARGIN_LEFT, y, CONTENT_WIDTH, 38)
            cr.fill()
            cr.set_source_rgb(*COLOR_BORDER)
            cr.set_line_width(0.6)
            cr.rectangle(MARGIN_LEFT, y, CONTENT_WIDTH, 38)
            cr.stroke()

            # Left accent pill
            cr.set_source_rgb(*COLOR_PRIMARY)
            cr.rectangle(MARGIN_LEFT, y, 3.5, 38)
            cr.fill()

            # Title
            cr.set_source_rgb(*COLOR_TEXT_MAIN)
            t_layout = PangoCairo.create_layout(cr)
            t_layout.set_font_description(Pango.FontDescription("Montserrat, Liberation Sans Bold 8.8"))
            t_layout.set_text(title, -1)
            cr.move_to(MARGIN_LEFT + 12, y + 6)
            PangoCairo.show_layout(cr, t_layout)

            # Subtitle / description
            cr.set_source_rgb(*COLOR_TEXT_MUTED)
            d_layout = PangoCairo.create_layout(cr)
            d_layout.set_font_description(Pango.FontDescription("Noto Sans, Liberation Sans 7.6"))
            d_layout.set_text(desc, -1)
            cr.move_to(MARGIN_LEFT + 12, y + 20)
            PangoCairo.show_layout(cr, d_layout)

            y += 44

if __name__ == "__main__":
    md_file = 'docs/Advaita_VOICE_Hub_Complete_System_Documentation.md'
    pdf_file = 'docs/Advaita_VOICE_Hub_Complete_System_Documentation.pdf'

    if not os.path.exists(md_file):
        print(f"Error: Markdown file {md_file} not found!")
        sys.exit(1)

    blocks = parse_markdown_blocks(md_file)
    print(f"Parsed {len(blocks)} content blocks from {md_file}")

    renderer = Renderer(pdf_file, blocks)
    renderer.run()
    
    if os.path.exists(pdf_file):
        size_kb = os.path.getsize(pdf_file) / 1024
        print(f"SUCCESS: Generated Master PDF '{pdf_file}' ({size_kb:.1f} KB)")
