import os
import json
import sys
import re
import markdown
import bs4
from PIL import Image
import traceback
from image_batch import generate_comic_images_for_page, extract_panel_content
from speech_bubble import SpeechBubbleGenerator
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage
from azure.ai.inference.models import UserMessage
from azure.core.credentials import AzureKeyCredential

def extract_json_from_response(response_text):
    """Extract JSON from response text that might include markdown code blocks"""
    if "```json" in response_text:
        start_idx = response_text.find("```json") + 7
        end_idx = response_text.find("```", start_idx)
        if end_idx > start_idx:
            return response_text[start_idx:end_idx].strip()
    
    if "```" in response_text:
        start_idx = response_text.find("```") + 3
        end_idx = response_text.find("```", start_idx)
        if end_idx > start_idx:
            return response_text[start_idx:end_idx].strip()
    
    return response_text

def create_detection_prompt_with_llm(characters, page_num, panel_num):
    """
    Use Azure AI Inference to create concise character detection prompts that distinguish between characters 
    based on visual features
    """
    if len(characters) == 0:
        return []
    
    if len(characters) == 1:
        return [{"character": characters[0], "detection_prompt": "person's head"}]
    
    client = ChatCompletionsClient(
        endpoint="https://models.inference.ai.azure.com",
        credential=AzureKeyCredential(os.environ.get("GITHUB_TOKEN")),
    )
    
    prompt = f"""
    I need simple object detection prompts for {len(characters)} different characters in a comic panel.
    
    Characters: {", ".join(characters)}
    
    Create a SIMPLE detection prompt for each character that:
    1. Focuses ONLY on distinct visual features (hair color, facial features, etc)
    2. Is VERY brief (2-4 words maximum)
    3. Always ends with "'s head" to ensure face detection
    4. Can be distinguished from the other characters
    
    For example:
    - "blonde woman's head" 
    - "bearded man's head"
    - "red haired boy's head"
    
    Return a JSON array with this exact format:
    [
      {{"character": "Character1", "detection_prompt": "detection phrase for Character1"}},
      {{"character": "Character2", "detection_prompt": "detection phrase for Character2"}}
    ]
    """
    
    try:
        response = client.complete(
            messages=[
                SystemMessage("You create concise character detection prompts. IMPORTANT: Your response must be valid JSON format."),
                UserMessage(prompt)
            ],
            model="Meta-Llama-3.1-8B-Instruct",
            temperature=0.3,
            max_tokens=300
        )
        
        response_content = response.choices[0].message.content
        json_content = extract_json_from_response(response_content)
        result = json.loads(json_content)
        
        if isinstance(result, list):
            return result
        elif "prompts" in result:
            return result["prompts"]
        else:
            for key, value in result.items():
                if isinstance(value, list):
                    return value
            
            return [{"character": char, "detection_prompt": f"{char.lower()}'s head"} for char in characters]
    except Exception as e:
        print(f"Error creating detection prompts: {e}")
        traceback.print_exc()
        return [{"character": char, "detection_prompt": f"{char.lower()}'s head"} for char in characters]

def get_dialogue_characters_from_panel_data(panel_data_file, page_num, panel_num):
    """
    Read the panel_data.txt file to determine on-panel and off-panel characters
    
    IMPORTANT FIX:
    - Lines with "  - Character:" are on-panel
    - Lines without "  - " prefix (except narration) are off-panel
    """
    on_panel_characters = set()
    off_panel_characters = set()
    
    try:
        with open(panel_data_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        pattern = fr"Page {page_num}, Panel {panel_num}:[\s\S]*?(?=Page \d+, Panel \d+:|$)"
        panel_match = re.search(pattern, content)
        
        if panel_match:
            panel_text = panel_match.group(0)
            panel_lines = panel_text.split('\n')
            
            dialogues_started = False
            for line in panel_lines:
                line = line.strip()
                
                if line.startswith('Dialogues:'):
                    dialogues_started = True
                    continue
                    
                if not dialogues_started:
                    continue
                
                if not line:
                    continue
                    
                if 'Narration:' in line:
                    continue
                    
                if line.startswith('  - '):
                    if ':' in line:
                        char_name = line[line.find('-') + 1:line.find(':')].strip()
                        on_panel_characters.add(char_name)
                        print(f"ON-PANEL character from panel data: {char_name}")
                elif ':' in line:
                    char_name = line[:line.find(':')].strip()
                    off_panel_characters.add(char_name)
                    print(f"OFF-PANEL character from panel data: {char_name}")
        
    except Exception as e:
        print(f"Error reading panel_data.txt: {e}")
        traceback.print_exc()
    
    return on_panel_characters, off_panel_characters

def get_panel_data_file(markdown_file, page_number):
    """Get the path to the panel data file for the specified page"""
    base_name = os.path.basename(markdown_file).split('.')[0]
    return os.path.join('output', f"{base_name}_page_{page_number}", 'panel_data.txt')

def parse_panel_dialogues(panel_data, on_panel_characters, off_panel_characters):
    """
    Parse the panel data to separate on-panel and off-panel dialogues
    based on the characters identified in panel_data.txt
    """
    on_panel_dialogues = []
    off_panel_dialogues = []
    
    all_dialogues = panel_data.get('dialogues', [])
    
    for dialogue in all_dialogues:
        character = dialogue.get('character', '')
        text = dialogue.get('text', '')
        
        if character == 'Narration':
            continue
            
        if character in on_panel_characters:
            print(f"Adding ON-PANEL dialogue for {character}")
            on_panel_dialogues.append({
                'character': character,
                'text': text
            })
        elif character in off_panel_characters or dialogue.get('is_off_panel', False):
            print(f"Adding OFF-PANEL dialogue for {character}")
            off_panel_dialogues.append({
                'character': character,
                'text': text
            })
        else:
            print(f"Adding DEFAULT OFF-PANEL dialogue for {character} (not found in panel data)")
            off_panel_dialogues.append({
                'character': character,
                'text': text
            })
    
    return on_panel_dialogues, off_panel_dialogues

def extract_actual_narration_from_markdown(markdown_file, page_num, panel_num):
    """
    Extract the actual narration text directly from the markdown file,
    looking specifically for text with **Narration**: prefix
    
    FIXED: Better regex pattern to handle different markdown formatting
    """
    try:
        with open(markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        page_pattern = fr"## Page {page_num}.*?(?=## Page|$)"
        page_match = re.search(page_pattern, content, re.DOTALL)
        
        if not page_match:
            print(f"Page {page_num} section not found in markdown")
            return None
            
        page_text = page_match.group(0)
        
        panel_pattern = fr"### Panel {panel_num}.*?(?=### Panel|$|---)"
        panel_match = re.search(panel_pattern, page_text, re.DOTALL)
        
        if not panel_match:
            print(f"Panel {panel_num} section not found in Page {page_num}")
            return None
            
        panel_text = panel_match.group(0)
        
        narration_pattern = r"\*\*Narration\*\*:\s*(.*?)(?=\n\s*\*\*|\Z)"
        narration_match = re.search(narration_pattern, panel_text, re.DOTALL)
        
        if narration_match:
            narration = narration_match.group(1).strip()
            print(f"Found narration in markdown: {narration[:50]}...")
            return narration
        
        print(f"No narration found in markdown for Page {page_num}, Panel {panel_num}")
        return None
        
    except Exception as e:
        print(f"Error extracting narration from markdown: {e}")
        traceback.print_exc()
        return None

def get_narration_from_panel_data(panel_data_file, page_num, panel_num):
    """
    Extract narration from panel_data.txt file as a backup method
    """
    try:
        with open(panel_data_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        pattern = fr"Page {page_num}, Panel {panel_num}:[\s\S]*?(?=Page \d+, Panel \d+:|$)"
        panel_match = re.search(pattern, content)
        
        if panel_match:
            panel_text = panel_match.group(0)
            
            narration_pattern = r"  - Narration: (.*?)(?=\n|$)"
            narration_match = re.search(narration_pattern, panel_text)
            
            if narration_match:
                narration = narration_match.group(1).strip()
                print(f"Found narration in panel_data: {narration[:50]}...")
                return narration
    
    except Exception as e:
        print(f"Error extracting narration from panel_data: {e}")
    
    return None

def apply_speech_bubbles_to_panels(images_data, markdown_file, page_number, api_key):
    """
    Apply speech bubbles to each panel image using the SpeechBubbleGenerator
    """
    results = []
    
    panel_data_file = get_panel_data_file(markdown_file, page_number)
    
    for panel in images_data:
        image_path = panel['path']
        page_num = panel['page']
        panel_num = panel['panel']
        
        print(f"\n{'='*30}")
        print(f"Processing Page {page_num}, Panel {panel_num}")
        print(f"{'='*30}")
        print(f"- Image path: {image_path}")
        
        actual_narration = extract_actual_narration_from_markdown(markdown_file, page_num, panel_num)
        
        if not actual_narration:
            actual_narration = get_narration_from_panel_data(panel_data_file, page_num, panel_num)
            print(f"- Using narration from panel_data.txt as fallback")
        
        print(f"- NARRATION: {actual_narration[:50]}..." if actual_narration else "- No narration found")
        
        on_panel_chars, off_panel_chars = get_dialogue_characters_from_panel_data(
            panel_data_file, page_num, panel_num
        )
        print(f"- On-panel characters: {list(on_panel_chars)}")
        print(f"- Off-panel characters: {list(off_panel_chars)}")
        
        on_panel_dialogues, off_panel_dialogues = parse_panel_dialogues(
            panel, on_panel_chars, off_panel_chars
        )
        
        print(f"- On-panel dialogues: {len(on_panel_dialogues)}")
        for d in on_panel_dialogues:
            print(f"  * {d['character']}: {d['text'][:30]}...")
            
        print(f"- Off-panel dialogues: {len(off_panel_dialogues)}")
        for d in off_panel_dialogues:
            print(f"  * {d['character']}: {d['text'][:30]}...")
        
        if not on_panel_dialogues and not off_panel_dialogues and not actual_narration:
            print(f"  Skipping panel - no text content")
            results.append({
                'page': page_num,
                'panel': panel_num,
                'original_path': image_path,
                'output_path': image_path,
                'status': 'skipped - no text'
            })
            continue
        
        on_panel_characters_list = [d['character'] for d in on_panel_dialogues]
        detection_prompts = create_detection_prompt_with_llm(on_panel_characters_list, page_num, panel_num)
        
        print(f"- Character detection prompts: {len(detection_prompts)}")
        for prompt in detection_prompts:
            print(f"  * {prompt['character']}: '{prompt['detection_prompt']}'")
        
        formatted_dialogues = []
        
        for dialogue in on_panel_dialogues:
            character = dialogue['character']
            text = dialogue['text'].strip('"')
            
            detection_prompt = None
            for prompt in detection_prompts:
                if prompt['character'].lower() == character.lower():
                    detection_prompt = prompt['detection_prompt']
                    break
            
            if detection_prompt:
                formatted_dialogues.append({
                    'character_description': detection_prompt,
                    'text': text
                })
            else:
                formatted_dialogues.append({
                    'is_off_panel': True,
                    'text': f"{character}: {text}"
                })
        
        for dialogue in off_panel_dialogues:
            character = dialogue['character']
            text = dialogue['text'].strip('"') 
            
            formatted_dialogues.append({
                'is_off_panel': True,
                'text': f"{character}: {text}"
            })
        
        dirname = os.path.dirname(image_path)
        basename = os.path.basename(image_path)
        output_path = os.path.join(dirname, f"bubble_{basename}")
        
        try:
            generator = SpeechBubbleGenerator(image_path, api_key)
            
            generator.generate_speech_bubbles(
                dialogues=formatted_dialogues,
                narration=actual_narration,
                narration_position="top"
            )
            
            generator.save(output_path)
            
            results.append({
                'page': page_num,
                'panel': panel_num,
                'original_path': image_path,
                'output_path': output_path,
                'status': 'success',
                'narration': actual_narration,
                'dialogues': formatted_dialogues
            })
            print(f"  ✅ Added speech bubbles to Panel {panel_num}")
            
        except Exception as e:
            print(f"  ❌ Error adding speech bubbles to Panel {panel_num}: {e}")
            traceback.print_exc()
            results.append({
                'page': page_num,
                'panel': panel_num,
                'original_path': image_path,
                'output_path': None,
                'status': f'error - {str(e)}'
            })
    
    return results

def generate_full_comic_page(markdown_file, page_number, settings):
    """
    Generate a full comic page with images, speech bubbles, and narration
    """
    print(f"\n{'='*50}")
    print(f"GENERATING FULL COMIC PAGE {page_number} FROM {markdown_file}")
    print(f"{'='*50}\n")
    
    print(f"\n{'*'*20} GENERATING PANEL IMAGES {'*'*20}")
    image_settings = settings.copy()
    image_settings['markdown_file'] = markdown_file
    image_settings['page_number'] = page_number
    
    panel_images = generate_comic_images_for_page(image_settings)
    
    if not panel_images:
        print(f"Error: Failed to generate images for page {page_number}")
        return None
    
    print(f"\nGenerated {len(panel_images)} panel images")
    
    print(f"\n{'*'*20} APPLYING SPEECH BUBBLES AND NARRATION {'*'*20}")
    api_key = settings.get('api_key', os.environ.get("LANDING_AI_API_KEY"))
    
    results = apply_speech_bubbles_to_panels(panel_images, markdown_file, page_number, api_key)
    
    output_dir = os.path.join('output', f"{os.path.basename(markdown_file).split('.')[0]}_page_{page_number}")
    summary_path = os.path.join(output_dir, 'page_summary.json')
    
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump({
            'page_number': page_number,
            'total_panels': len(results),
            'panels': results
        }, f, indent=2)
    
    print(f"\n{'='*50}")
    print(f"COMIC PAGE GENERATION COMPLETE!")
    print(f"Results saved to {output_dir}")
    print(f"{'='*50}")
    
    return results

if __name__ == "__main__":
    settings = {
        "markdown_file": "test_2_comic.md",   
        "page_number": 1,                   
        "style": "american comic (modern)",  
        "negative_prompt": "photorealistic, realistic, photo, 3d render, photography, photographic, hyperrealistic, low quality, bad anatomy, worst quality, low resolution, text, words, speech, dialogue, speech bubble, bubble",
        "seed": 9,
        "randomize_seed": False,
        "width": 768, 
        "height": 1024, 
        "panel_dimensions": [
            (768, 1024), 
            (768, 512),       
            (1024, 512),  
        ],
        "guidance_scale": 7.5,             
        "num_inference_steps": 40,
        "api_key": os.environ.get("LANDING_AI_API_KEY")
    }
    
    generate_full_comic_page(settings['markdown_file'], settings['page_number'], settings)