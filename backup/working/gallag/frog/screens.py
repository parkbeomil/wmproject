import pygame

from frog.settings import (
    screen, clock, FPS,
    SCREEN_W, SCREEN_H,
    DARK, WHITE, YELLOW, CYAN, GRAY, RED,
    F_BIG, F_MED, F_SM, F_TINY,
    draw_c, dark_overlay,
)
from frog.background import RippleField


ripples = RippleField(count=16)


def show_title():
    while True:
        dt = clock.tick(FPS) / 1000.0
        screen.fill(DARK)
        ripples.update(dt)
        ripples.draw(screen)
        draw_c(screen, "개구리 연못 건너기", F_BIG, YELLOW, SCREEN_W // 2, 150)
        draw_c(screen, "SPACE + 방향키: 점프  |  바닥은 ← → 이동", F_TINY, GRAY, SCREEN_W // 2, 260)
        draw_c(screen, "SPACE: 시작  |  ESC: 뒤로", F_SM, YELLOW, SCREEN_W // 2, 290)
        draw_c(screen, "아래 땅에서 시작 → 위 땅 도착이 목표", F_TINY, CYAN, SCREEN_W // 2, 335)
        draw_c(screen, "잘못 밟으면 연잎과 함께 가라앉고 아래로 돌아옵니다.", F_TINY, GRAY, SCREEN_W // 2, 360)
        pygame.display.flip()

        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                return False
            if ev.type == pygame.KEYDOWN:
                if ev.key == pygame.K_ESCAPE:
                    return False
                if ev.key == pygame.K_SPACE:
                    return True


def show_concept_select(concepts):
    sel = 0
    descriptions = {
        "약수": ("약수 게임", "목표 숫자의 약수만 밟기"),
        "배수": ("배수 게임", "목표 숫자의 배수만 밟기"),
    }

    while True:
        dt = clock.tick(FPS) / 1000.0
        screen.fill(DARK)
        ripples.update(dt)
        ripples.draw(screen)
        draw_c(screen, "개념 선택", F_BIG, YELLOW, SCREEN_W // 2, 120)
        draw_c(screen, "↑ ↓ 로 이동   SPACE 로 선택", F_TINY, GRAY, SCREEN_W // 2, 175)

        for i, concept in enumerate(concepts):
            cy = 270 + i * 120
            is_sel = (i == sel)
            box_col = CYAN if is_sel else (60, 60, 100)
            border = YELLOW if is_sel else GRAY

            pygame.draw.rect(screen, box_col,
                             (SCREEN_W // 2 - 260, cy - 45, 520, 90), border_radius=12)
            pygame.draw.rect(screen, border,
                             (SCREEN_W // 2 - 260, cy - 45, 520, 90), 2, border_radius=12)

            name_col = DARK if is_sel else WHITE
            draw_c(screen, f"{'▶  ' if is_sel else '   '}{concept.name} 게임",
                   F_MED, name_col, SCREEN_W // 2, cy - 8)

            desc = descriptions.get(concept.name, ("", ""))
            draw_c(screen, desc[1], F_TINY, DARK if is_sel else GRAY, SCREEN_W // 2, cy + 22)

        pygame.display.flip()

        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                return None
            if ev.type == pygame.KEYDOWN:
                if ev.key == pygame.K_ESCAPE:
                    return None
                if ev.key in (pygame.K_UP, pygame.K_DOWN):
                    sel = (sel + (-1 if ev.key == pygame.K_UP else 1)) % len(concepts)
                if ev.key == pygame.K_SPACE:
                    return concepts[sel]


def show_pause():
    """게임 중 ESC → 일시정지 메뉴. 반환값: 'resume' / 'menu' / 'quit'"""
    sel = 0
    options = [("계속하기", "resume"), ("메인 메뉴로", "menu"), ("종료", "quit")]

    while True:
        dark_overlay(screen, 160)
        draw_c(screen, "일시정지", F_BIG, YELLOW, SCREEN_W // 2, SCREEN_H // 2 - 110)

        for i, (label, _) in enumerate(options):
            cy     = SCREEN_H // 2 - 10 + i * 65
            is_sel = (i == sel)
            col    = CYAN if is_sel else WHITE
            draw_c(screen, f"{'▶  ' if is_sel else '   '}{label}",
                   F_MED, col, SCREEN_W // 2, cy)

        draw_c(screen, "ESC: 계속하기   ↑↓: 이동   SPACE: 선택",
               F_TINY, GRAY, SCREEN_W // 2, SCREEN_H // 2 + 195)
        pygame.display.flip()
        clock.tick(FPS)

        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                return "quit"
            if ev.type == pygame.KEYDOWN:
                if ev.key == pygame.K_ESCAPE:
                    return "resume"
                if ev.key == pygame.K_UP:
                    sel = (sel - 1) % len(options)
                if ev.key == pygame.K_DOWN:
                    sel = (sel + 1) % len(options)
                if ev.key == pygame.K_SPACE:
                    return options[sel][1]


def show_message(text, sub=None, delay=1200):
    start = pygame.time.get_ticks()
    while pygame.time.get_ticks() - start < delay:
        screen.fill(DARK)
        dark_overlay(screen, 170)
        draw_c(screen, text, F_BIG, YELLOW, SCREEN_W // 2, SCREEN_H // 2 - 20)
        if sub:
            draw_c(screen, sub, F_SM, WHITE, SCREEN_W // 2, SCREEN_H // 2 + 35)
        pygame.display.flip()
        clock.tick(FPS)


def show_gameover():
    while True:
        screen.fill(DARK)
        dark_overlay(screen, 170)
        draw_c(screen, "GAME OVER", F_BIG, RED, SCREEN_W // 2, SCREEN_H // 2 - 20)
        draw_c(screen, "SPACE: 다시 시작  |  ESC: 메인 메뉴", F_TINY, GRAY, SCREEN_W // 2, SCREEN_H // 2 + 40)
        pygame.display.flip()
        clock.tick(FPS)

        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                return "menu"
            if ev.type == pygame.KEYDOWN:
                if ev.key == pygame.K_ESCAPE:
                    return "menu"
                if ev.key == pygame.K_SPACE:
                    return "retry"


def show_result(result):
    if result == "clear":
        title, color, msg = "LEVEL CLEAR!", YELLOW, "SPACE: 다음 레벨"
    else:
        title, color, msg = "GAME OVER", RED, "SPACE: 다시 시작"

    while True:
        screen.fill(DARK)
        dark_overlay(screen, 155)
        draw_c(screen, title, F_BIG, color, SCREEN_W // 2, SCREEN_H // 2 - 40)
        draw_c(screen, msg, F_SM, WHITE, SCREEN_W // 2, SCREEN_H // 2 + 20)
        draw_c(screen, "ESC: 메인 메뉴", F_TINY, GRAY, SCREEN_W // 2, SCREEN_H // 2 + 60)
        pygame.display.flip()
        clock.tick(30)

        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                return "quit"
            if ev.type == pygame.KEYDOWN:
                if ev.key == pygame.K_ESCAPE:
                    return "menu"
                if ev.key == pygame.K_SPACE:
                    return result
