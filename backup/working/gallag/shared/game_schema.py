"""
Pydantic 스키마 정의 - DSPy와 함께 사용하여 구조화된 게임 정의 생성
"""

from pydantic import BaseModel, Field, model_validator
from typing import List, Union, Optional


class ValidationLogic(BaseModel):
    """검증 로직 - lambda 함수를 문자열로 저장"""
    type: str = Field(default="code", description="Must be 'code'")
    function: str = Field(
        description="Lambda function as string. Format: 'lambda num, target: <condition>'"
    )


class Concept(BaseModel):
    """수학 개념 정의"""
    name: str = Field(description="개념 이름 (예: 약수, 공약수, 배수)")
    description: str = Field(description="개념 설명 (1-2문장)")
    instruction: str = Field(
        description=(
            "게임 안내 메시지. 반드시 플레이스홀더 사용:\n"
            "- 약수/배수: '{target}의 약수가 아닌 수를 격파하세요!'\n"
            "- 공약수/공배수: '{target[0]}와 {target[1]}의 공약수가 아닌 수를 격파하세요!'\n"
            "❌ 구체적인 숫자 금지 (예: '30와 42의 공약수...')"
        )
    )
    eliminate_mode: bool = Field(
        description=(
            "false: 조건에 맞는 숫자를 피하고 나머지 격파 (기본)\n"
            "true: 조건에 맞는 숫자를 격파하고 나머지 피함"
        )
    )
    uses_target: bool = Field(
        description="true: candidates 필수 (약수, 배수, 공약수, 공배수)"
    )
    validation_logic: ValidationLogic
    candidates: List[Union[int, List[int]]] = Field(
        default_factory=list,
        description=(
            "uses_target이 true인 경우 필수 (3개):\n"
            "- 약수/배수: 정수 리스트 [12, 24, 36]\n"
            "- 공약수/공배수: 리스트의 리스트 [[2, 6], [12, 18], [24, 36]]"
        )
    )


class AirplaneRules(BaseModel):
    """수학 갤러그 게임 규칙"""
    speed_scale: List[float] = Field(
        description="레벨별 속도 배율 (3개). 쉬움: [0.5, 0.65, 0.8], 보통: [0.7, 1.0, 1.3], 어려움: [1.0, 1.4, 1.8]",
        min_length=3,
        max_length=3
    )
    max_total: List[int] = Field(
        description="레벨별 최대 적 수 (3개). 쉬움: [8, 12, 16], 보통: [12, 18, 24], 어려움: [16, 24, 30]",
        min_length=3,
        max_length=3
    )
    descent_rate: List[float] = Field(
        description="레벨별 하강 속도 (3개). 쉬움: [0.008, 0.012, 0.016], 보통: [0.012, 0.018, 0.024], 어려움: [0.016, 0.024, 0.032]",
        min_length=3,
        max_length=3
    )
    num_range: List[List[int]] = Field(
        description="레벨별 적 숫자 범위 (3개). 쉬움: [[1, 30], [1, 40], [1, 50]], 보통: [[1, 40], [1, 50], [1, 60]], 어려움: [[1, 50], [1, 70], [1, 80]]",
        min_length=3,
        max_length=3
    )


class FrogRules(BaseModel):
    """개구리 연못 건너기 게임 규칙"""
    rows: List[int] = Field(
        description="레벨별 행 수 (3개). 쉬움: [4, 5, 6], 보통: [5, 7, 9], 어려움: [7, 9, 10]",
        min_length=3,
        max_length=3
    )
    num_range: List[List[int]] = Field(
        description="레벨별 숫자 범위 (3개). 쉬움: [[1, 20], [1, 30], [1, 40]], 보통: [[1, 30], [2, 60], [3, 90]], 어려움: [[1, 50], [1, 80], [1, 100]]",
        min_length=3,
        max_length=3
    )
    speed: List[int] = Field(
        description="레벨별 패드 이동 속도 (3개). 쉬움: [30, 40, 50], 보통: [45, 65, 85], 어려움: [60, 80, 100]",
        min_length=3,
        max_length=3
    )


class GameRules(BaseModel):
    """게임별 규칙"""
    airplane: Optional[AirplaneRules] = Field(
        default=None,
        description="수학 갤러그 게임 규칙 (game_type이 'airplane'인 경우)"
    )
    frog: Optional[FrogRules] = Field(
        default=None,
        description="개구리 연못 건너기 게임 규칙 (game_type이 'frog'인 경우)"
    )

    @model_validator(mode='after')
    def check_one_game_rule(self):
        """airplane 또는 frog 중 정확히 하나만 있어야 함"""
        if not self.airplane and not self.frog:
            raise ValueError("airplane 또는 frog 중 하나는 필수입니다")
        if self.airplane and self.frog:
            raise ValueError("airplane과 frog 중 하나만 설정해야 합니다 (다른 하나는 null)")
        return self


class GameDefinition(BaseModel):
    """전체 게임 정의"""
    concept: Concept = Field(description="수학 개념 정의")
    game_rules: GameRules = Field(description="게임별 규칙 (airplane 또는 frog)")
