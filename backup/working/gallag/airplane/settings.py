import pygame

pygame.init()

# ── 화면 ──────────────────────────────────────────────────────────────────────
SCREEN_W, SCREEN_H = 800, 600
FPS = 60

_existing = pygame.display.get_surface()
screen = _existing if _existing is not None else pygame.display.set_mode((SCREEN_W, SCREEN_H))
pygame.display.set_caption("수학 갤러그 – 약수 격파!")
clock = pygame.time.Clock()

# ── 색상 ──────────────────────────────────────────────────────────────────────
WHITE  = (255, 255, 255)
RED    = (220,  55,  55)
GREEN  = ( 55, 210,  55)
YELLOW = (255, 215,   0)
CYAN   = (  0, 200, 250)
ORANGE = (255, 145,   0)
PURPLE = (160,  50, 210)
GRAY   = (155, 155, 155)
DARK   = ( 10,  10,  40)
L_GRAY = (200, 200, 200)

# ── 폰트 ──────────────────────────────────────────────────────────────────────
def _font(size, bold=False):
    try:
        return pygame.font.SysFont("Apple SD Gothic Neo", size, bold=bold)
    except Exception:
        return pygame.font.Font(None, size)

F_BIG  = _font(46, bold=True)
F_MED  = _font(28, bold=True)
F_SM   = _font(20)
F_TINY = _font(15)

# ── 유틸 함수 ─────────────────────────────────────────────────────────────────
def draw_c(surf, text, font, color, cx, cy):
    s = font.render(text, True, color)
    surf.blit(s, s.get_rect(center=(cx, cy)))

def draw_l(surf, text, font, color, x, y):
    surf.blit(font.render(text, True, color), (x, y))

def dark_overlay(surf, alpha=160):
    s = pygame.Surface((SCREEN_W, SCREEN_H), pygame.SRCALPHA)
    s.fill((0, 0, 0, alpha))
    surf.blit(s, (0, 0))