import json
import yfinance as yf
from datetime import datetime
import os

# 1. 데이터를 가져올 ETF 목록 설정 (원하는 종목 추가/삭제 가능)
TICKERS = [
    {"ticker": "SCHD", "name": "Schwab US Dividend Equity", "risk": "중위험", "sector": "배당성장"},
    {"ticker": "JEPI", "name": "JPMorgan Equity Premium", "risk": "중위험", "sector": "커버드콜"},
    {"ticker": "JEPQ", "name": "JPMorgan Nasdaq Equity", "risk": "고위험", "sector": "기술주 커버드콜"},
    {"ticker": "SPY", "name": "SPDR S&P 500 Trust", "risk": "저위험", "sector": "지수추종"},
    {"ticker": "QQQ", "name": "Invesco QQQ Trust", "risk": "중위험", "sector": "기술주"},
    {"ticker": "TQQQ", "name": "ProShares UltraPro QQQ", "risk": "초고위험", "sector": "기술주 3배"},
    {"ticker": "O", "name": "Realty Income Corp", "risk": "중위험", "sector": "리츠(부동산)"},
    {"ticker": "TLT", "name": "iShares 20+ Year Treasury", "risk": "저위험", "sector": "미국 장기채"},
    {"ticker": "TSLA", "name": "Tesla Inc", "risk": "고위험", "sector": "전기차"},
    {"ticker": "AAPL", "name": "Apple Inc", "risk": "중위험", "sector": "IT"},
]

def get_etf_data():
    etf_list = []
    
    # 환율 설정 (1달러 = 1450원 가정, 필요시 수정하거나 API 연동 가능)
    # 무료 API인 경우 환율 정보가 제한적이므로 보수적으로 고정값을 사용합니다.
    EXCHANGE_RATE = 1450 

    print(f"[{datetime.now().strftime('%H:%M:%S')}] 데이터 수집 시작...")

    for item in TICKERS:
        try:
            print(f"Fetching data for {item['ticker']}...")
            ticker = yf.Ticker(item['ticker'])
            
            # 1. 현재 주가 가져오기 (가장 최근 종가)
            history = ticker.history(period="1d")
            if not history.empty:
                current_price = history['Close'].iloc[-1]
            else:
                current_price = 0

            # 2. 배당률 계산 (Yahoo Finance 정보 활용)
            info = ticker.info
            # dividendYield는 0.034 처럼 소수로 나오므로 100을 곱해 %로 변환
            dividend_yield = info.get('dividendYield', 0)
            
            # 데이터가 None인 경우 0으로 처리
            if dividend_yield is None:
                dividend_yield = 0
                
            yield_percent = round(dividend_yield * 100, 2)
            
            # 3. 원화 환산 가격 계산
            price_krw = int(current_price * EXCHANGE_RATE)

            etf_list.append({
                "ticker": item['ticker'],
                "name": item['name'],
                "price": price_krw,
                "yield": yield_percent,
                "risk": item['risk'],
                "sector": item['sector']
            })
            
        except Exception as e:
            print(f"Error fetching {item['ticker']}: {e}")
            # 에러가 나더라도 다른 종목 수집을 계속 진행
            continue

    print(f"수집 완료: 총 {len(etf_list)}개 종목")
    return etf_list

def save_to_json(data):
    # 오늘 날짜
    today = datetime.now().strftime("%Y-%m-%d")
    
    output = {
        "updated_at": today,
        "etfs": data
    }
    
    # [경로 설정 핵심 로직]
    # 이 스크립트는 'scripts' 폴더 안에 있습니다.
    # 하지만 저장해야 할 파일은 상위 폴더인 'frontend' -> 'public' 안에 있어야 합니다.
    
    # 1. 현재 파일(update_data.py)의 절대 경로를 구합니다.
    current_dir = os.path.dirname(os.path.abspath(__file__)) 
    
    # 2. 상위 폴더(frontend)로 이동합니다.
    project_root = os.path.dirname(current_dir)
    
    # 3. public 폴더 안의 etf_data.json 경로를 만듭니다.
    target_dir = os.path.join(project_root, "public")
    file_path = os.path.join(target_dir, "etf_data.json")
    
    # 혹시 public 폴더가 없으면 에러가 날 수 있으니 확인 (보통 리액트엔 무조건 있음)
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)

    # 4. JSON 파일로 저장 (한글 깨짐 방지: ensure_ascii=False)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"JSON 파일 저장 완료: {file_path}")

if __name__ == "__main__":
    # 메인 실행 로직
    data = get_etf_data()
    if data:
        save_to_json(data)
    else:
        print("수집된 데이터가 없습니다. (네트워크 오류 등을 확인하세요)")