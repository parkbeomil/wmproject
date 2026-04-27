import math
import random

# ── 공통 상수 ───────────────────────────────────────────────────────────────
DIVISOR_CANDIDATES = [12, 15, 16, 18, 20, 21, 24, 28, 30, 32, 36, 40, 42, 45, 48]
MULTIPLE_CANDIDATES = list(range(2, 10))


# ── 유틸 ────────────────────────────────────────────────────────────────────

def get_divisors(n):
    return sorted(i for i in range(1, n + 1) if n % i == 0)


def get_candidates(name):
    if name == "약수":
        return DIVISOR_CANDIDATES
    return MULTIPLE_CANDIDATES


# ── 개념 베이스 ─────────────────────────────────────────────────────────────
class Concept:
    name = ""

    def is_valid(self, num, target):
        raise NotImplementedError

    def avoid_list(self, target, lo, hi):
        """[lo, hi] 범위에서 피해야 할 숫자(=유효 숫자) 목록."""
        return [n for n in range(lo, hi + 1) if self.is_valid(n, target)]

    def sample_targets(self, count):
        pool = get_candidates(self.name)
        return random.sample(pool, min(count, len(pool)))


# ── 약수 / 배수 개념 ─────────────────────────────────────────────────────────
class DivisorConcept(Concept):
    name = "약수"

    def is_valid(self, num, target):
        return target % num == 0


class MultipleConcept(Concept):
    name = "배수"

    def is_valid(self, num, target):
        return num % target == 0


# ── 팩토리 ────────────────────────────────────────────────────────────────

def get_concepts():
    return [DivisorConcept(), MultipleConcept()]
