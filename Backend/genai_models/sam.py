import sys
import os
import json
from pathlib import Path
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage, AssistantMessage
from azure.core.credentials import AzureKeyCredential

HISTORY_FILE = Path("chat_hist.json")

def initialize_sam():
    client = ChatCompletionsClient(
        endpoint="https://models.inference.ai.azure.com",
        credential=AzureKeyCredential("api key"),
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
                        conversation_history.append(UserMessage(msg["content"]))
                    elif msg["role"] == "assistant":
                        conversation_history.append(AssistantMessage(msg["content"]))
                return conversation_history
            except json.JSONDecodeError:
                return []
    return []

def save_conversation_history(conversation_history):
    """Save the global conversation history"""
    serializable_history = []
    for msg in conversation_history:
        if isinstance(msg, UserMessage):
            serializable_history.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AssistantMessage):
            serializable_history.append({"role": "assistant", "content": msg.content})
    
    if len(serializable_history) > 20:
        serializable_history = serializable_history[-10:]
    
    with open(HISTORY_FILE, "w") as f:
        json.dump(serializable_history, f, indent=2)

def process_message(user_message):
    """Process a message using global conversation history"""
    client = initialize_sam()
    
    conversation_history = load_conversation_history()
    
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
