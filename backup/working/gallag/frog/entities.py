import random
import pygame

from frog.settings import (
    SCREEN_W,
    WHITE, PAD_GREEN, PAD_SINK,
    F_SM, draw_c,
)


PADS_PER_ROW = 5


class Pad:
    W = 92
    H = 48

    def __init__(self, x, y, number, is_good):
        self.x = x
        self.y = y
        self.number = number
        self.is_good = is_good
        self.sinking = False
        self.sink_until = 0
        self.sink_offset = 0.0
        self.alive = True

    def rect(self):
        return pygame.Rect(self.x - self.W // 2, self.y - self.H // 2, self.W, self.H)

    def update(self):
        if not self.sinking:
            return
        self.sink_offset += 1.6
        if pygame.time.get_ticks() > self.sink_until:
            self.alive = False

    def draw(self, surf):
        if not self.alive:
            return
        color = PAD_SINK if self.sinking else PAD_GREEN
        rect = self.rect().move(0, int(self.sink_offset))
        # shadow
        shadow = pygame.Rect(rect.x + 4, rect.y + 6, rect.w - 4, rect.h - 6)
        pygame.draw.ellipse(surf, (10, 40, 20), shadow)
        # leaf body (base + darker rim)
        pygame.draw.ellipse(surf, color, rect)
        rim = rect.inflate(-8, -8)
        pygame.draw.ellipse(surf, (35, 120, 55), rim, 2)
        # subtle highlight
        highlight = pygame.Rect(rect.x + 10, rect.y + 8, rect.w - 26, rect.h - 20)
        pygame.draw.ellipse(surf, (90, 210, 120), highlight, 1)
        # leaf veins
        pygame.draw.line(surf, (40, 140, 70), (rect.centerx, rect.y + 6), (rect.centerx, rect.bottom - 6), 2)
        pygame.draw.line(surf, (40, 140, 70), (rect.centerx, rect.centery), (rect.right - 10, rect.centery - 7), 1)
        pygame.draw.line(surf, (40, 140, 70), (rect.centerx, rect.centery), (rect.left + 10, rect.centery - 7), 1)
        pygame.draw.line(surf, (40, 140, 70), (rect.centerx, rect.centery + 2), (rect.right - 12, rect.centery + 6), 1)
        pygame.draw.line(surf, (40, 140, 70), (rect.centerx, rect.centery + 2), (rect.left + 12, rect.centery + 6), 1)
        # leaf notch
        pygame.draw.polygon(surf, (20, 80, 35),
                            [(rect.centerx, rect.y + 2),
                             (rect.centerx - 6, rect.y + 14),
                             (rect.centerx + 6, rect.y + 14)])
        # subtle texture spots
        pygame.draw.circle(surf, (40, 150, 70), (rect.centerx - 18, rect.centery + 6), 3)
        pygame.draw.circle(surf, (40, 150, 70), (rect.centerx + 16, rect.centery + 4), 2)
        pygame.draw.circle(surf, (40, 150, 70), (rect.centerx - 4, rect.centery - 6), 2)
        draw_c(surf, str(self.number), F_SM, WHITE, self.x, self.y)
        # reflection
        reflect = pygame.Surface((rect.w, rect.h // 2), pygame.SRCALPHA)
        pygame.draw.ellipse(reflect, (210, 255, 220, 35), (0, 0, rect.w, rect.h // 2))
        surf.blit(reflect, (rect.x, rect.y + rect.h // 2 + 6))


class Row:
    def __init__(self, y, speed, direction, target, num_range, concept, pick_valid_number, pick_invalid_number):
        self.y = y
        self.speed = speed
        self.direction = direction
        self.pads = []

        lo, hi = num_range
        spacing = SCREEN_W // (PADS_PER_ROW + 1)
        base_x = [spacing * (i + 1) for i in range(PADS_PER_ROW)]
        random.shuffle(base_x)

        good_idx = random.randrange(PADS_PER_ROW)
        for i in range(PADS_PER_ROW):
            if i == good_idx:
                n = pick_valid_number(target, lo, hi, concept)
                good = True
            else:
                if random.random() < 0.35:
                    n = pick_valid_number(target, lo, hi, concept)
                    good = True
                else:
                    n = pick_invalid_number(target, lo, hi, concept)
                    good = False
            self.pads.append(Pad(base_x[i], y, n, good))

        # safety: row must have at least one good pad
        if not any(p.is_good for p in self.pads):
            p = random.choice(self.pads)
            p.number = pick_valid_number(target, lo, hi, concept)
            p.is_good = True

    def update(self, dt):
        for p in self.pads:
            p.update()

            p.x += self.speed * self.direction * dt
            if p.x < -Pad.W // 2:
                p.x += SCREEN_W + Pad.W
            elif p.x > SCREEN_W + Pad.W // 2:
                p.x -= SCREEN_W + Pad.W

    def sorted_pads(self):
        return sorted(self.pads, key=lambda pad: pad.x)


class Frog:
    W = 36
    H = 36

    def __init__(self, rows, max_lives, start_y):
        self.rows = rows
        self.row_idx = -1  # -1: bottom bank
        self.on_pad = None
        self.x = SCREEN_W // 2
        self.y = start_y
        self.start_y = start_y
        self.last_move = 0
        self.lives = max_lives
        self.checkpoint_row = -1
        self.checkpoint_pad = None
        self.respawn_until = 0
        self.jumping = False
        self.jump_start = 0
        self.jump_dur = 0
        self.jump_from = (0, 0)
        self.jump_to = (0, 0)
        self.jump_height = 0
        self.pending_pad = None
        self.pending_row_idx = -1
        self.sinking = False
        self.sink_until = 0
        self.jump_lock_until = 0

    def can_move(self, move_cd_ms):
        now = pygame.time.get_ticks()
        return (now - self.last_move > move_cd_ms) and (now >= self.jump_lock_until)

    def set_checkpoint(self):
        self.checkpoint_row = self.row_idx
        self.checkpoint_pad = self.on_pad

    def apply_checkpoint(self):
        self.jumping = False
        self.sinking = False
        self.row_idx = self.checkpoint_row
        self.on_pad = self.checkpoint_pad
        if self.on_pad:
            self.x = self.on_pad.x
            self.y = self.on_pad.y - 6
        else:
            self.x = SCREEN_W // 2
            self.y = self.start_y

    def start_jump(self, target_x, target_y, row_idx, pad, duration=260, height=28):
        if self.jumping:
            return
        self.jumping = True
        self.sinking = False
        self.jump_start = pygame.time.get_ticks()
        self.jump_dur = duration
        self.jump_lock_until = self.jump_start + duration + 80
        self.jump_from = (self.x, self.y)
        self.jump_to = (target_x, target_y)
        self.jump_height = height
        self.pending_pad = pad
        self.pending_row_idx = row_idx
        self.on_pad = None

    def update(self):
        now = pygame.time.get_ticks()
        if self.sinking:
            if self.on_pad:
                self.x = self.on_pad.x
                self.y = self.on_pad.y - 6 + self.on_pad.sink_offset
            else:
                self.y += 1.6
            if now >= self.sink_until:
                self.sinking = False
                return "sunk"
            return None
        if self.jumping:
            t = (now - self.jump_start) / max(1, self.jump_dur)
            if t >= 1.0:
                self.jumping = False
                self.x, self.y = self.jump_to
                self.row_idx = self.pending_row_idx
                self.on_pad = self.pending_pad
                return "landed"
            x0, y0 = self.jump_from
            x1, y1 = self.jump_to
            x = x0 + (x1 - x0) * t
            y = y0 + (y1 - y0) * t
            arc = self.jump_height * (1 - (2 * t - 1) ** 2)
            self.x = x
            self.y = y - arc
            return None

        if self.on_pad:
            self.x = self.on_pad.x
            self.y = self.on_pad.y - 6
        return None

    def draw(self, surf):
        body = pygame.Rect(self.x - self.W // 2, self.y - self.H // 2, self.W, self.H)
        shadow = pygame.Rect(body.x + 6, body.y + 10, body.w - 8, body.h - 10)
        pygame.draw.ellipse(surf, (10, 40, 20), shadow)
        pygame.draw.ellipse(surf, (30, 145, 60), body)
        pygame.draw.ellipse(surf, (18, 110, 36), body, 2)
        belly = body.inflate(-12, -16)
        pygame.draw.ellipse(surf, (55, 175, 85), belly)
        head = pygame.Rect(self.x - 16, self.y - 24, 32, 22)
        pygame.draw.ellipse(surf, (35, 165, 70), head)
        pygame.draw.ellipse(surf, (18, 110, 36), head, 2)
        # eyes
        pygame.draw.circle(surf, (245, 245, 245), (int(self.x - 9), int(self.y - 22)), 5)
        pygame.draw.circle(surf, (245, 245, 245), (int(self.x + 9), int(self.y - 22)), 5)
        pygame.draw.circle(surf, (20, 20, 20), (int(self.x - 9), int(self.y - 22)), 2)
        pygame.draw.circle(surf, (20, 20, 20), (int(self.x + 9), int(self.y - 22)), 2)
        pygame.draw.circle(surf, (255, 255, 255), (int(self.x - 11), int(self.y - 24)), 1)
        pygame.draw.circle(surf, (255, 255, 255), (int(self.x + 7), int(self.y - 24)), 1)
        # nostrils
        pygame.draw.circle(surf, (20, 90, 40), (int(self.x - 4), int(self.y - 8)), 2)
        pygame.draw.circle(surf, (20, 90, 40), (int(self.x + 4), int(self.y - 8)), 2)
        # mouth
        pygame.draw.arc(surf, (15, 80, 35), (self.x - 10, self.y - 6, 20, 12), 0.2, 2.9, 2)
        # legs
        pygame.draw.line(surf, (25, 120, 50), (self.x - 10, self.y + 6), (self.x - 28, self.y + 18), 4)
        pygame.draw.line(surf, (25, 120, 50), (self.x + 10, self.y + 6), (self.x + 28, self.y + 18), 4)
        pygame.draw.circle(surf, (25, 120, 50), (int(self.x - 28), int(self.y + 18)), 3)
        pygame.draw.circle(surf, (25, 120, 50), (int(self.x + 28), int(self.y + 18)), 3)
        # back spots
        pygame.draw.circle(surf, (22, 120, 48), (int(self.x - 8), int(self.y + 4)), 3)
        pygame.draw.circle(surf, (22, 120, 48), (int(self.x + 6), int(self.y + 8)), 2)
        # reflection
        reflect = pygame.Surface((body.w, body.h // 2), pygame.SRCALPHA)
        pygame.draw.ellipse(reflect, (200, 255, 210, 30), (0, 0, body.w, body.h // 2))
        surf.blit(reflect, (body.x, body.y + body.h // 2 + 6))
