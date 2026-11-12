"""Генерирует themes/clock/bg.png (320x170): градиент, мягкое свечение за цифрами,
тонкая линия-разделитель. Запуск: python -I tools/make_bg.py  (нужен только Pillow)"""
import math
import random
from PIL import Image

W, H = 320, 170
random.seed(1)
top, bot = (14, 20, 40), (3, 4, 9)
glow_c = (22, 38, 84)
line_y = 128
img = Image.new("RGB", (W, H))
px = img.load()
for y in range(H):
    t = y / (H - 1)
    for x in range(W):
        c = [top[i] * (1 - t) + bot[i] * t for i in range(3)]
        d = ((x - 160) / 150) ** 2 + ((y - 70) / 62) ** 2
        g = math.exp(-d * 1.6)
        c = [c[i] + glow_c[i] * g for i in range(3)]
        if y in (line_y, line_y + 1):
            k = 1.0 if y == line_y else 0.35
            f = max(0.0, 1 - abs(x - 160) / 120) ** 1.5 * 0.55 * k
            c = [c[i] + (v - c[i]) * f for i, v in enumerate((91, 140, 255))]
        # дизеринг против полос на 16-битном экране (RGB565)
        px[x, y] = tuple(max(0, min(255, int(v + random.uniform(-2.2, 2.2)))) for v in c)
img.save("themes/clock/bg.png")
print("ok")
