"""Regenerate the checked-in social cards (Pillow; not required for site builds)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/social'
OUT.mkdir(parents=True, exist_ok=True)
FONT = Path('C:/Windows/Fonts')
def font(size, serif=False):
    return ImageFont.truetype(str(FONT / ('georgia.ttf' if serif else 'segoeui.ttf')), size)

cards = {
    'catalog': ('Useful data.\nA clear starting point.', 'WEBSITE · VIDEO · COMPANY DATA', 'Choose a tool. Check the output.'),
    'website-fields': ('From web pages\nto useful fields.', 'CSS SELECTOR EXTRACTOR', 'Start small. Check every required field.'),
    'youtube': ('A channel inventory.\nReady to work with.', 'YOUTUBE DATA WORKFLOWS', 'Videos, public metadata and repeatable checks.'),
    'workflows': ('Connect the steps.\nBuild your workflow.', 'LEAD RESEARCH · RAG · SEO · HIRING', 'Practical guides for your next data task.'),
}
for name, (title, kicker, subtitle) in cards.items():
    im = Image.new('RGB', (1200, 630), '#f5f3ea')
    d = ImageDraw.Draw(im)
    d.rectangle((0,0,1200,12), fill='#087957')
    d.text((64,46), 'ChimeraMiND  /  DATA', font=font(26), fill='#123b32')
    d.line((64,110,1136,110), fill='#c9d3c8', width=2)
    d.text((64,151), kicker, font=font(20), fill='#087957')
    d.multiline_text((60,211), title, font=font(64,True), fill='#122d28', spacing=14)
    d.text((64,408), subtitle, font=font(25), fill='#476159')
    d.rounded_rectangle((64,500,502,561), radius=8, fill='#087957')
    d.text((86,514), 'data.chimeramind.com', font=font(25), fill='white')
    # A restrained data table motif; no invented performance or customer claims.
    for row in range(3):
        for col in range(4):
            x,y=850+col*68,465+row*34
            d.rounded_rectangle((x,y,x+52,y+20),radius=4,fill='#cee1d3' if (row+col)%3 else '#087957')
    im.save(OUT / f'{name}.png', optimize=True)
print(f'{len(cards)} social cards generated at 1200x630')
