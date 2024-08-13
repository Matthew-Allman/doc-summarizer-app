from fastapi import FastAPI, Request, HTTPException
from transformers import pipeline, BartTokenizer
import json
import uvicorn
import os

app = FastAPI()

tokenizer = BartTokenizer.from_pretrained("sshleifer/distilbart-cnn-12-6")
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

def split_text(text, max_length):
    tokens = tokenizer.encode(text, truncation=False)
    num_tokens = len(tokens)
    chunks = []
    
    if num_tokens <= max_length:
        chunks.append(text)
    else:
        start = 0

        while start < num_tokens:
            end = min(start + max_length, num_tokens)

            chunk_tokens = tokens[start:end]

            chunk = tokenizer.decode(chunk_tokens, skip_special_tokens=True)
            chunks.append(chunk)
            
            start = end
    
    return chunks

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

        max_tokens = 1022
        chunks = split_text(text, max_tokens)
        
        summaries = []

        for chunk in chunks:
            summary = summarizer(chunk, min_length=40, do_sample=False)
            
            if summary and 'summary_text' in summary[0]:
                summaries.append(summary[0]['summary_text'])
            else:
                raise HTTPException(status_code=500, detail="Failed to generate summary for a chunk")

        final_summary = " ".join(summaries)
        
        return {"summary": final_summary}

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Request body is not valid JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    uvicorn.run(app, host=host, port=port)
