// 시안 A 게임 진입 화면 + 선생님 도구
const { A_palette, A_typo, ACard, AStickyTape, APill } = window;

const A_GameDetail = () => {
  const game = window.GAMES[3]; // 갤러그
  const mascot = window.CHARACTERS.find(c => c.id === game.mascot);
  return (
    <div style={{
      width: 1280, minHeight: 820, background: A_palette.bg,
      fontFamily: A_typo.body, color: A_palette.ink, padding: 32, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(${A_palette.line} 1.5px, transparent 1.5px)`,
        backgroundSize: '24px 24px', opacity: 0.6, pointerEvents: 'none',
      }} />

      {/* 빵부스러기 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 14 }}>
        <span style={{ color: A_palette.inkSoft }}>← 메인으로</span>
        <span style={{ color: A_palette.inkSoft }}>·</span>
        <span style={{ color: A_palette.inkSoft }}>2차시 · 배수</span>
        <span style={{ color: A_palette.inkSoft }}>›</span>
        <b>약수 갤러그</b>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        {/* 큰 게임 카드 */}
        <ACard style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            height: 280, background: `linear-gradient(135deg, ${game.color}80, ${A_palette.primarySoft})`,
            position: 'relative', borderBottom: `2px solid ${A_palette.ink}`,
          }}>
            {/* 별 장식 */}
            {[...Array(8)].map((_,i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${10 + i*11}%`, top: `${15 + (i%3)*22}%`,
                fontSize: 14 + (i%3)*4, opacity: 0.7,
              }}>✦</div>
            ))}
            <div style={{
              position: 'absolute', right: 30, bottom: -10, width: 200, height: 280,
            }}>
              <img src={mascot.img} style={{ width: '100%' }} />
            </div>
            <div style={{ position: 'absolute', top: 24, left: 28 }}>
              <div style={{ fontSize: 48 }}>{game.icon}</div>
              <div style={{ fontFamily: A_typo.display, fontSize: 44, fontWeight: 700, lineHeight: 1, marginTop: 4 }}>
                약수 갤러그
              </div>
              <div style={{ fontSize: 16, marginTop: 6, color: A_palette.inkSoft }}>
                {mascot.name}이와 함께 우주에서 약수를 잡아라!
              </div>
            </div>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <APill color={game.color + '80'}>난이도 · {game.difficulty}</APill>
              <APill color={A_palette.paper}>{game.players}</APill>
              <APill color={A_palette.green}>2차시 · 배수</APill>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>🎯 게임 목표</div>
                <div style={{ fontSize: 13, color: A_palette.inkSoft, lineHeight: 1.6 }}>
                  화면에 떠다니는 숫자 중 <b style={{color: A_palette.ink}}>3의 배수</b>만 골라 쏘세요.
                  10초 안에 5개를 맞히면 다음 단계!
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>🕹️ 조작법</div>
                <div style={{ fontSize: 13, color: A_palette.inkSoft, lineHeight: 1.6 }}>
                  ← → 키로 좌우 이동, <b style={{color: A_palette.ink}}>스페이스바</b>로 발사!
                </div>
              </div>
            </div>
            <button style={{
              marginTop: 18, width: '100%', padding: '16px',
              background: A_palette.primary, border: `2px solid ${A_palette.ink}`,
              borderRadius: 14, fontSize: 20, fontWeight: 700,
              fontFamily: A_typo.display, color: A_palette.ink, cursor: 'pointer',
              boxShadow: `4px 4px 0 ${A_palette.ink}`,
            }}>▶ 게임 시작!</button>
          </div>
        </ACard>

        {/* 우측: 미션 + 친구들의 응원 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ACard style={{ padding: 16, position: 'relative' }}>
            <AStickyTape rotate={-3} color={A_palette.green} />
            <div style={{ fontFamily: A_typo.display, fontSize: 18, fontWeight: 700 }}>📌 오늘의 미션</div>
            <div style={{ marginTop: 10 }}>
              {['1단계 · 2의 배수 5개 맞히기', '2단계 · 3의 배수 7개 맞히기', '3단계 · 6의 공배수 잡기'].map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 0', borderBottom: i < 2 ? `1px dashed ${A_palette.line}` : 'none',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: i === 0 ? A_palette.primary : A_palette.paper,
                    border: `1.5px solid ${A_palette.ink}`,
                    display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700,
                    color: i === 0 ? A_palette.paper : A_palette.ink,
                  }}>{i+1}</div>
                  <span style={{ fontSize: 13 }}>{m}</span>
                </div>
              ))}
            </div>
          </ACard>

          <ACard style={{ padding: 16 }}>
            <div style={{ fontFamily: A_typo.display, fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
              💬 친구들의 응원
            </div>
            {window.CHARACTERS.slice(0, 3).map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: c.bg, border: `1.5px solid ${A_palette.ink}`,
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  <img src={c.img} style={{ width: '160%', marginLeft: '-30%', marginTop: '-15%' }} />
                </div>
                <div style={{
                  background: c.bg, padding: '8px 12px', borderRadius: 12,
                  border: `1.5px solid ${A_palette.ink}`, fontSize: 13,
                }}>
                  <b style={{ color: c.color }}>{c.name}</b> · {c.quote}
                </div>
              </div>
            ))}
          </ACard>

          <ACard style={{ padding: 16, background: A_palette.primarySoft }}>
            <div style={{ fontFamily: A_typo.display, fontSize: 16, fontWeight: 700 }}>🏆 최고 기록</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
              <span>🥇 김민준 · 24점</span>
              <span style={{ color: A_palette.inkSoft }}>3분 23초</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 13 }}>
              <span>🥈 이서연 · 21점</span>
              <span style={{ color: A_palette.inkSoft }}>4분 02초</span>
            </div>
          </ACard>
        </div>
      </div>
    </div>
  );
};

const A_TeacherTools = () => {
  const teamColors = [A_palette.pink, A_palette.yellow, A_palette.green, A_palette.blue];
  const students = ['민준', '서연', '도윤', '하윤', '시우', '지유', '주원', '예준', '서윤', '지호', '수아', '준호'];
  return (
    <div style={{
      width: 1280, minHeight: 820, background: A_palette.bg,
      fontFamily: A_typo.body, color: A_palette.ink, padding: 32, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(${A_palette.line} 1.5px, transparent 1.5px)`,
        backgroundSize: '24px 24px', opacity: 0.6, pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: A_palette.accent, border: `2px solid ${A_palette.ink}`,
          display: 'grid', placeItems: 'center', fontSize: 24,
          boxShadow: `3px 3px 0 ${A_palette.ink}`,
        }}>🧰</div>
        <div style={{ fontFamily: A_typo.display, fontSize: 28, fontWeight: 700 }}>선생님 도구함</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <APill color={A_palette.green}>학생 24명</APill>
          <APill color={A_palette.yellow}>3교시 진행 중</APill>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* 팀 나누기 */}
        <ACard style={{ padding: 20, position: 'relative' }}>
          <AStickyTape rotate={-4} color={A_palette.pink} />
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontFamily: A_typo.display, fontSize: 22, fontWeight: 700 }}>👥 팀 나누기</div>
            <span style={{ fontSize: 12, color: A_palette.inkSoft }}>4팀 · 무작위</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {window.CHARACTERS.slice(0, 4).map((c, ti) => (
              <div key={c.id} style={{
                background: teamColors[ti] + '50',
                border: `2px solid ${A_palette.ink}`, borderRadius: 14, padding: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: c.bg, border: `1.5px solid ${A_palette.ink}`,
                    overflow: 'hidden', flexShrink: 0,
                  }}>
                    <img src={c.img} style={{ width: '160%', marginLeft: '-30%', marginTop: '-15%' }} />
                  </div>
                  <div style={{ fontFamily: A_typo.display, fontSize: 18, fontWeight: 700 }}>{c.name}팀</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {students.slice(ti*3, ti*3 + 3).map(s => (
                    <span key={s} style={{
                      background: A_palette.paper, border: `1.5px solid ${A_palette.ink}`,
                      borderRadius: 10, padding: '3px 8px', fontSize: 12, fontWeight: 600,
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button style={{
            marginTop: 14, width: '100%', padding: '12px',
            background: A_palette.paper, border: `2px solid ${A_palette.ink}`,
            borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>🔀 다시 나누기</button>
        </ACard>

        {/* 랜덤 문제 출제기 */}
        <ACard style={{ padding: 20, position: 'relative' }}>
          <AStickyTape rotate={3} left={140} color={A_palette.yellow} />
          <div style={{ fontFamily: A_typo.display, fontSize: 22, fontWeight: 700, marginBottom: 12 }}>🎲 랜덤 문제 출제기</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {['약수', '배수', '공약수', '공배수', '최대공약수', '최소공배수'].map((t, i) => (
              <span key={t} style={{
                padding: '6px 12px', borderRadius: 999,
                background: i === 2 ? A_palette.primary : A_palette.paper,
                color: i === 2 ? A_palette.paper : A_palette.ink,
                border: `1.5px solid ${A_palette.ink}`,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>{t}</span>
            ))}
          </div>
          <div style={{
            background: A_palette.primarySoft, padding: 20, borderRadius: 14,
            border: `2px dashed ${A_palette.ink}`, textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, color: A_palette.inkSoft, fontWeight: 700, letterSpacing: 1 }}>문제 #07</div>
            <div style={{ fontFamily: A_typo.display, fontSize: 28, fontWeight: 700, lineHeight: 1.4, marginTop: 6 }}>
              12와 18의<br/><span style={{color: A_palette.primary}}>최대공약수</span>는?
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              {['2', '3', '6', '9'].map((a, i) => (
                <div key={a} style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: A_palette.paper, border: `2px solid ${A_palette.ink}`,
                  display: 'grid', placeItems: 'center',
                  fontFamily: A_typo.display, fontSize: 22, fontWeight: 700,
                  boxShadow: `2px 2px 0 ${A_palette.ink}`,
                }}>{a}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button style={{
              flex: 1, padding: 10, background: A_palette.paper, border: `2px solid ${A_palette.ink}`,
              borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>🔄 새 문제</button>
            <button style={{
              flex: 1, padding: 10, background: A_palette.accent, color: '#fff',
              border: `2px solid ${A_palette.ink}`,
              borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>👀 정답 공개</button>
          </div>
        </ACard>

        {/* 진행 가이드 */}
        <ACard style={{ padding: 20, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontFamily: A_typo.display, fontSize: 22, fontWeight: 700 }}>📋 오늘의 진행 가이드</div>
            <span style={{ fontSize: 12, color: A_palette.inkSoft }}>40분 수업</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { time: '0~5분', title: '도입', desc: '바두기와 인사하고 어제 배운 약수 복습', color: A_palette.pink },
              { time: '5~15분', title: '개념', desc: '공약수와 최대공약수 함께 알아보기', color: A_palette.yellow },
              { time: '15~30분', title: '게임 활동', desc: '뒤집기 카드 + 카드 고르기 자유 선택', color: A_palette.green, active: true },
              { time: '30~40분', title: '마무리', desc: '랜덤 문제 풀이 + 스티커 보상', color: A_palette.blue },
            ].map((s, i) => (
              <div key={i} style={{
                padding: 12, borderRadius: 12,
                background: s.active ? s.color + '60' : A_palette.paper,
                border: `2px solid ${A_palette.ink}`,
                position: 'relative',
              }}>
                {s.active && (
                  <div style={{
                    position: 'absolute', top: -8, right: 10,
                    background: A_palette.primary, color: '#fff',
                    padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                    border: `1.5px solid ${A_palette.ink}`,
                  }}>지금</div>
                )}
                <div style={{ fontSize: 11, color: A_palette.inkSoft, fontWeight: 700 }}>{s.time}</div>
                <div style={{ fontFamily: A_typo.display, fontSize: 18, fontWeight: 700, marginTop: 2 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: A_palette.inkSoft, marginTop: 4, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </ACard>
      </div>
    </div>
  );
};

window.A_GameDetail = A_GameDetail;
window.A_TeacherTools = A_TeacherTools;
