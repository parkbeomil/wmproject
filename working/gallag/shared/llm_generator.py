import os
import json
from pathlib import Path
from typing import Optional
import dspy
from dotenv import load_dotenv
from shared.game_schema import Concept, GameRules


class GameGenerationSignature(dspy.Signature):
    """Generate a game definition from user prompt based on mathematical concepts."""

    system_context: str = dspy.InputField(desc="System instructions and game rules")
    user_prompt: str = dspy.InputField(desc="User's request for the game")
    concept: Concept = dspy.OutputField(desc="수학 개념 정의 (name, description, instruction, validation_logic, candidates 등)")
    game_rules: GameRules = dspy.OutputField(desc="게임별 규칙 (airplane 또는 frog의 난이도 설정)")


class GameGenerator:
    """DSPy-based game generator using OpenAI API."""

    def __init__(self):
        load_dotenv()
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key == "your_api_key_here":
            raise ValueError(
                "OPENAI_API_KEY가 설정되지 않았습니다.\n"
                ".env 파일에 유효한 API 키를 설정해주세요.\n"
                "API 키는 https://platform.openai.com/api-keys 에서 발급받을 수 있습니다."
            )

        # 환경 변수에서 모델 설정 읽기
        model = os.getenv("OPENAI_MODEL", "gpt-4o")
        temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.3"))
        max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "2048"))

        # DSPy LM 설정
        self.lm = dspy.LM(
            model=f"openai/{model}",
            api_key=api_key,
            temperature=temperature,
            max_tokens=max_tokens
        )

        # 프롬프트 디렉토리 경로
        self.prompts_dir = Path(__file__).parent.parent / "prompts"

        # 프롬프트 및 예시 캐싱
        self._prompt_cache = {}
        self._examples_cache = None

        # DSPy Predictor 생성 (ChainOfThought 사용)
        self.predictor = dspy.ChainOfThought(GameGenerationSignature)

    def _load_prompt(self, filename: str) -> str:
        """프롬프트 파일을 로드합니다 (캐싱 적용)."""
        if filename not in self._prompt_cache:
            file_path = self.prompts_dir / filename
            with open(file_path, 'r', encoding='utf-8') as f:
                self._prompt_cache[filename] = f.read()
        return self._prompt_cache[filename]

    def _load_examples(self) -> list:
        """Few-shot examples를 로드합니다 (캐싱 적용)."""
        if self._examples_cache is None:
            file_path = self.prompts_dir / "examples.json"
            with open(file_path, 'r', encoding='utf-8') as f:
                self._examples_cache = json.load(f)
        return self._examples_cache

    def _build_dspy_examples(self, game_type: str) -> list[dspy.Example]:
        """Few-shot examples를 DSPy Example 객체로 변환합니다."""
        examples_data = self._load_examples()
        system_context = self._build_system_context(game_type)

        dspy_examples = []
        for ex_data in examples_data:
            # game_definition을 concept와 game_rules로 분리하여 Pydantic 모델로 변환
            try:
                game_def_data = ex_data["game_definition"]
                concept = Concept.model_validate(game_def_data["concept"])
                game_rules = GameRules.model_validate(game_def_data["game_rules"])
            except Exception as e:
                # 예시 데이터가 스키마와 맞지 않으면 스킵
                print(f"⚠️ 예시 데이터 검증 실패, 스킵: {str(e)}")
                continue

            example = dspy.Example(
                system_context=system_context,
                user_prompt=ex_data["user_prompt"],
                concept=concept,
                game_rules=game_rules
            ).with_inputs("system_context", "user_prompt")

            dspy_examples.append(example)

        return dspy_examples

    def _build_system_context(self, game_type: str) -> str:
        """게임 유형에 맞는 시스템 컨텍스트를 생성합니다."""
        # 기본 프롬프트 로드
        base_prompt = self._load_prompt("base_prompt.txt")

        # 게임별 규칙 로드
        if game_type == "airplane":
            game_specific = self._load_prompt("airplane_rules.txt")
        else:  # frog
            game_specific = self._load_prompt("frog_rules.txt")

        return base_prompt + "\n\n" + game_specific

    def generate_game_definition(self, game_type: str, user_prompt: str) -> dict:
        """
        사용자 프롬프트에서 게임 정의를 생성합니다.

        Args:
            game_type: "airplane" 또는 "frog"
            user_prompt: 사용자의 자연어 프롬프트

        Returns:
            dict: 게임 정의 (Pydantic 모델에서 변환)
        """
        try:
            # 시스템 컨텍스트 구성
            system_context = self._build_system_context(game_type)

            # Few-shot examples 로드
            examples = self._build_dspy_examples(game_type)

            # DSPy를 사용하여 예측 (few-shot learning 적용)
            with dspy.context(lm=self.lm):
                # Few-shot examples를 데모로 추가
                prediction = self.predictor(
                    system_context=system_context,
                    user_prompt=user_prompt,
                    demos=examples[:3]  # 상위 3개 예시 사용
                )

            # DSPy가 두 개의 Pydantic 모델을 반환 (자동 검증 포함)
            concept: Concept = prediction.concept
            game_rules: GameRules = prediction.game_rules

            # Pydantic이 자동으로 검증:
            # - GameRules.check_one_game_rule()에서 airplane 또는 frog 중 하나만 있는지 확인

            # dict로 조합
            definition = {
                "concept": concept.model_dump(),
                "game_rules": game_rules.model_dump()
            }

            return definition

        except Exception as e:
            raise RuntimeError(f"게임 생성 실패: {str(e)}")

    def _validate_definition(self, definition: dict, game_type: str) -> None:
        """
        생성된 정의의 추가 유효성을 검증합니다.

        Note: Pydantic이 대부분의 검증을 자동으로 처리하므로,
        여기서는 비즈니스 로직 검증만 수행합니다.
        """
        concept = definition["concept"]

        # validation_logic 검증
        func_str = concept["validation_logic"]["function"]
        if not func_str.startswith("lambda"):
            raise ValueError("validation_logic.function은 lambda 함수여야 합니다.")

        # uses_target과 candidates 관계 검증
        uses_target = concept["uses_target"]
        candidates = concept["candidates"]

        if uses_target and len(candidates) < 3:
            raise ValueError("uses_target이 true인 경우 candidates는 최소 3개를 포함해야 합니다.")

    def optimize_with_bootstrap(
        self,
        game_type: str,
        training_prompts: Optional[list[str]] = None
    ) -> None:
        """
        DSPy BootstrapFewShot을 사용하여 프롬프트를 최적화합니다.

        Args:
            game_type: "airplane" 또는 "frog"
            training_prompts: 최적화에 사용할 학습 프롬프트 목록
        """
        if training_prompts is None:
            # 기본 학습 데이터로 examples 사용
            examples = self._build_dspy_examples(game_type)
        else:
            # 제공된 프롬프트로 학습 데이터 생성
            system_context = self._build_system_context(game_type)
            examples = [
                dspy.Example(
                    system_context=system_context,
                    user_prompt=prompt
                ).with_inputs("system_context", "user_prompt")
                for prompt in training_prompts
            ]

        # Metric 정의: JSON 파싱 가능 여부
        def validation_metric(example, prediction, trace=None):
            try:
                response = prediction.game_definition
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                if json_start == -1 or json_end == 0:
                    return 0.0
                json_str = response[json_start:json_end]
                definition = json.loads(json_str)
                self._validate_definition(definition, game_type)
                return 1.0
            except:
                return 0.0

        # BootstrapFewShot으로 최적화
        from dspy.teleprompt import BootstrapFewShot

        optimizer = BootstrapFewShot(
            metric=validation_metric,
            max_bootstrapped_demos=3,
            max_labeled_demos=3
        )

        # Predictor 최적화
        self.predictor = optimizer.compile(
            self.predictor,
            trainset=examples
        )

        print("✓ DSPy BootstrapFewShot 최적화 완료!")
