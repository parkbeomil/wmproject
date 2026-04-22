import math
import random

from airplane.settings import SCREEN_W
from airplane.entities import Enemy
from shared.concepts import get_divisors, get_candidates


# ── 약수 계산 (DivisorConcept 내부에서도 사용) ────────────────────────────────
def build_levels(concept, custom_rules=None):
    """
    레벨을 생성합니다.

    Args:
        concept: Concept 객체
        custom_rules: 커스텀 룰 (옵션)
            {
                "speed_scale": [0.7, 1.0, 1.3],
                "max_total": [12, 18, 24],
                "descent_rate": [0.012, 0.018, 0.024]
            }

    Returns:
        list: 레벨 데이터 리스트
    """
    # DynamicConcept인지 확인 (sample_targets 메서드 존재 여부)
    from shared.dynamic_concept import DynamicConcept
    is_dynamic = isinstance(concept, DynamicConcept)

    # DynamicConcept이 아니고 프리셋 약수 개념인 경우
    if not is_dynamic and concept.name == "약수":
        targets = sorted(random.sample(get_candidates(concept.name), 3),
                         key=lambda n: len(get_divisors(n)))
        levels = []
        for param in targets:
            n_divs = len(get_divisors(param))
            hi     = min(60, param * 2)
            total  = max(18, n_divs + 10)
            cols   = 7 if total > 18 else 6
            rows   = math.ceil(total / cols)
            levels.append({
                "concept":    concept,
                "param":      param,
                "num_range":  (1, hi),
                "cols":       cols,
                "rows":       rows,
            })
        return levels

    # DynamicConcept 또는 배수/기타 개념
    # 커스텀 개념의 경우 sample_targets 사용
    try:
        targets = concept.sample_targets(3)
    except:
        # Fallback for concepts without proper candidates
        if hasattr(concept, 'name') and concept.name in ["약수", "배수"]:
            targets = sorted(random.sample(get_candidates(concept.name), 3), reverse=True)
        else:
            targets = [10, 15, 20]

    levels = []

    # custom_rules에서 num_range 가져오기
    if custom_rules:
        num_range_list = custom_rules.get("num_range", [[1, 40], [1, 50], [1, 60]])
    else:
        num_range_list = [[1, 40], [1, 50], [1, 60]]  # 기본값

    for i, param in enumerate(targets):
        idx = min(i, len(num_range_list) - 1)
        num_range = tuple(num_range_list[idx]) if isinstance(num_range_list[idx], list) else num_range_list[idx]

        total = 18
        cols  = 6
        rows  = math.ceil(total / cols)
        levels.append({
            "concept":   concept,
            "param":     param,
            "num_range": num_range,
            "cols":      cols,
            "rows":      rows,
        })
    return levels


def build_enemies(level_data, max_total=None):
    concept    = level_data["concept"]
    param      = level_data["param"]
    lo, hi     = level_data["num_range"]
    cols, rows = level_data["cols"], level_data["rows"]
    total      = cols * rows

    avoid_set  = set(concept.avoid_list(param, lo, hi))
    avoids     = [n for n in avoid_set if lo <= n <= hi]
    non_avoids = [n for n in range(lo, hi + 1) if n not in avoid_set]
    random.shuffle(non_avoids)
    random.shuffle(avoids)

    # 균형잡힌 비율로 배치 (40% 피해야 할 숫자, 60% 격파해야 할 숫자)
    target_avoid_ratio = 0.4
    n_avoid = max(3, min(len(avoids), int(total * target_avoid_ratio)))
    n_non_avoid = min(len(non_avoids), total - n_avoid)

    # 최소 개수 보장
    if n_non_avoid < 3 and len(non_avoids) >= 3:
        n_non_avoid = 3
        n_avoid = min(len(avoids), total - n_non_avoid)

    pool = avoids[:n_avoid] + non_avoids[:n_non_avoid]
    random.shuffle(pool)

    if max_total is not None and len(pool) > max_total:
        avoids_pool = [n for n in pool if n in avoid_set]
        non_pool    = [n for n in pool if n not in avoid_set]
        # 균형잡힌 비율 유지 (40% 피해야 할 숫자, 60% 격파해야 할 숫자)
        keep_avo = max(2, min(len(avoids_pool), int(max_total * 0.4)))
        keep_non = min(len(non_pool), max_total - keep_avo)
        # 최소 개수 보장
        if keep_non < 2 and len(non_pool) >= 2:
            keep_non = 2
            keep_avo = min(len(avoids_pool), max_total - keep_non)
        random.shuffle(non_pool)
        random.shuffle(avoids_pool)
        pool = non_pool[:keep_non] + avoids_pool[:keep_avo]
        random.shuffle(pool)

    gap_x   = 85
    gap_y   = 55
    start_x = (SCREEN_W - (cols - 1) * gap_x) // 2
    start_y = 88

    enemies = []
    for i, num in enumerate(pool):
        c       = i % cols
        r       = i // cols
        stagger = gap_x // 2 if r % 2 == 1 else 0
        bx      = start_x + c * gap_x + stagger
        by      = start_y + r * gap_y
        enemies.append(Enemy(num, num in avoid_set, bx, by))
    return enemies
