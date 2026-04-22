import math
import random
import pygame

from frog.settings import SCREEN_W, SCREEN_H


class Ripple:
    def __init__(self):
        self.x = random.randint(0, SCREEN_W)
        self.y = random.randint(0, SCREEN_H)
        self.r = random.randint(12, 40)
        self.speed = random.uniform(6, 14)
        self.alpha = random.randint(20, 55)

    def update(self, dt):
        self.r += self.speed * dt
        self.alpha -= 12 * dt
        if self.alpha <= 0:
            self.x = random.randint(0, SCREEN_W)
            self.y = random.randint(0, SCREEN_H)
            self.r = random.randint(10, 24)
            self.speed = random.uniform(6, 14)
            self.alpha = random.randint(22, 55)

    def draw(self, surf):
        if self.alpha <= 0:
            return
        s = pygame.Surface((int(self.r * 2 + 4), int(self.r * 2 + 4)), pygame.SRCALPHA)
        pygame.draw.ellipse(s, (255, 255, 255, int(self.alpha)), (2, 2, self.r * 2, self.r * 2), 2)
        surf.blit(s, (self.x - self.r, self.y - self.r))


class RippleField:
    def __init__(self, count=14):
        self.ripples = [Ripple() for _ in range(count)]

    def update(self, dt):
        for r in self.ripples:
            r.update(dt)

    def draw(self, surf):
        for r in self.ripples:
            r.draw(surf)
