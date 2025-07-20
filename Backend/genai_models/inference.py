import os
import json
import sys
import shutil
import traceback
import re

from image_batch import generate_comic_images_for_page, extract_panel_content
from speech_bubble import SpeechBubbleGenerator
from google import genai
from google.genai import types

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
        Tuple: (dialogues_list, scene_description)
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
            return [], ""
            
        page_content = page_match.group(1)
        print(f"Found page {page_number} content (first 100 chars): {page_content[:100]}...")
        
        panel_pattern = rf"### Panel {panel_number}\s*\n(.*?)(?:(?:### Panel \d+)|(?:---)|(?:\Z))"
        panel_match = re.search(panel_pattern, page_content, re.DOTALL)
        
        if not panel_match:
            print(f"Could not find Panel {panel_number} in Page {page_number}")
            return [], ""
            
        panel_content = panel_match.group(1).strip()
        print(f"Found panel {panel_number} content: \n{panel_content}")
        
        scene_description = ""
        scene_pattern = r"\[(.*?)\]"
        scene_matches = re.findall(scene_pattern, panel_content)
        if scene_matches:
            scene_description = " ".join(scene_matches)
            print(f"Extracted scene description: {scene_description}")
        
        result = []
        
        narration_pattern = r"\*\*Narration\*\*:\s*(.*?)(?=\n\*\*|\n\n|\Z)"
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
        
        dialogue_pattern = r"\*\*([^*:]+)\*\*:\s*(.*?)(?=\n\*\*|\n\n|\Z)"
        for dialogue_match in re.finditer(dialogue_pattern, panel_content, re.DOTALL):
            char_name = dialogue_match.group(1).strip()
            dialogue_text = dialogue_match.group(2).strip()
            
            if dialogue_text.startswith('"') and dialogue_text.endswith('"'):
                dialogue_text = dialogue_text[1:-1]
            
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
            print("\nAttempting line-by-line dialogue extraction:")
            lines = panel_content.split('\n')
            sequence_position = 0
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                if "**Narration**:" in line:
                    try:
                        narr_text = line.split("**Narration**:")[1].strip()
                        if narr_text:
                            result.append({
                                'character': 'Narration',
                                'text': narr_text,
                                'sequence_position': sequence_position,
                                'type': 'narration'
                            })
                            print(f"Line-by-line extracted narration: {narr_text[:30]}...")
                    except Exception as e:
                        print(f"Error extracting narration: {e}")
                
                elif "**" in line and ":" in line:
                    try:
                        char_start = line.find("**") + 2
                        char_end = line.find("**", char_start)
                        if char_end == -1:
                            continue
                            
                        char_name = line[char_start:char_end].strip()
                        
                        colon_pos = line.find(":", char_end)
                        if colon_pos == -1:
                            continue
                            
                        dialogue_text = line[colon_pos + 1:].strip()
                        
                        if dialogue_text.startswith('"') and dialogue_text.endswith('"'):
                            dialogue_text = dialogue_text[1:-1]
                        
                        if char_name.lower() != "narration" and dialogue_text:
                            result.append({
                                'character': char_name,
                                'text': dialogue_text,
                                'sequence_position': sequence_position,
                                'type': 'dialogue'
                            })
                            print(f"Line-by-line extracted: {char_name}: \"{dialogue_text[:30]}...\"")
                    except Exception as e:
                        print(f"Error in line-by-line extraction: {e}")
                        continue
                
                sequence_position += 10  
        
        result.sort(key=lambda x: x.get('sequence_position', 0))
        
        print(f"Direct parsing found {len(result)} entries in panel {panel_number} in sequence order:")
        for i, item in enumerate(result):
            item_type = item.get('type', 'unknown')
            print(f"  {i+1}. [{item_type}] {item['character']}: {item['text'][:30]}...")
        
        return result, scene_description
        
    except Exception as e:
        print(f"Error parsing markdown directly: {e}")
        traceback.print_exc()
        return [], ""

def generate_character_detection_prompts_llm(speaking_characters, scene_description, character_descriptions):
    """
    Use LLM to intelligently generate detection prompts based on who's speaking and who's in the scene.
    
    Args:
        speaking_characters: List of character names who are speaking
        scene_description: Description of the scene to find all characters present
        character_descriptions: Dictionary of character descriptions
    
    Returns:
        Dictionary mapping character names to detection prompts
    """
    try:
        client = genai.Client(
            api_key=os.environ["GEMINI_KEY"],
        )
        
        char_descriptions = {}
        for name in speaking_characters:
            clean_name = name.strip(':')
            description = character_descriptions.get(clean_name, {}).get('base', '')
            if not description:
                description = character_descriptions.get(name, {}).get('base', '')
            char_descriptions[name] = description
        
        user_prompt = f"""Analyze this comic panel to generate visual detection prompts for ALL speaking characters/entities.

SCENE DESCRIPTION: {scene_description}

SPEAKING CHARACTERS: {speaking_characters}

CHARACTER DESCRIPTIONS:
{json.dumps(char_descriptions, indent=2)}

TASK: Generate detection prompts for ALL speaking characters/entities that are physically present in the scene.

INSTRUCTIONS:
1. Analyze the scene description to understand what/who is present and speaking
2. For HUMAN/LIVING characters: use "head" detection (e.g., "woman's head", "man's head")
3. For NON-LIVING speakers (radio, computer, AI, device): use object detection (e.g., "radio", "computer screen", "device")
4. For VOICE-OVER or OFF-SCREEN speakers with no physical presence: return "NOT_VISIBLE"
5. If multiple people are in scene, make human prompts DISTINCTIVE (hair color, age, gender)
6. Each prompt should be 1-4 words describing the visual element to detect
7. NEVER use character names in prompts - only visual descriptions
8. Consider what's actually visible in the scene based on the description

EXAMPLES:
- "Cross leans on Kara" + Cross speaking → "elderly man's head" (distinctive from Kara)
- "Radio (V.O.)" speaking + "radio rig" in scene → "radio" or "radio device"
- "Computer AI" speaking + computer visible → "computer screen" or "monitor"
- "Narrator" speaking but no narrator visible → "NOT_VISIBLE"
- "Kara at radio" + Radio speaking → "radio equipment"

RESPONSE FORMAT: Return ONLY JSON with speaking character names as keys:
{{
  "Character1": "visual detection prompt" OR "NOT_VISIBLE",
  "Character2": "another detection prompt" OR "NOT_VISIBLE"
}}
"""
        
        model = "gemini-2.5-flash"
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=user_prompt),
                ],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1,
            max_output_tokens=65536
        )

        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config,
        )
        
        response_text = response.candidates[0].content.parts[0].text
        print(f"\nLLM Raw Response for detection prompts: {response_text}")
        
        detection_prompts = json.loads(response_text)
        
        visible_prompts = {}
        for char_name, prompt in detection_prompts.items():
            if prompt != "NOT_VISIBLE":
                visible_prompts[char_name] = prompt
        
        print(f"Final LLM-generated detection prompts (visible only): {visible_prompts}")
        return visible_prompts
        
    except Exception as e:
        print(f"Error generating detection prompts with LLM: {e}")
        traceback.print_exc()
        return {}

def generate_character_detection_prompts(panel_info, character_descriptions, scene_description=""):
    """
    Generate character detection prompts based on panel content and character descriptions.
    
    Args:
        panel_info: Dictionary with panel content
        character_descriptions: Dictionary with character descriptions
        scene_description: Scene description from square brackets
        
    Returns:
        Dictionary mapping character names to detection prompts
    """
    if not panel_info.get('dialogues'):
        print("No dialogues found in panel_info")
        return {}
        
    dialogues = panel_info.get('dialogues', [])
    
    speaking_characters = []
    for dialogue in dialogues:
        if dialogue['character'].lower() != "narration":
            char_name = dialogue['character']
            if char_name.endswith(':'):
                char_name = char_name[:-1]
            speaking_characters.append(char_name)
    
    print(f"\nAnalyzing panel for characters:")
    print(f"  Speaking characters: {speaking_characters}")
    
    characters_in_scene = []
    for char_name in character_descriptions.keys():
        if char_name.lower() in scene_description.lower():
            characters_in_scene.append(char_name)
    
    print(f"  Characters in scene description: {characters_in_scene}")
    
    all_characters_to_detect = list(set(speaking_characters))
    print(f"  All characters to detect: {all_characters_to_detect}")
    print(f"  Scene description: {scene_description[:100]}...")
    
    if not speaking_characters:
        print("No characters found in panel")
        return {}
    
    return generate_character_detection_prompts_llm(speaking_characters, scene_description, character_descriptions)

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
        
        all_content, scene_description = parse_direct_from_markdown(markdown_file, page_number, panel_num)
        
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
            scene_description = ""
            
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
        
        detection_prompts = generate_character_detection_prompts(
            {"dialogues": panel_dialogues}, 
            character_descriptions, 
            scene_description
        )
        print(f"Generated detection prompts for panel {panel_num}: {detection_prompts}")
        
        dialogues = []
        
        for dialogue in panel_dialogues:
            char_name = dialogue['character']
            
            if char_name.lower() == "narration":
                continue
            
            clean_char_name = char_name.rstrip(':')
            
            if clean_char_name in detection_prompts:
                detection_prompt = detection_prompts[clean_char_name]
                print(f"Adding on-panel dialogue for '{char_name}' ({detection_prompt}): {dialogue.get('text', '')[:30]}...")
                dialogues.append({
                    'character_description': detection_prompt,
                    'text': dialogue.get('text', ''),
                    'character_name': clean_char_name  
                })
            else:
                print(f"Adding off-panel dialogue for '{char_name}': {dialogue.get('text', '')[:30]}...")
                dialogues.append({
                    'text': dialogue.get('text', ''),
                    'character_name': clean_char_name,
                    'is_off_panel': True
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
    
    api_key = os.environ["LANDING_API_KEY"]
    
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
        markdown_file="test_3_comic.md", 
        page_number=7, 
        api_key=api_key,
        style="Anime",
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