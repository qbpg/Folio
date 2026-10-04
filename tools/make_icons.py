"""Build simple antialiased Folio icons without external dependencies."""
from pathlib import Path
import struct
import zlib

ROOT = Path(__file__).resolve().parents[1] / 'icons'
ROOT.mkdir(exist_ok=True)


def png(size):
    scale = 4
    w = size * scale
    pixels = bytearray(w * w * 4)

    def blend(x, y, color):
        p = (y * w + x) * 4
        pixels[p:p + 4] = bytes(color)

    for y in range(w):
        for x in range(w):
            u, v = (x + .5) / w, (y + .5) / w
            rounded = (.18 <= u <= .82 or .18 <= v <= .82 or
                       (u - (.18 if u < .5 else .82)) ** 2 +
                       (v - (.18 if v < .5 else .82)) ** 2 <= .18 ** 2)
            if not rounded:
                continue
            color = (53, 94, 82, 255)
            if (.28 <= u <= .38 and .24 <= v <= .77 or
                    .28 <= u <= .70 and .24 <= v <= .34 or
                    .28 <= u <= .63 and .46 <= v <= .56):
                color = (247, 248, 242, 255)
            blend(x, y, color)

    rows = bytearray()
    for y in range(size):
        rows.append(0)
        for x in range(size):
            for channel in range(4):
                total = sum(pixels[((y * scale + dy) * w + x * scale + dx) * 4 + channel]
                            for dy in range(scale) for dx in range(scale))
                rows.append(total // (scale * scale))

    def chunk(kind, body):
        return struct.pack('>I', len(body)) + kind + body + struct.pack('>I', zlib.crc32(kind + body))

    data = (b'\x89PNG\r\n\x1a\n' +
            chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)) +
            chunk(b'IDAT', zlib.compress(rows, 9)) + chunk(b'IEND', b''))
    (ROOT / f'icon{size}.png').write_bytes(data)


for dimension in (16, 48, 128):
    png(dimension)
