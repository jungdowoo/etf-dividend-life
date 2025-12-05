import React, { useState, useEffect } from 'react';
// react-router-dom이 설치되어 있어야 합니다. (npm install react-router-dom)
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, Coffee, Tv, Plane, Car, TrendingUp, Calculator, PieChart, RefreshCw, AlertTriangle, ExternalLink, BookOpen, X, ShieldCheck, Search, Landmark, BarChart3, ArrowRight } from 'lucide-react';

// 생활 목표 데이터 (고정)
const LIFE_GOALS = [
  { id: 1, title: 'OTT 무료로 보기', cost: 17000, icon: <Tv size={24} />, desc: '넷플릭스 프리미엄' },
  { id: 2, title: '매일 커피 한 잔', cost: 150000, icon: <Coffee size={24} />, desc: '스타벅스 월 30잔' },
  { id: 3, title: '통신비 방어', cost: 80000, icon: <DollarSign size={24} />, desc: '무제한 요금제' },
  { id: 4, title: '자차 주유비', cost: 300000, icon: <Car size={24} />, desc: '월 평균 주유비' },
  { id: 5, title: '분기별 호캉스', cost: 500000, icon: <Plane size={24} />, desc: '3개월마다 5성급 (월 환산)' },
];

// 페이지 이동 시 스크롤을 최상단으로 올려주는 컴포넌트
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// [SEO] 메타 태그를 동적으로 관리하는 헬퍼 함수
const updateMetaTags = (seoData) => {
  // 1. Title 변경
  document.title = seoData.title;

  // 2. Meta Description 변경 (없으면 생성)
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', seoData.desc);

  // 3. Meta Keywords 변경 (없으면 생성)
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.name = "keywords";
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', seoData.keywords);

  // 4. Open Graph (SNS 공유용) 태그 업데이트
  const ogTags = {
    'og:title': seoData.title,
    'og:description': seoData.desc,
    'og:type': 'website'
  };

  Object.entries(ogTags).forEach(([property, content]) => {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  });
};

// [SEO] 구조화된 데이터 (JSON-LD) 주입 함수
const updateJsonLd = () => {
  let script = document.querySelector('#structured-data');
  if (!script) {
    script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ETF 배당 라이프",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW"
    },
    "description": "배당금 계산기 및 복리 시뮬레이터를 통해 경제적 자유를 계획하는 도구입니다."
  };

  script.text = JSON.stringify(structuredData);
};


// 메인 앱 컨텐츠 (Router 내부에서 사용)
function AppContent() {
  const [etfData, setEtfData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // 현재 경로에 따른 활성 탭 판단
  const activeTab = location.pathname === '/compound' ? 'compound' 
                  : location.pathname === '/calculator' ? 'calculator' 
                  : 'lifeGoal';

  // [SEO 핵심] 경로 변경 시 메타 태그 및 구조화 데이터 업데이트
  useEffect(() => {
    // 페이지별 SEO 데이터 정의
    const seoMap = {
      '/': {
        title: 'ETF 배당 라이프 - 생활 목표 달성 계산기',
        desc: '스타벅스 커피, 넷플릭스 구독료를 배당금으로 해결하려면 얼마가 필요할까? SCHD, JEPI 등 인기 ETF로 계산해보세요.',
        keywords: '배당금 계산기, ETF 투자, SCHD, JEPI, 배당 생활, 파이어족, 재테크'
      },
      '/calculator': {
        title: '월 배당금 계산기 - SCHD, JEPI 투자 시뮬레이션',
        desc: '투자금액을 입력하면 매월 얼마를 받을 수 있는지 즉시 확인하세요. 배당률, 세금, 수수료를 고려한 실전 계산기.',
        keywords: '월 배당금, 배당 수익률, 미국 주식 세금, ETF 시뮬레이션, 월세 받기'
      },
      '/compound': {
        title: '배당금 복리 계산기 - 스노우볼 효과 확인하기',
        desc: '배당금을 재투자하면 10년 뒤 자산은 얼마나 불어날까? 72의 법칙과 복리 마법을 눈으로 확인하세요.',
        keywords: '복리 계산기, 스노우볼 효과, 배당 재투자, 장기 투자, 자산 증식, 은퇴 준비'
      }
    };

    const currentSeo = seoMap[location.pathname] || seoMap['/'];
    
    updateMetaTags(currentSeo);
    updateJsonLd();

  }, [location]);

  // 데이터 불러오기
  useEffect(() => {
    fetch('/etf_data.json')
      .then(res => res.json())
      .then(data => {
        setEtfData(data.etfs);
        setLastUpdated(data.updated_at);
        setLoading(false);
      })
      .catch(err => {
        console.warn("데이터 로딩 실패 (더미 데이터 사용):", err);
        setEtfData([
            { ticker: "SCHD", name: "Schwab US Dividend Equity", price: 105000, yield: 3.4, risk: "중위험", sector: "배당성장" },
            { ticker: "JEPI", name: "JPMorgan Equity Premium", price: 75000, yield: 7.5, risk: "중위험", sector: "커버드콜" },
            { ticker: "TQQQ", name: "ProShares UltraPro QQQ", price: 80000, yield: 0.8, risk: "고위험", sector: "기술주 레버리지" },
        ]);
        setLastUpdated("2024-05-20");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">데이터를 불러오는 중...</div>;
  
  if (!etfData || !etfData.length) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-xl font-bold mb-2 text-slate-800">데이터를 불러올 수 없습니다 😢</h2>
      <p className="text-slate-500">잠시 후 다시 시도해주세요.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <ScrollToTop />
      
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg transition-colors duration-300 relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-end">
            <div 
              onClick={() => navigate('/')} 
              className="cursor-pointer group"
            >
              {/* [SEO] h1 태그는 페이지당 하나가 원칙, 로고에 할당 */}
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 group-hover:opacity-90 transition-opacity">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8" /> 
                <span>ETF 배당 라이프</span>
              </h1>
              <p className="mt-2 text-blue-100 text-xs md:text-base group-hover:text-white transition-colors">
                배당금으로 만드는 경제적 자유
              </p>
            </div>
            <div className="text-[10px] md:text-xs text-blue-200 flex items-center gap-1 bg-blue-700/50 px-2 py-1 rounded-full">
              <RefreshCw size={10} className="animate-pulse"/> 
              <span className="hidden md:inline">업데이트:</span> {lastUpdated}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation (React Router Link 적용) */}
      <nav className="max-w-4xl mx-auto px-4 mt-4 md:mt-6 w-full relative z-0">
        <div className="flex p-1 space-x-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto scrollbar-hide">
          <Link to="/" className="flex-1 min-w-[120px] md:min-w-0" aria-label="생활 목표 달성 계산기 이동">
            <TabButton active={activeTab === 'lifeGoal'} icon={<Coffee size={16} />} label="배당 라이프" />
          </Link>
          <Link to="/calculator" className="flex-1 min-w-[120px] md:min-w-0" aria-label="월 배당금 계산기 이동">
            <TabButton active={activeTab === 'calculator'} icon={<Calculator size={16} />} label="단순 계산기" />
          </Link>
          <Link to="/compound" className="flex-1 min-w-[120px] md:min-w-0" aria-label="복리 시뮬레이터 이동">
            <TabButton active={activeTab === 'compound'} icon={<PieChart size={16} />} label="복리 시뮬레이터" />
          </Link>
        </div>
      </nav>

      {/* Main Content (Routes 적용) */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8 flex-grow w-full">
        <Routes>
          <Route path="/" element={<LifeGoalSection etfList={etfData} />} />
          <Route path="/calculator" element={<SimpleCalculatorSection etfList={etfData} />} />
          <Route path="/compound" element={<CompoundCalculatorSection etfList={etfData} />} />
        </Routes>
        
        {/* SEO 텍스트 콘텐츠 */}
        <GuideSection />
      </main>

      {/* Footer Section */}
      <footer className="bg-slate-900 text-slate-400 py-8 md:py-12 mt-8 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2 mb-4">
                <TrendingUp className="text-blue-500" /> ETF 배당 라이프
              </h3>
              <p className="text-sm leading-relaxed text-slate-500 break-keep">
                경제적 자유를 꿈꾸는 당신을 위한 가장 직관적인 배당금 계산기입니다.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">바로가기</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-blue-400 transition-colors">생활 목표 달성</Link></li>
                <li><Link to="/calculator" className="hover:text-blue-400 transition-colors">월 배당금 계산기</Link></li>
                <li><Link to="/compound" className="hover:text-blue-400 transition-colors">복리 시뮬레이터</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-2">
                <ShieldCheck size={16} className="text-green-500"/> 정책 및 약관
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => setShowPrivacy(true)} className="hover:text-white underline decoration-slate-600 underline-offset-4 transition-colors">
                    개인정보처리방침
                  </button>
                </li>
                <li className="text-xs text-slate-600 pt-2 break-keep">
                    본 사이트는 투자 권유를 하지 않으며, 모든 투자의 책임은 본인에게 있습니다.
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <div>
              &copy; 2025 ETF Dividend Life. All rights reserved.
            </div>
            <div className="flex gap-4">
              <span>데이터 출처: Yahoo Finance</span>
            </div>
          </div>
        </div>
      </footer>

      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  );
}

// 최상위 컴포넌트: Router 제공
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

// --- Components ---

// [SEO 핵심] 대폭 보강된 가이드 섹션
function GuideSection() {
  return (
    <section className="mt-16 border-t border-slate-200 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2 border-b border-slate-100 pb-4">
          <BookOpen className="text-blue-600 w-7 h-7" /> 배당 투자, 이것만은 알고 시작하세요
        </h3>
        
        <div className="space-y-12 text-slate-600 leading-relaxed">
          
          {/* 주제 1: 기초 */}
          <div className="grid md:grid-cols-[1fr_2fr] gap-4 md:gap-8">
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">STEP 1</span>
                배당금의 원리
              </h4>
              <p className="text-sm text-slate-500">회사가 돈을 벌면 주주에게 나눠줍니다.</p>
            </div>
            <div>
              <p className="text-sm md:text-base break-keep mb-3">
                배당금이란 기업이 영업 활동을 통해 벌어들인 이익의 일부를 주주들에게 환원하는 것입니다. 
                부동산 월세와 비슷하지만, <strong>세입자 걱정이 없고 소액으로 시작할 수 있다는 점</strong>이 가장 큰 장점입니다.
              </p>
              <div className="bg-slate-50 p-4 rounded-lg text-sm border-l-4 border-blue-500">
                <strong>💡 핵심 포인트:</strong> 은행 이자는 원금이 그대로지만, 좋은 배당주(Dividend Aristocrats)는 
                시간이 지날수록 <strong>주가(원금)와 배당금(이자)이 함께 성장</strong>합니다.
              </div>
            </div>
          </div>

          {/* 주제 2: 종목 선정 기준 (신규 추가) */}
          <div className="grid md:grid-cols-[1fr_2fr] gap-4 md:gap-8">
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full">STEP 2</span>
                실패 없는 ETF 고르는 법
              </h4>
              <p className="text-sm text-slate-500">배당률만 보고 사면 위험합니다.</p>
            </div>
            <div>
              <p className="text-sm md:text-base break-keep mb-4">
                무조건 배당률이 높은 종목(Yield Trap)을 쫓다가 주가 하락으로 손해를 보는 경우가 많습니다. 
                안전한 투자를 위해 다음 3가지를 반드시 확인하세요.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <Search className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <span className="text-sm"><strong>운용 자산(AUM):</strong> 자산 규모가 너무 작으면 상장 폐지 위험이 있거나 거래가 힘들 수 있습니다. 최소 1조 원 이상의 대형 ETF를 추천합니다.</span>
                </li>
                <li className="flex gap-3">
                  <BarChart3 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <span className="text-sm"><strong>배당 성장률(CAGR):</strong> 지난 5~10년간 배당금을 꾸준히 늘려왔는지 확인하세요. SCHD 같은 ETF가 인기 있는 이유는 10년 넘게 연평균 10% 이상 배당을 늘려왔기 때문입니다.</span>
                </li>
                <li className="flex gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <span className="text-sm"><strong>운용 보수(Fee):</strong> 장기 투자 시 0.1%의 수수료 차이도 큽니다. 연 0.5% 이하의 보수를 가진 상품이 유리합니다.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 주제 3: 세금 (신규 추가 - 중요) */}
          <div className="grid md:grid-cols-[1fr_2fr] gap-4 md:gap-8">
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">STEP 3</span>
                세금, 아는 만큼 법니다
              </h4>
              <p className="text-sm text-slate-500">15.4% 세금을 아끼는 계좌 활용법</p>
            </div>
            <div>
              <p className="text-sm md:text-base break-keep mb-4">
                미국 주식이나 ETF에서 배당을 받으면 기본적으로 <strong>15%의 배당소득세</strong>가 원천 징수됩니다. 
                한국 계좌로 들어올 때 이미 세금이 떼인 상태로 들어오죠. 하지만 '절세 계좌'를 활용하면 이 세금을 아끼거나 미룰 수 있습니다.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-red-200 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Landmark className="text-red-500 w-5 h-5"/> <strong>ISA (중개형)</strong>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    200만원(서민형 400만원)까지 비과세 혜택. 초과분은 9.9%로 분리 과세됩니다. 
                    3년 의무 가입 기간이 있지만 세금 혜택이 가장 강력합니다.
                  </p>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-red-200 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="text-green-500 w-5 h-5"/> <strong>연금저축 / IRP</strong>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    배당소득세를 내지 않고 전액 재투자합니다(과세 이연). 
                    나중에 연금을 받을 때 3.3~5.5%의 낮은 연금소득세만 내면 됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 주제 4: 복리 (보강) */}
          <div className="grid md:grid-cols-[1fr_2fr] gap-4 md:gap-8">
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">STEP 4</span>
                72의 법칙과 스노우볼
              </h4>
              <p className="text-sm text-slate-500">내 돈이 2배가 되는 시간</p>
            </div>
            <div>
              <p className="text-sm md:text-base break-keep mb-4">
                복리 효과를 가장 쉽게 이해하는 방법은 '72의 법칙'입니다. 
                <strong>72 ÷ 연 수익률 = 원금이 2배 되는 시간(년)</strong>입니다.
              </p>
              <div className="bg-green-50 p-4 rounded-xl mb-4">
                <ul className="text-sm space-y-2 text-slate-700">
                  <li>• 연 <strong>4%</strong> 배당 수익률: 원금 2배까지 <strong>18년</strong></li>
                  <li>• 연 <strong>8%</strong> 배당 수익률: 원금 2배까지 <strong>9년</strong></li>
                  <li>• 연 <strong>12%</strong> 배당 수익률: 원금 2배까지 <strong>6년</strong></li>
                </ul>
              </div>
              <p className="text-sm text-slate-600">
                위의 <strong>[복리 시뮬레이터]</strong> 탭을 사용하여 배당금을 재투자했을 때, 
                10년, 20년 뒤 자산이 얼마나 기하급수적으로 늘어나는지 직접 눈으로 확인해보세요.
                초반에는 느리게 느껴지지만, 눈덩이가 구르듯 자산이 불어나는 '스노우볼 효과'를 경험할 수 있습니다.
              </p>
              <div className="mt-4 flex justify-end">
                 <Link 
                   to="/compound" 
                   onClick={() => window.scrollTo(0, 0)}
                   className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
                 >
                   복리 계산해보기 <ArrowRight size={14} />
                 </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function PrivacyModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center z-10">
          <h3 className="font-bold text-lg">개인정보처리방침</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 text-sm text-slate-600 space-y-4">
          <p><strong>1. 개인정보의 처리 목적</strong><br/>
          본 서비스는 별도의 회원가입 없이 이용 가능하며, 사용자의 개인정보를 서버에 저장하지 않습니다.</p>
          
          <p><strong>2. 쿠키(Cookie)</strong><br/>
          방문자 분석 및 설정 저장을 위해 브라우저 쿠키를 사용할 수 있습니다. 구글 애드센스 광고 게재를 위해 제3자 쿠키가 사용될 수 있습니다.</p>
          
          <p><strong>3. 면책 조항</strong><br/>
          제공되는 모든 데이터는 시뮬레이션 목적이며, 실제 수익을 보장하지 않습니다.</p>
        </div>
        <div className="p-4 border-t border-slate-100 text-right sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium w-full md:w-auto">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap
        ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}

function LifeGoalSection({ etfList }) {
  const [selectedGoal, setSelectedGoal] = useState(LIFE_GOALS[0]);
  const [selectedTicker, setSelectedTicker] = useState(etfList[0]?.ticker || "SCHD");

  const currentEtf = etfList.find(e => e.ticker === selectedTicker) || etfList[0] || { ticker: "Loading", yield: 0, price: 0 };
  
  // 계산 로직
  const targetYearlyDividend = selectedGoal.cost * 12;
  const yieldVal = currentEtf.yield > 0 ? currentEtf.yield : 0.01; 
  const requiredCapital = targetYearlyDividend / (yieldVal / 100);
  const requiredShares = currentEtf.price > 0 ? Math.ceil(requiredCapital / currentEtf.price) : 0;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">생활 속 목표 달성하기</h2>
        <p className="text-sm md:text-base text-slate-500">목표를 선택하면 필요한 투자금을 계산해드립니다.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {LIFE_GOALS.map((goal) => (
          <button
            key={goal.id}
            onClick={() => setSelectedGoal(goal)}
            className={`p-3 md:p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 text-center h-36 md:h-40
              ${selectedGoal.id === goal.id 
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-200 ring-offset-2' 
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'}`}
          >
            <div className={`p-2 md:p-3 rounded-full ${selectedGoal.id === goal.id ? 'bg-blue-200' : 'bg-slate-100'}`}>
              {React.cloneElement(goal.icon, { size: 20 })} 
            </div>
            <div>
              <div className="font-bold text-sm">{goal.title}</div>
              <div className="text-[10px] md:text-xs opacity-70 mt-1">{goal.cost.toLocaleString()}원/월</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        {/* 모바일에서는 컬럼 1개, PC에서는 2개 */}
        <div className="p-5 md:p-8 grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">어떤 종목으로 달성할까요?</label>
              <select 
                value={selectedTicker} 
                onChange={(e) => setSelectedTicker(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
              >
                {etfList.map(etf => (
                  <option key={etf.ticker} value={etf.ticker}>
                    [{etf.ticker}] {etf.name} (배당률 {etf.yield}%)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 space-y-1">
              <p>선택한 목표: <strong>{selectedGoal.title}</strong></p>
              <p>월 필요 금액: <strong>{selectedGoal.cost.toLocaleString()}원</strong></p>
              <p>선택 ETF: <strong>{currentEtf.ticker}</strong> (연 {currentEtf.yield}%)</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white text-center shadow-inner">
            <h3 className="text-blue-100 text-sm font-medium mb-1">필요한 투자금</h3>
            <div className="text-3xl md:text-4xl font-bold mb-4 break-words">
              {Math.round(requiredCapital).toLocaleString()}원
            </div>
            
            <div className="border-t border-blue-400/30 pt-4 flex justify-around">
              <div>
                <div className="text-xs text-blue-200">필요 주식 수</div>
                <div className="font-semibold text-lg">{requiredShares.toLocaleString()}주</div>
              </div>
              <div className="w-px bg-blue-400/30"></div>
              <div>
                <div className="text-xs text-blue-200">예상 연 배당금</div>
                <div className="font-semibold text-lg">{(Math.round(requiredCapital * (currentEtf.yield/100))).toLocaleString()}원</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimpleCalculatorSection({ etfList }) {
  const [amount, setAmount] = useState(10000000);
  const [ticker, setTicker] = useState(etfList[0]?.ticker || "SCHD");

  const etf = etfList.find(e => e.ticker === ticker) || etfList[0] || { ticker: "", price: 0, yield: 0, risk: "", sector: "" };
  const monthlyDividend = (amount * (etf.yield / 100)) / 12;

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Calculator className="text-blue-600" /> 월 배당금 계산기
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">투자 금액 (원)</label>
            <input 
              type="text" 
              value={amount.toLocaleString()} 
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (!isNaN(value)) {
                  setAmount(Number(value));
                }
              }}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {[100, 1000, 5000, 10000].map(val => (
                <button key={val} onClick={() => setAmount(val * 10000)} className="px-3 py-1 text-xs bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-colors">
                  {val}만
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">종목 선택</label>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
              {etfList.map((item) => (
                <button
                  key={item.ticker}
                  onClick={() => setTicker(item.ticker)}
                  className={`flex justify-between items-center p-3 rounded-lg border text-left transition-colors
                    ${ticker === item.ticker ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <div>
                    <span className="font-bold text-slate-800">{item.ticker}</span>
                    <span className="text-xs text-slate-500 ml-2">{item.name}</span>
                  </div>
                  <div className="text-sm font-semibold text-blue-600">{item.yield}%</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center bg-slate-50 rounded-xl p-6 border border-slate-100">
          <div className="text-center">
            <p className="text-slate-500 mb-2">예상 월 배당금 (세전)</p>
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2 break-all">
              {Math.floor(monthlyDividend).toLocaleString()}원
            </div>
            <p className="text-sm text-slate-400">
              연간 {Math.floor(monthlyDividend * 12).toLocaleString()}원
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
             <div className="flex justify-between text-sm">
               <span className="text-slate-600">현재 주가 (약)</span>
               <span className="font-medium">{etf.price.toLocaleString()}원</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-slate-600">구매 가능 수량</span>
               <span className="font-medium">{etf.price > 0 ? Math.floor(amount / etf.price) : 0}주</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-slate-600">성향/섹터</span>
               <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{etf.risk} / {etf.sector}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompoundCalculatorSection({ etfList }) {
  const [initialAmount, setInitialAmount] = useState(10000000);
  const [monthlyContribution, setMonthlyContribution] = useState(500000);
  const [years, setYears] = useState(10);
  const [selectedEtfIndex, setSelectedEtfIndex] = useState(0);

  const etf = etfList[selectedEtfIndex] || { yield: 0, ticker: "" };
  
  const generateChartData = () => {
    let data = [];
    let currentAsset = initialAmount;
    let totalInvested = initialAmount;
    // 주가 상승률 가정: 배당률이 높으면 성장률 낮게, 배당률 낮으면 성장률 높게 (임의 로직)
    const priceGrowthRate = Math.max(1, 8 - etf.yield) / 100; 
    const dividendRate = etf.yield / 100;
    
    for (let year = 0; year <= years; year++) {
      let monthlyDividendIncome = (currentAsset * dividendRate) / 12;
      data.push({
        year: year,
        asset: Math.round(currentAsset),
        invested: totalInvested,
        monthlyDividend: Math.round(monthlyDividendIncome)
      });
      const yearlyContribution = monthlyContribution * 12;
      const yearlyDividend = currentAsset * dividendRate;
      const yearlyGrowth = currentAsset * priceGrowthRate;
      currentAsset = currentAsset + yearlyContribution + yearlyDividend + yearlyGrowth;
      totalInvested += yearlyContribution;
    }
    return data;
  };
  const chartData = generateChartData();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">배당금 스노우볼 (복리 계산)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
           <div>
             <label className="text-sm font-semibold text-slate-600">ETF 선택</label>
             <select className="w-full mt-1 p-2 border rounded-md" value={selectedEtfIndex} onChange={(e) => setSelectedEtfIndex(Number(e.target.value))}>
               {etfList.map((e, idx) => (
                 <option key={e.ticker} value={idx}>{e.ticker} ({e.yield}%)</option>
               ))}
             </select>
           </div>
           <div>
             <label className="text-sm font-semibold text-slate-600">초기 투자금</label>
             <input 
               type="text" 
               value={initialAmount.toLocaleString()} 
               onChange={e => {
                  const value = e.target.value.replace(/,/g, '');
                  if (!isNaN(value)) setInitialAmount(Number(value));
               }} 
               className="w-full mt-1 p-2 border rounded-md" 
             />
           </div>
           <div>
             <label className="text-sm font-semibold text-slate-600">월 적립금</label>
             <input 
               type="text" 
               value={monthlyContribution.toLocaleString()} 
               onChange={e => {
                  const value = e.target.value.replace(/,/g, '');
                  if (!isNaN(value)) setMonthlyContribution(Number(value));
               }} 
               className="w-full mt-1 p-2 border rounded-md" 
             />
           </div>
        </div>
        
        <div className="h-[250px] md:h-[300px] w-full mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{fontSize: 12}} />
              <YAxis tickFormatter={(val) => `${(val / 100000000).toFixed(1)}억`} width={40} tick={{fontSize: 11}} />
              <Tooltip formatter={(val) => `${val.toLocaleString()}원`} />
              <Legend />
              <Line type="monotone" dataKey="asset" name="총 자산" stroke="#2563eb" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="invested" name="원금" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-4 text-xs text-slate-500">
            * 배당금 재투자 및 주가 상승을 가정한 시뮬레이션입니다.
        </div>
      </div>
    </div>
  );
}