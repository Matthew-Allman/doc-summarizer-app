from fastapi import FastAPI, Request, HTTPException
from transformers import pipeline, BartTokenizer
import json
import uvicorn
from dotenv import load_dotenv
import os


app = FastAPI()

tokenizer = BartTokenizer.from_pretrained("sshleifer/distilbart-cnn-12-6")
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

def get_max_length(text, max_tokens=1024):
    tokens = tokenizer.encode(text, truncation=False)
    num_tokens = len(tokens)
    return min(max_tokens, num_tokens)

@app.post("/")
async def summarize(request: Request):
    try:
        data = await request.json()
        
        if not isinstance(data, dict):
            raise HTTPException(status_code=400, detail="Invalid JSON format")

        text = data.get("text", None)
        if text is None:
            raise HTTPException(status_code=400, detail="No 'text' field found in the request")

        if not isinstance(text, str):
            raise HTTPException(status_code=400, detail="'text' field must be a string")

        max_length = get_max_length(text)
        
        if max_length <= 0:
            raise HTTPException(status_code=400, detail="Calculated max_length is not valid")

        summary = summarizer(text, max_length=max_length - 1, min_length=40, do_sample=False)
        
        if not summary or 'summary_text' not in summary[0]:
            raise HTTPException(status_code=500, detail="Failed to generate summary")

        return {"summary": summary[0]['summary_text']}

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Request body is not valid JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    uvicorn.run(app, host=host, port=port)