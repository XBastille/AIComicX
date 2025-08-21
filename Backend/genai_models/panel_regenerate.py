import os
import sys
import json
import torch
import re
import traceback
import ast
from diffusers import StableDiffusion3Pipeline
from speech_bubble import SpeechBubbleGenerator
from google import genai
from google.genai import types

script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

from image_batch import get_or_create_pipeline, extract_panel_content
from inference import parse_direct_from_markdown, generate_character_detection_prompts

def regenerate_panel_image(markdown_file, page_number, panel_number, custom_prompt,
                          guidance_scale, inference_steps, panel_width, panel_height, theme, font_style, seed,
                          api_key=None):
    """
    Regenerate a specific panel image with full parameters matching inference.py structure.
    
    Args:
        markdown_file: Path to the markdown file with comic content
        page_number: Page number (1-indexed)  
        panel_number: Panel number within the page (1-indexed)
        custom_prompt: User-provided custom prompt for regeneration
        guidance_scale: Guidance scale for image generation
        inference_steps: Number of inference steps
        panel_width: Width of the specific panel to regenerate
        panel_height: Height of the specific panel to regenerate
        theme: Color theme (default, sepia, noir, modern)
        font_style: Font style (anime, manga, comic, handwritten, cute)
        seed: Seed for image generation
        api_key: API key for character detection
    
    Returns:
        String: Path to the regenerated image file
    """
    print(f"Starting panel regeneration for Page {page_number}, Panel {panel_number}")
    print(f"Using parameters - Guidance: {guidance_scale}, Steps: {inference_steps}, Seed: {seed}")
    print(f"Theme: {theme}, Font style: {font_style}")
    print(f"Custom prompt: {custom_prompt}")
    print(f"Panel dimensions: {panel_width}x{panel_height}")
    
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

    theme_mapping = {
        "default": default_colors,
        "sepia": sepia_colors,
        "noir": noir_colors,
        "modern": modern_colors
    }
    
    colors = theme_mapping.get(theme.lower(), default_colors)
    font_path = font_mapping.get(font_style.lower(), "fonts/font1reg.ttf")
    
    bubble_color = colors["bubble_color"]
    text_color = colors["text_color"]
    narration_bg_color = colors["narration_bg_color"]
    narration_text_color = colors["narration_text_color"]
    
    try:
        char_desc_path = os.path.join(script_dir, 'output', "character_descriptions.json")
        if os.path.exists(char_desc_path):
            with open(char_desc_path, 'r', encoding='utf-8') as f:
                character_descriptions = json.load(f)
            print(f"Loaded character descriptions for {len(character_descriptions)} characters")
        else:
            print("Warning: No character descriptions found. Speech bubbles may not work properly.")
            character_descriptions = {}
        
        base_name = os.path.basename(markdown_file).split('.')[0]
        
        page_output_dir = os.path.join('output', f"{base_name}_page_{page_number}")
        bubble_output_dir = os.path.join('output', f"{base_name}_page_{page_number}_with_bubbles")
        
        os.makedirs(page_output_dir, exist_ok=True)
        os.makedirs(bubble_output_dir, exist_ok=True)
        
        final_prompt = custom_prompt
        print(f"Final prompt: {final_prompt}")
        
        print("Generating panel image...")
        image = generate_panel_image(final_prompt, panel_width, panel_height, guidance_scale, inference_steps, seed)
        
        base_image_path = os.path.join(page_output_dir, f"panel_0{panel_number}.png")
        image.save(base_image_path)
        print(f"Saved base image to: {base_image_path}")
        
        print("Adding speech bubbles and narration...")
        bubble_image_path = add_speech_bubbles_to_panel(
            base_image_path, markdown_file, page_number, panel_number,
            character_descriptions, api_key, bubble_color, text_color,
            narration_bg_color, narration_text_color, font_path
        )
        
        if bubble_image_path:
            print(f"Panel regeneration completed successfully!")
            print(f"Base image: {base_image_path}")
            print(f"Final image with bubbles: {bubble_image_path}")
            return bubble_image_path
        else:
            print(f"Panel regeneration completed (base image only)")
            return base_image_path
            
    except Exception as e:
        print(f"Error during panel regeneration: {e}")
        traceback.print_exc()
        return None

def generate_panel_image(prompt, width, height, guidance_scale, inference_steps, seed):
    """
    Generate a single panel image using the Stable Diffusion pipeline.
    
    Args:
        prompt: Text prompt for image generation
        width: Image width
        height: Image height
        guidance_scale: Guidance scale
        inference_steps: Number of inference steps
        seed: Random seed
    
    Returns:
        PIL Image: Generated image
    """
    try:
        pipe = get_or_create_pipeline()
        
        generator = torch.Generator("cuda").manual_seed(seed)
        
        negative_prompt = "photorealistic, realistic, photo, 3d render, photography, photographic, hyperrealistic, low quality, bad anatomy, worst quality, low resolution, speech bubble, bubble, blurry, distorted"
        
        print(f"Generating image with Stable Diffusion...")
        print(f"Dimensions: {width}x{height}")
        print(f"Guidance scale: {guidance_scale}, Steps: {inference_steps}, Seed: {seed}")
        
        image = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            max_sequence_length=512,
            guidance_scale=guidance_scale,
            num_inference_steps=inference_steps,
            generator=generator
        ).images[0]
        
        print("Image generation completed successfully")
        return image
        
    except Exception as e:
        print(f"Error generating panel image: {e}")
        traceback.print_exc()
        raise e

def generate_character_detection_prompts_llm(speaking_characters, scene_description, character_descriptions):
    """
    Use LLM to intelligently generate detection prompts based on who's speaking and who's in the scene.
    Copied from inference.py to generate head detection prompts for the specific panel.
    
    Args:
        speaking_characters: List of character names who are speaking
        scene_description: Description of the scene to find all characters present
        character_descriptions: Dictionary of character descriptions
    
    Returns:
        Dictionary mapping character names to detection prompts
    """
    try:
        client = genai.Client(
            api_key=os.getenv("GEMINI_KEY"),
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

def add_speech_bubbles_to_panel(image_path, markdown_file, page_number, panel_number, 
                               character_descriptions, api_key, bubble_color, text_color,
                               narration_bg_color, narration_text_color, font_path):
    """
    Add speech bubbles and narration to a generated panel image.
    
    Args:
        image_path: Path to the base image
        markdown_file: Path to the markdown file
        page_number: Page number
        panel_number: Panel number
        character_descriptions: Character descriptions dictionary
        api_key: API key for character detection
        bubble_color: Speech bubble color
        text_color: Text color
        narration_bg_color: Narration background color
        narration_text_color: Narration text color
        font_path: Font file path
    
    Returns:
        String: Path to the image with speech bubbles, or None if no dialogues/narration
    """
    try:
        dialogues_and_narration = parse_direct_from_markdown(markdown_file, page_number, panel_number)
        
        if not dialogues_and_narration:
            print(f"No dialogues or narration found for Page {page_number}, Panel {panel_number}")
            return None
            
        dialogues, scene_description = dialogues_and_narration
        
        actual_dialogues = []
        narrations = []
        
        for item in dialogues:
            if item.get('type') == 'narration':
                narrations.append(item.get('text', ''))
            elif item.get('type') == 'dialogue':
                actual_dialogues.append(item)
        
        if not actual_dialogues and not narrations:
            print("No speech bubbles or narrations to add")
            return None
            
        print(f"Found {len(actual_dialogues)} dialogues and {len(narrations)} narrations")
        
        if not font_path:
            font_path = "fonts/font1reg.ttf"  
        
        bubble_generator = SpeechBubbleGenerator(
            image_path=image_path,
            api_key=api_key,
            bubble_color=bubble_color,
            text_color=text_color,
            narration_bg_color=narration_bg_color,
            narration_text_color=narration_text_color,
            font_path=font_path
        )
        
        bubble_dialogues = []
        
        if actual_dialogues:
            speaking_characters = []
            for dialogue in actual_dialogues:
                if dialogue['character'].lower() != "narration":
                    char_name = dialogue['character']
                    if char_name.endswith(':'):
                        char_name = char_name[:-1]
                    speaking_characters.append(char_name)
            
            print(f"Speaking characters for detection: {speaking_characters}")
            
            detection_prompts = generate_character_detection_prompts_llm(
                speaking_characters, 
                scene_description, 
                character_descriptions
            )
            
            for dialogue in actual_dialogues:
                character_name = dialogue.get('character', '')
                dialogue_text = dialogue.get('text', '')
                
                bubble_dialogue = {
                    'text': dialogue_text,
                    'character_name': character_name
                }
                
                clean_char_name = character_name.rstrip(':')
                if clean_char_name in detection_prompts:
                    detection_prompt = detection_prompts[clean_char_name]
                    if detection_prompt != "NOT_VISIBLE":
                        bubble_dialogue['character_description'] = detection_prompt
                        print(f"Adding on-panel dialogue for '{character_name}' ({detection_prompt}): {dialogue_text[:30]}...")
                    else:
                        bubble_dialogue['is_off_panel'] = True
                        print(f"Adding off-panel dialogue for '{character_name}': {dialogue_text[:30]}...")
                else:
                    bubble_dialogue['is_off_panel'] = True
                    print(f"Adding off-panel dialogue for '{character_name}' (no detection prompt): {dialogue_text[:30]}...")
                
                bubble_dialogues.append(bubble_dialogue)
        
        top_narration = None
        bottom_narration = None
        
        if narrations:
            if len(narrations) == 1:
                top_narration = narrations[0]
            elif len(narrations) >= 2:
                top_narration = narrations[0]
                bottom_narration = narrations[1]
        
        print(f"Panel {panel_number} narration placement:")
        print(f"  Top narration: {top_narration[:30]}..." if top_narration else "  No top narration")
        print(f"  Bottom narration: {bottom_narration[:30]}..." if bottom_narration else "  No bottom narration")
        
        bubble_generator.generate_speech_bubbles(
            dialogues=bubble_dialogues,
            top_narration=top_narration,
            bottom_narration=bottom_narration
        )
        
        base_name = os.path.basename(markdown_file).split('.')[0]
        bubble_output_dir = os.path.join('output', f"{base_name}_page_{page_number}_with_bubbles")
        os.makedirs(bubble_output_dir, exist_ok=True)
        
        output_path = os.path.join(bubble_output_dir, f"panel_0{panel_number}_with_bubbles.png")
        bubble_generator.save(output_path)
        
        print(f"Saved image with speech bubbles to: {output_path}")
        return output_path
        
    except Exception as e:
        print(f"Error adding speech bubbles: {e}")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    if len(sys.argv) < 11:
        print("Usage: python panel_regenerate.py <markdown_file> <page_number> <panel_number> <custom_prompt> <guidance_scale> <inference_steps> <panel_width> <panel_height> <theme> <font_style> <seed>")
        print("Example: python panel_regenerate.py temp_story_comic.md 1 2 'a character in a forest' 7.5 30 768 1024 sepia anime 42")
        sys.exit(1)

    try:
        markdown_file = sys.argv[1]
        page_number = int(sys.argv[2])
        panel_number = int(sys.argv[3])
        custom_prompt = "anime, vibrant cel-shaded, dynamic composition, A man in his late 20s with a lean, wiry build. His hair is an unruly, spiky charcoal-black cut in a messy undercut; a few strands are interwoven with faint, glowing blue micro-filaments, hinting at cheap neural mods. He wears a grease-stained, dark grey canvas utility jacket with a high collar over a faded black t-shirt, paired with baggy, olive-drab cargo pants that have numerous straps and pockets, tucked into scuffed, steel-toed black combat boots. annoyed, swatting away a holographic ad with one hand, other hand using a multi-tool to zap a tiny, crab-shaped piece of malware on a logic board, Noodle-Bot's single red eye flickering."
        guidance_scale = float(sys.argv[4])
        inference_steps = int(sys.argv[5])
        panel_width = int(sys.argv[6])
        panel_height = int(sys.argv[7])
        theme = sys.argv[8]
        font_style = sys.argv[9]
        seed = int(sys.argv[10])
        
    except (ValueError, IndexError) as e:
        print(f"Error parsing arguments: {e}")
        sys.exit(1)

    api_key = os.getenv("LANDING_API_KEY")
    
    result_path = regenerate_panel_image(
        markdown_file=markdown_file,
        page_number=page_number,
        panel_number=panel_number,
        custom_prompt=custom_prompt,
        guidance_scale=guidance_scale,
        inference_steps=inference_steps,
        panel_width=panel_width,
        panel_height=panel_height,
        theme=theme,
        font_style=font_style,
        seed=seed,
        api_key=api_key
    )
    
    if result_path:
        print(f"Panel regeneration successful! Image saved to: {result_path}")
    else:
        print("Panel regeneration failed!")
        sys.exit(1)
