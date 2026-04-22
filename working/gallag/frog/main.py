import sys
import pygame

from frog.settings import (
    screen, clock, FPS,
    SCREEN_W, SCREEN_H,
    WHITE, YELLOW, CYAN, RED,
    WATER_DEEP, WATER_MID, BANK_COLOR, HUD_BG,
    F_SM, F_TINY,
    draw_l, draw_c,
)
from frog.entities import Frog
from frog.levels import (
    MOVE_CD_MS, SINK_TIME_MS, RESPAWN_DELAY_MS,
    build_levels, build_level, find_closest_pad, find_neighbor_pad,
)
from frog.screens import show_title, show_message, show_gameover, show_concept_select, show_pause, show_result
from shared.concepts import get_concepts


MAX_LIVES = 3
BOTTOM_Y = 560
TOP_Y = 70
TOP_LAND_H = 100
BOTTOM_LAND_H = 70


def handle_landing(frog, pad, concept=None):
    if pad is None:
        return "ok"

    # eliminate_mode에 따라 is_good 판정 반대
    eliminate_mode = getattr(concept, 'eliminate_mode', False) if concept else False
    should_be_good = pad.is_good if not eliminate_mode else not pad.is_good

    if should_be_good:
        frog.set_checkpoint()
        return "ok"

    pad.sinking = True
    pad.sink_until = pygame.time.get_ticks() + SINK_TIME_MS
    frog.lives -= 1
    frog.sinking = True
    frog.sink_until = pygame.time.get_ticks() + SINK_TIME_MS
    frog.respawn_until = frog.sink_until + RESPAWN_DELAY_MS
    frog.on_pad = pad
    return "hit"


def run_level(level_idx, frog, levels):
    level_data = levels[level_idx]
    rows, target = build_level(level_data)
    frog.rows = rows
    frog.row_idx = -1
    frog.on_pad = None
    frog.x = SCREEN_W // 2
    frog.y = BOTTOM_Y
    frog.set_checkpoint()
    banner_end = pygame.time.get_ticks() + 2200

    def try_jump(direction):
        if frog.respawn_until != 0 or now <= banner_end or frog.jumping:
            return None
        if not frog.can_move(MOVE_CD_MS):
            return None

        frog.last_move = now

        if direction == "up":
            if frog.row_idx == len(rows) - 1:
                frog.start_jump(frog.x, TOP_Y, len(rows), None, duration=240, height=30)
                return None
            nxt = rows[frog.row_idx + 1] if frog.row_idx >= 0 else rows[0]
            pad = find_closest_pad(nxt, frog.x)
            if pad is None:
                return None
            row_idx = 0 if frog.row_idx < 0 else frog.row_idx + 1
            frog.start_jump(pad.x, pad.y - 6, row_idx, pad)
            return None

        if direction == "down":
            if frog.row_idx <= -1:
                return None
            if frog.row_idx == 0:
                frog.start_jump(frog.x, BOTTOM_Y, -1, None)
                return None
            prv = rows[frog.row_idx - 1]
            pad = find_closest_pad(prv, frog.x)
            if pad is None:
                return None
            frog.start_jump(pad.x, pad.y - 6, frog.row_idx - 1, pad)
            return None

        if direction == "left":
            if frog.on_pad:
                row = rows[frog.row_idx]
                pad = find_neighbor_pad(row, frog.on_pad.x, -1)
                if pad:
                    frog.start_jump(pad.x, pad.y - 6, frog.row_idx, pad, duration=220, height=20)
            else:
                nx = max(60, frog.x - 70)
                frog.start_jump(nx, BOTTOM_Y, -1, None, duration=200, height=14)
            return None

        if direction == "right":
            if frog.on_pad:
                row = rows[frog.row_idx]
                pad = find_neighbor_pad(row, frog.on_pad.x, 1)
                if pad:
                    frog.start_jump(pad.x, pad.y - 6, frog.row_idx, pad, duration=220, height=20)
            else:
                nx = min(SCREEN_W - 60, frog.x + 70)
                frog.start_jump(nx, BOTTOM_Y, -1, None, duration=200, height=14)
            return None

        return None

    while True:
        dt = clock.tick(FPS) / 1000.0
        now = pygame.time.get_ticks()
        space_pressed = False
        arrow_pressed = None

        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                return "quit"
            if ev.type == pygame.KEYDOWN and ev.key == pygame.K_ESCAPE:
                r = show_pause()
                if r != "resume":
                    return r
            if ev.type == pygame.KEYDOWN:
                if ev.key == pygame.K_SPACE:
                    space_pressed = True
                if ev.key in (pygame.K_UP, pygame.K_DOWN, pygame.K_LEFT, pygame.K_RIGHT):
                    arrow_pressed = ev.key

        if now >= frog.respawn_until:
            frog.respawn_until = 0

        # ── 입력 처리 (SPACE + 방향키) ──
        if now > banner_end and not frog.jumping and not frog.sinking and frog.respawn_until == 0:
            keys = pygame.key.get_pressed()
            direction = None
            if space_pressed:
                if keys[pygame.K_UP]:
                    direction = "up"
                elif keys[pygame.K_DOWN]:
                    direction = "down"
                elif keys[pygame.K_LEFT]:
                    direction = "left"
                elif keys[pygame.K_RIGHT]:
                    direction = "right"
            if direction is None and arrow_pressed and keys[pygame.K_SPACE]:
                direction = {
                    pygame.K_UP: "up",
                    pygame.K_DOWN: "down",
                    pygame.K_LEFT: "left",
                    pygame.K_RIGHT: "right",
                }[arrow_pressed]
            if direction:
                res = try_jump(direction)
                if res == "clear":
                    return "clear"

        # 바닥 좌우 이동 (SPACE 없이 가능)
        if (frog.row_idx == -1 and not frog.jumping and not frog.sinking
                and frog.respawn_until == 0 and now > banner_end):
            keys = pygame.key.get_pressed()
            if keys[pygame.K_LEFT]:
                frog.x = max(60, frog.x - 4)
            if keys[pygame.K_RIGHT]:
                frog.x = min(SCREEN_W - 60, frog.x + 4)


        # ── 업데이트 ──
        for row in rows:
            row.update(dt)
        state = frog.update()
        if state == "landed":
            if frog.row_idx == len(rows):
                return "clear"
            res = handle_landing(frog, frog.on_pad, level_data['concept'])
            if res == "hit" and frog.lives <= 0:
                return "gameover"
        elif state == "sunk":
            frog.row_idx = -1
            frog.on_pad = None
            frog.x = SCREEN_W // 2
            frog.y = BOTTOM_Y
            frog.set_checkpoint()

        # ── 그리기 ──
        screen.fill(WATER_DEEP)
        pygame.draw.rect(screen, WATER_MID, (0, 0, SCREEN_W, SCREEN_H), 0)
        pygame.draw.rect(screen, BANK_COLOR, (0, 0, SCREEN_W, TOP_LAND_H))
        pygame.draw.rect(screen, BANK_COLOR, (0, SCREEN_H - BOTTOM_LAND_H, SCREEN_W, BOTTOM_LAND_H))

        # water ripples
        ripple = pygame.Surface((SCREEN_W, SCREEN_H), pygame.SRCALPHA)
        for row in rows:
            for p in row.pads:
                if not p.alive:
                    continue
                rr = pygame.Rect(int(p.x - 46), int(p.y + 14 + p.sink_offset), 92, 22)
                pygame.draw.ellipse(ripple, (255, 255, 255, 30), rr, 2)
                p.draw(screen)
        # frog ripple
        fr = pygame.Rect(int(frog.x - 20), int(frog.y + 14), 40, 18)
        pygame.draw.ellipse(ripple, (255, 255, 255, 35), fr, 2)
        screen.blit(ripple, (0, 0))

        frog.draw(screen)

        # HUD
        pygame.draw.rect(screen, HUD_BG, (0, 0, SCREEN_W, 42))
        draw_l(screen, f"LEVEL {level_idx + 1}", F_SM, YELLOW, 10, 12)
        # target이 리스트인 경우 "4와 6" 형식으로 표시
        target_str = f"{target[0]}와 {target[1]}" if isinstance(target, list) else str(target)
        draw_l(screen, f"목표: {target_str}", F_SM, CYAN, 140, 12)
        draw_l(screen, f"목숨: {'♥ ' * frog.lives}", F_SM, RED, 260, 12)
        # Use concept's instruction if available, otherwise use old format
        concept = level_data['concept']
        if hasattr(concept, 'instruction') and concept.instruction:
            # format()을 사용하여 {target}, {target[0]}, {target[1]} 모두 처리
            hint = concept.instruction.format(target=target).replace('격파하세요', '밟으세요').replace('피하세요', '밟으세요')
        else:
            hint = f"{target}의 {concept.name}만 밟기"
        draw_l(screen, hint, F_TINY, WHITE, SCREEN_W - 230, 15)

        # 레벨 시작 배너
        if now <= banner_end:
            s = pygame.Surface((SCREEN_W, 130), pygame.SRCALPHA)
            s.fill((0, 0, 0, 185))
            screen.blit(s, (0, SCREEN_H // 2 - 65))
            draw_c(screen, f"LEVEL {level_idx + 1}", F_SM, YELLOW, SCREEN_W // 2, SCREEN_H // 2 - 32)
            # Use concept's instruction if available, otherwise use old format
            if hasattr(concept, 'instruction') and concept.instruction:
                # format()을 사용하여 {target}, {target[0]}, {target[1]} 모두 처리
                banner_msg = concept.instruction.format(target=target).replace('격파하세요', '밟으세요').replace('피하세요', '밟으세요')
            else:
                banner_msg = f"{target}의 {concept.name}만 밟으세요"
            draw_c(screen, banner_msg, F_SM, WHITE, SCREEN_W // 2, SCREEN_H // 2 + 10)

        # 여자 개구리 (목표 지점) - 움직이는 개구리와 동일한 코드 + 리본
        girl_x, girl_y = SCREEN_W // 2, TOP_Y + 5
        body = pygame.Rect(girl_x - 18, girl_y - 18, 36, 36)
        shadow = pygame.Rect(body.x + 6, body.y + 10, body.w - 8, body.h - 10)
        pygame.draw.ellipse(screen, (10, 40, 20), shadow)
        pygame.draw.ellipse(screen, (30, 145, 60), body)
        pygame.draw.ellipse(screen, (18, 110, 36), body, 2)
        belly = body.inflate(-12, -16)
        pygame.draw.ellipse(screen, (55, 175, 85), belly)
        head = pygame.Rect(girl_x - 16, girl_y - 24, 32, 22)
        pygame.draw.ellipse(screen, (35, 165, 70), head)
        pygame.draw.ellipse(screen, (18, 110, 36), head, 2)
        # eyes
        pygame.draw.circle(screen, (245, 245, 245), (int(girl_x - 9), int(girl_y - 22)), 5)
        pygame.draw.circle(screen, (245, 245, 245), (int(girl_x + 9), int(girl_y - 22)), 5)
        pygame.draw.circle(screen, (20, 20, 20), (int(girl_x - 9), int(girl_y - 22)), 2)
        pygame.draw.circle(screen, (20, 20, 20), (int(girl_x + 9), int(girl_y - 22)), 2)
        pygame.draw.circle(screen, (255, 255, 255), (int(girl_x - 11), int(girl_y - 24)), 1)
        pygame.draw.circle(screen, (255, 255, 255), (int(girl_x + 7), int(girl_y - 24)), 1)
        # nostrils
        pygame.draw.circle(screen, (20, 90, 40), (int(girl_x - 4), int(girl_y - 8)), 2)
        pygame.draw.circle(screen, (20, 90, 40), (int(girl_x + 4), int(girl_y - 8)), 2)
        # mouth
        pygame.draw.arc(screen, (15, 80, 35), (girl_x - 10, girl_y - 6, 20, 12), 0.2, 2.9, 2)
        # cheek blush (wide pink ovals)
        blush_col = (240, 140, 170)
        pygame.draw.ellipse(screen, blush_col, (girl_x - 22, girl_y - 16, 12, 6))
        pygame.draw.ellipse(screen, blush_col, (girl_x + 10, girl_y - 16, 12, 6))
        # legs
        pygame.draw.line(screen, (25, 120, 50), (girl_x - 10, girl_y + 6), (girl_x - 28, girl_y + 18), 4)
        pygame.draw.line(screen, (25, 120, 50), (girl_x + 10, girl_y + 6), (girl_x + 28, girl_y + 18), 4)
        pygame.draw.circle(screen, (25, 120, 50), (int(girl_x - 28), int(girl_y + 18)), 3)
        pygame.draw.circle(screen, (25, 120, 50), (int(girl_x + 28), int(girl_y + 18)), 3)
        # back spots
        pygame.draw.circle(screen, (22, 120, 48), (int(girl_x - 8), int(girl_y + 4)), 3)
        pygame.draw.circle(screen, (22, 120, 48), (int(girl_x + 6), int(girl_y + 8)), 2)
        # reflection
        reflect = pygame.Surface((body.w, body.h // 2), pygame.SRCALPHA)
        pygame.draw.ellipse(reflect, (200, 255, 210, 30), (0, 0, body.w, body.h // 2))
        screen.blit(reflect, (body.x, body.y + body.h // 2 + 6))
        # 리본 제거

        pygame.display.flip()


def main(standalone=False, custom_concept=None, custom_rules=None):
    """standalone=True: 단독 실행 시 '메인 메뉴로' → 타이틀로 복귀
       standalone=False: 런처에서 호출 시 '메인 메뉴로' → 런처로 복귀
       custom_concept: 커스텀 Concept 객체 (제공시 선택 화면 스킵)
       custom_rules: 커스텀 게임 룰 (레벨 생성에 사용)"""
    while True:
        # 커스텀 개념이 제공되지 않은 경우에만 타이틀/선택 화면 표시
        if custom_concept is None:
            if not show_title():
                return

            concept = show_concept_select(get_concepts())
            if concept is None:
                continue  # 타이틀로 돌아가기
        else:
            concept = custom_concept

        levels = build_levels(concept, custom_rules)
        frog = Frog(rows=[], max_lives=MAX_LIVES, start_y=BOTTOM_Y)
        level_idx = 0
        go_menu = False

        while level_idx < len(levels):
            result = run_level(level_idx, frog, levels)
            if result == "quit":
                sys.exit()
            if result == "menu":
                go_menu = True
                break
            if result == "gameover":
                res = show_gameover()
                if res == "menu":
                    go_menu = True
                    break
                frog = Frog(rows=[], max_lives=MAX_LIVES, start_y=BOTTOM_Y)
                level_idx = 0
                continue
            if result == "clear":
                res = show_result("clear")
                if res == "quit":
                    sys.exit()
                if res == "menu":
                    go_menu = True
                    break
                frog = Frog(rows=[], max_lives=MAX_LIVES, start_y=BOTTOM_Y)
                level_idx += 1

        if go_menu:
            if custom_concept is not None:
                return  # 커스텀 게임: 런처로 복귀
            if standalone:
                continue  # 단독 실행: 타이틀로
            return  # 런처: 런처 메뉴로

        if level_idx >= len(levels):
            show_message("ALL CLEAR!", "메뉴로 돌아갑니다", 1200)
            if custom_concept is not None:
                return  # 커스텀 게임: 런처로 복귀
            if standalone:
                continue
            return


if __name__ == "__main__":
    main(standalone=True)
