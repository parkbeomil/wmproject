import random
from shared.concepts import Concept


class DynamicConcept(Concept):
    """LLM이 생성한 JSON 정의로부터 동적으로 생성되는 Concept."""

    def __init__(self, game_definition):
        """
        Args:
            game_definition: llm_generator가 생성한 JSON
                {
                    "concept": {
                        "name": str,
                        "description": str,
                        "uses_target": bool (optional, default: True),
                        "validation_logic": {
                            "type": "code",
                            "function": "lambda num, target: ..."
                        },
                        "candidates": [...] (optional if uses_target=False)
                    },
                    ...
                }
        """
        concept_data = game_definition["concept"]

        self.name = concept_data["name"]
        self.description = concept_data.get("description", "")
        self.instruction = concept_data.get("instruction", "")
        self.eliminate_mode = concept_data.get("eliminate_mode", False)
        self.uses_target = concept_data.get("uses_target", True)
        self._candidates = concept_data.get("candidates", [])

        # Safely compile validation lambda
        logic = concept_data["validation_logic"]
        if logic["type"] != "code":
            raise ValueError("validation_logic.type must be 'code'")

        # Create restricted namespace for security
        safe_namespace = {
            '__builtins__': {
                # Math functions
                'abs': abs,
                'min': min,
                'max': max,
                'sum': sum,
                'int': int,
                'float': float,
                'round': round,
                'pow': pow,
                'divmod': divmod,
                # Boolean
                'bool': bool,
                'True': True,
                'False': False,
                'None': None,
                # String operations (for palindrome, digit manipulation)
                'str': str,
                # Collections (for membership test)
                'range': range,
                'len': len,
                'all': all,
                'any': any,
                'sorted': sorted,
                'list': list,
                'set': set,
            }
        }

        try:
            # Compile the lambda function in restricted namespace
            func_str = logic["function"]
            self._validator = eval(func_str, safe_namespace, {})

            # Test the validator with a sample value
            if self._candidates:
                test_target = self._candidates[0]
                # candidates가 리스트의 리스트인 경우 (공약수/공배수)와
                # 정수 리스트인 경우 (약수/배수)를 모두 처리
                test_num = 1  # num은 항상 정수
            else:
                test_target = 1
                test_num = 1

            test_result = self._validator(test_num, test_target)
            if not isinstance(test_result, bool):
                raise ValueError("Validator must return boolean")

        except Exception as e:
            raise ValueError(f"Invalid validation function: {str(e)}")

    def is_valid(self, num, target):
        """
        주어진 숫자가 개념에 부합하는지 검사합니다.

        Args:
            num: 검사할 숫자
            target: 목표 숫자 (게임에서 선택된 candidate)

        Returns:
            bool: 유효하면 True
        """
        try:
            return self._validator(num, target)
        except Exception:
            # 에러 발생시 안전하게 False 반환
            return False

    def avoid_list(self, target, lo, hi):
        """
        [lo, hi] 범위에서 피해야 할 숫자(=유효 숫자) 목록.

        Args:
            target: 목표 숫자
            lo: 범위 시작
            hi: 범위 끝

        Returns:
            list: 피해야 할 숫자들
        """
        try:
            return [n for n in range(lo, hi + 1) if self.is_valid(n, target)]
        except Exception:
            # 에러 발생시 빈 리스트 반환
            return []

    def sample_targets(self, count):
        """
        게임에서 사용할 목표 숫자들을 샘플링합니다.

        Args:
            count: 필요한 숫자 개수

        Returns:
            list: 샘플링된 숫자들 (uses_target=False인 경우 None 리스트)
        """
        # target을 사용하지 않는 개념은 None 반환
        if not self.uses_target:
            return [None] * count

        if not self._candidates:
            # Fallback: generate default range
            return list(range(2, min(count + 2, 10)))

        actual_count = min(count, len(self._candidates))
        return random.sample(self._candidates, actual_count)

    def __repr__(self):
        return f"DynamicConcept(name='{self.name}', candidates={self._candidates})"
