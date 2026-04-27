// 시안 B 게임 진입 + 선생님 도구
const { B_palette, B_typo, BParchment, BBadge } = window;

const B_GameDetail = () => {
  const game = window.GAMES[4]; // pacman
  const mascot = window.CHARACTERS.find(c => c.id === game.mascot);
  return (
    <div style={{
      width: 1280, minHeight: 820,
      background: B_palette.bgGrad,
      fontFamily: B_typo.body, color: '#fff',
      padding: 28, position: 'relative', overflow: 'hidden',
    }}>
      {[...Array(40)].map((_, i) => {
        const x = (i * 137) % 1280, y = (i * 73) % 820;
        return <div key={i} style={{position:'absolute', left:x, top:y, width:2, height:2, borderRadius:'50%', background:'#fff', opacity:0.3}} />;
      })}

      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, fontSize:14, color:'#C7B987' }}>
        <span>← 모험 지도로</span><span>·</span><span>3번째 섬 · 최대공약수</span><span>›</span>
        <b style={{color:B_palette.star}}>공배수 미로</b>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 22 }}>
        {/* 큰 게임 카드 */}
        <BParchment style={{ padding: 0, overflow: 'hidden', color: B_palette.ink }}>
          <div style={{
            height: 280,
            background: `linear-gradient(135deg, #1A2654, #4A2D7E)`,
            position: 'relative', borderBottom: `3px solid ${B_palette.ink}`,
            overflow: 'hidden',
          }}>
            {[...Array(20)].map((_,i)=>(
              <div key={i} style={{
                position:'absolute',
                left:`${(i*47)%100}%`, top:`${(i*23)%100}%`,
                fontSize: 12+(i%3)*4, color:B_palette.star, opacity: 0.6,
              }}>✦</div>
            ))}
            <div style={{ position:'absolute', right: 30, bottom: -10, width: 240, height: 300 }}>
              <img src={mascot.img} style={{ width:'100%' }} />
            </div>
            <div style={{ position:'absolute', top:24, left:28, color: '#fff' }}>
              <div style={{ fontSize: 50 }}>{game.icon}</div>
              <div style={{ fontFamily: B_typo.display, fontSize: 46, lineHeight:1, marginTop:6 }}>
                공배수 미로
              </div>
              <div style={{ fontSize: 15, marginTop:8, color: '#C7B987' }}>
                {mascot.name}이 탐정과 함께 미로의 공배수를 모아라!
              </div>
            </div>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              <BBadge color={game.color}>난이도 · {game.difficulty}</BBadge>
              <BBadge color={B_palette.cyan}>{game.players}</BBadge>
              <BBadge color={B_palette.green}>3번째 섬</BBadge>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
              <div>
                <div style={{ fontFamily: B_typo.display, fontSize:16, marginBottom:4 }}>🎯 모험 목표</div>
                <div style={{ fontSize:13, color: B_palette.inkSoft, lineHeight:1.6 }}>
                  미로에 떠 있는 숫자 중 <b style={{color:B_palette.red}}>4와 6의 공배수</b>만 먹어라!
                  유령(=공배수가 아닌 수)을 피하면서 모두 모으면 클리어!
                </div>
              </div>
              <div>
                <div style={{ fontFamily: B_typo.display, fontSize:16, marginBottom:4 }}>🕹️ 조작</div>
                <div style={{ fontSize:13, color: B_palette.inkSoft, lineHeight:1.6 }}>
                  방향키 ← → ↑ ↓ 로 이동.<br/>유령에 닿으면 한 번 부활할 기회가 있어요!
                </div>
              </div>
            </div>
            <button style={{
              marginTop:18, width:'100%', padding:18,
              background: B_palette.gold, border:`3px solid ${B_palette.ink}`,
              borderRadius:14, fontSize:22, fontWeight:700, fontFamily: B_typo.display,
              color: B_palette.ink, cursor:'pointer',
              boxShadow:`0 5px 0 ${B_palette.goldDeep}`,
            }}>⚔️ 모험 시작!</button>
          </div>
        </BParchment>

        {/* 우측 */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <BParchment style={{ padding:14, color: B_palette.ink }}>
            <div style={{ fontFamily: B_typo.display, fontSize:18 }}>📌 모험 미션</div>
            <div style={{ marginTop:10 }}>
              {['1단계 · 공배수 5개 모으기', '2단계 · 유령 피해서 미로 통과', '3단계 · 보스 공배수 처치'].map((m,i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'8px 0', borderBottom: i<2 ? `1px dashed ${B_palette.goldDeep}`:'none',
                }}>
                  <div style={{
                    width:24, height:24, borderRadius:'50%',
                    background: i===0 ? B_palette.red : B_palette.paperDark,
                    border:`2px solid ${B_palette.ink}`,
                    display:'grid', placeItems:'center', fontSize:11, fontWeight:700,
                    color: i===0 ? '#fff' : B_palette.ink,
                  }}>{i+1}</div>
                  <span style={{ fontSize:13 }}>{m}</span>
                </div>
              ))}
            </div>
          </BParchment>

          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border:`2px solid ${B_palette.gold}`, borderRadius:14, padding:14,
          }}>
            <div style={{ fontFamily: B_typo.display, fontSize:16, color:B_palette.star, marginBottom:10 }}>
              💬 모험가들의 응원
            </div>
            {window.CHARACTERS.slice(0, 3).map(c => (
              <div key={c.id} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                <div style={{
                  width:36, height:36, borderRadius:'50%',
                  background: c.bg, border:`2px solid ${B_palette.ink}`, overflow:'hidden', flexShrink:0,
                }}>
                  <img src={c.img} style={{width:'160%', marginLeft:'-30%', marginTop:'-15%'}} />
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.1)', padding:'6px 10px', borderRadius:10,
                  fontSize:12, color:'#fff',
                }}>
                  <b style={{color:c.accent}}>{c.name}</b> · {c.quote}
                </div>
              </div>
            ))}
          </div>

          <BParchment style={{ padding:12, color: B_palette.ink }}>
            <div style={{ fontFamily: B_typo.display, fontSize:14 }}>🏆 명예의 전당</div>
            <div style={{ fontSize:12, marginTop:6, lineHeight:1.6 }}>
              🥇 김민준 · 24보석 <span style={{float:'right', color: B_palette.inkSoft}}>3분 23초</span><br/>
              🥈 이서연 · 21보석 <span style={{float:'right', color: B_palette.inkSoft}}>4분 02초</span>
            </div>
          </BParchment>
        </div>
      </div>
    </div>
  );
};

const B_TeacherTools = () => {
  const teamColors = [B_palette.red, B_palette.green, B_palette.cyan, B_palette.purple];
  const students = ['민준','서연','도윤','하윤','시우','지유','주원','예준','서윤','지호','수아','준호'];
  return (
    <div style={{
      width: 1280, minHeight: 820, background: B_palette.bgGrad,
      fontFamily: B_typo.body, color:'#fff', padding:28, position:'relative', overflow:'hidden',
    }}>
      {[...Array(40)].map((_, i) => {
        const x = (i * 137) % 1280, y = (i * 73) % 820;
        return <div key={i} style={{position:'absolute', left:x, top:y, width:2, height:2, borderRadius:'50%', background:'#fff', opacity:0.25}} />;
      })}

      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:22 }}>
        <div style={{
          width:54, height:54, borderRadius:14,
          background: B_palette.gold, border:`3px solid ${B_palette.ink}`,
          display:'grid', placeItems:'center', fontSize:26,
          boxShadow:`0 4px 0 ${B_palette.goldDeep}`,
        }}>🧙</div>
        <div style={{ fontFamily: B_typo.display, fontSize:30, color: B_palette.star }}>
          모험 마스터의 작업실
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <BBadge color={B_palette.green}>모험가 24명</BBadge>
          <BBadge color={B_palette.cyan}>3섬 진행 중</BBadge>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:20 }}>
        {/* 동맹 (팀) */}
        <BParchment style={{ padding:18, color: B_palette.ink }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontFamily: B_typo.display, fontSize:22 }}>🛡️ 동맹 결성</div>
            <span style={{ fontSize:11, color: B_palette.inkSoft }}>4팀 · 무작위</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10 }}>
            {window.CHARACTERS.slice(0,4).map((c, ti) => (
              <div key={c.id} style={{
                background: teamColors[ti]+'30',
                border: `2px solid ${B_palette.ink}`, borderRadius: 12, padding: 10,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <div style={{
                    width:34, height:34, borderRadius:'50%',
                    background: c.bg, border:`2px solid ${B_palette.ink}`, overflow:'hidden',
                  }}>
                    <img src={c.img} style={{width:'160%', marginLeft:'-30%', marginTop:'-15%'}} />
                  </div>
                  <div style={{ fontFamily: B_typo.display, fontSize:17 }}>{c.name} 동맹</div>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {students.slice(ti*3, ti*3+3).map(s => (
                    <span key={s} style={{
                      background: B_palette.paper, border:`1.5px solid ${B_palette.ink}`,
                      borderRadius:8, padding:'2px 8px', fontSize:11, fontWeight:700,
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button style={{
            marginTop:12, width:'100%', padding:'10px',
            background: B_palette.gold, border:`2px solid ${B_palette.ink}`,
            borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer',
            boxShadow:`0 3px 0 ${B_palette.goldDeep}`,
          }}>🔀 동맹 다시 결성</button>
        </BParchment>

        {/* 운명의 주사위 */}
        <BParchment style={{ padding:18, color: B_palette.ink }}>
          <div style={{ fontFamily: B_typo.display, fontSize:22, marginBottom:12 }}>🎲 운명의 주사위</div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
            {['약수','배수','공약수','공배수','최대공약수','최소공배수'].map((t,i)=>(
              <span key={t} style={{
                padding:'5px 10px', borderRadius:999,
                background: i===2 ? B_palette.red : B_palette.paperDark,
                color: i===2 ? '#fff' : B_palette.ink,
                border:`2px solid ${B_palette.ink}`, fontSize:11, fontWeight:700,
              }}>{t}</span>
            ))}
          </div>
          <div style={{
            background: B_palette.bg, padding: 18, borderRadius:12,
            border: `3px dashed ${B_palette.gold}`, textAlign:'center', color:'#fff',
          }}>
            <div style={{ fontSize:11, color: B_palette.star, fontWeight:700, letterSpacing:2 }}>운명의 문제 #07</div>
            <div style={{ fontFamily: B_typo.display, fontSize:26, marginTop:6, lineHeight:1.4 }}>
              12와 18의<br/><span style={{color: B_palette.star}}>최대공약수</span>는?
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:14 }}>
              {['2','3','6','9'].map(a => (
                <div key={a} style={{
                  width:46, height:46, borderRadius:10,
                  background: B_palette.paper, border:`2px solid ${B_palette.gold}`,
                  display:'grid', placeItems:'center',
                  fontFamily: B_typo.display, fontSize:22, color: B_palette.ink,
                }}>{a}</div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button style={{ flex:1, padding:10, background: B_palette.paperDark, border:`2px solid ${B_palette.ink}`, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer'}}>🔄 새 문제</button>
            <button style={{ flex:1, padding:10, background: B_palette.green, color:'#fff', border:`2px solid ${B_palette.ink}`, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer'}}>👀 정답 공개</button>
          </div>
        </BParchment>

        {/* 진행 가이드 */}
        <BParchment style={{ padding:18, gridColumn: '1 / -1', color: B_palette.ink }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontFamily: B_typo.display, fontSize:22 }}>📜 모험 일정표</div>
            <span style={{ fontSize:11, color: B_palette.inkSoft }}>40분 모험</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10 }}>
            {[
              {time:'0~5분', title:'출발', desc:'바두기와 인사하고 어제의 모험 복습', color: B_palette.red},
              {time:'5~15분', title:'전수', desc:'공약수와 최대공약수 비밀 전수', color: B_palette.gold},
              {time:'15~30분', title:'모험', desc:'5가지 게임 자유 선택!', color: B_palette.green, active:true},
              {time:'30~40분', title:'귀환', desc:'운명 문제 풀이 + 보석 획득', color: B_palette.cyan},
            ].map((s,i)=>(
              <div key={i} style={{
                padding:10, borderRadius:10,
                background: s.active ? s.color+'40' : B_palette.paperDark,
                border:`2px solid ${B_palette.ink}`, position:'relative',
              }}>
                {s.active && (
                  <div style={{
                    position:'absolute', top:-8, right:8,
                    background: B_palette.red, color:'#fff',
                    padding:'2px 8px', borderRadius:999, fontSize:10, fontWeight:700,
                    border:`2px solid ${B_palette.ink}`,
                  }}>지금 ⚔️</div>
                )}
                <div style={{ fontSize:10, color: B_palette.inkSoft, fontWeight:700 }}>{s.time}</div>
                <div style={{ fontFamily: B_typo.display, fontSize:18, marginTop:2 }}>{s.title}</div>
                <div style={{ fontSize:11, color: B_palette.inkSoft, marginTop:4, lineHeight:1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </BParchment>
      </div>
    </div>
  );
};

window.B_GameDetail = B_GameDetail;
window.B_TeacherTools = B_TeacherTools;
