import os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
load_dotenv()
class OpenAILLM:
    def __init__(self, model: str = "gpt-4o-mini"):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set in .env")
        self.llm = ChatOpenAI(model=model, temperature=0)

    def generate(self, prompt: str) -> str:
        return self.llm.invoke(prompt).content