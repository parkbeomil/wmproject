/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Gamepad2, 
  Settings, 
  User as UserIcon, 
  HelpCircle, 
  Sparkles, 
  ChevronRight,
  ArrowLeft,
  X,
  Zap,
  Grid,
  Trophy,
  Layout
} from 'lucide-react';

// --- Types ---
type Topic = 'divisors' | 'multiples' | 'gcd' | 'lcm' | 'games';

interface ModuleProps {
  onBack: () => void;
}

// --- Components ---

const Header = ({ currentTopic, onBack }: { currentTopic: Topic | null, onBack: () => void }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-blue-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentTopic && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-blue-50 rounded-xl transition-colors text-blue-600"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-2xl font-display text-blue-600 tracking-tight flex items-center gap-2">
            <Sparkles className="text-yellow-400" />
            수학 탐험대
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
          <a href="#" className="hover:text-blue-600 transition-colors">홈</a>
          <a href="#" className="hover:text-blue-600 transition-colors">내 기록</a>
          <a href="#" className="hover:text-blue-600 transition-colors">도움말</a>
        </nav>
        <div className="flex items-center gap-4">
          <div className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
            <Trophy size={16} />
            <span>1,240 XP</span>
          </div>
          <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
            <UserIcon size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

// --- Topic Modules ---

const DivisorsModule = ({ onBack }: ModuleProps) => {
  const [number, setNumber] = useState(12);
  const divisors = Array.from({ length: number }, (_, i) => i + 1).filter(n => number % n === 0);

  return (
    <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center">
          <span className="text-blue-600 font-bold tracking-widest text-sm uppercase">Topic 01</span>
          <h2 className="text-4xl font-display mt-2">약수 (Divisors)</h2>
          <p className="text-slate-500 mt-4">어떤 수를 나누어 떨어지게 하는 수를 약수라고 해요!</p>
        </div>

        <div className="math-card bg-blue-600 text-white flex flex-col items-center gap-6">
          <p className="text-lg">숫자를 조절해서 약수를 찾아보자!</p>
          <div className="flex items-center gap-8">
            <button onClick={() => setNumber(Math.max(1, number - 1))} className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all font-bold text-2xl">-</button>
            <span className="text-7xl font-display">{number}</span>
            <button onClick={() => setNumber(Math.min(100, number + 1))} className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all font-bold text-2xl">+</button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {divisors.map(d => (
            <motion.div 
              key={d} 
              layoutId={`div-${d}`}
              className="bg-white border-4 border-blue-200 rounded-2xl p-6 flex flex-col items-center gap-2 shadow-sm"
              whileHover={{ scale: 1.05, borderColor: '#fbbf24' }}
            >
              <span className="text-3xl font-display text-blue-600">{d}</span>
              <span className="text-xs text-slate-400 font-bold uppercase">약수</span>
            </motion.div>
          ))}
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-8">
          <h3 className="font-display text-xl text-yellow-700 flex items-center gap-2">
            <HelpCircle size={20} />
            알고 있나요?
          </h3>
          <p className="mt-4 text-slate-600 leading-relaxed font-medium">
            모든 숫자는 1과 자기 자신을 약수로 가져요. 
            그 이상의 약수가 없다면 그 숫자는 '소수'라고 부른답니다!
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const MultiplesModule = ({ onBack }: ModuleProps) => {
  const [base, setBase] = useState(3);
  const multiples = Array.from({ length: 12 }, (_, i) => base * (i + 1));

  return (
    <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center">
          <span className="text-green-600 font-bold tracking-widest text-sm uppercase">Topic 02</span>
          <h2 className="text-4xl font-display mt-2">배수 (Multiples)</h2>
          <p className="text-slate-500 mt-4">어떤 수의 1배, 2배, 3배... 가 되는 수를 배수라고 해요!</p>
        </div>

        <div className="math-card bg-green-500 text-white flex flex-col items-center gap-6 shadow-green-200">
          <p className="text-lg">어떤 수의 배수를 찾아볼까요?</p>
          <div className="flex items-center gap-8">
            <button onClick={() => setBase(Math.max(1, base - 1))} className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all font-bold text-2xl">-</button>
            <span className="text-7xl font-display">{base}</span>
            <button onClick={() => setBase(Math.min(20, base + 1))} className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all font-bold text-2xl">+</button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {multiples.map((m, idx) => (
            <motion.div 
              key={idx} 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border-4 border-green-200 rounded-2xl p-6 flex flex-col items-center gap-2 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                x{idx + 1}
              </div>
              <span className="text-3xl font-display text-green-600">{m}</span>
              <span className="text-xs text-slate-400 font-bold uppercase">{idx + 1}배</span>
            </motion.div>
          ))}
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-8">
          <h3 className="font-display text-xl text-blue-700 flex items-center gap-2">
            <Sparkles size={20} />
            탐험 팁!
          </h3>
          <p className="mt-4 text-slate-600 leading-relaxed font-medium">
            배수는 끝이 없어요! 100배, 1000배, 아니 그 이상도 가능하답니다. 
            구구단도 사실 그 숫자의 배수들을 모아놓은 표라는 사실, 알고 있었나요?
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const GCDLCMModule = ({ onBack }: ModuleProps) => {
  const [num1, setNum1] = useState(12);
  const [num2, setNum2] = useState(18);

  const getDivisors = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter(v => n % v === 0);
  const divs1 = getDivisors(num1);
  const divs2 = getDivisors(num2);
  const commonDivs = divs1.filter(v => divs2.includes(v));
  const gcd = commonDivs.length > 0 ? Math.max(...commonDivs) : 1;
  const lcm = (num1 * num2) / gcd;

  return (
    <div className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-display">최대공약수와 최소공배수</h2>
          <p className="text-slate-500 mt-2">두 수 사이의 특별한 관계를 찾아보세요!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="math-card border-orange-200 p-8">
            <h4 className="text-xl font-display text-orange-600 mb-6 uppercase">첫 번째 숫자</h4>
            <div className="flex items-center justify-center gap-6">
               <button onClick={() => setNum1(Math.max(1, num1 - 1))} className="w-10 h-10 border-2 border-orange-200 rounded-xl hover:bg-orange-50 transition-colors">-</button>
               <span className="text-6xl font-display">{num1}</span>
               <button onClick={() => setNum1(Math.min(100, num1 + 1))} className="w-10 h-10 border-2 border-orange-200 rounded-xl hover:bg-orange-50 transition-colors">+</button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 justify-center">
               {divs1.map(d => <span key={d} className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-bold text-sm ${commonDivs.includes(d) ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>{d}</span>)}
            </div>
          </div>

          <div className="math-card border-indigo-200 p-8">
            <h4 className="text-xl font-display text-indigo-600 mb-6 uppercase">두 번째 숫자</h4>
            <div className="flex items-center justify-center gap-6">
               <button onClick={() => setNum2(Math.max(1, num2 - 1))} className="w-10 h-10 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">-</button>
               <span className="text-6xl font-display">{num2}</span>
               <button onClick={() => setNum2(Math.min(100, num2 + 1))} className="w-10 h-10 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">+</button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 justify-center">
               {divs2.map(d => <span key={d} className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-bold text-sm ${commonDivs.includes(d) ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>{d}</span>)}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="math-card bg-orange-500 text-white text-center p-8 shadow-orange-200 border-orange-400"
          >
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Greatest Common Divisor</p>
            <h3 className="text-xl font-display mb-4">최대공약수 (GCD)</h3>
            <div className="text-7xl font-display">{gcd}</div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="math-card bg-indigo-600 text-white text-center p-8 shadow-indigo-200 border-indigo-500"
          >
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Least Common Multiple</p>
            <h3 className="text-xl font-display mb-4">최소공배수 (LCM)</h3>
            <div className="text-7xl font-display">{lcm}</div>
          </motion.div>
        </div>

        <div className="bg-white border-4 border-dashed border-slate-200 rounded-[32px] p-8 text-center">
           <p className="text-slate-500 font-medium">두 수를 곱한 값은 최대공약수와 최소공배수를 곱한 값과 항상 같아요!</p>
           <p className="text-2xl font-display mt-2 text-slate-700">
             {num1} × {num2} = {gcd} × {lcm} = {num1 * num2}
           </p>
        </div>
      </motion.div>
    </div>
  );
};

// ... Similar modules would go here for Multiples, GCD, LCM

const GameZone = ({ onBack }: ModuleProps) => {
  return (
    <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-display">게임 스테이션</h2>
          <p className="text-slate-500 mt-2">오늘 배운 내용을 게임으로 즐겨보세요!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card Game Placeholder */}
          <div className="math-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 bg-yellow-400 text-slate-900 rounded-bl-3xl font-bold z-10">BEST</div>
            <div className="aspect-video bg-slate-100 rounded-2xl mb-6 relative overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center">
                  <Grid className="w-16 h-16 text-blue-200" />
               </div>
               <img 
                src="https://picsum.photos/seed/cards/800/600" 
                alt="Card Game" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                referrerPolicy="no-referrer"
               />
            </div>
            <h3 className="text-2xl font-display">숫자 카드 맞추기</h3>
            <p className="text-slate-500 mt-2 font-medium">약수와 배수를 빠르게 찾아 카드를 뒤집으세요!</p>
            <button className="btn-primary mt-6 w-full flex items-center justify-center gap-2">
              <Gamepad2 size={20} />
              게임 시작하기
            </button>
          </div>

          {/* Arcade Game Placeholder */}
          <div className="math-card relative overflow-hidden group">
            <div className="aspect-video bg-slate-100 rounded-2xl mb-6 relative overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-16 h-16 text-purple-200" />
               </div>
               <img 
                src="https://picsum.photos/seed/arcade/800/600" 
                alt="Arcade Game" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                referrerPolicy="no-referrer"
               />
            </div>
            <h3 className="text-2xl font-display">매쓰-갤러그</h3>
            <p className="text-slate-500 mt-2 font-medium">배수를 쏘아 맞추고 최고의 점수를 기록해보세요!</p>
            <button className="btn-primary mt-6 w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white">
              <Gamepad2 size={20} />
              게임 시작하기
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Dashboard ---

export default function App() {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);

  const topics = [
    { id: 'divisors', title: '약수 탐험', desc: '나누어 떨어지는 수 찾기', color: 'bg-blue-500', icon: BookOpen },
    { id: 'multiples', title: '배수 탐험', desc: '배꼽까지 늘어나는 배수', color: 'bg-green-500', icon: Sparkles },
    { id: 'gcd', title: '최대공약수', desc: '가장 큰 공통된 약수', color: 'bg-orange-500', icon: Zap },
    { id: 'lcm', title: '최소공배수', desc: '가장 작은 공통된 배수', color: 'bg-purple-500', icon: Grid },
  ];

  return (
    <div className="min-h-screen bg-pattern font-sans pb-20">
      <Header currentTopic={currentTopic} onBack={() => setCurrentTopic(null)} />
      
      <AnimatePresence mode="wait">
        {!currentTopic ? (
          <motion.main 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="pt-24 px-6 max-w-7xl mx-auto"
          >
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12 mb-12 shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase inline-block mb-6 border border-white/30">
                    Welcome Explorers!
                  </span>
                  <h2 className="text-5xl md:text-6xl font-display leading-[1.1]">
                    반가워요, <br />
                    수학 탐험대 친구들!
                  </h2>
                  <p className="text-blue-100 text-xl mt-6 leading-relaxed">
                    재미있는 게임과 함께 약수와 배수의 <br className="hidden sm:block" />
                    신비로운 세계를 모험해볼까요?
                  </p>
                  <div className="mt-10 flex flex-wrap gap-4">
                    <button 
                      onClick={() => setCurrentTopic('divisors')}
                      className="btn-primary"
                    >
                      모험 시작하기
                    </button>
                    <button 
                      onClick={() => setCurrentTopic('games')}
                      className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/40 rounded-2xl font-bold backdrop-blur-md transition-all active:scale-95"
                    >
                      게임하러 가기
                    </button>
                  </div>
                </motion.div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-yellow-400/20 rounded-full blur-[100px]" />
              <div className="absolute top-1/2 -right-10 w-64 h-64 bg-purple-400/20 rounded-full blur-[80px]" />
              <Zap className="absolute top-12 right-12 w-24 h-24 text-white/10 rotate-12" />
              <Grid className="absolute bottom-12 right-1/4 w-32 h-32 text-white/5 -rotate-6" />
            </section>

            {/* Topic Grid */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-display flex items-center gap-3">
                  <Layout className="text-blue-600" />
                  학습 테마
                </h3>
                <span className="text-slate-400 font-bold hover:text-blue-600 cursor-pointer flex items-center gap-1 transition-colors">
                  모든 주제 보기 <ChevronRight size={16} />
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topics.map((topic, idx) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    onClick={() => setCurrentTopic(topic.id as Topic)}
                    className="math-card cursor-pointer group flex flex-col h-full"
                  >
                    <div className={`${topic.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:rotate-12 transition-transform`}>
                      <topic.icon size={32} />
                    </div>
                    <h4 className="text-2xl font-display mb-2">{topic.title}</h4>
                    <p className="text-slate-500 font-medium flex-grow">{topic.desc}</p>
                    <div className="mt-6 flex items-center text-blue-600 font-bold gap-1 group-hover:gap-2 transition-all">
                      배우러 가기 <ChevronRight size={18} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Quick Play Banner */}
            <section className="mt-12 mb-12">
              <div 
                onClick={() => setCurrentTopic('games')}
                className="bg-yellow-400 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 cursor-pointer hover:bg-yellow-500 transition-colors shadow-xl border-4 border-yellow-300"
              >
                <div className="flex items-center gap-6">
                  <div className="bg-white p-4 rounded-3xl shadow-lg">
                    <Gamepad2 size={40} className="text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">도전! 수학 랭킹 게임</h3>
                    <p className="text-yellow-900/70 font-medium">다른 친구들과 점수 내기를 해보세요.</p>
                  </div>
                </div>
                <button className="bg-white text-slate-900 px-8 py-3 rounded-2xl font-bold shadow-md">
                  지금 바로 도전하기
                </button>
              </div>
            </section>
          </motion.main>
        ) : (
          <motion.div
            key="module"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {currentTopic === 'divisors' && <DivisorsModule onBack={() => setCurrentTopic(null)} />}
            {currentTopic === 'multiples' && <MultiplesModule onBack={() => setCurrentTopic(null)} />}
            {(currentTopic === 'gcd' || currentTopic === 'lcm') && <GCDLCMModule onBack={() => setCurrentTopic(null)} />}
            {currentTopic === 'games' && <GameZone onBack={() => setCurrentTopic(null)} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Menu (Mobile) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/90 backdrop-blur-lg px-6 py-4 rounded-3xl border border-blue-100 shadow-2xl">
        <button onClick={() => setCurrentTopic(null)} className="p-2 text-slate-400 hover:text-blue-600"><BookOpen size={24} /></button>
        <button onClick={() => setCurrentTopic('games')} className="p-3 bg-blue-600 text-white rounded-full shadow-lg"><Gamepad2 size={24} /></button>
        <button className="p-2 text-slate-400 hover:text-blue-600"><UserIcon size={24} /></button>
      </div>
    </div>
  );
}
