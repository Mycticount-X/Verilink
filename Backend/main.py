import re
import traceback
from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from tld import get_tld

app = FastAPI()

# 1. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Model
model = joblib.load('decision_tree.joblib')

# 3. Data Input
class URLRequest(BaseModel):
    url: str

# 4. Extract Feature
def extract_features(url):
    # 0. PREPROCESSING: Hapus 'www.' seperti saat training
    url = url.replace("www.", "")
    
    features = {}
    
    # 1. URL Length
    features['url_len'] = len(url)
    
    # 2. Special Characters Count
    special_chars = ['@', '?', '-', '=', '.', '#', '%', '+', '$', '!', '*', ',', '//']
    for char in special_chars:
        features[char] = url.count(char)
    
    # 3. HTTPS Usage (Gunakan urlparse untuk mengecek protokol)
    parsed_url = urlparse(url)
    features['https'] = 1 if str(parsed_url.scheme) == 'https' else 0
    
    # 4. Digits & Letters Count
    features['digits'] = sum(c.isdigit() for c in url)
    features['letters'] = sum(c.isalpha() for c in url)
    
    # 5. Shortening Service Detection
    match_short = re.search(r'bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd|cli\.gs|'
                      r'yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|'
                      r'short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|bkite\.com|snipr\.com|fic\.kr|loopt\.us|'
                      r'doiop\.com|short\.ie|kl\.am|wp\.me|rubyurl\.com|om\.ly|to\.ly|bit\.do|t\.co|lnkd\.in|'
                      r'db\.tt|qr\.ae|adf\.ly|goo\.gl|bitly\.com|cur\.lv|tinyurl\.com|ow\.ly|bit\.ly|ity\.im|'
                      r'q\.gs|is\.gd|po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|cutt\.us|u\.bb|yourls\.org|'
                      r'x\.co|prettylinkpro\.com|scrnch\.me|filoops\.info|vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|'
                      r'tr\.im|link\.zip\.net', url)
    features['Shortining_Service'] = 1 if match_short else 0
    
    # 6. Abnormal URL Detection
    hostname = parsed_url.hostname
    if hostname:
        match_abnormal = re.search(str(hostname), url)
        features['abnormal_url'] = 1 if match_abnormal else 0
    else:
        features['abnormal_url'] = 0
        
    # 7. Having IP Address
    match_ip = re.search(r'(([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.'
                         r'([01]?\d\d?|2[0-4]\d|25[0-5])\/)', url)
    features['having_ip_address'] = 1 if match_ip else 0
    
    df = pd.DataFrame([features])
    
    try:
        df = df[model.feature_names_in_]
    except KeyError as e:
        print(f"\nColumn Name Incomplete. Model need: {e}\n")
        raise e
        
    return df

# 5. Endpoint Prediksi
@app.post("/api/analyze")
async def analyze_url(request: URLRequest):
    try:
        processed_data = extract_features(request.url)
        
        prediction = model.predict(processed_data)[0]
        
        labels = {0: 'benign', 1: 'defacement', 2: 'phishing', 3: 'malware'}
        result = labels.get(prediction, "unknown")
        
        return {
            "url": request.url,
            "prediction": result,
            "confidence": 0.98 
        }
    except Exception as e:
        print("=== TERJADI ERROR ===")
        traceback.print_exc()
        print("=====================")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)