import pygame

pygame.init()

# ── 화면 ──────────────────────────────────────────────────────────────────────
SCREEN_W, SCREEN_H = 800, 600
FPS = 60

_existing = pygame.display.get_surface()
screen = _existing if _existing is not None else pygame.display.set_mode((SCREEN_W, SCREEN_H))
pygame.display.set_caption("개구리 연못 건너기")
clock = pygame.time.Clock()

# ── 색상 ──────────────────────────────────────────────────────────────────────
WHITE       = (255, 255, 255)
YELLOW      = (255, 215,   0)
CYAN        = (  0, 200, 250)
GRAY        = (155, 155, 155)
DARK        = ( 10,  10,  40)
RED         = (220,  55,  55)
GREEN       = ( 55, 210,  55)
ORANGE      = (255, 145,   0)

WATER_DEEP  = ( 18,  70,  90)
WATER_MID   = ( 28,  95, 125)
BANK_COLOR  = ( 70, 120,  60)
PAD_GREEN   = ( 50, 160,  70)
PAD_SINK    = ( 35, 110,  60)
PAD_WRONG   = (180,  50,  50)
HUD_BG      = ( 14,  14,  48)

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
