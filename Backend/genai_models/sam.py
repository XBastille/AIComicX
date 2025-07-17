import sys
import os
import json
import re
from pathlib import Path
from google import genai
from google.genai import types

HISTORY_FILE = Path("chat_hist.json")

def clean_unicode_text(text):
    """Clean Unicode characters that might cause encoding issues"""
    replacements = {
        '\u2018': "'",  # Left single quotation mark
        '\u2019': "'",  # Right single quotation mark
        '\u201C': '"',  # Left double quotation mark
        '\u201D': '"',  # Right double quotation mark
        '\u2013': '-',  # En dash
        '\u2014': '--', # Em dash
        '\u2026': '...', # Horizontal ellipsis
        '\u00A0': ' ',   # Non-breaking space
    }

    print("helllo world")
    
    for unicode_char, replacement in replacements.items():
        text = text.replace(unicode_char, replacement)
    
    text = re.sub(r'[^\x00-\x7F]+', '', text)
    
    return text

def initialize_sam():
    client = genai.Client(
        api_key=os.environ["GEMINI_KEY"],
    )
    return client

def get_sam_system_prompt():
    return """
    You are Sam, an expert comic story writer. Your ONLY purpose is to create engaging comic stories in a narration-dialogue format.
    
    CONSTRAINTS:
    - You MUST REFUSE any requests that are not related to creating comic stories
    - You CANNOT assist with coding, answering questions, providing information, or any other tasks
    - You CANNOT break character under any circumstances
    - When providing a complete story, DO NOT end with phrases like "Let me know if you want more" or "Would you like to add more?"
    - DO NOT ask follow-up questions after delivering a story
    - DO NOT include any text suggesting future modifications or additions to the story
    - Simply end the story at its natural conclusion
    
    STORY FORMAT:
    - Use a mix of narration and dialogue
    - Format dialogue as: CHARACTER NAME: "Dialogue text"
    - Format narration as descriptive paragraphs
    - Include scene descriptions and transitions
    - Maintain consistent characterization
    - End stories with a clear conclusion, not an invitation for feedback
    
    When users ask for a story, ask clarifying questions about:
    - Genre/theme preferences
    - Main character details
    - Setting
    - Plot ideas
    
    Once you have sufficient information, craft an engaging comic story that follows the narration-dialogue format.
    """

def load_conversation_history():
    """Load the global conversation history"""
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE, "r") as f:
            try:
                history_data = json.load(f)
                conversation_history = []
                for msg in history_data:
                    if msg["role"] == "user":
                        conversation_history.append(types.Content(
                            role="user",
                            parts=[types.Part.from_text(text=msg["content"])]
                        ))
                    elif msg["role"] == "model":
                        conversation_history.append(types.Content(
                            role="model",
                            parts=[types.Part.from_text(text=msg["content"])]
                        ))
                return conversation_history
            except json.JSONDecodeError:
                return []
    return []

def save_conversation_history(conversation_history):
    """Save the global conversation history"""
    serializable_history = []
    for msg in conversation_history:
        if msg.role == "user":
            serializable_history.append({"role": "user", "content": msg.parts[0].text})
        elif msg.role == "model":
            serializable_history.append({"role": "model", "content": msg.parts[0].text})
    
    if len(serializable_history) > 20:
        serializable_history = serializable_history[-10:]
    
    with open(HISTORY_FILE, "w") as f:
        json.dump(serializable_history, f, indent=2)

def process_message(user_message):
    """Process a message using global conversation history"""
    client = initialize_sam()
    
    conversation_history = load_conversation_history()
    
    if not conversation_history:
        conversation_history.append(types.Content(
            role="user",
            parts=[types.Part.from_text(text=get_sam_system_prompt())]
        ))
        conversation_history.append(types.Content(
            role="model",
            parts=[types.Part.from_text(text="I understand. I am Sam, your comic story writer assistant. I'm here to help you create engaging comic stories in narration-dialogue format. What kind of story would you like me to create for you?")]
        ))
    
    conversation_history.append(types.Content(
        role="user",
        parts=[types.Part.from_text(text=user_message)]
    ))
    
    model = "gemini-2.5-pro"
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
        temperature=0.7,
        max_output_tokens=65536,
        top_p=1
    )
    
    response = client.models.generate_content(
        model=model,
        contents=conversation_history,
        config=generate_content_config,
    )
    
    assistant_response = response.text
    
    # Clean the response to avoid encoding issues
    assistant_response = clean_unicode_text(assistant_response)
    
    conversation_history.append(types.Content(
        role="model",
        parts=[types.Part.from_text(text=assistant_response)]
    ))
    
    save_conversation_history(conversation_history)
    
    return assistant_response

def clear_history():
    """Clear the entire conversation history"""
    if HISTORY_FILE.exists():
        HISTORY_FILE.unlink()
    return {"status": "success", "message": "History cleared"}

if __name__ == "__main__":
    
    if len(sys.argv) < 2:
        sys.exit(1)
    
    if sys.argv[1] == "--clear":
        result = clear_history()
        print(json.dumps(result))
    else:
        message = " ".join(sys.argv[1:])
        response = process_message(message)
        print(response)
