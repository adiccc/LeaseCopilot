import os
from langchain_ollama import ChatOllama

class OllamaLLM:
    def __init__(self, model: str | None = None):
        self.model = model or os.getenv("OLLAMA_MODEL", "llama3.1:8b")
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

        self.llm = ChatOllama(
            model=self.model,
            base_url=self.base_url,
            temperature=0,
        )

    def generate(self, prompt: str) -> str:
        return self.llm.invoke(prompt).content