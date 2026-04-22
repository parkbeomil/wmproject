import pygame
import random
import math

from airplane.settings import (SCREEN_W, SCREEN_H,
                       WHITE, CYAN, YELLOW, ORANGE, PURPLE, RED, GREEN,
                       F_MED, F_SM)


# ── 배경별 ────────────────────────────────────────────────────────────────────
class Star:
    def __init__(self, initial=True):
        self.x     = random.randint(0, SCREEN_W)
        self.y     = random.randint(0, SCREEN_H) if initial else 0
        self.speed = random.uniform(0.2, 1.3)
        self.r     = random.randint(1, 2)
        self.br    = random.randint(80, 220)

    def update(self):
        self.y += self.speed
        if self.y > SCREEN_H:
            self.x  = random.randint(0, SCREEN_W)
            self.y  = 0
            self.br = random.randint(80, 220)

    def draw(self, surf):
        pygame.draw.circle(surf, (self.br,) * 3, (int(self.x), int(self.y)), self.r)


stars = [Star() for _ in range(80)]


# ── 플레이어 ──────────────────────────────────────────────────────────────────
class Player:
    W, H     = 48, 42
    SPEED    = 5
    SHOOT_CD = 290  # ms

    def __init__(self):
        self.x          = SCREEN_W // 2
        self.y          = SCREEN_H - 65
        self.lives      = 3
        self.score      = 0
        self._last_shot = 0
        self._inv_until = 0

    @property
    def rect(self):
        return pygame.Rect(self.x - 10, self.y - 20, 20, 38)

    def move(self, keys, forward_limit=None):
        if keys[pygame.K_LEFT]  and self.x > 30:
            self.x -= self.SPEED
        if keys[pygame.K_RIGHT] and self.x < SCREEN_W - 30:
            self.x += self.SPEED
        if keys[pygame.K_UP]:
            limit = 60 if forward_limit is None else forward_limit
            if self.y > limit:
                self.y -= self.SPEED
        if keys[pygame.K_DOWN] and self.y < SCREEN_H - 40:
            self.y += self.SPEED

    def shoot(self):
        now = pygame.time.get_ticks()
        if now - self._last_shot >= self.SHOOT_CD:
            self._last_shot = now
            return PlayerBullet(self.x, self.y - self.H // 2)
        return None

    def take_hit(self):
        now = pygame.time.get_ticks()
        if now < self._inv_until:
            return False
        self.lives -= 1
        self._inv_until = now + 2000
        return True

    def draw(self, surf):
        now = pygame.time.get_ticks()
        if now < self._inv_until and (now // 80) % 2 == 0:
            return
        cx, cy = self.x, self.y
        pygame.draw.polygon(surf, CYAN,
            [(cx, cy - self.H // 2), (cx - 22, cy + self.H // 2), (cx + 22, cy + self.H // 2)])
        pygame.draw.polygon(surf, (0, 150, 200),
            [(cx - 22, cy + self.H // 2), (cx - 32, cy + 8), (cx - 8, cy + 4)])
        pygame.draw.polygon(surf, (0, 150, 200),
            [(cx + 22, cy + self.H // 2), (cx + 32, cy + 8), (cx + 8, cy + 4)])
        pygame.draw.circle(surf, YELLOW, (cx, cy + 2), 8)
        pygame.draw.rect(surf, ORANGE, (cx - 6, cy + self.H // 2 - 3, 12, 7), border_radius=3)


# ── 플레이어 총알 ─────────────────────────────────────────────────────────────
class PlayerBullet:
    SPEED = 12

    def __init__(self, x, y):
        self.x, self.y = float(x), float(y)
        self.alive = True

    @property
    def rect(self):
        return pygame.Rect(self.x - 3, self.y - 9, 6, 18)

    def update(self):
        self.y -= self.SPEED
        if self.y < -20:
            self.alive = False

    def draw(self, surf):
        pygame.draw.rect(surf, YELLOW, self.rect, border_radius=3)
        pygame.draw.rect(surf, WHITE, (self.x - 1, self.y - 7, 2, 14), border_radius=1)


# ── 적 총알 ───────────────────────────────────────────────────────────────────
class EnemyBullet:
    SPEED = 4

    def __init__(self, x, y):
        self.x, self.y = float(x), float(y)
        self.alive = True

    @property
    def rect(self):
        return pygame.Rect(self.x - 3, self.y - 6, 6, 12)

    def update(self):
        self.y += self.SPEED
        if self.y > SCREEN_H + 20:
            self.alive = False

    def draw(self, surf):
        pygame.draw.rect(surf, ORANGE, self.rect, border_radius=3)


# ── 적 ───────────────────────────────────────────────────────────────────────
class Enemy:
    W, H = 54, 40

    def __init__(self, number, is_avoid, base_x, base_y):
        self.number   = number
        self.is_avoid = is_avoid
        self.base_x     = float(base_x)
        self.base_y     = float(base_y)
        self.x          = float(base_x)
        self.y          = float(base_y)
        self.alive      = True
        self.phase      = random.uniform(0, 2 * math.pi)
        self.speed      = random.uniform(0.6, 1.1)
        self.base_speed = self.speed

    def update(self, t):
        """t: 경과 시간(초). 사인파로 좌우 진동."""
        self.x = self.base_x + 38 * math.sin(self.speed * t + self.phase)

    @property
    def rect(self):
        return pygame.Rect(int(self.x) - self.W // 2,
                           int(self.y) - self.H // 2,
                           self.W, self.H)

    def draw(self, surf):
        cx, cy = int(self.x), int(self.y)
        pygame.draw.rect(surf, PURPLE, self.rect, border_radius=8)
        pygame.draw.rect(surf, (200, 100, 255), self.rect, 2, border_radius=8)
        s = F_MED.render(str(self.number), True, WHITE)
        surf.blit(s, s.get_rect(center=(cx, cy)))


# ── 파티클 ────────────────────────────────────────────────────────────────────
class Particle:
    def __init__(self, x, y, color):
        self.x     = float(x)
        self.y     = float(y)
        self.vx    = random.uniform(-3.5, 3.5)
        self.vy    = random.uniform(-5, 1)
        self.life  = random.randint(22, 45)
        self.color = color
        self.r     = random.randint(2, 5)

    def update(self):
        self.x  += self.vx
        self.y  += self.vy
        self.vy += 0.15
        self.life -= 1

    def draw(self, surf):
        if self.life <= 0:
            return
        s = pygame.Surface((self.r * 2 + 2, self.r * 2 + 2), pygame.SRCALPHA)
        alpha = min(255, self.life * 6)
        pygame.draw.circle(s, (*self.color, alpha), (self.r + 1, self.r + 1), self.r)
        surf.blit(s, (int(self.x) - self.r - 1, int(self.y) - self.r - 1))


# ── 떠오르는 텍스트 ───────────────────────────────────────────────────────────
class FloatText:
    def __init__(self, text, x, y, color, life=80):
        self.text  = text
        self.x     = float(x)
        self.y     = float(y)
        self.color = color
        self.life  = life
        self.total = life

    def update(self):
        self.y    -= 1.1
        self.life -= 1

    def draw(self, surf):
        if self.life <= 0:
            return
        s = F_SM.render(self.text, True, self.color)
        s.set_alpha(max(0, min(255, int(255 * self.life / self.total))))
        surf.blit(s, s.get_rect(center=(int(self.x), int(self.y))))
