// 시안 C 게임 진입 + 선생님 도구
const { C_palette, C_typo, CCard, CChip } = window;

const C_GameDetail = () => {
  const game = window.GAMES[2]; // 연못 건너기
  const mascot = window.CHARACTERS.find(c => c.id === game.mascot);
  return (
    <div style={{
      width:1280, minHeight:820, background: C_palette.bg,
      fontFamily: C_typo.body, color: C_palette.ink, padding:32,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, fontSize:13, color: C_palette.inkSoft }}>
        <span>← 메인</span><span>·</span><span>2차시 · 배수</span><span>›</span>
        <b style={{color:C_palette.ink}}>연못 건너기</b>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 22 }}>
        <CCard style={{ padding:0, overflow:'hidden' }}>
          <div style={{
            height: 300, background: `linear-gradient(135deg, ${game.color}80, #C9E8DC)`,
            position:'relative',
          }}>
            {/* 연못 일러스트 */}
            <svg style={{position:'absolute', bottom:0, left:0, width:'100%', height:80}} viewBox="0 0 800 80" preserveAspectRatio="none">
              <path d="M0 40 Q200 20 400 40 T800 40 V80 H0 Z" fill="#7AB8A4" opacity="0.4"/>
              <path d="M0 50 Q200 35 400 50 T800 50 V80 H0 Z" fill="#7AB8A4" opacity="0.6"/>
            </svg>
            {[2,4,6,8].map((n,i)=>(
              <div key={n} style={{
                position:'absolute', bottom: 22 + (i%2)*15, left: 80 + i*120,
                width: 56, height: 36, borderRadius: '50%',
                background: '#8B6F4E', border:`3px solid ${C_palette.ink}`,
                display:'grid', placeItems:'center', fontFamily:C_typo.display, fontSize:18, color:'#fff',
              }}>{n}</div>
            ))}
            <div style={{ position:'absolute', right:30, bottom:60, width:200, height:240 }}>
              <img src={mascot.img} style={{ width:'100%' }} />
            </div>
            <div style={{ position:'absolute', top:24, left:28 }}>
              <div style={{ fontSize:42 }}>{game.icon}</div>
              <div style={{ fontFamily: C_typo.display, fontSize: 46, lineHeight:1, marginTop:6, letterSpacing:-1 }}>
                연못 건너기
              </div>
              <div style={{ fontSize:14, marginTop:6, color: C_palette.inkSoft }}>
                {mascot.name}이와 함께 배수의 돌만 밟고 건너자!
              </div>
            </div>
          </div>
          <div style={{ padding:'22px 26px' }}>
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              <CChip bg={game.color+'40'}>난이도 · {game.difficulty}</CChip>
              <CChip bg={C_palette.bg}>{game.players}</CChip>
              <CChip bg={C_palette.bg}>2차시 · 배수</CChip>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color: C_palette.inkSoft, letterSpacing:2 }}>HOW TO PLAY</div>
                <div style={{ fontSize:13, marginTop:4, lineHeight:1.6, color: C_palette.inkSoft }}>
                  연못 위에 떠 있는 돌 중 <b style={{color: C_palette.ink}}>3의 배수</b>만 골라 밟으세요.
                  잘못 밟으면 풍덩!
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color: C_palette.inkSoft, letterSpacing:2 }}>CONTROLS</div>
                <div style={{ fontSize:13, marginTop:4, lineHeight:1.6, color: C_palette.inkSoft }}>
                  돌을 클릭하거나 ← →로 선택, <b style={{color:C_palette.ink}}>스페이스바</b>로 점프!
                </div>
              </div>
            </div>
            <button style={{
              marginTop:20, width:'100%', padding:'16px',
              background: C_palette.ink, color:'#fff', border:'none',
              borderRadius:14, fontSize:18, fontWeight:700, cursor:'pointer',
              fontFamily: C_typo.display, letterSpacing:0.5,
            }}>▶ 게임 시작</button>
          </div>
        </CCard>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <CCard style={{ padding:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color: C_palette.inkSoft, letterSpacing:2 }}>MISSION</div>
            <div style={{ fontFamily: C_typo.display, fontSize:18, marginBottom: 10, marginTop:2 }}>오늘의 미션</div>
            {['1단계 · 2의 배수 5개 밟기', '2단계 · 3의 배수 7개 밟기', '3단계 · 6의 공배수 도전'].map((m,i)=>(
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'10px 0', borderBottom: i<2 ? `1px solid ${C_palette.line}`:'none',
              }}>
                <div style={{
                  width:24, height:24, borderRadius: 6,
                  background: i===0 ? C_palette.brand : C_palette.bg,
                  color: i===0 ? '#fff' : C_palette.inkSoft,
                  display:'grid', placeItems:'center', fontSize:11, fontWeight:700,
                }}>{i+1}</div>
                <span style={{ fontSize:13 }}>{m}</span>
              </div>
            ))}
          </CCard>

          <CCard style={{ padding:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color: C_palette.inkSoft, letterSpacing:2 }}>FRIENDS SAY</div>
            <div style={{ fontFamily: C_typo.display, fontSize:18, marginTop:2, marginBottom:10 }}>친구들의 응원</div>
            {window.CHARACTERS.slice(0,3).map(c=>(
              <div key={c.id} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
                <div style={{
                  width:40, height:40, borderRadius:'50%',
                  background: c.bg, border:`2px solid ${C_palette.ink}`, overflow:'hidden', flexShrink:0,
                }}>
                  <img src={c.img} style={{width:'160%', marginLeft:'-30%', marginTop:'-15%'}} />
                </div>
                <div style={{ background: c.bg+'80', padding:'8px 12px', borderRadius:12, fontSize:12 }}>
                  <b style={{ color: c.color }}>{c.name}</b> · {c.quote}
                </div>
              </div>
            ))}
          </CCard>

          <CCard style={{ padding:14, background: C_palette.brandSoft, border:'none' }}>
            <div style={{ fontSize:11, fontWeight:700, color: C_palette.brand, letterSpacing:2 }}>TOP RECORDS</div>
            <div style={{ marginTop:6, fontSize:13, lineHeight:1.7 }}>
              🥇 김민준 · 24점 <span style={{float:'right', color: C_palette.inkSoft, fontSize:12}}>3분 23초</span><br/>
              🥈 이서연 · 21점 <span style={{float:'right', color: C_palette.inkSoft, fontSize:12}}>4분 02초</span>
            </div>
          </CCard>
        </div>
      </div>
    </div>
  );
};

const C_TeacherTools = () => {
  const teamColors = [C_palette.brand, C_palette.yellow, C_palette.mint, C_palette.blue];
  const students = ['민준','서연','도윤','하윤','시우','지유','주원','예준','서윤','지호','수아','준호'];
  return (
    <div style={{
      width:1280, minHeight:820, background: C_palette.bg,
      fontFamily: C_typo.body, color: C_palette.ink, padding:32,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:22 }}>
        <div style={{ width:46, height:46, borderRadius:12, background: C_palette.ink, display:'grid', placeItems:'center', color:'#fff', fontSize:22 }}>🧰</div>
        <div>
          <div style={{ fontFamily: C_typo.display, fontSize: 26, lineHeight:1 }}>선생님 도구함</div>
          <div style={{ fontSize:12, color: C_palette.inkSoft, marginTop:3 }}>수업을 더 풍성하게 만드는 도구들</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <CChip bg={C_palette.surface} color={C_palette.ink}>학생 24명</CChip>
          <CChip bg={C_palette.brand} color="#fff" dark>● 3교시 진행 중</CChip>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:18 }}>
        <CCard style={{ padding:20 }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:14 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color: C_palette.inkSoft, letterSpacing:2 }}>TEAMS</div>
              <div style={{ fontFamily: C_typo.display, fontSize:22, marginTop:2 }}>팀 나누기</div>
            </div>
            <span style={{ fontSize:12, color: C_palette.inkSoft }}>4팀 · 무작위</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10 }}>
            {window.CHARACTERS.slice(0,4).map((c, ti) => (
              <div key={c.id} style={{
                background: teamColors[ti]+'18',
                borderRadius: 14, padding:12,
                border:`1px solid ${teamColors[ti]}40`,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <div style={{
                    width:34, height:34, borderRadius:'50%',
                    background: c.bg, border:`2px solid ${C_palette.ink}`, overflow:'hidden',
                  }}>
                    <img src={c.img} style={{width:'160%', marginLeft:'-30%', marginTop:'-15%'}} />
                  </div>
                  <div style={{ fontFamily: C_typo.display, fontSize:17 }}>{c.name}팀</div>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {students.slice(ti*3, ti*3+3).map(s => (
                    <span key={s} style={{
                      background:'#fff', borderRadius:8, padding:'2px 8px', fontSize:11, fontWeight:600,
                      border:`1px solid ${C_palette.line}`,
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button style={{
            marginTop:14, width:'100%', padding:'12px',
            background:'#fff', border:`1px solid ${C_palette.line}`,
            borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer',
          }}>🔀 다시 나누기</button>
        </CCard>

        <CCard style={{ padding:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color: C_palette.inkSoft, letterSpacing:2 }}>RANDOM QUIZ</div>
          <div style={{ fontFamily: C_typo.display, fontSize:22, marginTop:2, marginBottom:12 }}>랜덤 문제 출제기</div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
            {['약수','배수','공약수','공배수','최대공약수','최소공배수'].map((t,i)=>(
              <span key={t} style={{
                padding:'5px 10px', borderRadius:8,
                background: i===2 ? C_palette.ink : C_palette.bg,
                color: i===2 ? '#fff' : C_palette.ink,
                fontSize:11, fontWeight:600, cursor:'pointer',
              }}>{t}</span>
            ))}
          </div>
          <div style={{
            background: C_palette.bg, padding:18, borderRadius:14,
            textAlign:'center',
          }}>
            <div style={{ fontSize:11, color: C_palette.inkSoft, fontWeight:700, letterSpacing:2 }}>QUESTION #07</div>
            <div style={{ fontFamily: C_typo.display, fontSize:26, marginTop:6, lineHeight:1.4, letterSpacing:-0.5 }}>
              12와 18의<br/><span style={{color: C_palette.brand}}>최대공약수</span>는?
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:14 }}>
              {['2','3','6','9'].map(a => (
                <div key={a} style={{
                  width:48, height:48, borderRadius:12,
                  background:'#fff', border:`1px solid ${C_palette.line}`,
                  display:'grid', placeItems:'center', fontFamily:C_typo.display, fontSize:22,
                }}>{a}</div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button style={{ flex:1, padding:10, background:'#fff', border:`1px solid ${C_palette.line}`, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer' }}>🔄 새 문제</button>
            <button style={{ flex:1, padding:10, background:C_palette.ink, color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer' }}>👀 정답 공개</button>
          </div>
        </CCard>

        <CCard style={{ padding:20, gridColumn:'1 / -1' }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:14 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color: C_palette.inkSoft, letterSpacing:2 }}>LESSON FLOW</div>
              <div style={{ fontFamily: C_typo.display, fontSize:22, marginTop:2 }}>오늘의 진행 가이드</div>
            </div>
            <span style={{ fontSize:12, color: C_palette.inkSoft }}>40분 수업</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10 }}>
            {[
              {time:'0~5분', title:'도입', desc:'어제 배운 약수 복습', color: C_palette.pink},
              {time:'5~15분', title:'개념', desc:'공약수와 최대공약수', color: C_palette.yellow},
              {time:'15~30분', title:'게임 활동', desc:'5가지 게임 자유 선택', color: C_palette.mint, active:true},
              {time:'30~40분', title:'마무리', desc:'랜덤 문제 + 보상', color: C_palette.blue},
            ].map((s,i)=>(
              <div key={i} style={{
                padding:14, borderRadius:14,
                background: s.active ? s.color+'25' : C_palette.bg,
                border: s.active ? `2px solid ${s.color}` : `1px solid ${C_palette.line}`,
                position:'relative',
              }}>
                {s.active && (
                  <div style={{
                    position:'absolute', top:-10, right:10,
                    background: C_palette.ink, color:'#fff',
                    padding:'3px 10px', borderRadius:999, fontSize:10, fontWeight:700,
                  }}>NOW</div>
                )}
                <div style={{ fontSize:11, fontWeight:700, color: C_palette.inkSoft, letterSpacing:1 }}>{s.time}</div>
                <div style={{ fontFamily: C_typo.display, fontSize:18, marginTop:4 }}>{s.title}</div>
                <div style={{ fontSize:12, color: C_palette.inkSoft, marginTop:4, lineHeight:1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </CCard>
      </div>
    </div>
  );
};

window.C_GameDetail = C_GameDetail;
window.C_TeacherTools = C_TeacherTools;
