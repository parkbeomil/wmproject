import pygame

from airplane.settings import (screen, clock, FPS,
                       DARK, WHITE, RED, GREEN, YELLOW, CYAN, GRAY, ORANGE,
                       SCREEN_W, SCREEN_H,
                       F_BIG, F_MED, F_SM, F_TINY,
                       draw_c, dark_overlay)
from airplane.entities import stars


def show_title():
    while True:
        screen.fill(DARK)
        for st in stars:
            st.update()
            st.draw(screen)
        draw_c(screen, "수학 갤러그", F_BIG,  YELLOW, SCREEN_W // 2, 150)
        draw_c(screen, "방향키: 이동  |  SPACE: 발사", F_TINY, GRAY,   SCREEN_W // 2, 260)
        draw_c(screen, "SPACE: 시작  |  ESC: 뒤로", F_SM, YELLOW, SCREEN_W // 2, 290)
        draw_c(screen, "적을 모두 격파하면 다음 레벨로 진행합니다.", F_TINY, CYAN, SCREEN_W // 2, 355)
        pygame.display.flip()
        clock.tick(FPS)

        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                return False
            if ev.type == pygame.KEYDOWN:
                if ev.key == pygame.K_ESCAPE:
                    return False
                if ev.key == pygame.K_SPACE:
                    return True


def show_concept_select(concepts):
    """방향키 ↑↓ 로 이동, SPACE 로 선택. 선택한 Concept 객체 반환."""
    sel = 0
    descriptions = {
        "약수": ("약수 격파!", "목표 숫자의 약수를 가진 적은 피하고", "약수가 아닌 적을 모두 격파하세요!"),
        "배수": ("배수 격파!", "목표 숫자의 배수를 가진 적은 피하고", "배수가 아닌 적을 모두 격파하세요!"),
    }

    while True:
        screen.fill(DARK)
        for st in stars:
            st.update()
            st.draw(screen)

        draw_c(screen, "개념 선택", F_BIG, YELLOW, SCREEN_W // 2, 110)
        draw_c(screen, "↑ ↓ 로 이동   SPACE 로 선택", F_TINY, GRAY, SCREEN_W // 2, 165)

        for i, concept in enumerate(concepts):
            cy      = 260 + i * 130
            is_sel  = (i == sel)
            box_col = CYAN if is_sel else (60, 60, 100)
            border  = YELLOW if is_sel else GRAY

            pygame.draw.rect(screen, box_col,
                             (SCREEN_W // 2 - 280, cy - 50, 560, 100), border_radius=12)
            pygame.draw.rect(screen, border,
                             (SCREEN_W // 2 - 280, cy - 50, 560, 100), 2, border_radius=12)

            name_col = DARK if is_sel else WHITE
            draw_c(screen, f"{'▶  ' if is_sel else '   '}{concept.name} 게임",
                   F_MED, name_col, SCREEN_W // 2, cy - 16)

            desc = descriptions.get(concept.name, ("", "", ""))
            draw_c(screen, desc[1], F_TINY, DARK if is_sel else GRAY, SCREEN_W // 2, cy + 14)
            draw_c(screen, desc[2], F_TINY, DARK if is_sel else GRAY, SCREEN_W // 2, cy + 32)

        pygame.display.flip()
        clock.tick(FPS)

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


def show_result(result, score):
    if result == "clear":
        title, color, msg = "STAGE CLEAR!", GREEN, "SPACE: 다음 레벨"
    else:
        title, color, msg = "GAME OVER", RED, "SPACE: 다시 시작"

    while True:
        screen.fill(DARK)
        for st in stars:
            st.update()
            st.draw(screen)
        dark_overlay(screen, 155)
        draw_c(screen, title,            F_BIG,  color,  SCREEN_W // 2, SCREEN_H // 2 - 60)
        draw_c(screen, f"점수: {score}", F_MED,  WHITE,  SCREEN_W // 2, SCREEN_H // 2)
        draw_c(screen, msg,              F_SM,   YELLOW, SCREEN_W // 2, SCREEN_H // 2 + 60)
        draw_c(screen, "ESC: 메인 메뉴", F_TINY, GRAY,   SCREEN_W // 2, SCREEN_H // 2 + 100)
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


def show_win(score):
    while True:
        screen.fill(DARK)
        for st in stars:
            st.update()
            st.draw(screen)
        draw_c(screen, "축하합니다!",           F_BIG, YELLOW, SCREEN_W // 2, 180)
        draw_c(screen, "모든 레벨 클리어!",     F_MED, GREEN,  SCREEN_W // 2, 260)
        draw_c(screen, f"최종 점수: {score}",   F_MED, CYAN,   SCREEN_W // 2, 320)
        draw_c(screen, "SPACE: 처음부터  |  ESC: 메인 메뉴", F_SM, GRAY, SCREEN_W // 2, 420)
        pygame.display.flip()
        clock.tick(FPS)

        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                return False
            if ev.type == pygame.KEYDOWN:
                if ev.key == pygame.K_ESCAPE:
                    return False
                if ev.key == pygame.K_SPACE:
                    return True
