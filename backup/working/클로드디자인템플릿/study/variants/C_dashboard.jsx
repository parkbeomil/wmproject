// 시안 C: 워크숍 노트 - 모던하고 정돈된 학습툴 + 큰 캐릭터 + 대담한 타이포
const C_palette = {
  bg: '#F5F2EC',         // 따뜻한 크림 그레이
  surface: '#FFFFFF',
  ink: '#1F1B16',
  inkSoft: '#5C5448',
  line: '#E5DFD3',
  brand: '#FF6B3D',      // 코랄 오렌지 (활기참)
  brandSoft: '#FFE3D5',
  yellow: '#F4C53C',
  mint: '#7AB8A4',
  blue: '#5B8FCF',
  pink: '#E89BB0',
  lavender: '#A993D6',
};

const C_typo = {
  display: '"Black Han Sans", "Jua", system-ui',
  body: '"Pretendard", "Gowun Dodum", system-ui',
};

const CChip = ({ children, color = C_palette.brand, bg, dark }) => (
  <span style={{
    display:'inline-flex', alignItems:'center', gap:4,
    padding:'4px 10px', borderRadius: 8,
    background: bg || color + '20',
    color: dark ? '#fff' : (color === C_palette.brand ? C_palette.brand : C_palette.ink),
    fontSize: 12, fontWeight: 600,
    fontFamily: C_typo.body,
  }}>{children}</span>
);

const CCard = ({ children, style, ...rest }) => (
  <div style={{
    background: C_palette.surface,
    borderRadius: 18,
    border: `1px solid ${C_palette.line}`,
    ...style,
  }} {...rest}>{children}</div>
);

// ─────────────── C1: 메인 ───────────────
const C_Dashboard = () => {
  return (
    <div style={{
      width:1280, minHeight:820, background: C_palette.bg,
      fontFamily: C_typo.body, color: C_palette.ink,
      padding:32, position:'relative',
    }}>
      {/* 상단 헤더 */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{
            width:46, height:46, borderRadius:12,
            background: C_palette.ink,
            display:'grid', placeItems:'center', color:'#fff', fontWeight:800, fontSize:22,
            fontFamily: C_typo.display,
          }}>5</div>
          <div>
            <div style={{ fontFamily: C_typo.display, fontSize: 26, lineHeight:1, letterSpacing:-0.5 }}>
              우리반 수학 시간
            </div>
            <div style={{ fontSize:12, color: C_palette.inkSoft, marginTop:3 }}>
              5학년 · 약수와 배수
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
          <CChip bg={C_palette.surface} color={C_palette.ink}>📅 4월 26일 · 3교시</CChip>
          <CChip bg={C_palette.surface} color={C_palette.ink}>👨‍🏫 김선생님 반</CChip>
          <button style={{
            padding:'8px 16px', background: C_palette.ink, color:'#fff',
            borderRadius: 10, border: 'none', fontWeight:700, fontSize:13, cursor:'pointer',
          }}>선생님 도구함 →</button>
        </div>
      </div>

      {/* 히어로: 학습 목표 + 큰 캐릭터 */}
      <CCard style={{
        padding: 0, overflow:'hidden', marginBottom:18,
        background: `linear-gradient(135deg, ${C_palette.brandSoft} 0%, #FFF6E8 100%)`,
        border: 'none', position:'relative',
      }}>
        <div style={{ display:'flex', alignItems:'stretch' }}>
          <div style={{ flex:1, padding: '32px 36px' }}>
            <div style={{ fontSize:11, fontWeight:700, color: C_palette.brand, letterSpacing:2 }}>
              TODAY'S GOAL · 오늘의 학습 목표
            </div>
            <div style={{
              fontFamily: C_typo.display, fontSize: 44, lineHeight:1.15,
              marginTop:10, letterSpacing:-1,
            }}>
              두 수의 <span style={{color: C_palette.brand, position:'relative'}}>
                공약수
                <svg style={{position:'absolute', left:0, bottom:-8, width:'100%'}} viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M2 8 Q50 2 100 6 T 198 7" stroke={C_palette.brand} strokeWidth="3" fill="none" strokeLinecap="round"/>
                </svg>
              </span>를 찾고,<br/>
              가장 큰 약수를 알아봐요.
            </div>
            <div style={{ display:'flex', gap:8, marginTop:18 }}>
              <CChip bg="#fff" color={C_palette.ink}>3차시 · 최대공약수</CChip>
              <CChip bg="#fff" color={C_palette.ink}>40분 수업</CChip>
              <CChip bg={C_palette.brand} color="#fff" dark>● 진행 중</CChip>
            </div>
          </div>
          <div style={{
            width: 360, position:'relative',
            background: 'transparent',
          }}>
            <img src={window.CHARACTERS.find(c=>c.id==='ssaksu').img} style={{
              position: 'absolute', right: 0, bottom: 0,
              height: 280, width: 'auto',
            }} />
            {/* 말풍선 */}
            <div style={{
              position:'absolute', top: 30, left: 20,
              background: '#fff', padding: '12px 16px', borderRadius: 18,
              border: `2px solid ${C_palette.ink}`,
              fontSize: 13, fontWeight: 600, maxWidth: 200,
              boxShadow: '0 4px 0 rgba(31,27,22,0.12)',
            }}>
              "오늘은 싹수랑 함께 풀어볼까?" 💡
              <div style={{
                position:'absolute', bottom:-10, right:30,
                width:0, height:0,
                borderLeft:'10px solid transparent',
                borderRight:'10px solid transparent',
                borderTop:`12px solid ${C_palette.ink}`,
              }} />
            </div>
          </div>
        </div>
      </CCard>

      {/* 차시 진행도 (간결한 칩 형태) */}
      <CCard style={{ padding: 16, marginBottom: 18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ fontSize:12, fontWeight:700, color: C_palette.inkSoft, minWidth: 80 }}>UNITS</div>
          <div style={{ flex:1, display:'flex', gap:8 }}>
            {window.LESSONS.map((l, i) => {
              const active = i === 2;
              const done = i < 2;
              return (
                <div key={l.id} style={{
                  flex:1, display:'flex', alignItems:'center', gap:10,
                  padding:'10px 14px', borderRadius:12,
                  background: active ? C_palette.ink : (done ? C_palette.line : C_palette.bg),
                  color: active ? '#fff' : C_palette.ink,
                  position:'relative',
                }}>
                  <div style={{
                    width:28, height:28, borderRadius:8,
                    background: active ? C_palette.brand : (done ? '#fff' : C_palette.surface),
                    display:'grid', placeItems:'center', fontSize:14,
                    color: done ? C_palette.inkSoft : (active ? '#fff' : C_palette.ink),
                  }}>{done ? '✓' : l.id}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700 }}>{l.title}</div>
                    <div style={{ fontSize:11, opacity:0.7 }}>{l.subtitle}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CCard>

      {/* 게임 그리드 + 사이드 */}
      <div style={{ display:'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
        <div>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:10 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color: C_palette.inkSoft, letterSpacing:2 }}>PLAY</div>
              <div style={{ fontFamily: C_typo.display, fontSize: 24, marginTop:2 }}>오늘의 게임</div>
            </div>
            <div style={{ fontSize:12, color: C_palette.inkSoft }}>총 {window.GAMES.length}개 · 자유롭게 선택</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {window.GAMES.map((g) => {
              const mascot = window.CHARACTERS.find(c => c.id === g.mascot);
              return (
                <CCard key={g.id} style={{
                  padding: 0, overflow:'hidden', cursor:'pointer',
                  transition:'all 0.2s', position:'relative',
                }}>
                  <div style={{
                    height: 140, background: g.color + '50', position:'relative',
                    overflow:'hidden',
                  }}>
                    <div style={{ position:'absolute', top: 12, left: 14, fontSize: 30 }}>{g.icon}</div>
                    <div style={{ position:'absolute', right: -10, bottom: -20, width: 130, height: 170 }}>
                      <img src={mascot.img} style={{width:'100%'}} />
                    </div>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ fontFamily: C_typo.display, fontSize: 19, marginBottom: 2 }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: C_palette.inkSoft, lineHeight: 1.4, minHeight: 32 }}>{g.desc}</div>
                    <div style={{ display:'flex', gap: 6, marginTop: 8 }}>
                      <CChip bg={g.color + '40'} color={C_palette.ink}>{g.difficulty}</CChip>
                      <CChip bg={C_palette.bg} color={C_palette.inkSoft}>{g.players}</CChip>
                    </div>
                  </div>
                </CCard>
              );
            })}
            {/* + 슬롯 */}
            <CCard style={{
              border: `2px dashed ${C_palette.line}`, background: 'transparent',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              minHeight: 280, color: C_palette.inkSoft,
            }}>
              <div style={{ fontSize: 36 }}>+</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>새 게임 추가</div>
            </CCard>
          </div>
        </div>

        {/* 사이드 */}
        <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
          {/* 점수판 */}
          <CCard style={{ padding: 16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color: C_palette.inkSoft, letterSpacing:2 }}>SCORE</div>
                <div style={{ fontFamily: C_typo.display, fontSize:18 }}>우리반 스티커</div>
              </div>
              <div style={{ fontFamily: C_typo.display, fontSize: 24, color: C_palette.brand }}>+12</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap: 4 }}>
              {Array.from({length:18}).map((_, i) => (
                <div key={i} style={{
                  aspectRatio:'1', borderRadius:6,
                  background: i < 12 ? [C_palette.brand, C_palette.yellow, C_palette.mint, C_palette.blue][i%4] : C_palette.line,
                  opacity: i < 12 ? 1 : 0.5,
                }} />
              ))}
            </div>
          </CCard>

          {/* 도구 */}
          <CCard style={{ padding: 16 }}>
            <div style={{ fontSize:11, fontWeight:700, color: C_palette.inkSoft, letterSpacing:2 }}>TOOLS</div>
            <div style={{ fontFamily: C_typo.display, fontSize:18, marginBottom:10, marginTop:2 }}>선생님 도구</div>
            {[
              {icon:'🎲', label:'랜덤 문제', desc:'즉석 출제'},
              {icon:'👥', label:'팀 나누기', desc:'학생 분배'},
              {icon:'⏱', label:'타이머', desc:'5분 도전'},
              {icon:'📋', label:'진행 가이드', desc:'수업 노트'},
            ].map((t,i)=>(
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'10px 8px', borderRadius:10,
                background: i===0 ? C_palette.brandSoft : 'transparent',
                marginBottom: 4, cursor:'pointer',
              }}>
                <div style={{
                  width:36, height:36, borderRadius:10,
                  background: i===0 ? C_palette.brand : C_palette.bg,
                  display:'grid', placeItems:'center', fontSize:18,
                }}>{t.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{t.label}</div>
                  <div style={{ fontSize:11, color: C_palette.inkSoft }}>{t.desc}</div>
                </div>
                <div style={{ color: C_palette.inkSoft }}>›</div>
              </div>
            ))}
          </CCard>

          {/* 미니 친구들 */}
          <CCard style={{ padding: 14 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 8 }}>
              <div style={{ fontSize:11, fontWeight:700, color: C_palette.inkSoft, letterSpacing:2 }}>FRIENDS</div>
              <span style={{ fontSize: 11, color: C_palette.inkSoft }}>5명의 친구</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              {window.CHARACTERS.map(c => (
                <div key={c.id} style={{ textAlign:'center' }}>
                  <div style={{
                    width:42, height:42, borderRadius:'50%',
                    background: c.bg, border: `2px solid ${C_palette.ink}`,
                    overflow:'hidden', marginBottom:4,
                  }}>
                    <img src={c.img} style={{width:'160%', marginLeft:'-30%', marginTop:'-15%'}} />
                  </div>
                  <div style={{ fontSize:10, fontWeight:700 }}>{c.name}</div>
                </div>
              ))}
            </div>
          </CCard>
        </div>
      </div>
    </div>
  );
};

window.C_Dashboard = C_Dashboard;
window.C_palette = C_palette;
window.C_typo = C_typo;
window.CCard = CCard;
window.CChip = CChip;
