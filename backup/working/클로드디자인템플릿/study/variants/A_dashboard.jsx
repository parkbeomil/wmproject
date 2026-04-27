// 시안 A: 친구들의 학교 - 따뜻한 파스텔, 손그림 노트 느낌
const A_palette = {
  bg: '#FBF7F0',
  paper: '#FFFFFF',
  ink: '#3B3328',
  inkSoft: '#7A6F5E',
  line: '#E8DFCB',
  primary: '#F4A261',  // 따뜻한 오렌지
  primarySoft: '#FFE4C7',
  accent: '#7BA8A0',   // 민트
  pink: '#F4B6BB',
  yellow: '#FFD96B',
  blue: '#B8D4E3',
  green: '#C6DEB0',
};

const A_typo = {
  display: '"Gaegu", "Ownglyph_meetme-Rg", system-ui',
  body: '"Gowun Dodum", "Pretendard", system-ui',
};

// 작은 헬퍼들
const ACard = ({ children, style, ...rest }) => (
  <div style={{
    background: A_palette.paper,
    border: `2px solid ${A_palette.ink}`,
    borderRadius: 18,
    boxShadow: `4px 4px 0 ${A_palette.ink}`,
    ...style,
  }} {...rest}>{children}</div>
);

const AStickyTape = ({ rotate = -4, top = -10, left = 30, color = A_palette.yellow }) => (
  <div style={{
    position: 'absolute', top, left, width: 70, height: 22,
    background: color, opacity: 0.85,
    transform: `rotate(${rotate}deg)`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  }} />
);

const APill = ({ children, color = A_palette.yellow, dark }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: color,
    color: dark ? A_palette.ink : A_palette.ink,
    padding: '3px 10px', borderRadius: 999,
    fontSize: 13, fontWeight: 700,
    border: `1.5px solid ${A_palette.ink}`,
    fontFamily: A_typo.body,
  }}>{children}</span>
);

// ───────────────────────── A1: 메인 대시보드 ─────────────────────────
const A_Dashboard = () => {
  return (
    <div style={{
      width: 1280, minHeight: 820, background: A_palette.bg,
      fontFamily: A_typo.body, color: A_palette.ink,
      padding: 32, position: 'relative', overflow: 'hidden',
    }}>
      {/* 배경 도트 패턴 */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(${A_palette.line} 1.5px, transparent 1.5px)`,
        backgroundSize: '24px 24px',
        opacity: 0.6, pointerEvents: 'none',
      }} />

      {/* 상단 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: A_palette.primary, border: `2px solid ${A_palette.ink}`,
            display: 'grid', placeItems: 'center', fontSize: 28,
            boxShadow: `3px 3px 0 ${A_palette.ink}`,
          }}>📚</div>
          <div>
            <div style={{ fontFamily: A_typo.display, fontSize: 32, lineHeight: 1, fontWeight: 700 }}>
              숫자친구 교실
            </div>
            <div style={{ fontSize: 14, color: A_palette.inkSoft, marginTop: 4 }}>
              5학년 수학 · 약수와 배수 · 함께하는 5친구
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <APill color={A_palette.green}>🗓 4월 26일 · 3교시</APill>
          <APill color={A_palette.pink}>👨‍🏫 김선생님 반</APill>
        </div>
      </div>

      {/* 학습 목표 + 캐릭터 줄 */}
      <ACard style={{ position: 'relative', padding: '20px 24px', marginBottom: 22 }}>
        <AStickyTape />
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: A_palette.primary, letterSpacing: 1 }}>
              ★ 오늘의 학습 목표
            </div>
            <div style={{ fontFamily: A_typo.display, fontSize: 26, marginTop: 4, lineHeight: 1.3 }}>
              두 수의 <u style={{textDecorationColor: A_palette.yellow, textDecorationThickness: 6, textUnderlineOffset: -2}}>공약수</u>를 찾고,
              <span style={{ color: A_palette.primary }}> 가장 큰 약수</span>가 무엇인지 알아봐요.
            </div>
          </div>
          {/* 캐릭터 5명 */}
          <div style={{ display: 'flex', gap: -8 }}>
            {window.CHARACTERS.map((c, i) => (
              <div key={c.id} style={{
                width: 64, height: 64, borderRadius: '50%',
                background: c.bg, border: `2px solid ${A_palette.ink}`,
                marginLeft: i === 0 ? 0 : -10,
                overflow: 'hidden', position: 'relative',
                zIndex: 5 - i,
              }}>
                <img src={c.img} alt={c.name} style={{
                  width: '160%', height: '160%',
                  objectFit: 'cover', objectPosition: 'top center',
                  marginLeft: '-30%', marginTop: '-15%',
                }} />
              </div>
            ))}
          </div>
        </div>
      </ACard>

      {/* 차시 진행도 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {window.LESSONS.map((l, i) => {
          const active = i === 2;
          const done = i < 2;
          const mascot = window.CHARACTERS.find(c => c.id === l.mascot);
          return (
            <ACard key={l.id} style={{
              padding: 14, position: 'relative',
              background: active ? l.color + '40' : (done ? '#F0E9DC' : A_palette.paper),
              transform: active ? 'translateY(-4px)' : 'none',
              boxShadow: active ? `5px 6px 0 ${A_palette.ink}` : `3px 3px 0 ${A_palette.ink}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 11, color: A_palette.inkSoft, fontWeight: 700 }}>
                  {done ? '✓ 완료' : active ? '오늘 진행' : `${l.id}차시`}
                </div>
                <div style={{ fontSize: 22 }}>{l.icon}</div>
              </div>
              <div style={{ fontFamily: A_typo.display, fontSize: 22, marginTop: 6, fontWeight: 700 }}>
                {l.title}
              </div>
              <div style={{ fontSize: 12, color: A_palette.inkSoft, marginTop: 2 }}>{l.subtitle}</div>
              {active && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: mascot.bg, border: `1.5px solid ${A_palette.ink}`,
                    overflow: 'hidden',
                  }}>
                    <img src={mascot.img} style={{ width: '160%', marginLeft: '-30%', marginTop: '-15%' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{mascot.name}이 안내</span>
                </div>
              )}
            </ACard>
          );
        })}
      </div>

      {/* 게임 그리드 + 사이드 도구 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 22 }}>
        {/* 게임 카드들 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontFamily: A_typo.display, fontSize: 24, fontWeight: 700 }}>
              🎮 오늘의 게임 · 자유롭게 골라봐!
            </div>
            <div style={{ fontSize: 12, color: A_palette.inkSoft }}>총 {window.GAMES.length}개의 게임</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {window.GAMES.map((g, i) => {
              const mascot = window.CHARACTERS.find(c => c.id === g.mascot);
              return (
                <ACard key={g.id} style={{ padding: 0, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                  <div style={{
                    height: 100, background: g.color + '70', position: 'relative',
                    borderBottom: `2px solid ${A_palette.ink}`,
                  }}>
                    <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 32 }}>{g.icon}</div>
                    <div style={{
                      position: 'absolute', right: -10, bottom: -20, width: 100, height: 130,
                      overflow: 'hidden',
                    }}>
                      <img src={mascot.img} style={{ width: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontFamily: A_typo.display, fontSize: 20, fontWeight: 700 }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: A_palette.inkSoft, marginTop: 2, minHeight: 28 }}>{g.desc}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      <APill color={g.color + '80'}>{g.difficulty}</APill>
                      <APill color={A_palette.paper}>{g.players}</APill>
                    </div>
                  </div>
                </ACard>
              );
            })}
            {/* 빈 슬롯에 친근한 안내 */}
            <ACard style={{
              padding: 14, background: A_palette.primarySoft,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
              minHeight: 220,
            }}>
              <div style={{ fontSize: 36 }}>🌱</div>
              <div style={{ fontFamily: A_typo.display, fontSize: 18, marginTop: 6, fontWeight: 700 }}>
                새 게임이<br/>곧 자라나요!
              </div>
              <div style={{ fontSize: 11, color: A_palette.inkSoft, marginTop: 6 }}>곧 추가 예정</div>
            </ACard>
          </div>
        </div>

        {/* 사이드: 보조 도구 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 점수판 */}
          <ACard style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: A_typo.display, fontSize: 18, fontWeight: 700 }}>🏅 우리반 스티커판</div>
              <span style={{ fontSize: 11, color: A_palette.inkSoft }}>오늘 12개</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
              {Array.from({length: 18}).map((_, i) => (
                <div key={i} style={{
                  aspectRatio: '1', borderRadius: '50%',
                  background: i < 12 ? [A_palette.pink, A_palette.yellow, A_palette.green, A_palette.blue][i%4] : '#F0E9DC',
                  border: `1.5px solid ${A_palette.ink}`,
                  display: 'grid', placeItems: 'center', fontSize: 12,
                }}>{i < 12 ? '★' : ''}</div>
              ))}
            </div>
          </ACard>

          {/* 빠른 도구들 */}
          <ACard style={{ padding: 14 }}>
            <div style={{ fontFamily: A_typo.display, fontSize: 18, fontWeight: 700, marginBottom: 10 }}>🧰 선생님 도구</div>
            {[
              { icon: '🎲', label: '랜덤 문제', desc: '약수/배수 즉석 출제' },
              { icon: '👥', label: '팀 나누기', desc: '학생을 팀으로 분배' },
              { icon: '⏱', label: '타이머', desc: '5분 도전!' },
              { icon: '📋', label: '진행 가이드', desc: '오늘의 수업 노트' },
            ].map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 8px', borderRadius: 10,
                background: i === 0 ? A_palette.primarySoft : 'transparent',
                border: i === 0 ? `1.5px solid ${A_palette.ink}` : '1.5px solid transparent',
                marginBottom: 6, cursor: 'pointer',
              }}>
                <div style={{ fontSize: 22 }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: A_palette.inkSoft }}>{t.desc}</div>
                </div>
                <div style={{ fontSize: 14, color: A_palette.inkSoft }}>›</div>
              </div>
            ))}
          </ACard>

          {/* 개념 카드 미리보기 */}
          <ACard style={{ padding: 14, position: 'relative' }}>
            <AStickyTape rotate={3} top={-8} left={140} color={A_palette.pink} />
            <div style={{ fontFamily: A_typo.display, fontSize: 18, fontWeight: 700 }}>📖 개념 다시 보기</div>
            <div style={{ fontSize: 12, color: A_palette.inkSoft, marginTop: 4 }}>한 번 더 짚어줄까요?</div>
            <div style={{
              marginTop: 10, padding: 10, borderRadius: 10,
              background: A_palette.bg, border: `1.5px dashed ${A_palette.line}`,
              fontSize: 13, lineHeight: 1.5,
            }}>
              <b>약수</b>는 어떤 수를 <u>나누어떨어지게 하는</u> 수예요.<br/>
              예) 12의 약수 = 1, 2, 3, 4, 6, 12
            </div>
          </ACard>
        </div>
      </div>
    </div>
  );
};

window.A_Dashboard = A_Dashboard;
window.A_palette = A_palette;
window.A_typo = A_typo;
window.ACard = ACard;
window.AStickyTape = AStickyTape;
window.APill = APill;
