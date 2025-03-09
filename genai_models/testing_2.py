import os
import sys
from openai import OpenAI
from markitdown import MarkItDown

def convert_formatted_to_comic(formatted_text):
    """
    Convert pre-formatted text with narration and dialogue into comic format with pages and panels
    Input format expected:
    narration text
    Character A: dialogue
    Character B: dialogue
    """
    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=os.environ["GITHUB_TOKEN"],
    )

    prompt = f"""
    Convert the following pre-formatted text (which already has narration and character dialogue) into a comic book format with pages and panels.
    Follow these formatting rules:

    1. Divide the story into pages using markdown headers: ## Page 1, ## Page 2, etc.
    2. Pages should have 1-4 panels, depending on the scene's importance:
       - Use a single panel for an entire page to emphasize heroic, iconic, or very important moments
       - Use 2-4 panels for regular storytelling where multiple scenes flow together
    3. Label panels with: ### Panel 1, ### Panel 2, etc.
    4. Each panel must contain maximum 3 dialogue lines.
    5. Format narration as regular paragraphs inside each panel.
    6. Format dialogue with character names and their lines as: **Character Name:** Their dialogue
    7. If a conversation continues beyond 3 dialogue exchanges, move to a new panel.
    8. Use visual language in narration that suggests what should be drawn in the panel.
    9. For dramatic moments (revelations, plot twists, action climaxes), use a single full-page panel.
    
    Note: The input is already formatted with narration paragraphs and character dialogues in the format "Character: dialogue".
    Your job is to organize this into the comic book page and panel structure while maintaining the original dialogue.

    Input text:
    {formatted_text}
    """

    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a comic book creation assistant that formats pre-structured narration and dialogue into comic book layouts with pages and panels.",
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="gpt-4o",
        temperature=0.7,
        max_tokens=4096,
        top_p=1
    )

    return response.choices[0].message.content

def process_formatted_file(file_path):
    """
    Process a file with pre-formatted narration and dialogue and convert it to comic format
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            formatted_text = file.read()
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        return None
    except Exception as e:
        print(f"Error reading file: {e}")
        return None
    
    comic_text = convert_formatted_to_comic(formatted_text)
    
    output_file = os.path.splitext(file_path)[0] + "_comic.md"
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(comic_text)
    
    print(f"Comic format saved to {output_file}")
    
    return comic_text

if __name__ == "__main__":
    input_file = "test_2.txt"
    
    result = process_formatted_file(input_file)
    