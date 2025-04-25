import os
import json
import sys
import shutil
import traceback
import re

from image_batch import generate_comic_images_for_page, extract_panel_content
from speech_bubble import SpeechBubbleGenerator
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

def parse_additional_dialogues(panel_content, panel_num):
    """
    Parse additional character dialogues from the panel content using regex.
    The extract_panel_content function doesn't seem to be getting all dialogues.
    
    Args:
        panel_content: Dictionary with panel content
        panel_num: Panel number
    
    Returns:
        List of additional dialogue dictionaries
    """
    panel_desc = panel_content.get('description', '')
    
    dialogue_pattern = r'([A-Z][a-zA-Z\s]+):\s+"([^"]+)"'
    
    matches = re.findall(dialogue_pattern, panel_desc)
    
    additional_dialogues = []
    for match in matches:
        character = match[0].strip()
        text = match[1].strip()
        
        is_duplicate = False
        for existing in panel_content.get('dialogues', []):
            if existing.get('character') == character and existing.get('text') == text:
                is_duplicate = True
                break
        
        if not is_duplicate:
            print(f"Found additional dialogue for panel {panel_num}: {character}: {text[:30]}...")
            additional_dialogues.append({
                'character': character,
                'text': text
            })
    
    return additional_dialogues

def parse_direct_from_markdown(markdown_file, page_number, panel_number):
    """
    Parse dialogues directly from the markdown file to catch ALL dialogues.
    This bypasses any limitations in the extract_panel_content function.
    
    Args:
        markdown_file: Path to the markdown file
        page_number: Page number to look for
        panel_number: Panel number to extract dialogues from
        
    Returns:
        List of dialogue dictionaries with sequence information
    """
    try:
        with open(markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        print(f"\nReading markdown file: {markdown_file}")
        print(f"File excerpt (first 200 chars): {content[:200]}...")
        
        page_pattern = rf"## Page {page_number}\s*\n(.*?)(?:## Page|\Z)"
        page_match = re.search(page_pattern, content, re.DOTALL)
        
        if not page_match:
            print(f"Could not find Page {page_number} in markdown file")
            return []
            
        page_content = page_match.group(1)
        print(f"Found page {page_number} content (first 100 chars): {page_content[:100]}...")
        
        panel_pattern = rf"### Panel {panel_number}\s*\n(.*?)(?:(?:---|\Z))"
        panel_match = re.search(panel_pattern, page_content, re.DOTALL)
        
        if not panel_match:
            print(f"Could not find Panel {panel_number} in Page {page_number}")
            return []
            
        panel_content = panel_match.group(1)
        print(f"Found panel {panel_number} content: \n{panel_content}")
        
        result = []
        
        narration_pattern = r"\*\*Narration\*\*:[ \t]*(.*?)(?:\n\n|\n\*\*|\Z)"
        for narration_match in re.finditer(narration_pattern, panel_content, re.DOTALL):
            narration_text = narration_match.group(1).strip()
            if narration_text:
                narration_start = narration_match.start()
                result.append({
                    'character': 'Narration',
                    'text': narration_text,
                    'sequence_position': narration_start,
                    'type': 'narration'
                })
                print(f"Added narration at position {narration_start}: {narration_text[:30]}...")
        
        dialogue_pattern = r"\*\*([^*:]+)\*\*:[ \t]*\"((?:[^\"\\]|\\.)*)\""
        for dialogue_match in re.finditer(dialogue_pattern, panel_content, re.DOTALL):
            char_name = dialogue_match.group(1).strip()
            dialogue_text = dialogue_match.group(2).strip()
            dialogue_start = dialogue_match.start()
            
            if char_name.lower() != "narration":
                result.append({
                    'character': char_name,
                    'text': dialogue_text,
                    'sequence_position': dialogue_start,
                    'type': 'dialogue'
                })
                print(f"Added dialogue at position {dialogue_start}: {char_name}: {dialogue_text[:30]}...")
        
        if not result:
            print("\nAttempting manual dialogue extraction:")
            manual_dialogues = []
            sequence_position = 0
            for line in panel_content.split('\n'):
                if "**Narration**:" in line:
                    try:
                        narr_text = line.split("**Narration**:")[1].strip()
                        if narr_text:
                            manual_dialogues.append({
                                'character': 'Narration',
                                'text': narr_text,
                                'sequence_position': sequence_position,
                                'type': 'narration'
                            })
                            print(f"Manually extracted narration: {narr_text[:30]}...")
                    except Exception as e:
                        print(f"Error extracting narration: {e}")
                elif "**" in line and ":" in line and "\"" in line:
                    try:
                        char_start = line.find("**") + 2
                        char_end = line.find("**", char_start)
                        char_name = line[char_start:char_end].strip()
                        
                        quote_start = line.find("\"")
                        quote_end = line.rfind("\"")
                        if quote_start != -1 and quote_end != -1 and quote_end > quote_start:
                            dialogue_text = line[quote_start+1:quote_end].strip()
                            
                            if char_name.lower() != "narration":
                                manual_dialogues.append({
                                    'character': char_name,
                                    'text': dialogue_text,
                                    'sequence_position': sequence_position,
                                    'type': 'dialogue'
                                })
                                print(f"Manually extracted: {char_name}: \"{dialogue_text[:30]}...\"")
                    except Exception as e:
                        print(f"Error in manual extraction: {e}")
                        continue
                sequence_position += 1
            
            if manual_dialogues:
                result = manual_dialogues
        
        result.sort(key=lambda x: x.get('sequence_position', 0))
        
        print(f"Direct parsing found {len(result)} entries in panel {panel_number} in sequence order:")
        for i, item in enumerate(result):
            item_type = item.get('type', 'unknown')
            print(f"  {i+1}. [{item_type}] {item['character']}: {item['text'][:30]}...")
        
        return result
        
    except Exception as e:
        print(f"Error parsing markdown directly: {e}")
        traceback.print_exc()
        return []

def generate_character_detection_prompts_llm(character_names, character_descriptions):
    """
    Use LLM to generate distinctive and visually descriptive detection prompts.
    
    Args:
        character_names: List of character names in the panel
        character_descriptions: Dictionary of character descriptions
    
    Returns:
        Dictionary mapping character names to detection prompts
    """
    if len(character_names) == 1:
        return {character_names[0]: "person's head"}
    
    try:
        client = ChatCompletionsClient(
            endpoint="https://models.inference.ai.azure.com",
            credential=AzureKeyCredential(os.environ.get("GITHUB_TOKEN")),
        )
        
        char_descriptions = {}
        for name in character_names:
            clean_name = name.strip(':')
            description = character_descriptions.get(clean_name, {}).get('base', '')
            if not description:
                description = character_descriptions.get(name, {}).get('base', '')
            char_descriptions[name] = description
        
        system_prompt = """You are an expert comic artist assistant that creates visual detection prompts for comic panels.
Your task is to create short, distinctive prompts that help identify different characters in a comic panel by their visual appearance.
"""

        user_prompt = f"""Create visual detection prompts for {len(character_names)} characters in a comic panel.

CHARACTERS AND DESCRIPTIONS:
{json.dumps(char_descriptions, indent=2)}

IMPORTANT GUIDELINES:
1. Each prompt must END with "head" (e.g., "blonde woman's head", "bearded man's head")
2. Each prompt must be VISUALLY DISTINCTIVE - focus on hair color, facial features, age, or distinctive accessories visible on the head/face
3. NEVER use character names in prompts
4. MAXIMUM 4 WORDS per prompt (not including "'s head")
5. Focus on MOST UNIQUE visual features to distinguish each character
6. NEVER use "first", "second", or "different" as these are not visual features
7. For clothing, mention ONLY if it's visible near the head (hat, hood, helmet, etc.)

RESPONSE FORMAT: Return ONLY a JSON object with character names as keys and prompts as values:
{{
  "Character1": "visual prompt head",
  "Character2": "another visual prompt head"
}}

VISUAL FEATURES TO PRIORITIZE (in order):
1. Hair color (blonde, redhead, brunette, gray-haired)
2. Facial features (bearded, glasses, eyepatch)
3. Age indicators (young, elderly)
4. Head accessories (hat, helmet, hood)
5. Gender + hair length (if distinctive)

EXAMPLES:
✓ GOOD: "blonde woman's head", "bearded man's head", "redhead's head", "helmeted warrior's head"
✗ BAD: "first man's head", "different person's head", "tall character's head"
"""
        
        response = client.complete(
            messages=[
                SystemMessage(system_prompt),
                UserMessage(user_prompt)
            ],
            model="Ministral-3B", 
            temperature=0.1,
            max_tokens=500
        )
        
        response_text = response.choices[0].message.content.strip()
        print(f"\nLLM Raw Response for detection prompts: {response_text}")
        
        try:
            detection_prompts = json.loads(response_text)
            
            if not all(isinstance(key, str) and isinstance(val, str) for key, val in detection_prompts.items()):
                raise ValueError("Invalid JSON structure")
                
        except Exception as e:
            print(f"Error parsing LLM response as JSON: {e}")
            
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if json_match:
                try:
                    detection_prompts = json.loads(json_match.group(1))
                except:
                    start = response_text.find('{')
                    end = response_text.rfind('}') + 1
                    if start >= 0 and end > start:
                        try:
                            detection_prompts = json.loads(response_text[start:end])
                        except:
                            print("All JSON extraction attempts failed.")
                            detection_prompts = {}
            else:
                print("No JSON block found in response.")
                detection_prompts = {}
        
        for name in character_names:
            if name not in detection_prompts:
                desc = char_descriptions.get(name, "").lower()
                if "woman" in desc or "female" in desc or "girl" in desc:
                    detection_prompts[name] = "woman's head"
                elif "man" in desc or "male" in desc or "boy" in desc:
                    detection_prompts[name] = "man's head"
                else:
                    detection_prompts[name] = "person's head"
            
            if not detection_prompts[name].lower().endswith("head"):
                detection_prompts[name] = detection_prompts[name] + "'s head"
        
        used_prompts = set()
        for name in character_names:
            prompt = detection_prompts[name]
            if prompt in used_prompts:
                desc = char_descriptions.get(name, "").lower()
                if "blonde" in desc or "blond" in desc:
                    detection_prompts[name] = "blonde's head"
                elif "red" in desc and "hair" in desc:
                    detection_prompts[name] = "redhead's head"
                elif "black" in desc and "hair" in desc:
                    detection_prompts[name] = "black-haired's head"
                elif "brown" in desc and "hair" in desc:
                    detection_prompts[name] = "brown-haired's head"
                else:
                    detection_prompts[name] = "another person's head"
            
            used_prompts.add(detection_prompts[name])
        
        print(f"Final LLM-generated detection prompts: {detection_prompts}")
        return detection_prompts
        
    except Exception as e:
        print(f"Error generating detection prompts with LLM: {e}")
        traceback.print_exc()
        
        prompts = {}
        for i, name in enumerate(character_names):
            if i == 0:
                prompts[name] = "person's head"
            else:
                prompts[name] = f"character {i+1}'s head"
        return prompts

def generate_character_detection_prompts(panel_info, character_descriptions):
    """
    Generate character detection prompts based on panel content and character descriptions.
    
    Args:
        panel_info: Dictionary with panel content
        character_descriptions: Dictionary with character descriptions
        
    Returns:
        Dictionary mapping character names to detection prompts
    """
    if not panel_info.get('dialogues'):
        print("No dialogues found in panel_info")
        return {}
        
    dialogues = panel_info.get('dialogues', [])
    
    character_names = []
    for dialogue in dialogues:
        if dialogue['character'].lower() != "narration":
            char_name = dialogue['character']
            if char_name.endswith(':'):
                char_name = char_name[:-1]
            character_names.append(char_name)
    
    print(f"\nFound {len(character_names)} characters in panel: {character_names}")
    
    if not character_names:
        print("WARNING: No character names found in dialogues!")
        return {}
    
    return generate_character_detection_prompts_llm(character_names, character_descriptions)

def process_comic_page(markdown_file, page_number, api_key, style, panel_dimensions, guidance_scale, inference_steps,
                      bubble_color=(255, 255, 255), text_color=(0, 0, 0),
                      narration_bg_color=(0, 0, 0), narration_text_color=(255, 255, 255)):
    """
    Generate comic page and add speech bubbles to each panel.
    
    Args:
        markdown_file: Path to the markdown file with comic content
        page_number: Page number to process
        api_key: API key for character detection
        style: Comic style for image generation
        panel_dimensions: List of panel dimensions (width, height) for each panel
        guidance_scale: Guidance scale for image generation
        inference_steps: Number of inference steps
        bubble_color: RGB tuple for speech bubble background color
        text_color: RGB tuple for speech bubble text color
        narration_bg_color: RGB tuple for narration background color
        narration_text_color: RGB tuple for narration text color
    """
    print(f"Processing page {page_number} from {markdown_file}")
    print(f"Using colors - Bubble: {bubble_color}, Text: {text_color}, Narration BG: {narration_bg_color}, Narration Text: {narration_text_color}")
    
    settings = {
        "markdown_file": markdown_file,
        "page_number": page_number,
        "style": style,
        "negative_prompt": "photorealistic, realistic, photo, 3d render, photography, photographic, hyperrealistic, low quality, bad anatomy, worst quality, low resolution, text, words, speech, dialogue, speech bubble, bubble",
        "seed": 9,
        "randomize_seed": False,
        "width": 768,
        "height": 1024,
        "panel_dimensions": panel_dimensions,
        "guidance_scale": guidance_scale,
        "num_inference_steps": inference_steps
    }
    
    panel_images = generate_comic_images_for_page(settings)
    
    if not panel_images:
        print(f"No panels generated for page {page_number}")
        return
    
    base_name = os.path.basename(markdown_file).split('.')[0]
    char_desc_path = os.path.join('output', "character_descriptions.json")
    
    if (os.path.exists(char_desc_path)):
        with open(char_desc_path, 'r', encoding='utf-8') as f:
            character_descriptions = json.load(f)
        print(f"Loaded character descriptions for {len(character_descriptions)} characters")
    else:
        print("Warning: No character descriptions found")
        character_descriptions = {}
    
    comic_structure = extract_panel_content(markdown_file, page_number)
    if not comic_structure or len(comic_structure) == 0:
        print(f"Error: No content found for page {page_number}")
        return
    
    page = comic_structure[0]  
    
    output_dir = os.path.join('output', f"{base_name}_page_{page_number}_with_bubbles")
    os.makedirs(output_dir, exist_ok=True)
    
    for panel in panel_images:
        panel_num = panel['panel']
        panel_image_path = panel['path']
        
        panel_content = None
        for p in page['panels']:
            if p['panel_number'] == panel_num:
                panel_content = p
                break
        
        if not panel_content:
            print(f"Warning: No content found for panel {panel_num}")
            continue
        
        all_content = parse_direct_from_markdown(markdown_file, page_number, panel_num)
        
        if all_content:
            panel_dialogues = []
            narrations = []
            
            for item in all_content:
                if item['character'].lower() == "narration":
                    narrations.append({
                        'text': item['text'],
                        'sequence_position': item['sequence_position']
                    })
                else:
                    panel_dialogues.append(item)
        else:
            print(f"WARNING: No content found through direct parsing for panel {panel_num}!")
            panel_dialogues = panel_content.get('dialogues', [])
            narrations = []
            
            for dialogue in panel_dialogues:
                if dialogue['character'].lower() == "narration":
                    narrations.append({
                        'text': dialogue['text'],
                        'sequence_position': 0
                    })
                    panel_dialogues.remove(dialogue)
        
        print(f"\nPanel {panel_num} dialogues: {len(panel_dialogues)}")
        for i, dialogue in enumerate(panel_dialogues):
            print(f"  {i+1}. {dialogue.get('character', 'Unknown')}: {dialogue.get('text', '')[:30]}...")
        
        print(f"\nPanel {panel_num} narrations: {len(narrations)}")
        for i, narration in enumerate(narrations):
            print(f"  {i+1}. {narration['text'][:30]}...")
        
        detection_prompts = generate_character_detection_prompts({"dialogues": panel_dialogues}, character_descriptions)
        print(f"Generated detection prompts for panel {panel_num}: {detection_prompts}")
        
        dialogues = []
        
        for dialogue in panel_dialogues:
            char_name = dialogue['character']
            
            if char_name.lower() == "narration":
                continue
            
            clean_char_name = char_name.rstrip(':')
            
            detection_prompt = detection_prompts.get(clean_char_name, "person's head")
            if clean_char_name != char_name and clean_char_name not in detection_prompts:
                detection_prompt = detection_prompts.get(char_name, "person's head")
            
            text = dialogue.get('text', '')
            if text:
                print(f"Adding dialogue for '{char_name}' ({detection_prompt}): {text[:30]}...")
                dialogues.append({
                    'character_description': detection_prompt,
                    'text': text,
                    'character_name': clean_char_name  
                })
        
        top_narration = None
        bottom_narration = None
        
        if narrations:
            narrations.sort(key=lambda x: x.get('sequence_position', 0))
            
            if len(narrations) == 1:
                if not panel_dialogues:
                    top_narration = narrations[0]['text']
                else:
                    first_dialogue_pos = min(d.get('sequence_position', float('inf')) for d in panel_dialogues)
                    if narrations[0]['sequence_position'] < first_dialogue_pos:
                        top_narration = narrations[0]['text']
                    else:
                        bottom_narration = narrations[0]['text']
            else:
                top_narration = narrations[0]['text']
                bottom_narration = narrations[-1]['text']
        
        print(f"Panel {panel_num} narration placement:")
        print(f"  Top narration: {top_narration[:30]}..." if top_narration else "  No top narration")
        print(f"  Bottom narration: {bottom_narration[:30]}..." if bottom_narration else "  No bottom narration")
        
        try:
            generator = SpeechBubbleGenerator(
                panel_image_path, 
                api_key,
                bubble_color=bubble_color,
                text_color=text_color,
                narration_bg_color=narration_bg_color,
                narration_text_color=narration_text_color
            )
            result_image = generator.generate_speech_bubbles(
                dialogues, 
                top_narration=top_narration,
                bottom_narration=bottom_narration
            )
            
            output_path = os.path.join(output_dir, f"panel_{panel_num:02d}_with_bubbles.png")
            generator.save(output_path)
            print(f"Saved panel with speech bubbles to {output_path}")
            
            debug_path = panel_image_path.replace('.png', '_debug.png')
            if os.path.exists(debug_path):
                debug_output_path = os.path.join(output_dir, f"panel_{panel_num:02d}_debug.png")
                shutil.copy(debug_path, debug_output_path)
                print(f"Saved debug visualization to {debug_output_path}")
        except Exception as e:
            print(f"Error processing panel {panel_num}: {e}")
            traceback.print_exc()

if __name__ == "__main__":
    
    api_key = os.environ.get("LANDING_AI_API_KEY")
    
    default_colors = {
        "bubble_color": (255, 255, 255),  # White
        "text_color": (0, 0, 0),          # Black
        "narration_bg_color": (0, 0, 0),  # Black
        "narration_text_color": (255, 255, 255)  # White
    }
    
    sepia_colors = {
        "bubble_color": (245, 222, 179),  # Tan
        "text_color": (101, 67, 33),      # Brown
        "narration_bg_color": (101, 67, 33),  # Brown
        "narration_text_color": (255, 248, 220)  # Cream
    }
    
    noir_colors = {
        "bubble_color": (220, 220, 220),  # Light Gray
        "text_color": (0, 0, 0),          # Black
        "narration_bg_color": (0, 0, 0),  # Black
        "narration_text_color": (180, 180, 180)  # Gray
    }
    
    modern_colors = {
        "bubble_color": (230, 240, 250),  # Light Blue
        "text_color": (0, 51, 102),       # Dark Blue
        "narration_bg_color": (0, 51, 102),  # Dark Blue
        "narration_text_color": (230, 240, 250)  # Light Blue
    }
    
    colors = sepia_colors
    
    process_comic_page(
        markdown_file="test_2_comic.md", 
        page_number=3, 
        api_key=api_key,
        style="american comic (modern)",
        panel_dimensions=[
            (768, 1024),
            (768, 1024),
            (768, 1024)
        ],
        guidance_scale=7.5,
        inference_steps=40,
        bubble_color=colors["bubble_color"],
        text_color=colors["text_color"],
        narration_bg_color=colors["narration_bg_color"],
        narration_text_color=colors["narration_text_color"]
    )