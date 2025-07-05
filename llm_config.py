import os
from dotenv import load_dotenv
from crewai import LLM

load_dotenv()

def get_llm():
    """Get LLM instance for CrewAI agents"""
    # Option 1: OpenAI
    if os.getenv("OPENAI_API_KEY"):
        return LLM(
            model="gpt-4",
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.7,
            max_tokens=1000
        )
    
    # Option 2: OpenRouter (free tier)
    elif os.getenv("OPENROUTER_API_KEY"):
        return LLM(
            model="openrouter/mistralai/mistral-small-3.2-24b-instruct:free",
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1",
            temperature=0.7,
            max_tokens=1000
        )
    
    # Option 3: Local Ollama
    else:
        return LLM(
            model="ollama/llama2",
            base_url="http://localhost:11434",
            temperature=0.7
        )

def get_evaluator_llm():
    """Get LLM for alignment evaluation (lower temperature for consistency)"""
    llm = get_llm()
    llm.temperature = 0.3
    return llm

def get_rewriter_llm():
    """Get LLM for creative rewrites (higher temperature)"""
    llm = get_llm()
    llm.temperature = 0.8
    return llm