"""
Streamlit에서 Pygame 게임을 실행하는 헬퍼 모듈.

macOS 호환성을 위해 subprocess 방식을 사용하여 별도 프로세스에서 게임을 실행합니다.
게임 정의는 JSON으로 직렬화하여 임시 파일로 전달합니다.
"""

import subprocess
import sys
import json
import tempfile
from pathlib import Path


def launch_pygame_game(game_type, game_definition=None):
    """
    Pygame 게임을 subprocess로 실행합니다.

    Args:
        game_type: "airplane" 또는 "frog"
        game_definition: dict - 게임 정의 JSON (커스텀 게임용, 선택사항)

    Raises:
        ValueError: 유효하지 않은 game_type
        RuntimeError: 게임 실행 중 오류 발생
    """
    if game_type not in ["airplane", "frog"]:
        raise ValueError(f"Invalid game type: {game_type}. Must be 'airplane' or 'frog'.")

    try:
        # Python 실행 파일 경로
        python_exe = sys.executable

        # 프로젝트 루트 디렉토리
        project_root = Path(__file__).parent

        # 게임 실행 스크립트 생성
        if game_definition:
            # 커스텀 게임: 임시 파일에 게임 정의 저장
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                json.dump(game_definition, f, ensure_ascii=False, indent=2)
                temp_file = f.name

            try:
                # subprocess로 게임 실행
                cmd = [
                    python_exe,
                    str(project_root / "game_runner.py"),
                    game_type,
                    temp_file
                ]
                result = subprocess.run(cmd, cwd=str(project_root))

                if result.returncode != 0 and result.returncode != 1:
                    # returncode 0: 정상 종료, 1: SystemExit, 기타: 오류
                    raise RuntimeError(f"게임이 비정상 종료되었습니다 (exit code: {result.returncode})")

            finally:
                # 임시 파일 삭제
                try:
                    Path(temp_file).unlink()
                except Exception:
                    pass
        else:
            # 프리셋 게임: 직접 실행
            cmd = [
                python_exe,
                str(project_root / "game_runner.py"),
                game_type
            ]
            result = subprocess.run(cmd, cwd=str(project_root))

            if result.returncode != 0 and result.returncode != 1:
                raise RuntimeError(f"게임이 비정상 종료되었습니다 (exit code: {result.returncode})")

    except subprocess.SubprocessError as e:
        raise RuntimeError(f"게임 실행 중 오류가 발생했습니다: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"게임 실행 중 오류가 발생했습니다: {str(e)}")


def validate_environment():
    """
    실행 환경이 올바르게 설정되었는지 검증합니다.

    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    import os
    from pathlib import Path

    errors = []

    # 1. 필수 패키지 확인
    required_packages = {
        'pygame': 'pygame',
        'dspy': 'dspy-ai',
        'openai': 'openai',
        'dotenv': 'python-dotenv'
    }

    for module_name, package_name in required_packages.items():
        try:
            __import__(module_name)
        except ImportError:
            errors.append(f"❌ {package_name} 패키지가 설치되지 않았습니다.")

    # 2. .env 파일 확인
    env_path = Path(__file__).parent / ".env"
    if not env_path.exists():
        errors.append("❌ .env 파일이 존재하지 않습니다.")
    else:
        # OPENAI_API_KEY 확인
        from dotenv import load_dotenv
        load_dotenv()
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key == "your_api_key_here":
            errors.append(
                "❌ OPENAI_API_KEY가 설정되지 않았습니다.\n"
                "   .env 파일에 유효한 API 키를 설정해주세요.\n"
                "   API 키는 https://platform.openai.com/api-keys 에서 발급받을 수 있습니다."
            )

    # 3. 게임 디렉토리 확인
    project_root = Path(__file__).parent
    required_dirs = ['airplane', 'frog', 'shared']
    for dir_name in required_dirs:
        if not (project_root / dir_name).exists():
            errors.append(f"❌ {dir_name} 디렉토리가 존재하지 않습니다.")

    if errors:
        return False, "\n".join(errors)

    return True, None
