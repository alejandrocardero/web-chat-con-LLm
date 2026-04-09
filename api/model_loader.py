"""
SLM Model Loader and Inference
Handles loading small language models and generating responses.
Supports models from Hugging Face with 4-bit quantization for memory efficiency.
"""

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from threading import Lock

# Available SLM models optimized for edge/cloud deployment
SUPPORTED_MODELS = {
    # Ultra ligeros (< 2B)
    "llama-1b": "meta-llama/Llama-3.2-1B-Instruct",
    "smollm2-1.7b": "HuggingFaceTB/SmolLM2-1.7B-Instruct",
    "qwen-1.5b": "Qwen/Qwen2.5-1.5B-Instruct",
    
    # Ligeros (3B-4B) - Mejor equilibrio
    "smollm3-3b": "HuggingFaceTB/SmolLM3-3B",
    "phi-3.5-mini": "microsoft/Phi-3.5-mini-instruct",
    "qwen-3b": "Qwen/Qwen2.5-3B-Instruct",
    
    # Calidad media (7B) - Requiere mas GPU
    "qwen-7b": "Qwen/Qwen2.5-7B-Instruct",
    "llama-8b": "meta-llama/Llama-3.1-8B-Instruct",
}

class ModelManager:
    """Singleton manager for SLM models. Loads one model at a time to save memory."""
    
    def __init__(self):
        self._model = None
        self._tokenizer = None
        self._current_model_id = None
        self._lock = Lock()
    
    def get_supported_models(self):
        """Return list of available model IDs."""
        return list(SUPPORTED_MODELS.keys())
    
    def load_model(self, model_id: str, device: str = None):
        """
        Load an SLM into memory with 4-bit quantization.
        
        Args:
            model_id: Short model ID (e.g., 'smollm3-3b')
            device: 'cuda', 'cpu', or 'auto'
        """
        if model_id not in SUPPORTED_MODELS:
            raise ValueError(f"Modelo no soportado: {model_id}. Use: {list(SUPPORTED_MODELS.keys())}")
        
        # Check if model is already loaded
        if self._current_model_id == model_id and self._model is not None:
            print(f"[ModelManager] Model '{model_id}' already loaded.")
            return
        
        model_name = SUPPORTED_MODELS[model_id]
        
        with self._lock:
            # Unload previous model
            if self._model is not None:
                print(f"[ModelManager] Unloading previous model...")
                del self._model
                del self._tokenizer
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                self._model = None
                self._tokenizer = None
            
            print(f"[ModelManager] Loading '{model_name}'...")
            
            # Determine device
            if device == "auto":
                device = "cuda" if torch.cuda.is_available() else "cpu"
            
            # 4-bit quantization config for memory efficiency
            if device == "cuda":
                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_use_double_quant=True,
                    bnb_4bit_quant_type="nf4",
                    bnb_4bit_compute_dtype=torch.float16,
                )
                load_kwargs = {
                    "quantization_config": quantization_config,
                    "torch_dtype": torch.float16,
                    "device_map": "auto",
                }
            else:
                # CPU mode - no quantization (slower but works)
                load_kwargs = {
                    "torch_dtype": torch.float32,
                    "device_map": "cpu",
                }
            
            # Load tokenizer
            self._tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
            if self._tokenizer.pad_token is None:
                self._tokenizer.pad_token = self._tokenizer.eos_token
            
            # Load model
            self._model = AutoModelForCausalLM.from_pretrained(
                model_name,
                trust_remote_code=True,
                **load_kwargs
            )
            
            self._current_model_id = model_id
            print(f"[ModelManager] Model '{model_id}' loaded successfully on {device}.")
    
    def generate(
        self,
        messages: list,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        top_p: float = 0.9,
    ) -> str:
        """
        Generate a response from the loaded model.
        
        Args:
            messages: List of {role, content} dicts
            temperature: Creativity (0.0-1.0)
            max_tokens: Max response length
            top_p: Nucleus sampling parameter
        
        Returns:
            Generated text response
        """
        if self._model is None or self._tokenizer is None:
            raise RuntimeError("No model loaded. Call load_model() first.")
        
        # Build prompt from message history
        prompt = self._build_prompt(messages)
        
        # Tokenize
        inputs = self._tokenizer(prompt, return_tensors="pt").to(self._model.device)
        
        # Generate
        with torch.no_grad():
            outputs = self._model.generate(
                **inputs,
                temperature=temperature,
                max_new_tokens=max_tokens,
                top_p=top_p,
                do_sample=temperature > 0,
                pad_token_id=self._tokenizer.pad_token_id,
            )
        
        # Decode only the generated tokens
        generated_ids = outputs[0][inputs["input_ids"].shape[1]:]
        response = self._tokenizer.decode(generated_ids, skip_special_tokens=True)
        
        return response.strip()
    
    def _build_prompt(self, messages: list) -> str:
        """
        Build a chat prompt compatible with instruction-tuned models.
        Uses ChatML format for broad compatibility.
        """
        prompt = ""
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            prompt += f"<|im_start|>{role}\n{content}<|im_end|>\n"
        
        # Add assistant prompt
        prompt += "<|im_start|>assistant\n"
        return prompt
    
    def is_loaded(self) -> bool:
        """Check if a model is currently loaded."""
        return self._model is not None
    
    def get_current_model(self) -> str:
        """Return the currently loaded model ID."""
        return self._current_model_id


# Global singleton
model_manager = ModelManager()
