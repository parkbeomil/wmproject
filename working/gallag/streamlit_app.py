"""
수학 게임 런처 - Streamlit Web UI

Streamlit 웹 인터페이스로 게임을 선택하고, 실제 게임은 Pygame 창에서 실행됩니다.
"""

import streamlit as st
from streamlit_launcher import launch_pygame_game, validate_environment
from shared.llm_generator import GameGenerator
from shared.dynamic_concept import DynamicConcept


# ── 페이지 설정 ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="수학 게임 런처",
    page_icon="🎮",
    layout="centered",
    initial_sidebar_state="collapsed"
)


# ── 커스텀 CSS ───────────────────────────────────────────────────────────────
st.markdown("""
<style>
/* 버튼 스타일 */
.stButton>button {
    width: 100%;
    height: 60px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 10px;
    transition: all 0.3s;
}

.stButton>button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 카드 스타일 */
.game-card {
    padding: 20px;
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
    margin: 10px 0;
}

/* 텍스트 영역 스타일 */
.stTextArea>div>div>textarea {
    font-size: 16px;
    border-radius: 8px;
}

/* 제목 스타일 */
h1 {
    text-align: center;
    color: #667eea;
}

h2 {
    text-align: center;
    color: #764ba2;
}
</style>
""", unsafe_allow_html=True)


# ── Session State 초기화 ─────────────────────────────────────────────────────
def initialize_session_state():
    """세션 상태를 초기화합니다."""
    if 'page' not in st.session_state:
        st.session_state.page = 'menu'  # 'menu' or 'custom'

    if 'game_type' not in st.session_state:
        st.session_state.game_type = None

    if 'game_definition' not in st.session_state:
        st.session_state.game_definition = None

    if 'custom_concept' not in st.session_state:
        st.session_state.custom_concept = None

    if 'custom_rules' not in st.session_state:
        st.session_state.custom_rules = None

    if 'prompt' not in st.session_state:
        st.session_state.prompt = ""

    if 'additional_request' not in st.session_state:
        st.session_state.additional_request = ""

    if 'env_validated' not in st.session_state:
        st.session_state.env_validated = False


# ── 프리셋 게임 실행 ─────────────────────────────────────────────────────────
def launch_preset_game(game_type):
    """
    프리셋 게임을 실행합니다.

    Args:
        game_type: "airplane" 또는 "frog"
    """
    try:
        with st.spinner(f"🎮 게임을 시작하는 중..."):
            launch_pygame_game(game_type, game_definition=None)
        st.success("✅ 게임이 종료되었습니다!")
    except SystemExit:
        st.info("게임이 정상적으로 종료되었습니다.")
    except Exception as e:
        st.error(f"❌ 게임 실행 오류: {str(e)}")


# ── 커스텀 게임 실행 ─────────────────────────────────────────────────────────
def launch_custom_game():
    """커스텀 게임을 실행합니다."""
    try:
        game_type = st.session_state.game_type
        game_definition = st.session_state.game_definition

        if not game_type or not game_definition:
            st.error("❌ 게임 정보가 없습니다.")
            return

        with st.spinner("🚀 게임을 시작하는 중..."):
            launch_pygame_game(game_type, game_definition)
        st.success("✅ 게임이 종료되었습니다!")
    except Exception as e:
        st.error(f"❌ 게임 실행 오류: {str(e)}")


# ── 프롬프트 생성 ────────────────────────────────────────────────────────────
def build_prompt(learning_objective, difficulty, additional_request):
    """
    선택된 옵션들로부터 LLM 프롬프트를 생성합니다.

    Args:
        learning_objective: 학습 목표
        difficulty: 난이도 (쉬움/보통/어려움)
        additional_request: 추가 요청사항

    Returns:
        str: 생성된 프롬프트
    """
    # 기본 프롬프트 구성
    prompt_parts = []

    # 학습 목표에 따른 간단한 설명
    objective_descriptions = {
        "약수의 의미와 구하기": "주어진 수의 약수를 찾는 게임을 만들어주세요.",
        "공약수 찾기": "두 수의 공약수를 찾는 게임을 만들어주세요. 구체적인 두 수를 명시해야 합니다.",
        "최대공약수 구하기": "두 수의 최대공약수를 구하는 게임을 만들어주세요. 구체적인 두 수와 그 최대공약수를 명시해야 합니다.",
        "배수 이해하기": "주어진 수의 배수를 찾는 게임을 만들어주세요.",
        "공배수 찾기": "두 수의 공배수를 찾는 게임을 만들어주세요. 구체적인 두 수를 명시해야 합니다.",
        "최소공배수 구하기": "두 수의 최소공배수를 구하는 게임을 만들어주세요. 구체적인 두 수와 그 최소공배수를 명시해야 합니다."
    }

    description = objective_descriptions.get(learning_objective, learning_objective)
    prompt_parts.append(description)

    # 난이도 반영 (명시적으로 표현)
    difficulty_instructions = {
        "쉬움": "**난이도: 쉬움** - game_rules를 '쉬움' 가이드에 맞춰 설정하세요.",
        "보통": "**난이도: 보통** - game_rules를 '보통' 가이드에 맞춰 설정하세요.",
        "어려움": "**난이도: 어려움** - game_rules를 '어려움' 가이드에 맞춰 설정하세요."
    }
    prompt_parts.append(difficulty_instructions.get(difficulty, ""))

    # 추가 요청사항 (모든 가이드와 힌트를 오버라이드)
    if additional_request and additional_request.strip():
        prompt_parts.append(
            f"**사용자 맞춤 요청** (위의 모든 가이드와 힌트보다 우선하여 반영): {additional_request.strip()}"
        )

    # 프롬프트 결합
    final_prompt = " ".join(prompt_parts)

    return final_prompt


# ── 게임 생성 ────────────────────────────────────────────────────────────────
def generate_game(game_type, prompt):
    """
    LLM을 사용하여 커스텀 게임을 생성합니다.

    Args:
        game_type: "airplane" 또는 "frog"
        prompt: 사용자 프롬프트

    Returns:
        bool: 성공 여부
    """
    try:
        with st.spinner("🤖 AI가 게임을 생성하는 중..."):
            generator = GameGenerator()
            definition = generator.generate_game_definition(game_type, prompt)

            # 디버그: 생성된 정의 출력
            with st.expander("🔍 생성된 게임 정의 (디버그)", expanded=False):
                st.json(definition)

            # DynamicConcept 생성
            concept = DynamicConcept(definition)

            # 게임 룰 추출
            custom_rules = definition.get("game_rules", {}).get(game_type)

            # Session state에 저장
            st.session_state.game_definition = definition
            st.session_state.custom_concept = concept
            st.session_state.custom_rules = custom_rules
            st.session_state.game_type = game_type

        st.success("✅ 게임이 생성되었습니다!")
        st.balloons()
        return True

    except ValueError as e:
        st.error(f"⚠️ 검증 오류: {str(e)}")
        st.warning("💡 **힌트**: candidates와 validation_logic이 일치하지 않을 수 있습니다.")
        with st.expander("📋 생성된 게임 정의 확인 (디버그)"):
            if 'definition' in locals():
                st.json(definition)
        st.info("프롬프트를 수정하고 다시 시도해주세요.")
        return False
    except Exception as e:
        st.error(f"❌ 생성 실패: {str(e)}")
        with st.expander("📋 에러 세부 정보"):
            st.code(str(e))
            if 'definition' in locals():
                st.json(definition)
        st.info("잠시 후 다시 시도해주세요.")
        return False


# ── 메인 메뉴 페이지 ─────────────────────────────────────────────────────────
def render_main_menu():
    """메인 메뉴 페이지를 렌더링합니다."""
    st.title("🎮 수학 게임 런처")
    st.markdown("---")

    st.markdown("### 게임을 선택하세요")
    st.write("")

    # 3개 열로 게임 카드 배치
    col1, col2, col3 = st.columns(3)

    # 수학 갤러그
    with col1:
        st.markdown("#### ✈️ 수학 갤러그")
        st.write("적을 피하고 숫자를 격파하세요!")
        if st.button("플레이", key="airplane"):
            launch_preset_game("airplane")

    # 개구리 연못
    with col2:
        st.markdown("#### 🐸 개구리 연못")
        st.write("올바른 숫자만 밟고 건너가세요!")
        if st.button("플레이", key="frog"):
            launch_preset_game("frog")

    # 커스텀 게임
    with col3:
        st.markdown("#### 🤖 커스텀 게임")
        st.write("AI가 새로운 게임을 만들어줍니다!")
        if st.button("생성하기", key="custom"):
            st.session_state.page = 'custom'
            st.rerun()

    st.markdown("---")
    st.markdown(
        """
        <div style='text-align: center; color: gray; font-size: 14px;'>
        💡 커스텀 게임은 OpenAI API를 사용하여 생성됩니다.<br>
        게임을 종료하려면 Pygame 창에서 ESC를 누르세요.
        </div>
        """,
        unsafe_allow_html=True
    )


# ── 커스텀 게임 생성 페이지 ──────────────────────────────────────────────────
def render_custom_game_page():
    """커스텀 게임 생성 페이지를 렌더링합니다."""
    st.title("🤖 커스텀 게임 생성")
    st.markdown("---")

    # 뒤로가기 버튼
    if st.button("◀️ 뒤로가기"):
        st.session_state.page = 'menu'
        st.rerun()

    st.write("")

    # 게임이 아직 생성되지 않았을 때
    if not st.session_state.custom_concept:
        # 학습 목표 선택
        st.markdown("### 1️⃣ 학습 목표")
        learning_objectives = [
            "약수의 의미와 구하기",
            "공약수 찾기",
            "최대공약수 구하기",
            "배수 이해하기",
            "공배수 찾기",
            "최소공배수 구하기"
        ]
        learning_objective = st.selectbox(
            "학습할 수학 개념을 선택하세요",
            options=learning_objectives,
            index=0
        )

        # 게임 유형 선택
        st.markdown("### 2️⃣ 게임 유형")
        game_types_display = {
            "airplane": "✈️ 수학 갤러그 - 적을 피하고 숫자를 격파하세요",
            "frog": "🐸 개구리 연못 건너기 - 올바른 숫자만 밟고 건너가세요"
        }
        game_type_display = st.selectbox(
            "게임 방식을 선택하세요",
            options=list(game_types_display.values()),
            index=0
        )
        # 선택된 게임 타입 추출
        game_type = "airplane" if "갤러그" in game_type_display else "frog"
        st.session_state.game_type = game_type

        # 난이도 선택
        st.markdown("### 3️⃣ 난이도")
        difficulty_map = {
            "쉬움": "easy",
            "보통": "normal",
            "어려움": "hard"
        }
        difficulty_display = st.selectbox(
            "난이도를 선택하세요",
            options=list(difficulty_map.keys()),
            index=1  # 기본값: 보통
        )
        difficulty = difficulty_map[difficulty_display]

        # 추가 요청사항 (선택)
        st.markdown("### 4️⃣ 추가 요청사항 (선택)")
        additional_request = st.text_area(
            "특별한 요구사항이 있다면 입력하세요",
            value=st.session_state.get('additional_request', ''),
            max_chars=200,
            height=100,
            placeholder="예: 숫자 범위를 1부터 50까지로 제한해주세요"
        )

        # 글자 수 표시
        if additional_request:
            char_count = len(additional_request)
            st.caption(f"글자 수: {char_count}/200")

        st.write("")

        # 선택된 내용 요약 표시
        with st.expander("📋 선택한 내용 확인", expanded=False):
            st.markdown(f"""
            - **학습 목표**: {learning_objective}
            - **게임 유형**: {game_type_display.split(' - ')[0]}
            - **난이도**: {difficulty_display}
            - **추가 요청사항**: {additional_request if additional_request else '없음'}
            """)

        st.write("")

        # 생성 버튼
        col1, col2 = st.columns([2, 1])
        with col1:
            if st.button("🎮 게임 생성", use_container_width=True, type="primary"):
                # 프롬프트 생성
                prompt = build_prompt(learning_objective, difficulty_display, additional_request)

                st.session_state.additional_request = additional_request
                st.session_state.prompt = prompt

                if generate_game(game_type, prompt):
                    st.rerun()

        with col2:
            if st.button("🔄 초기화", use_container_width=True):
                st.session_state.additional_request = ""
                st.session_state.prompt = ""
                st.rerun()

    # 게임이 생성된 후
    else:
        st.success("✅ 게임이 생성되었습니다!")
        st.markdown("### 3️⃣ 생성된 게임 정보")

        definition = st.session_state.game_definition
        concept_data = definition.get("concept", {})

        # 게임 정보 표시
        with st.container():
            st.markdown(f"**📌 개념:** {concept_data.get('name', 'N/A')}")
            st.markdown(f"**📝 설명:** {concept_data.get('description', 'N/A')}")

            if concept_data.get('instruction'):
                st.markdown(f"**🎯 목표:** {concept_data.get('instruction')}")

            if concept_data.get('uses_target'):
                candidates = concept_data.get('candidates', [])
                if candidates:
                    st.markdown(f"**🔢 후보 숫자:** {', '.join(map(str, candidates[:5]))}")

        # 디버깅: 전체 게임 정의 표시
        with st.expander("🔍 게임 정의 상세 보기 (디버깅)", expanded=False):
            st.json(definition)

        st.write("")

        # 게임 시작 및 새로 만들기 버튼
        col1, col2 = st.columns([2, 1])
        with col1:
            if st.button("🚀 게임 시작!", use_container_width=True, type="primary"):
                launch_custom_game()

        with col2:
            if st.button("🔄 새로 만들기", use_container_width=True):
                # 게임 정보 초기화
                st.session_state.custom_concept = None
                st.session_state.game_definition = None
                st.session_state.custom_rules = None
                st.session_state.prompt = ""
                st.session_state.additional_request = ""
                st.rerun()


# ── 메인 앱 ──────────────────────────────────────────────────────────────────
def main():
    """메인 애플리케이션 진입점."""
    # Session state 초기화
    initialize_session_state()

    # 환경 검증 (첫 실행 시에만)
    if not st.session_state.env_validated:
        with st.spinner("🔍 환경을 확인하는 중..."):
            success, error_msg = validate_environment()

        if not success:
            st.error("❌ 환경 설정 오류")
            st.code(error_msg)
            st.info(
                """
                **해결 방법:**
                1. 필요한 패키지를 설치하세요: `pip install -r requirements.txt`
                2. .env 파일에 OPENAI_API_KEY를 설정하세요.
                """
            )
            st.stop()

        st.session_state.env_validated = True

    # 페이지 라우팅
    if st.session_state.page == 'menu':
        render_main_menu()
    elif st.session_state.page == 'custom':
        render_custom_game_page()


if __name__ == "__main__":
    main()
