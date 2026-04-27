// 시안 B: 숫자나라 모험 - 차시별 모험 지도, 캐릭터가 가이드 역할
const B_palette = {
  bg: '#0F1B3C',           // 깊은 밤하늘
  bgGrad: 'linear-gradient(180deg, #1A2654 0%, #2B3A7C 100%)',
  paper: '#FFF8E7',         // 양피지
  paperDark: '#F4E8C8',
  ink: '#2A1F0E',
  inkSoft: '#6B5A38',
  gold: '#F5C242',
  goldDeep: '#C7901C',
  red: '#D4574A',
  green: '#5DA670',
  cyan: '#7AC4D9',
  purple: '#8B6FC4',
  star: '#FFE066',
};

const B_typo = {
  display: '"Black Han Sans", "Jua", system-ui',
  body: '"Jua", "Gowun Dodum", system-ui',
};

const BParchment = ({ children, style, ...rest }) => (
  <div style={{
    background: B_palette.paper,
    borderRadius: 14,
    border: `3px solid ${B_palette.ink}`,
    boxShadow: `0 8px 0 ${B_palette.goldDeep}, 0 12px 30px rgba(0,0,0,0.4)`,
    position: 'relative',
    ...style,
  }} {...rest}>
    {/* 모서리 장식 */}
    {[
      {top:6,left:6}, {top:6,right:6}, {bottom:6,left:6}, {bottom:6,right:6}
    ].map((p, i) => (
      <div key={i} style={{
        position:'absolute', width:14, height:14,
        background: B_palette.gold,
        clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)',
        ...p,
      }} />
    ))}
    {children}
  </div>
);

const BBadge = ({ children, color = B_palette.gold, dark = false }) => (
  <span style={{
    display:'inline-flex', alignItems:'center', gap:4,
    padding: '4px 12px', borderRadius:999,
    background: color, color: dark ? '#fff' : B_palette.ink,
    fontFamily: B_typo.body, fontSize:12, fontWeight:700,
    border: `2px solid ${B_palette.ink}`,
  }}>{children}</span>
);

// ─────────────── B1: 메인 모험 지도 ───────────────
const B_Dashboard = () => {
  return (
    <div style={{
      width: 1280, minHeight: 820,
      background: B_palette.bgGrad,
      fontFamily: B_typo.body, color: B_palette.paper,
      padding: 28, position: 'relative', overflow: 'hidden',
    }}>
      {/* 별 배경 */}
      {[...Array(40)].map((_, i) => {
        const x = (i * 137) % 1280;
        const y = (i * 73) % 820;
        const s = (i % 4) + 1;
        return (
          <div key={i} style={{
            position:'absolute', left:x, top:y,
            width:s, height:s, borderRadius:'50%',
            background: '#fff', opacity: 0.3 + (i%3)*0.2,
          }} />
        );
      })}
      {/* 큰 별 */}
      {[{x:80,y:120,s:24},{x:1100,y:90,s:18},{x:200,y:680,s:20}].map((p,i)=>(
        <div key={i} style={{
          position:'absolute', left:p.x, top:p.y,
          fontSize:p.s, color:B_palette.star,
        }}>✦</div>
      ))}

      {/* 헤더 */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{
            width:60, height:60, borderRadius:14,
            background: B_palette.gold, border: `3px solid ${B_palette.ink}`,
            display:'grid', placeItems:'center', fontSize:32,
            boxShadow: `0 4px 0 ${B_palette.goldDeep}`,
          }}>🗺️</div>
          <div>
            <div style={{ fontFamily: B_typo.display, fontSize: 34, lineHeight:1, letterSpacing: 1 }}>
              숫자나라 모험
            </div>
            <div style={{ fontSize: 13, color: '#C7B987', marginTop:4 }}>
              5학년 수학 · 약수와 배수의 비밀을 풀어라!
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <BBadge color={B_palette.cyan}>📅 4월 26일</BBadge>
          <BBadge color={B_palette.gold}>⭐ 우리반 별 12개</BBadge>
        </div>
      </div>

      {/* 학습 목표 양피지 */}
      <BParchment style={{ padding: '18px 26px', marginBottom: 20, color: B_palette.ink }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div style={{ fontSize: 36 }}>📜</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color: B_palette.goldDeep, fontWeight:700, letterSpacing:2 }}>
              ★ 오늘의 모험 임무
            </div>
            <div style={{ fontFamily: B_typo.display, fontSize: 24, marginTop:4, lineHeight:1.3 }}>
              두 수의 <span style={{color: B_palette.red}}>공약수</span>를 모으고, <span style={{color: B_palette.red}}>최대공약수</span> 보물을 찾아라!
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {window.CHARACTERS.slice(0,5).map((c,i) => (
              <div key={c.id} style={{
                width:50, height:50, borderRadius:'50%',
                background: c.bg, border: `2px solid ${B_palette.ink}`,
                overflow:'hidden',
              }}>
                <img src={c.img} style={{width:'160%', marginLeft:'-30%', marginTop:'-15%'}} />
              </div>
            ))}
          </div>
        </div>
      </BParchment>

      {/* 차시 모험 지도 */}
      <div style={{
        background: 'rgba(15, 27, 60, 0.6)',
        border: `2px solid ${B_palette.gold}`,
        borderRadius: 16, padding: 18, marginBottom: 18,
        position: 'relative',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
          <div style={{ fontFamily: B_typo.display, fontSize: 20, color: B_palette.star }}>
            🌍 4개 차시 · 모험 지도
          </div>
          <div style={{ fontSize:12, color:'#C7B987' }}>지금 3번째 섬에 있어요</div>
        </div>
        {/* 길 + 노드 */}
        <div style={{ position:'relative', height: 130, padding: '0 30px' }}>
          {/* 점선 길 */}
          <svg style={{position:'absolute', inset:0, width:'100%', height:'100%'}}>
            <path d="M 60 65 Q 230 20, 380 65 T 700 65 T 1020 65 T 1180 65"
                  stroke={B_palette.gold} strokeWidth="3" strokeDasharray="6 8" fill="none" opacity="0.6"/>
          </svg>
          {/* 노드들 */}
          {window.LESSONS.map((l, i) => {
            const xs = [60, 360, 660, 960];
            const active = i === 2;
            const done = i < 2;
            const mascot = window.CHARACTERS.find(c => c.id === l.mascot);
            return (
              <div key={l.id} style={{
                position:'absolute', left: xs[i], top: active ? 25 : 35,
                width: active ? 200 : 180,
              }}>
                <div style={{
                  position:'relative',
                  background: active ? B_palette.paper : (done ? '#5A6B92' : 'rgba(255,255,255,0.1)'),
                  border: `3px solid ${active ? B_palette.gold : B_palette.ink}`,
                  borderRadius: 14, padding: 10,
                  color: active ? B_palette.ink : '#fff',
                  boxShadow: active ? `0 6px 0 ${B_palette.goldDeep}` : 'none',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{
                      width:36, height:36, borderRadius:'50%',
                      background: l.color, border: `2px solid ${B_palette.ink}`,
                      display:'grid', placeItems:'center', fontSize:18,
                    }}>{done ? '✓' : l.icon}</div>
                    <div>
                      <div style={{ fontSize:10, opacity:0.7 }}>{l.id}번째 섬</div>
                      <div style={{ fontFamily: B_typo.display, fontSize:18, lineHeight:1 }}>{l.title}</div>
                    </div>
                  </div>
                  {active && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, paddingTop:8, borderTop:`1px dashed ${B_palette.goldDeep}`}}>
                      <div style={{
                        width:24, height:24, borderRadius:'50%',
                        background: mascot.bg, border:`1.5px solid ${B_palette.ink}`, overflow:'hidden',
                      }}>
                        <img src={mascot.img} style={{width:'160%', marginLeft:'-30%', marginTop:'-15%'}} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:700 }}>{mascot.name}이 안내</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 게임 카드 그리드 (모험 카드 스타일) */}
      <div style={{ display:'grid', gridTemplateColumns: '1fr 280px', gap:18 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ fontFamily: B_typo.display, fontSize: 22, color: B_palette.star }}>
              ⚔️ 모험 도전 · 5가지 게임
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10 }}>
            {window.GAMES.map((g,i) => {
              const mascot = window.CHARACTERS.find(c => c.id === g.mascot);
              return (
                <div key={g.id} style={{
                  background: B_palette.paper,
                  border: `3px solid ${B_palette.ink}`,
                  borderRadius: 14, overflow: 'hidden',
                  color: B_palette.ink,
                  boxShadow: `0 6px 0 ${B_palette.goldDeep}`,
                  cursor:'pointer', position:'relative',
                }}>
                  <div style={{
                    height: 110, background: g.color + 'AA',
                    borderBottom: `2px solid ${B_palette.ink}`,
                    position:'relative', overflow:'hidden',
                  }}>
                    <div style={{position:'absolute', top:6, left:8, fontSize:24}}>{g.icon}</div>
                    <div style={{ position:'absolute', right:-15, bottom:-25, width:90, height:130 }}>
                      <img src={mascot.img} style={{width:'100%'}} />
                    </div>
                  </div>
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ fontFamily: B_typo.display, fontSize: 16 }}>{g.title}</div>
                    <div style={{ fontSize: 11, color: B_palette.inkSoft, marginTop:2, minHeight: 32, lineHeight: 1.3 }}>{g.desc}</div>
                    <div style={{ display:'flex', gap:4, marginTop:6 }}>
                      <span style={{
                        background: g.color, fontSize:10, padding:'2px 6px', borderRadius: 6,
                        border: `1.5px solid ${B_palette.ink}`, fontWeight:700,
                      }}>{g.difficulty}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 사이드 (보석 점수 + 도구) */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: `2px solid ${B_palette.gold}`,
            borderRadius:14, padding:14, color:'#fff',
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontFamily: B_typo.display, fontSize:18, color:B_palette.star }}>💎 보물 상자</div>
              <span style={{ fontSize:11, color:'#C7B987' }}>오늘 12개</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:5 }}>
              {Array.from({length:18}).map((_,i)=>(
                <div key={i} style={{
                  aspectRatio:'1', borderRadius:6,
                  background: i<12 ? [B_palette.red, B_palette.cyan, B_palette.green, B_palette.gold][i%4] : 'rgba(255,255,255,0.1)',
                  border: `1.5px solid ${i<12 ? B_palette.ink : 'rgba(255,255,255,0.2)'}`,
                  display:'grid', placeItems:'center', fontSize:11, color: B_palette.ink, fontWeight:700,
                }}>{i<12?'◆':''}</div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: `2px solid ${B_palette.cyan}`,
            borderRadius:14, padding:14, color:'#fff',
          }}>
            <div style={{ fontFamily: B_typo.display, fontSize: 18, color: B_palette.cyan, marginBottom:10 }}>
              🧰 모험가의 도구
            </div>
            {[
              {icon:'🎲', label:'운명의 주사위', desc:'랜덤 문제 출제'},
              {icon:'🛡️', label:'동맹 만들기', desc:'팀 나누기'},
              {icon:'⏳', label:'모래시계', desc:'시간 측정'},
              {icon:'📖', label:'마법서', desc:'개념 다시 보기'},
            ].map((t,i)=>(
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'8px 6px', borderRadius:8,
                background: i===0 ? 'rgba(122,196,217,0.2)':'transparent',
                marginBottom: 4, cursor:'pointer',
              }}>
                <div style={{ fontSize: 18 }}>{t.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{t.label}</div>
                  <div style={{ fontSize:10, color:'#C7B987' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.B_Dashboard = B_Dashboard;
window.B_palette = B_palette;
window.B_typo = B_typo;
window.BParchment = BParchment;
window.BBadge = BBadge;
