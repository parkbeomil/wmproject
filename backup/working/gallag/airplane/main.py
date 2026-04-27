import pygame
import sys
import random

from airplane.settings import (screen, clock, FPS,
                       DARK, WHITE, RED, GREEN, YELLOW, CYAN, L_GRAY,
                       SCREEN_W, SCREEN_H,
                       F_BIG, F_SM, F_TINY,
                       draw_c, draw_l)
from airplane.entities import Player, Enemy, EnemyBullet, Particle, FloatText, stars
from shared.concepts import get_concepts
from airplane.levels import build_enemies, build_levels
from airplane.screens import show_title, show_concept_select, show_result, show_win, show_pause


# ── 메인 레벨 루프 ────────────────────────────────────────────────────────────
def run_level(level_idx, player, levels, custom_rules=None):
    data    = levels[level_idx]
    concept = data["concept"]
    param   = data["param"]
    lo, hi  = data["num_range"]

    avoid_nums = concept.avoid_list(param, lo, hi)

    level_num = level_idx + 1
    # 난이도 스케일: 낮은 레벨은 적게/느리게, 높은 레벨은 많고 빠르게
    # 커스텀 룰이 제공되면 사용, 아니면 기본값
    if custom_rules:
        speed_scale_by_level = custom_rules.get("speed_scale", [0.65, 0.9, 1.2])
        max_total_by_level = custom_rules.get("max_total", [10, 16, 24])
        descent_rate_by_level = custom_rules.get("descent_rate", [0.012, 0.018, 0.024])
    else:
        speed_scale_by_level = [0.65, 0.9, 1.2]
        max_total_by_level = [10, 16, 24]
        descent_rate_by_level = [0.012, 0.018, 0.024]

    speed_scale = speed_scale_by_level[min(level_idx, len(speed_scale_by_level) - 1)]
    max_total = max_total_by_level[min(level_idx, len(max_total_by_level) - 1)]
    base_descent_rate = descent_rate_by_level[min(level_idx, len(descent_rate_by_level) - 1)]

    enemies   = build_enemies(data, max_total=max_total)
    for e in enemies:
        e.speed = e.base_speed * speed_scale
    p_bullets = []
    e_bullets = []
    particles = []
    floats    = []

    descent      = 0.0
    descent_rate = base_descent_rate
    start_time   = pygame.time.get_ticks()

    last_e_shot = pygame.time.get_ticks()
    e_shoot_cd_by_level = [2800, 2000, 1400]
    e_shoot_cd  = e_shoot_cd_by_level[min(level_idx, len(e_shoot_cd_by_level) - 1)]
    banner_end  = pygame.time.get_ticks() + 2500

    while True:
        now = pygame.time.get_ticks()
        clock.tick(FPS)

        # ── 이벤트 ──
        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                return "quit"
            if ev.type == pygame.KEYDOWN and ev.key == pygame.K_ESCAPE:
                r = show_pause()
                if r != "resume":
                    return r

        # ── 입력 ──
        keys = pygame.key.get_pressed()
        if now > banner_end:
            alive_enemies = [e for e in enemies if e.alive]
            forward_limit = 60
            if alive_enemies:
                top_enemy_y = min(e.y for e in alive_enemies)
                forward_limit = max(60, int(top_enemy_y + 40))
            player.move(keys, forward_limit=forward_limit)
            if keys[pygame.K_SPACE]:
                b = player.shoot()
                if b:
                    p_bullets.append(b)

        # ── 적 개별 이동 ──
        t = (now - start_time) / 1000.0
        descent += descent_rate

        alive_enemies = [e for e in enemies if e.alive]
        for e in enemies:
            if e.alive:
                e.update(t)
                e.y = e.base_y + descent

        # ── 적 총알 발사 ──
        if now > banner_end and alive_enemies and now - last_e_shot > e_shoot_cd:
            shooter = random.choice(alive_enemies)
            e_bullets.append(EnemyBullet(shooter.x, shooter.y + Enemy.H // 2))
            last_e_shot = now

        # ── 총알 업데이트 ──
        for b in p_bullets:
            b.update()
        p_bullets = [b for b in p_bullets if b.alive]

        for b in e_bullets:
            b.update()
        e_bullets = [b for b in e_bullets if b.alive]

        # ── 충돌: 플레이어 총알 vs 적 ──
        for pb in p_bullets:
            if not pb.alive:
                continue
            for e in enemies:
                if not e.alive:
                    continue
                if pb.rect.colliderect(e.rect):
                    pb.alive = False
                    e.alive  = False

                    # eliminate_mode에 따라 점수/목숨 처리 반대
                    eliminate_mode = getattr(concept, 'eliminate_mode', False)
                    should_avoid = e.is_avoid if not eliminate_mode else not e.is_avoid

                    if should_avoid:
                        player.lives -= 1
                        # Use concept's instruction if available, otherwise use old format
                        if hasattr(concept, 'instruction') and concept.instruction:
                            msg = f"{e.number}! -1"
                        else:
                            msg = f"{e.number}은(는) {param}의 {concept.name}! -1"
                        floats.append(FloatText(msg, e.x, e.y - 20, RED, 110))
                        for _ in range(14):
                            particles.append(Particle(e.x, e.y, RED))
                        if player.lives <= 0:
                            player.lives = 0
                            return show_result("gameover", player.score)
                    else:
                        player.score += 10
                        floats.append(FloatText("+10", e.x, e.y - 20, GREEN, 60))
                        for _ in range(14):
                            particles.append(Particle(e.x, e.y, GREEN))
                    break

        # ── 충돌: 적 총알 vs 플레이어 ──
        for eb in e_bullets:
            if not eb.alive:
                continue
            if eb.rect.colliderect(player.rect):
                eb.alive = False
                if player.take_hit():
                    floats.append(FloatText("목숨 -1!", player.x, player.y - 30, RED, 80))
                    for _ in range(10):
                        particles.append(Particle(player.x, player.y, RED))
                    if player.lives <= 0:
                        player.lives = 0
                        return show_result("gameover", player.score)

        # ── 적이 하단 침범 → 게임오버 ──
        for e in alive_enemies:
            if e.y > SCREEN_H - 90:
                return show_result("gameover", player.score)

        # ── 파티클 / 텍스트 업데이트 ──
        for p in particles:
            p.update()
        particles = [p for p in particles if p.life > 0]
        for ft in floats:
            ft.update()
        floats = [ft for ft in floats if ft.life > 0]

        # ── 스테이지 클리어 확인 ──
        # eliminate_mode에 따라 클리어 조건 반대
        eliminate_mode = getattr(concept, 'eliminate_mode', False)
        if eliminate_mode:
            # eliminate_mode: validation=true인 것들을 모두 격파해야 클리어
            if not any(e.alive and e.is_avoid for e in enemies):
                return show_result("clear", player.score)
        else:
            # 기본: validation=false인 것들을 모두 격파해야 클리어
            if not any(e.alive and not e.is_avoid for e in enemies):
                return show_result("clear", player.score)

        # ── 그리기 ──
        screen.fill(DARK)
        for st in stars:
            st.update()
            st.draw(screen)

        for e in enemies:
            if e.alive:
                e.draw(screen)
        for b in p_bullets:
            b.draw(screen)
        for b in e_bullets:
            b.draw(screen)
        for p in particles:
            p.draw(screen)
        for ft in floats:
            ft.draw(screen)
        player.draw(screen)

        # HUD 상단
        pygame.draw.rect(screen, (14, 14, 48), (0, 0, SCREEN_W, 48))
        draw_l(screen, f"점수: {player.score}", F_SM, YELLOW, 10, 12)
        draw_l(screen, f"목숨: {'♥ ' * player.lives}", F_SM, RED, 180, 12)
        draw_c(screen, f"LEVEL {level_idx + 1}", F_SM, L_GRAY, SCREEN_W - 70, 24)

        # HUD 하단 힌트
        pygame.draw.rect(screen, (14, 14, 48), (0, SCREEN_H - 28, SCREEN_W, 28))
        # Use concept's instruction if available, otherwise use old format
        if hasattr(concept, 'instruction') and concept.instruction:
            # format()을 사용하여 {target}, {target[0]}, {target[1]} 모두 처리
            hint = f"목표: {concept.instruction.format(target=param)}"
        else:
            # param이 리스트인 경우 "4와 6" 형식으로 표시
            param_str = f"{param[0]}와 {param[1]}" if isinstance(param, list) else str(param)
            hint = f"목표: {param_str}의 {concept.name}는 피하세요!"
        draw_l(screen, hint, F_TINY, CYAN, 8, SCREEN_H - 21)

        # 레벨 시작 배너
        if now <= banner_end:
            s = pygame.Surface((SCREEN_W, 130), pygame.SRCALPHA)
            s.fill((0, 0, 0, 195))
            screen.blit(s, (0, SCREEN_H // 2 - 65))
            draw_c(screen, f"LEVEL {level_idx + 1}", F_BIG, YELLOW,
                   SCREEN_W // 2, SCREEN_H // 2 - 28)
            # Use concept's instruction if available, otherwise use old format
            if hasattr(concept, 'instruction') and concept.instruction:
                # format()을 사용하여 {target}, {target[0]}, {target[1]} 모두 처리
                banner_msg = concept.instruction.format(target=param)
            else:
                # param이 리스트인 경우 "4와 6" 형식으로 표시
                param_str = f"{param[0]}와 {param[1]}" if isinstance(param, list) else str(param)
                banner_msg = f"{param_str}의 {concept.name}가 아닌 수를 모두 격파하세요!"
            draw_c(screen, banner_msg, F_SM, WHITE, SCREEN_W // 2, SCREEN_H // 2 + 22)

        pygame.display.flip()


# ── 진입점 ────────────────────────────────────────────────────────────────────
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

        player    = Player()
        levels    = build_levels(concept, custom_rules)
        level_idx = 0
        go_menu   = False

        while level_idx < len(levels):
            result = run_level(level_idx, player, levels, custom_rules)
            if result == "quit":
                sys.exit()
            elif result == "menu":
                go_menu = True
                break
            elif result == "gameover":
                player    = Player()
                levels    = build_levels(concept)
                level_idx = 0
            elif result == "clear":
                player.x = SCREEN_W // 2
                player.y = SCREEN_H - 65
                player.lives = 3
                player._inv_until = 0
                level_idx += 1

        if go_menu:
            if custom_concept is not None:
                return  # 커스텀 게임: 런처로 복귀
            if standalone:
                continue  # 단독 실행: 타이틀로
            return  # 런처: 런처 메뉴로

        if level_idx >= len(levels):
            if not show_win(player.score):
                if custom_concept is not None:
                    return  # 커스텀 게임: 런처로 복귀
                if standalone:
                    continue
                return
            # 승리 후 다시 시작 선택 시
            if custom_concept is not None:
                return  # 커스텀 게임: 런처로 복귀


if __name__ == "__main__":
    main(standalone=True)
