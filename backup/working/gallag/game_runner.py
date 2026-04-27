"""
Pygame 게임을 실행하는 subprocess 스크립트.

Usage:
    python game_runner.py <game_type>                    # 프리셋 게임
    python game_runner.py <game_type> <definition.json>  # 커스텀 게임
"""

import sys
import json
from pathlib import Path


def main():
    """게임 실행 메인 함수."""
    if len(sys.argv) < 2:
        print("Usage: python game_runner.py <game_type> [definition.json]", file=sys.stderr)
        sys.exit(1)

    game_type = sys.argv[1]

    if game_type not in ["airplane", "frog"]:
        print(f"Invalid game type: {game_type}", file=sys.stderr)
        sys.exit(1)

    # 커스텀 게임 정의 로드 (있는 경우)
    custom_concept = None
    custom_rules = None

    if len(sys.argv) >= 3:
        definition_file = sys.argv[2]
        try:
            with open(definition_file, 'r', encoding='utf-8') as f:
                definition = json.load(f)

            # DynamicConcept 생성
            from shared.dynamic_concept import DynamicConcept
            custom_concept = DynamicConcept(definition)

            # 커스텀 룰 추출
            custom_rules = definition.get("game_rules", {}).get(game_type)

        except Exception as e:
            print(f"게임 정의 로드 실패: {str(e)}", file=sys.stderr)
            sys.exit(1)

    # 게임 실행
    try:
        if game_type == "airplane":
            from airplane.main import main as airplane_main
            airplane_main(standalone=False, custom_concept=custom_concept, custom_rules=custom_rules)
        elif game_type == "frog":
            from frog.main import main as frog_main
            frog_main(standalone=False, custom_concept=custom_concept, custom_rules=custom_rules)

    except SystemExit:
        # 정상 종료
        sys.exit(0)
    except Exception as e:
        print(f"게임 실행 오류: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
