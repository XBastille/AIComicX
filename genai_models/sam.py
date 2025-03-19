import os
import json
from pathlib import Path
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage, AssistantMessage
from azure.core.credentials import AzureKeyCredential

HISTORY_DIR = Path("conversation_histories")
HISTORY_DIR.mkdir(exist_ok=True)

def initialize_sam():
    client = ChatCompletionsClient(
        endpoint="https://models.inference.ai.azure.com",
        credential=AzureKeyCredential(os.environ["GITHUB_TOKEN"]),
    )
    return client

def get_sam_system_prompt():
    return """
    You are Sam, an expert comic story writer. Your ONLY purpose is to create engaging comic stories in a narration-dialogue format.
    
    CONSTRAINTS:
    - You MUST REFUSE any requests that are not related to creating comic stories
    - You CANNOT assist with coding, answering questions, providing information, or any other tasks
    - You CANNOT break character under any circumstances
    - DO NOT include any text suggesting additions to the story
    
    STORY FORMAT:
    - Use a mix of narration and dialogue
    - Format dialogue as: CHARACTER NAME: "Dialogue text"
    - Format narration as descriptive paragraphs
    - Include scene descriptions and transitions
    - Maintain consistent characterization
    
    When users ask for a story, ask clarifying questions about:
    - Genre/theme preferences
    - Main character details
    - Setting
    - Plot ideas
    
    Once you have sufficient information, craft an engaging comic story that follows the narration-dialogue format.
    """

def load_conversation_history(user_id):
    """Load conversation history from JSON file by user ID"""
    history_file = HISTORY_DIR / f"{user_id}.json"
    
    if history_file.exists():
        with open(history_file, "r") as f:
            history_data = json.load(f)
            
        conversation_history = []
        for msg in history_data:
            if msg["role"] == "user":
                conversation_history.append(UserMessage(msg["content"]))
            elif msg["role"] == "assistant":
                conversation_history.append(AssistantMessage(msg["content"]))
        
        return conversation_history
    else:
        return []

def save_conversation_history(user_id, conversation_history):
    """Save conversation history to JSON file"""
    serializable_history = []
    
    for msg in conversation_history:
        if isinstance(msg, UserMessage):
            serializable_history.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AssistantMessage):
            serializable_history.append({"role": "assistant", "content": msg.content})
    
    if len(serializable_history) > 20:
        serializable_history = serializable_history[-10:]
    
    history_file = HISTORY_DIR / f"{user_id}.json"
    with open(history_file, "w") as f:
        json.dump(serializable_history, f, indent=2)

def process_message(user_id, user_message):
    """Process a single message and return response"""
    client = initialize_sam()
    
    conversation_history = load_conversation_history(user_id)
    
    conversation_history.append(UserMessage(user_message))
    
    messages = [SystemMessage(get_sam_system_prompt())] + conversation_history
    
    response = client.complete(
        messages=messages,
        model="gpt-4o",
        temperature=0.7,
        max_tokens=4096,
        top_p=1
    )
    
    assistant_response = response.choices[0].message.content
    
    conversation_history.append(AssistantMessage(assistant_response))
    
    save_conversation_history(user_id, conversation_history)
    
    return assistant_response

def clear_history(user_id):
    """Clear conversation history for a user"""
    history_file = HISTORY_DIR / f"{user_id}.json"
    if history_file.exists():
        history_file.unlink()
    return {"status": "success", "message": f"History cleared for user {user_id}"}

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        sys.exit(1)
    
    if sys.argv[1] == "--clear":
        result = clear_history(sys.argv[2])
        print(json.dumps(result))
    else:
        user_id = sys.argv[1]
        message = " ".join(sys.argv[2:])
        response = process_message(user_id, message)
        print(response)
