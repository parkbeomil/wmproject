import random

from frog.settings import SCREEN_H
from frog.entities import Row


MOVE_CD_MS = 140
SINK_TIME_MS = 700
RESPAWN_DELAY_MS = 450

FROG_TEMPLATES = [
    {"rows": 5, "num_range": (1, 30), "speed": 45},
    {"rows": 7, "num_range": (2, 60), "speed": 65},
    {"rows": 9, "num_range": (3, 90), "speed": 85},
]


def build_levels(concept, custom_rules=None):
    """
    레벨을 생성합니다.

    Args:
        concept: Concept 객체
        custom_rules: 커스텀 룰 (옵션)
            {
                "rows": [5, 7, 9],
                "num_range": [[1, 30], [2, 60], [3, 90]],
                "speed": [45, 65, 85]
            }

    Returns:
        list: 레벨 데이터 리스트
    """
    targets = concept.sample_targets(3)
    levels = []

    if custom_rules:
        # 커스텀 룰 사용
        rows_list = custom_rules.get("rows", [5, 7, 9])
        num_range_list = custom_rules.get("num_range", [[1, 30], [2, 60], [3, 90]])
        speed_list = custom_rules.get("speed", [45, 65, 85])

        for i, target in enumerate(targets):
            idx = min(i, len(rows_list) - 1)
            levels.append({
                "concept": concept,
                "param": target,
                "rows": rows_list[idx],
                "num_range": tuple(num_range_list[idx]) if isinstance(num_range_list[idx], list) else num_range_list[idx],
                "speed": speed_list[idx]
            })
    else:
        # 기본 템플릿 사용
        for data, target in zip(FROG_TEMPLATES, targets):
            levels.append({"concept": concept, "param": target, **data})

    return levels


# ── 숫자 규칙 ─────────────────────────────────────────────────────────────────

def is_valid(num, target, concept):
    return concept.is_valid(num, target)


def valid_numbers_in_range(target, lo, hi, concept):
    vals = set()
    for n in range(lo, hi + 1):
        if is_valid(n, target, concept):
            vals.add(n)
    return sorted(vals)


def pick_valid_number(target, lo, hi, concept):
    vals = valid_numbers_in_range(target, lo, hi, concept)
    if vals:
        return random.choice(vals)
    # fallback: 범위의 최소값 반환 (target이 리스트일 수 있으므로)
    return lo


def pick_invalid_number(target, lo, hi, concept):
    for _ in range(60):
        n = random.randint(lo, hi)
        if not is_valid(n, target, concept):
            return n
    # fallback: try simple search
    for n in range(lo, hi + 1):
        if not is_valid(n, target, concept):
            return n
    # 최종 fallback: 범위의 최대값 반환 (target이 리스트일 수 있으므로)
    return hi


def build_level(level_data):
    data = level_data
    concept = data["concept"]
    rows_n = data["rows"]
    target = data["param"]
    num_range = data["num_range"]

    # uses_target이 false인 경우 target이 None일 수 있음
    # 이 경우 num_range의 중간값 사용 (실제로는 사용되지 않음)
    if target is None:
        target = (num_range[0] + num_range[1]) // 2

    # target은 validation 기준값이므로 num_range와 무관
    # airplane 게임과 동일하게 target을 그대로 concept에 전달

    top_bank = 70
    bottom_bank = SCREEN_H - 70
    span = bottom_bank - top_bank
    gap = span / (rows_n + 1)

    rows = []
    # rows[0] should be the bottom-most row so that first jump goes to the nearest row
    for i in range(rows_n):
        y = bottom_bank - gap * (i + 1)
        speed = data["speed"] + i * 8
        direction = 1 if i % 2 == 0 else -1
        rows.append(Row(y, speed, direction, target, num_range, concept, pick_valid_number, pick_invalid_number))

    return rows, target


def find_closest_pad(row, x):
    pads = [p for p in row.pads if p.alive]
    if not pads:
        return None
    return min(pads, key=lambda p: abs(p.x - x))


def find_neighbor_pad(row, x, direction):
    pads = [p for p in row.sorted_pads() if p.alive]
    if not pads:
        return None
    if direction < 0:
        left = [p for p in pads if p.x < x]
        return left[-1] if left else None
    right = [p for p in pads if p.x > x]
    return right[0] if right else None
