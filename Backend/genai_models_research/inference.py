import ast
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

def parse_direct_from_json(json_file, page_number, panel_number):
    """
    Parse dialogues and narrations directly from the JSON comic file for a specific page/panel.
    
    Args:
        json_file: Path to the JSON file
        page_number: Page number to extract (1-indexed)
        panel_number: Panel number to extract (1-indexed)
        
    Returns: 
        Tuple of (entries_list, scene_description)
        - entries_list: List of dicts with keys {type, character, text, sequence_position}
        - scene_description: Scene description from the panel
    """
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            comic_data = json.load(f)
        
        print(f"\nReading JSON file: {json_file}")
        
        page_data = None
        for page in comic_data.get('pages', []):
            if page.get('page_number') == page_number:
                page_data = page
                break
        
        if not page_data:
            print(f"Could not find Page {page_number} in JSON file")
            return [], ""
        
        panel_data = None
        for panel in page_data.get('panels', []):
            if panel.get('panel_number') == panel_number:
                panel_data = panel
                break
        
        if not panel_data:
            print(f"Could not find Panel {panel_number} in Page {page_number}")
            return [], ""
        
        print(f"Found panel {panel_number} data")
        
        scene_description = panel_data.get('scene_description', '')
        print(f"Extracted scene description: {scene_description[:100]}...")
        
        entries = []
        seq = 0
        
        for narration in panel_data.get('narrations', []):
            entries.append({
                'type': 'narration',
                'character': None,
                'text': narration,
                'sequence_position': seq
            })
            seq += 1
            print(f"Added narration: {narration[:50]}...")
        
        for dialogue in panel_data.get('dialogues', []):
            character = dialogue.get('character', '')
            text = dialogue.get('text', '')
            entries.append({
                'type': 'dialogue',
                'character': character,
                'text': text,
                'sequence_position': seq
            })
            seq += 1
            print(f"Added dialogue: {character}: {text[:50]}...")
        
        print(f"Total entries parsed: {len(entries)} ({sum(1 for e in entries if e['type']=='narration')} narrations, {sum(1 for e in entries if e['type']=='dialogue')} dialogues)")
        
        return entries, scene_description
        
    except FileNotFoundError:
        print(f"JSON file not found: {json_file}")
        return [], ""
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file: {e}")
        return [], ""
    except Exception as e:
        print(f"Error in parse_direct_from_json: {e}")
        traceback.print_exc()
        return [], ""

def generate_detection_prompts_mega(page_number, json_file, character_descriptions):
    """
    Generate detection prompts for ALL panels in a page with ONE LLM call (mega prompt approach).
    
    Args:
        page_number: Page number to process
        json_file: Path to JSON file with panel data
        character_descriptions: Dictionary of character descriptions
        
    Returns:
        Dictionary mapping panel numbers to detection prompt dictionaries
        Format: {panel_num: {character_name: detection_prompt}}
    """
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            comic_data = json.load(f)
        
        page_data = None
        for page in comic_data.get('pages', []):
            if page.get('page_number') == page_number:
                page_data = page
                break
        
        if not page_data:
            print(f"Page {page_number} not found in JSON")
            return {}
        
        panels_info = []
        for panel in page_data.get('panels', []):
            panel_num = panel.get('panel_number')
            scene_description = panel.get('scene_description', '')
            
            speaking_chars = []
            for dialogue in panel.get('dialogues', []):
                char = dialogue.get('character', '').strip(':')
                if char and char.lower() != 'narration':
                    speaking_chars.append(char)
            
            if speaking_chars:
                panels_info.append({
                    'panel': panel_num,
                    'scene': scene_description,
                    'speaking_characters': speaking_chars
                })
        
        if not panels_info:
            print("No panels with dialogues found")
            return {}
        
        client = genai.Client(
            api_key=os.environ["GEMINI_KEY"],
        )
        
        all_chars = set()
        for panel_info in panels_info:
            all_chars.update(panel_info['speaking_characters'])
        
        char_descriptions_section = "CHARACTER DESCRIPTIONS:\n"
        for char_name in all_chars:
            desc = character_descriptions.get(char_name, {}).get('main', '')
            if not desc:
                desc = character_descriptions.get(char_name, {}).get('base', '')
            char_descriptions_section += f"\n{char_name}:\n{desc}\n"
        
        panels_section = ""
        for i, panel_info in enumerate(panels_info, 1):
            panels_section += f"\nPanel {panel_info['panel']}:\n"
            panels_section += f"Scene: {panel_info['scene']}\n"
            panels_section += f"Speaking: {', '.join(panel_info['speaking_characters'])}\n"
        
        mega_prompt = f"""Generate visual detection prompts for ALL speaking characters across ALL panels in this page.

{char_descriptions_section}

PANELS TO PROCESS:
{panels_section}

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

OUTPUT FORMAT (JSON):
{{
  "1": {{
    "Character1": "detection prompt",
    "Character2": "detection prompt"
  }},
  "2": {{
    "Character3": "detection prompt"
  }}
}}

Return detection prompts for ALL {len(panels_info)} panels."""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=mega_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
                max_output_tokens=16384
            )
        )
        
        response_text = response.text
        print(f"\n✓ MEGA Detection Prompts Generated ({len(response_text)} chars)")
        
        detection_data = json.loads(response_text)
        
        result = {}
        for panel_key, prompts in detection_data.items():
            panel_num = int(panel_key)
            result[panel_num] = prompts
        
        print(f"✓ Detection prompts ready for {len(result)} panels")
        return result
        
    except Exception as e:
        print(f"Error in mega detection prompt generation: {e}")
        traceback.print_exc()
        return {}

def process_comic_page(markdown_file, page_number, api_key, style, panel_dimensions, guidance_scale, inference_steps,
                      bubble_color=(255, 255, 255), text_color=(0, 0, 0),
                      narration_bg_color=(0, 0, 0), narration_text_color=(255, 255, 255), font_path=None, seed=9, 
                      poster_format="iconic_hero"):
    """
    Generate comic page and add speech bubbles to each panel.
    
    Args:
        markdown_file: Path to the markdown file with comic content (will also check for JSON)
        page_number: Page number to process (0 for poster, 1+ for comic pages)
        api_key: API key for character detection
        style: Comic style for image generation
        panel_dimensions: List of panel dimensions (width, height) for each panel (ignored for page 0)
        guidance_scale: Guidance scale for image generation
        inference_steps: Number of inference steps
        bubble_color: RGB tuple for speech bubble background color
        text_color: RGB tuple for speech bubble text color
        narration_bg_color: RGB tuple for narration background color
        narration_text_color: RGB tuple for narration text color
        font_path: Path to the font file to use
        seed: Seed for image generation
        poster_format: Poster format for page 0: 'iconic_hero', 'dynamic_ensemble', 'focal_point', 
                      'relationship_two_shot', 'tapestry_collage'
    """
    print(f"Processing page {page_number} from {markdown_file}")
    
    if page_number == 0:
        print(f"Poster format: {poster_format}")
        print(f"Poster dimensions: 832x1216 (WxH, 2:3 ratio)")
    else:
        print(f"Using colors - Bubble: {bubble_color}, Text: {text_color}, Narration BG: {narration_bg_color}, Narration Text: {narration_text_color}")
    
    json_file = markdown_file.replace('.md', '.json')
    
    if not os.path.exists(json_file):
        print(f"ERROR: JSON file not found: {json_file}")
        print(f"Please generate the JSON file first using st2nar.py or nar2nar.py")
        return
    
    print(f"Using JSON file: {json_file}")
    
    settings = {
        "markdown_file": markdown_file,
        "page_number": page_number,
        "style": style,
        "negative_prompt": "photorealistic, realistic, photo, 3d render, photography, photographic, hyperrealistic, low quality, bad anatomy, worst quality, low resolution, text, words, speech, dialogue, speech bubble, bubble",
        "seed": seed,
        "randomize_seed": False,
        "width": 768,
        "height": 1024,
        "panel_dimensions": panel_dimensions,
        "guidance_scale": guidance_scale,
        "num_inference_steps": inference_steps,
        "poster_format": poster_format  
    }
    
    panel_images = generate_comic_images_for_page(settings)
    
    if not panel_images:
        print(f"No panels generated for page {page_number}")
        return
    
    if page_number == 0:
        print(f"\\n✓ Poster generation complete!")
        print(f"Output: {panel_images[0]['image']}")
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
    
    print(f"\n{'='*60}")
    print(f"GENERATING DETECTION PROMPTS FOR ENTIRE PAGE {page_number}")
    print(f"{'='*60}")
    all_detection_prompts = generate_detection_prompts_mega(page_number, json_file, character_descriptions)
    print(f"✓ Detection prompts generated for {len(all_detection_prompts)} panels in ONE API call")
    print(f"{'='*60}\n")
    
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
        
        all_content, scene_description = parse_direct_from_json(json_file, page_number, panel_num)
        
        if all_content:
            panel_dialogues = []
            narrations = []
            
            for item in all_content:
                item_type = item.get('type', 'dialogue')
                if item_type == 'narration' or (item.get('character') and item['character'].lower() == "narration"):
                    narrations.append({
                        'text': item['text'],
                        'sequence_position': item.get('sequence_position', 0)
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
        
        detection_prompts = all_detection_prompts.get(panel_num, {})
        if not detection_prompts:
            print(f"⚠ No pre-generated detection prompts for panel {panel_num}, generating on-demand...")
            
        else:
            print(f"✓ Using pre-generated detection prompts for panel {panel_num}: {detection_prompts}")
        
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
                font_path=font_path,
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
    
    font_mapping = {
        "anime": "fonts/font1reg.ttf",
        "manga": "fonts/font2t.ttf", 
        "comic": "fonts/font3.ttf",
        "handwritten": "fonts/font4.ttf",
        "cute": "fonts/font5.ttf"
    }

    theme = "default"  # Options: default, sepia, noir, modern
    font_style = "anime"  # Options: anime, manga, comic, handwritten, cute
    seed = 102904
    
    poster_format = "tapestry_collage"  # Options: iconic_hero, dynamic_ensemble, focal_point, relationship_two_shot, tapestry_collage

    theme_map = {
        "default": default_colors,
        "sepia": sepia_colors,
        "noir": noir_colors,
        "modern": modern_colors,    
    }

    if theme.lower() not in theme_map:
        print(f"Unknown theme '{theme}', falling back to default")
        colors = default_colors
    else:
        colors = theme_map[theme.lower()]
    print(f"Using theme '{theme}': {colors}")
    
    font_path = font_mapping.get(font_style, "fonts/font1reg.ttf")
    
    
    process_comic_page(
        markdown_file="test_4.md", 
        page_number=0,  # 0 = poster, 1+ = comic panels
        api_key=api_key,
        style="anime",
        panel_dimensions=[
            (1216, 832),
            (768, 1344),
            (768, 1344),
            (1216, 832),
        ],
        guidance_scale=7.5,
        inference_steps=40,
        bubble_color=colors["bubble_color"],
        text_color=colors["text_color"],
        narration_bg_color=colors["narration_bg_color"],
        narration_text_color=colors["narration_text_color"],
        font_path=font_path,
        seed=seed,
        poster_format=poster_format
    )