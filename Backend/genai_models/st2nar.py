import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from markitdown import MarkItDown

def convert_story_to_comic(story_text):
    """Convert prose story to comic book format."""
    client = ChatCompletionsClient(
        endpoint="https://models.inference.ai.azure.com",
        credential=AzureKeyCredential(os.environ["GITHUB_TOKEN"])
    )
    
    system_prompt = """
You are a comic book script creator that converts prose stories into detailed comic book format markdown.
Follow these exact rules when converting stories:

1. Divide the story into pages using markdown headers: ## Page 1, ## Page 2, etc.
2. Pages should have 1-4 panels, depending on the scene's importance:
   - Use a single panel for an entire page to emphasize heroic, iconic, or very important moments
   - Use 2-4 panels for regular storytelling where multiple scenes flow together
3. Label panels with: ### Panel 1, ### Panel 2, etc.
4. Each panel must contain maximum 3 dialogue lines.
5. IMPORTANT: Each panel should contain only ONE narration block if it has dialogues, else only 2.
6. If a conversation continues beyond 3 dialogue exchanges, move to a new panel.
7. Use visual language in narration that suggests what should be drawn in the panel.
8. For dramatic moments (revelations, plot twists, action climaxes), use a single full-page panel.
9. IMPORTANT: Do not include phrases like "A full-page panel" in your panel descriptions. Just describe the scene directly.
10. IMPORTANT: Do not include any parenthetical descriptions after character names like "(off-panel)" or "(shouting)".
11. IMPORTANT: Include all character actions as part of the narration, not as separate italicized lines.
12. IMPORTANT: Do not use any markdown formatting (asterisks, italics, etc.) inside narration text.

Format each panel like this:
### Panel X  
[Description of the visual scene in square brackets]

**Narration**: Brief narration text.

**Character Name:** "Dialogue line"  
**Another Character:** "Response dialogue"

---

Create proper page breaks between pages.
IMPORTANT: Do NOT wrap your response in ```markdown code blocks```. Just provide the raw markdown content directly.
"""
    
    try:
        response = client.complete(
            messages=[
                SystemMessage(system_prompt),
                UserMessage(f"Convert this story into comic book markdown format:\n\n{story_text}")
            ],
            model="gpt-4o",
            temperature=0.7,
            max_tokens=4096
        )
        
        content = response.choices[0].message.content
        
        if content.startswith("```markdown"):
            content = content.replace("```markdown", "", 1)
        if content.startswith("```"):
            content = content.replace("```", "", 1)
        if content.endswith("```"):
            content = content[:-3]
            
        content = content.strip()
        
        return content
    except Exception as e:
        return f"Error converting story to comic format: {str(e)}"

def write_file(file_path, content):
    """Write content to a file."""
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Comic script successfully created at: {file_path}")

if __name__ == "__main__":
    input_file = "test_2.txt"  
    output_file = "test_2_comic.md"
    
    md = MarkItDown()
    result = md.convert(input_file)
    story_text = result.text_content
    
    print("Converting story to comic format...")
    comic_markdown = convert_story_to_comic(story_text)
    
    print(f"Writing comic script to: {output_file}")
    write_file(output_file, comic_markdown)
