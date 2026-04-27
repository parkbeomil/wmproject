import pygame
import sys

pygame.init()

# ── 화면 ──────────────────────────────────────────────────────────────────────
SCREEN_W, SCREEN_H = 800, 600
FPS = 60

screen = pygame.display.set_mode((SCREEN_W, SCREEN_H))
pygame.display.set_caption("수학 게임")
clock = pygame.time.Clock()

# ── 색상 ──────────────────────────────────────────────────────────────────────
DARK   = ( 10,  10,  40)
WHITE  = (255, 255, 255)
YELLOW = (255, 215,   0)
CYAN   = (  0, 200, 250)
GRAY   = (155, 155, 155)
RED    = (255,  50,  50)

# ── 폰트 ──────────────────────────────────────────────────────────────────────
def _font(size, bold=False):
    try:
        return pygame.font.SysFont("Apple SD Gothic Neo", size, bold=bold)
    except Exception:
        return pygame.font.Font(None, size)

F_BIG  = _font(46, bold=True)
F_MED  = _font(28, bold=True)
F_TINY = _font(15)

def draw_c(surf, text, font, color, cx, cy):
    s = font.render(text, True, color)
    surf.blit(s, s.get_rect(center=(cx, cy)))


# ── 게임 런처 (지연 임포트: display 생성 후 games 로드) ────────────────────────
def launch_airplane():
    from airplane.main import main
    main()

def launch_frog():
    from frog.main import main
    main()


GAME_LIST = [
    ("수학 갤러그",         launch_airplane),
    ("개구리 연못 건너기",   launch_frog),
]


def main():
    sel = 0

    while True:
        pygame.display.set_caption("수학 게임")
        screen.fill(DARK)

        draw_c(screen, "수학 게임", F_BIG, YELLOW, SCREEN_W // 2, 150)
        draw_c(screen, "↑ ↓ 로 이동   SPACE 로 선택", F_TINY, GRAY, SCREEN_W // 2, 215)

        for i, (name, _) in enumerate(GAME_LIST):
            cy      = 330 + i * 90
            is_sel  = (i == sel)
            box_col = CYAN if is_sel else (60, 60, 100)
            border  = YELLOW if is_sel else GRAY

            pygame.draw.rect(screen, box_col,
                             (SCREEN_W // 2 - 240, cy - 35, 480, 70), border_radius=12)
            pygame.draw.rect(screen, border,
                             (SCREEN_W // 2 - 240, cy - 35, 480, 70), 2, border_radius=12)

            name_col = DARK if is_sel else WHITE
            draw_c(screen, f"{'▶  ' if is_sel else '   '}{name}",
                   F_MED, name_col, SCREEN_W // 2, cy)

        draw_c(screen, "ESC: 종료", F_TINY, GRAY, SCREEN_W // 2, SCREEN_H - 30)
        pygame.display.flip()
        clock.tick(FPS)

        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                pygame.quit(); sys.exit()
            if ev.type == pygame.KEYDOWN:
                if ev.key == pygame.K_ESCAPE:
                    pygame.quit(); sys.exit()
                if ev.key == pygame.K_UP:
                    sel = (sel - 1) % len(GAME_LIST)
                if ev.key == pygame.K_DOWN:
                    sel = (sel + 1) % len(GAME_LIST)
                if ev.key == pygame.K_SPACE:
                    try:
                        GAME_LIST[sel][1]()
                    except SystemExit:
                        pygame.quit()
                        sys.exit()
                    pygame.event.clear()  # 게임 복귀 후 누적 이벤트 제거


if __name__ == "__main__":
    main()
