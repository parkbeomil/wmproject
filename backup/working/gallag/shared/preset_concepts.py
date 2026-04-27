"""
API 없이 사용 가능한 프리셋 게임 정의
"""

# 미리 정의된 게임 컨셉들
PRESET_GAMES = {
    "짝수": {
        "concept": {
            "name": "짝수",
            "description": "2로 나누어떨어지는 수",
            "validation_logic": {
                "type": "code",
                "function": "lambda num, target: num % 2 == 0"
            },
            "candidates": [10, 20, 30]
        },
        "game_rules": {
            "airplane": {
                "speed_scale": [0.65, 0.9, 1.2],
                "max_total": [10, 16, 24],
                "descent_rate": [0.012, 0.018, 0.024]
            },
            "frog": {
                "rows": [5, 7, 9],
                "num_range": [[1, 30], [2, 60], [3, 90]],
                "speed": [45, 65, 85]
            }
        }
    },

    "홀수": {
        "concept": {
            "name": "홀수",
            "description": "2로 나눈 나머지가 1인 수",
            "validation_logic": {
                "type": "code",
                "function": "lambda num, target: num % 2 == 1"
            },
            "candidates": [15, 25, 35]
        },
        "game_rules": {
            "airplane": {
                "speed_scale": [0.65, 0.9, 1.2],
                "max_total": [10, 16, 24],
                "descent_rate": [0.012, 0.018, 0.024]
            },
            "frog": {
                "rows": [5, 7, 9],
                "num_range": [[1, 30], [2, 60], [3, 90]],
                "speed": [45, 65, 85]
            }
        }
    },

    "3의 배수": {
        "concept": {
            "name": "3의 배수",
            "description": "3으로 나누어떨어지는 수",
            "validation_logic": {
                "type": "code",
                "function": "lambda num, target: num % 3 == 0"
            },
            "candidates": [15, 21, 30]
        },
        "game_rules": {
            "airplane": {
                "speed_scale": [0.65, 0.9, 1.2],
                "max_total": [10, 16, 24],
                "descent_rate": [0.012, 0.018, 0.024]
            },
            "frog": {
                "rows": [5, 7, 9],
                "num_range": [[1, 30], [2, 60], [3, 90]],
                "speed": [45, 65, 85]
            }
        }
    },

    "5의 배수": {
        "concept": {
            "name": "5의 배수",
            "description": "5로 나누어떨어지는 수",
            "validation_logic": {
                "type": "code",
                "function": "lambda num, target: num % 5 == 0"
            },
            "candidates": [20, 25, 30]
        },
        "game_rules": {
            "airplane": {
                "speed_scale": [0.65, 0.9, 1.2],
                "max_total": [10, 16, 24],
                "descent_rate": [0.012, 0.018, 0.024]
            },
            "frog": {
                "rows": [5, 7, 9],
                "num_range": [[1, 30], [2, 60], [3, 90]],
                "speed": [45, 65, 85]
            }
        }
    },

    "소수": {
        "concept": {
            "name": "소수",
            "description": "1과 자기 자신으로만 나누어지는 수",
            "validation_logic": {
                "type": "code",
                "function": "lambda num, target: num in [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59] and num <= 60"
            },
            "candidates": [30, 40, 50]
        },
        "game_rules": {
            "airplane": {
                "speed_scale": [0.5, 0.7, 0.9],
                "max_total": [8, 12, 16],
                "descent_rate": [0.010, 0.014, 0.018]
            },
            "frog": {
                "rows": [4, 6, 8],
                "num_range": [[1, 20], [1, 40], [1, 60]],
                "speed": [40, 55, 70]
            }
        }
    },

    "10보다 작은 수": {
        "concept": {
            "name": "10보다 작은 수",
            "description": "10 미만의 양수",
            "validation_logic": {
                "type": "code",
                "function": "lambda num, target: 0 < num < 10"
            },
            "candidates": [15, 25, 35]
        },
        "game_rules": {
            "airplane": {
                "speed_scale": [0.6, 0.85, 1.1],
                "max_total": [10, 14, 20],
                "descent_rate": [0.012, 0.016, 0.020]
            },
            "frog": {
                "rows": [5, 7, 9],
                "num_range": [[1, 20], [1, 40], [1, 60]],
                "speed": [45, 60, 80]
            }
        }
    },
}


def get_preset_list():
    """사용 가능한 프리셋 목록 반환"""
    return list(PRESET_GAMES.keys())


def get_preset_definition(name):
    """프리셋 게임 정의 가져오기"""
    return PRESET_GAMES.get(name)
