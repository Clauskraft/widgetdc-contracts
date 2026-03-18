import os
import logging
import re
import hashlib
from typing import List, Tuple, Dict, Any
import spacy
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.chunk import ne_chunk
from nltk.tag import pos_tag
from string import punctuation

# Set up logging
logger = logging.getLogger(__name__)

# Initialize NLP components - with fallbacks if packages aren't available
try:
    # Load SpaCy model
    _nlp = spacy.load("en_core_web_sm")
    SPACY_AVAILABLE = True
    logger.info("Loaded spaCy en_core_web_sm model")
except Exception as e:
    logger.warning(f"Failed to load spaCy model: {str(e)}")
    SPACY_AVAILABLE = False
    
    # Try to download the model
    try:
        import subprocess
        subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], check=True)
        _nlp = spacy.load("en_core_web_sm")
        SPACY_AVAILABLE = True
        logger.info("Successfully downloaded and loaded spaCy model")
    except Exception as inner_e:
        logger.warning(f"Failed to download spaCy model: {str(inner_e)}")
        _nlp = None

# Initialize NLTK resources
try:
    nltk.data.find('tokenizers/punkt')
    NLTK_TOKENIZER_AVAILABLE = True
except LookupError:
    logger.info("NLTK punkt tokenizer not found. Downloading...")
    try:
        nltk.download('punkt')
        NLTK_TOKENIZER_AVAILABLE = True
        logger.info("Successfully downloaded NLTK punkt tokenizer")
    except Exception as e:
        logger.warning(f"Failed to download NLTK punkt tokenizer: {str(e)}")
        NLTK_TOKENIZER_AVAILABLE = False

try:
    nltk.data.find('corpora/stopwords')
    _stop_words = set(stopwords.words('english'))
    NLTK_STOPWORDS_AVAILABLE = True
except LookupError:
    logger.info("NLTK stopwords not found. Downloading...")
    try:
        nltk.download('stopwords')
        _stop_words = set(stopwords.words('english'))
        NLTK_STOPWORDS_AVAILABLE = True
        logger.info("Successfully downloaded NLTK stopwords")
    except Exception as e:
        logger.warning(f"Failed to download NLTK stopwords: {str(e)}")
        NLTK_STOPWORDS_AVAILABLE = False
        _stop_words = set()

# Academic terminology dictionary
ACADEMIC_TERMINOLOGY = {
    "algorithm", "method", "theory", "framework", "model", "approach", "technique",
    "system", "paradigm", "architecture", "process", "protocol", "experiment",
    "analysis", "evaluation", "implementation", "design", "development", "solution",
    "challenge", "problem", "hypothesis", "conclusion", "finding", "result",
    "neural network", "deep learning", "machine learning", "artificial intelligence",
    "transformer", "attention mechanism", "embedding", "classification", "regression",
    "clustering", "optimization", "dataset", "benchmark", "performance", "accuracy",
    "precision", "recall", "f1 score", "loss function", "gradient descent"
}

def split_text_into_chunks(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """
    Split text into overlapping chunks of approximately equal size.
    """
    if not text or not isinstance(text, str):
        return []
    
    try:
        text = text.strip()
        if len(text) <= chunk_size:
            return [text]
        
        if NLTK_TOKENIZER_AVAILABLE:
            sentences = sent_tokenize(text)
        else:
            sentences = re.split(r'(?<=[.!?])\s+', text)
        
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) > chunk_size and current_chunk:
                chunks.append(current_chunk)
                if chunk_overlap > 0:
                    words = current_chunk.split()
                    overlap_word_count = min(len(words), int(chunk_overlap / 10))
                    current_chunk = " ".join(words[-overlap_word_count:]) + " " + sentence
                else:
                    current_chunk = sentence
            else:
                current_chunk += " " + sentence if current_chunk else sentence
        
        if current_chunk:
            chunks.append(current_chunk)
        return chunks
    except Exception as e:
        logger.error(f"Error splitting text into chunks: {str(e)}")
        return [text] if text else []

def extract_entities_and_relations(text: str) -> Tuple[List[Tuple[str, str]], List[Tuple[str, str, str]]]:
    """
    Extract entities and relationships from text.
    """
    entities = []
    relations = []
    
    if not text or not isinstance(text, str) or len(text.strip()) < 10:
        return entities, relations
    
    try:
        if SPACY_AVAILABLE:
            entities, relations = _extract_with_spacy(text)
        else:
            entities, relations = _extract_with_regex(text)
        
        academic_terms = _extract_academic_terms(text)
        entities.extend(academic_terms)
        
        return entities, relations
    except Exception as e:
        logger.error(f"Error extracting entities and relations: {str(e)}")
        return [], []

def _extract_with_spacy(text: str) -> Tuple[List[Tuple[str, str]], List[Tuple[str, str, str]]]:
    entities = []
    relations = []
    doc = _nlp(text)
    for ent in doc.ents:
        if len(ent.text.strip()) >= 3 and ent.text.lower() not in _stop_words:
            entities.append((ent.text.strip(), ent.label_))
    return entities, relations

def _extract_with_regex(text: str) -> Tuple[List[Tuple[str, str]], List[Tuple[str, str, str]]]:
    entities = []
    relations = []
    entity_pattern = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b'
    matches = re.finditer(entity_pattern, text)
    for match in matches:
        entities.append((match.group(1), "ENTITY"))
    return entities, relations

def _extract_academic_terms(text: str) -> List[Tuple[str, str]]:
    academic_entities = []
    text_lower = text.lower()
    for term in ACADEMIC_TERMINOLOGY:
        if term in text_lower:
            academic_entities.append((term, "ACADEMIC_TERM"))
    return academic_entities

def detect_secrets_and_values(text: str) -> Tuple[List[Tuple[str, str]], List[Tuple[str, str, str]]]:
    """
    Detect potential secrets (API keys, tokens) and their contextual economic value.
    This implements Pillar 4: Automated Leak Intelligence.
    """
    entities = []
    relations = []
    
    secret_patterns = {
        "GENERIC_KEY": r'\b[a-zA-Z0-9]{32,64}\b',
        "CLAUDE_KEY": r'\bsk-ant-api03-[a-zA-Z0-9\-_]{93,95}\b',
        "OPENAI_KEY": r'\bsk-[a-zA-Z0-9]{48}\b',
        "JWT_TOKEN": r'\beyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\b'
    }
    
    try:
        for label, pattern in secret_patterns.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                secret_val = match.group(0)
                logger.warning(f"POTENTIAL SECRET DETECTED: {label}")
                
                secret_node_id = f"secret_{label.lower()}_{hashlib.md5(secret_val.encode()).hexdigest()[:8]}"
                secret_node = (secret_node_id, "SecretPattern")
                entities.append(secret_node)
                
                context_start = max(0, match.start() - 50)
                context_end = min(len(text), match.end() + 50)
                context = text[context_start:context_end]
                
                assignment_match = re.search(r'(\w+)\s*=', context)
                if assignment_match:
                    var_name = assignment_match.group(1)
                    relations.append((secret_node_id, "FLOWS_TO", var_name))
                
                if any(kw in context.lower() for kw in ["prod", "admin", "live", "master"]):
                    val_node = ("high_economic_value", "EconomicValue")
                    if val_node not in [e[0] for e in entities if isinstance(e, tuple)]:
                        entities.append(val_node)
                    relations.append((secret_node_id, "REPRESENTS_VALUE", val_node[0]))
                    
        return entities, relations
    except Exception as e:
        logger.error(f"Error in detect_secrets_and_values: {str(e)}")
        return [], []
