import os
import sys
import json
import torch
import re
import shutil
from google import genai
from google.genai import types
from markitdown import MarkItDown
from diffusers import StableDiffusion3Pipeline
from gradio_client import Client

def generate_character_descriptions(story_text, comic_markdown, style):
    """Generate character descriptions with dynamic variations based on story context and comic structure"""
    client = genai.Client(
        api_key=os.environ["GEMINI_KEY"],
    )

    character_names = set()
    
    words = re.findall(r'\b[A-Z][a-z]+\b', story_text)
    word_counts = {}
    for word in words:
        if len(word) > 2: 
            word_counts[word] = word_counts.get(word, 0) + 1
    
    common_words = ['The', 'And', 'But', 'For']
    for name, count in word_counts.items():
        if count >= 3 and name not in common_words:
            character_names.add(name)
    
    print(f"Detected character names: {', '.join(character_names)}")

    llm_prompt = f"""
    Create DETAILED character descriptions with DYNAMIC VARIATIONS based on story context and scenes.
    
    ORIGINAL STORY CONTEXT:
    {story_text}
    
    COMIC STRUCTURE (for page references):
    {comic_markdown}
    
    DETECTED CHARACTERS: {', '.join(character_names)}

    STYLE REQUESTED:
    {style} style

     TASK: For EACH named character, create a MAIN description plus CONTEXTUAL VARIATIONS based on different scenes, settings, or time periods in the story.

     CRITICAL: Focus ONLY on PURE VISUAL APPEARANCE - no environmental context, emotions, or situational details.

     STRUCTURED FEATURE TAGGING (MANDATORY): Each description (main & variations) MUST contain the following labeled segments IN ORDER using UPPERCASE tags exactly once each: [AGE_BUILD] [HAIR] [EYES] [FACIAL_FEATURES] [OUTFIT] [ACCESSORIES] [DISTINCTIVES]. They are concatenated into a single string, but each tag starts its segment. Example:
     "[AGE_BUILD] 25-year-old athletic woman, lean defined build. [HAIR] metallic silver asymmetrical bob ... [EYES] piercing bright emerald green eyes ... [FACIAL_FEATURES] high cheekbones ... [OUTFIT] long form-fitting black synth-leather trench coat over ... [ACCESSORIES] silver chain necklace ... [DISTINCTIVES] small scar over left eyebrow."

     CONTINUITY & RANGE INFERENCE RULES:
     1. If an outfit introduced in a variation logically continues in subsequent panels (no explicit change described in story), EXTEND the page.panel range forward until a change appears. Do NOT truncate ranges prematurely (e.g. wetsuit at 4.2 that is still worn in storm scenes across 5.x must have range like "4.2-5.1" or further if still present).
     2. Never produce a variation whose range skips an intermediate panel where the outfit is still present.
     3. If a panel depicts the SAME outfit as previous variation, DO NOT create a new variation; just ensure the existing variation's range covers it.
     4. If the story indicates a partial state change (e.g. jacket removed, sleeves rolled, soaked version), treat as either:
         - Minor state: keep same variation and note state inside [OUTFIT] without splitting range (e.g. "now soaked, clinging to frame")
         - Major visual change: create a new variation with a new range start.
     5. Ranges must be precise, using page.panel-page.panel; single panel still uses start-end same (e.g. "5.2-5.2").

     OUTFIT COMPLETENESS ENFORCEMENT:
     - [OUTFIT] segment MUST always include: garment layers (outer/mid/base), materials, dominant colors, fit descriptors, and lower-body + footwear.
     - If a character is partially undressed (e.g. only undergarments), [OUTFIT] must explicitly state each visible clothing element; never omit.
     - For water / storm / damage contexts, append condition adjectives (soaked, torn, mud-splattered) INSIDE [OUTFIT].

     FAIL-SAFE SELF CHECK (apply before returning JSON):
     - For every character: confirm each description contains ALL seven tags; if any tag missing, regenerate that description segment internally before output.
     - For every variation: ensure ranges don't overlap inconsistently or leave uncovered gaps between consecutive panels depicting the same outfit.
     - Ensure NO variation is created with identical [OUTFIT] text to main without a visual state difference; instead aggregate via range if truly identical.

     ABSOLUTE: Never drop [OUTFIT] details in any variation or panel-level description; absence of [OUTFIT] is invalid.

    CORE CHARACTER CONSISTENCY (MUST MAINTAIN):
    - Exact hair color with specific shade descriptions
    - Exact eye color with intensity details  
    - Facial structure and distinctive features
    - Body build, height, age appearance
    - Any scars, birthmarks, or unique traits

    REQUIRED VISUAL DETAIL LEVEL:
    1. HAIR: Include color, texture, length, specific style, and distinctive features
       Examples: "striking metallic silver hair", "gravity-defying spiky layered brown hair with lighter brunette highlights"
    2. EYES: Include exact color, shape, and distinctive qualities
       Examples: "piercing bright emerald green eyes", "intense grey eyes", "sharp dark brown eyes"
    3. CLOTHING: Include materials, colors, fit, layering, and specific style details
       Examples: "long form-fitting trench coat of black synth-leather over sleeveless high-necked black silk top"
    4. PHYSICAL BUILD: Include height indication, build type, and distinctive physical traits
       Examples: "lean athletic build", "tall muscular imposing build", "slender but resilient build"

    FORBIDDEN ELEMENTS (NEVER INCLUDE):
    - Environmental context: "by the cold London air", "in the jungle humidity"
    - Emotional states: "determined", "focused", "concerned"
    - Situational details: "during escape", "after struggle", "while working"
    - Action descriptions: "leaning", "running", "speaking"
    - Only pure static visual appearance allowed

    VARIATION CATEGORIES TO DETECT AND CREATE (VISUAL APPEARANCE ONLY):
    1. MAIN/DEFAULT: Primary outfit with complete visual details
    2. OUTFIT CHANGES: Different clothing combinations
        - Casual vs formal wear (complete outfit descriptions)
        - Work uniform vs street clothes (full material and style details)
        - Seasonal clothing (detailed material and color descriptions)
        - Special event outfits (comprehensive style descriptions)
    3. TEMPORAL CHANGES: Different ages with adjusted features
        - Younger versions (same core features, age-appropriate styling)
        - Older versions (same core features, maturity indicators)
    4. PHYSICAL STATE CHANGES: Visible alterations only
        - Different hairstyles (if significantly different)
        - Costume/disguise changes (complete visual transformation)
        - Injured appearance (visible injuries only, no emotional context)

    INSTRUCTIONS:
    1. Analyze the ORIGINAL STORY to identify character visual details and outfit changes
    2. Use the COMIC STRUCTURE to determine proper page numbers for variations
    3. Create variations ONLY for VISIBLE PHYSICAL CHANGES (outfits, age, appearance)
    4. ALWAYS maintain core physical features across all variations
    5. Main description should be the most commonly worn outfit with full details
    6. Each variation should be 100-120 words with comprehensive visual details
    7. Reference specific page.panel ranges using format "page.panel-page.panel"
    8. Include detailed descriptions for:
       - Hair: exact color, texture, length, style
       - Eyes: precise color, shape, distinctive qualities  
       - Clothing: materials, colors, fit, layering, style details
       - Build: height indication, body type, distinctive features
    9. Remove ALL environmental context and emotional descriptors
    10. Focus on pure static visual appearance that an artist would need

        OUTPUT FORMAT:
    {{
      "Character1": {{
        "main": "detailed main outfit description with core features...",
        "variations": {{
          "work_outfit": {{
            "1.2-3.4, 8.1-10.3": "COMPLETE character description with work uniform while maintaining ALL core features (hair, eyes, build, etc.)..."
          }},
          "formal_suit": {{
            "15.2-17.1": "COMPLETE character description with formal attire while maintaining ALL core features (hair, eyes, build, etc.)..."
          }},
          "childhood": {{
            "22.3-24.2": "COMPLETE younger version description maintaining hair color, facial features, and build..."
          }}
        }}
      }}
    }}

    EXAMPLE:
    {{
      "Emma": {{
        "main": "25-year-old woman with flowing golden blonde hair cascading to her shoulders in soft waves, bright emerald green eyes, athletic build, wearing elegant navy blue business blazer over white silk blouse, tailored black trousers, black leather heels",
        "variations": {{
          "winter_coat": {{
            "5.2-7.4": "25-year-old woman with flowing golden blonde hair in messy bun, bright emerald green eyes, athletic build, wearing thick navy winter coat, warm scarf, dark jeans, winter boots, gloves"
          }},
          "teenage": {{
            "12.1-14.3": "17-year-old version with same golden blonde hair but shorter and straighter, bright emerald green eyes, slender teenage build, wearing school uniform with pleated skirt, white blouse, navy blazer"
          }}
        }}
      }}
    }}

    IMPORTANT: 
    - NEVER include "narration" as a character
    - Only create variations for ACTUAL outfit changes or temporal (age) differences
    - DO NOT create variations for emotions, moods, situations, or contexts
    - DO NOT create variations like "determined_action", "empathetic_support", "grieving", etc.
    - Maintain character consistency across all variations
    - Use precise page.panel ranges like "1.2-3.4" for panel-level accuracy
    - Each variation should be a COMPLETE character description, not partial
    - Variations should be the SAME LENGTH and DETAIL as the main description
    - Focus ONLY on visible physical appearance changes (clothes, age, hair style)
    - Every description MUST include all mandated tags [AGE_BUILD][HAIR][EYES][FACIAL_FEATURES][OUTFIT][ACCESSORIES][DISTINCTIVES]
    """
    
    try:
        model = "gemini-flash-latest"
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=llm_prompt),
                ],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.5,
            max_output_tokens=65536,
            top_p=1
        )

        response_chunks = []
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            response_chunks.append(chunk.text)
        
        response_content = "".join(response_chunks)
        
        character_descriptions = json.loads(response_content)
        
        print(f"Generated detailed descriptions for {len(character_descriptions)} characters")
        
        
        
        return character_descriptions
        
    except json.JSONDecodeError as e:
        print(f"Error: Could not parse JSON response: {e}")
        print(f"Response content: {response_content[:500]}...")
        return {}
    except Exception as e:
        print(f"Error generating character descriptions: {e}")
        return {}

def generate_character_reference_prompt(character_name, character_desc, style):
    """Generate intelligent reference image prompt using LLM with increased detail focus"""
    client = genai.Client(
        api_key=os.environ["GEMINI_KEY"],
    )
    
    if style.lower() == "manga":
        style_instruction = f"""
        Create a detailed Stable Diffusion image prompt for a {style} character reference.

        CHARACTER: {character_name}
        CHARACTER DESCRIPTION: {character_desc}

        INSTRUCTIONS:
        1. Start with "Manga style, black and white, monochrome, clean line art, high contrast"
        2. Describe the character's full body view and standing pose
        3. Include their COMPLETE DETAILED physical description: {character_desc}
        4. Pay special attention to hair details (style, length, texture)
        5. Include EVERY detail of their outfit (clothing, accessories, materials)
        6. Add "full body character illustration, standing pose, front facing, neutral expression"
        7. Add "plain background, character sheet style"
        8. MAXIMUM 150 tokens total 
        9. Focus on clear character design and visual details
        10. Prioritize hair and outfit consistency

        OUTPUT: Single line prompt only, no explanations or character names.
        """
    else:
        style_instruction = f"""
        Create a detailed Stable Diffusion image prompt for a {style} character reference.

        CHARACTER: {character_name}
        CHARACTER DESCRIPTION: {character_desc}

        INSTRUCTIONS:
        1. Start with "{style} style" and describe the art style characteristics
        2. Describe the character's full body view and standing pose
        3. Include their COMPLETE DETAILED physical description: {character_desc}
        4. Pay special attention to hair details (color, style, length, texture)
        5. Include EVERY detail of their outfit (clothing, accessories, materials, colors)
        6. Add "full body character illustration, standing pose, front facing, neutral expression"
        7. Add "plain background, character sheet style"
        8. MAXIMUM 150 tokens total 
        9. Focus on clear character design and visual details
        10. Prioritize hair and outfit consistency

        OUTPUT: Single line prompt only, no explanations or character names.
        """
    
    try:
        model = "gemini-2.5-pro"
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=style_instruction),
                ],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            response_mime_type="text/plain",
            temperature=0.7,
            max_output_tokens=65536,
            top_p=1
        )

        response_chunks = []
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            if chunk.text is not None:
                response_chunks.append(chunk.text)
        
        prompt = "".join(response_chunks).strip()
        
        prompt = prompt.replace("**", "").strip()
        
        if style.lower() == "manga":
            if not prompt.lower().startswith("manga style, black and white"):
                prompt = f"Manga style, black and white, monochrome, clean line art, high contrast, " + prompt
        else:
            if not prompt.lower().startswith(style.lower()):
                prompt = f"{style} style, " + prompt
        
        max_tokens = 150 
        if len(prompt.split()) > max_tokens:
            words = prompt.split()
            truncated_prompt = ' '.join(words[:max_tokens])
            print(f"WARNING: Reference prompt for {character_name} truncated from {len(prompt.split())} to {max_tokens} words")
            prompt = truncated_prompt
        
        return prompt
        
    except Exception as e:
        print(f"Error generating reference prompt for {character_name}: {e}")
        raise e

def generate_character_reference_image(character_index, character_name, character_desc, style):
    """Generate reference image for a character using intelligent LLM-generated prompt"""
    
    print(f"Generating intelligent reference prompt for {character_name}")
    reference_prompt = generate_character_reference_prompt(character_name, character_desc, style)
    
    print(f"Generated prompt: {reference_prompt}")
    
    os.makedirs('character_references', exist_ok=True)
    prompt_data = {
        "character": character_name,
        "description": character_desc,
        "style": style,
        "full_prompt": reference_prompt
    }
    prompt_file = f"character_references/reference{character_index}_prompt.json"
    with open(prompt_file, 'w', encoding='utf-8') as f:
        json.dump(prompt_data, f, indent=2)
    
    try:
        client = Client("stabilityai/stable-diffusion-3.5-large")
        result = client.predict(
            prompt=reference_prompt,
            negative_prompt="multiple people, blurry, low quality, distorted face, photorealistic, realistic, photo, cropped, partial body, headshot, portrait only, text, words, speech, dialogue, speech bubble, bubble",
            seed=9,
            randomize_seed=False,
            width=768,
            height=1024,
            guidance_scale=7.5,
            num_inference_steps=30,
            api_name="/infer"
        )
        
        image_path = f"character_references/reference{character_index}.png"
        if isinstance(result[0], str):
            shutil.copy(result[0], image_path)
        else:
            result[0].save(image_path)
        
        return image_path
        
    except Exception as e:
        print(f"Gradio client failed: {e}")
        try:
            pipe = StableDiffusion3Pipeline.from_pretrained(
                "stabilityai/stable-diffusion-3.5-large", 
                torch_dtype=torch.bfloat16
            )
            pipe = pipe.to("cuda")
            
            generator = torch.Generator("cuda").manual_seed(9)
            
            image = pipe(
                prompt=reference_prompt,
                negative_prompt="multiple people, blurry, low quality, distorted face, photorealistic, realistic, photo, cropped, partial body, headshot, portrait only, text, words, speech, dialogue, speech bubble, bubble",
                width=768,
                height=1024,
                max_sequence_length=512,
                guidance_scale=7.5,
                num_inference_steps=30,
                generator=generator
            ).images[0]
            
            image_path = f"character_references/reference{character_index}.png"
            image.save(image_path)
            return image_path
            
        except Exception as e2:
            print(f"Local pipeline also failed: {e2}")
            raise e2

def convert_story_to_comic(story_text):
    """Convert prose story to comic book format JSON."""
    client = genai.Client(
        api_key=os.environ["GEMINI_KEY"],
    )
    
    system_prompt = """
You are a comic book script creator that converts prose stories into a structured JSON format.
Follow these exact rules when converting stories:

1. Divide the story into pages. Pages should have 1-4 panels, depending on the scene's importance:
   - Use a single panel for an entire page to emphasize heroic, iconic, or very important moments
   - Use 2-4 panels for regular storytelling where multiple scenes flow together
2. Each panel must contain maximum 3 dialogue lines.
3. IMPORTANT: Each panel should contain only ONE narration block if it has dialogues, else only 2.
4. If a conversation continues beyond 3 dialogue exchanges, move to a new panel.
5. Use visual language in scene descriptions that suggests what should be drawn.
6. For dramatic moments (revelations, plot twists, action climaxes), use a single full-page panel.
7. IMPORTANT: Do not include any parenthetical descriptions after character names like "(off-panel)" or "(shouting)".
8. IMPORTANT: Include all character actions as part of the narration, not as separate entries.

LENGTH LIMITS (CRITICAL):
9. Single narration: Maximum 200 characters. If longer, split into multiple panels.
10. Single dialogue: Maximum 100 characters. If longer, split into multiple dialogue entries or panels.
11. If content exceeds limits, intelligently break it:
    - For narration: Create a new panel with continuation
    - For dialogue: Split into multiple dialogue entries in same panel, or move to next panel if already at 3 dialogues

JSON OUTPUT FORMAT:
{
  "pages": [
    {
      "page_number": 1,
      "panels": [
        {
          "panel_number": 1,
          "scene_description": "Description of the visual scene",
          "narrations": [
            "First narration text",
            "Second narration text (optional)"
          ],
          "dialogues": [
            {
              "character": "Character Name",
              "text": "Dialogue line without quotes"
            }
          ]
        }
      ]
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown code blocks or explanations.

CRITICAL FORMATTING RULES:
- DO NOT use emojis in narrations or dialogues
- DO NOT use emojis in scene descriptions
- Use plain text only without any emoji characters
- Focus on descriptive language instead of visual symbols
"""
    
    try:
        model = "gemini-2.5-pro"
        full_prompt = f"{system_prompt}\n\nConvert this story into comic book JSON format:\n\n{story_text}"
        
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=full_prompt),
                ],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.7,
            max_output_tokens=65536
        )

        response_chunks = []
        content = ""
        
        try:
            for chunk in client.models.generate_content_stream(
                model=model,
                contents=contents,
                config=generate_content_config,
            ):
                response_chunks.append(chunk.text)
            
            content = "".join(response_chunks)
        except Exception as stream_error:
            print(f"Error during streaming: {stream_error}")
            print(f"Attempting non-streaming generation...")
            
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            content = response.text
        
        if not content or content.strip() == "":
            print("Error: Empty response from Gemini API")
            return None
        
        try:
            comic_json = json.loads(content)
        except json.JSONDecodeError as e:
            print(f"Error: Could not parse JSON response: {e}")
            print(f"Response content (first 500 chars): {content[:500]}...")
            return None
        
        return comic_json
    except Exception as e:
        print(f"Error converting story to comic format: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def convert_json_to_markdown(comic_json):
    """Convert comic JSON to markdown format with exact structure."""
    if not comic_json or 'pages' not in comic_json:
        return ""
    
    markdown_lines = []
    
    for page in comic_json['pages']:
        page_num = page['page_number']
        markdown_lines.append(f"## Page {page_num}")
        
        for panel in page['panels']:
            panel_num = panel['panel_number']
            markdown_lines.append(f"### Panel {panel_num}")
            
            scene_desc = panel.get('scene_description', '')
            if scene_desc:
                markdown_lines.append(f"[{scene_desc}]")
                markdown_lines.append("")  
            
            narrations = panel.get('narrations', [])
            for narration in narrations:
                markdown_lines.append(f"**Narration**: {narration}")
                markdown_lines.append("")  
            
            dialogues = panel.get('dialogues', [])
            for dialogue in dialogues:
                character = dialogue.get('character', '')
                text = dialogue.get('text', '')
                markdown_lines.append(f"**{character}:** \"{text}\"")
            
            if dialogues and panel != page['panels'][-1]:
                markdown_lines.append("")
        
        markdown_lines.append("")
        markdown_lines.append("---")
        markdown_lines.append("")
    
    return "\n".join(markdown_lines)

def extract_page_panel_info_from_json(comic_json):
    """Extract page and panel information directly from comic JSON structure."""
    if not comic_json or 'pages' not in comic_json:
        return {
            "total_pages": 0,
            "panels_per_page": []
        }
    
    total_pages = len(comic_json['pages'])
    panels_per_page = [len(page['panels']) for page in comic_json['pages']]
    
    return {
        "total_pages": total_pages,
        "panels_per_page": panels_per_page
    }

def write_file(file_path, content):
    """Write content to a file."""
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Comic script successfully created at: {file_path}")

def process_story_to_comic(input_file, output_file, style, generate_reference_images=False):
    """Process story file and convert to comic format with optional reference image generation"""
    
    md = MarkItDown()
    result = md.convert(input_file)
    story_text = result.text_content
    
    print("Converting story to comic JSON format...")
    comic_json = convert_story_to_comic(story_text)
    
    if not comic_json:
        print("Error: Failed to convert story to comic JSON")
        return
    
    json_output_file = output_file.replace('.md', '.json')
    os.makedirs('output', exist_ok=True)
    with open(json_output_file, 'w', encoding='utf-8') as f:
        json.dump(comic_json, f, indent=2)
    print(f"Comic JSON saved to: {json_output_file}")
    
    print("Converting JSON to markdown format...")
    comic_markdown = convert_json_to_markdown(comic_json)
    
    print(f"Writing comic script to: {output_file}")
    write_file(output_file, comic_markdown)
    
    print("\nGenerating character descriptions...")
    character_descriptions = generate_character_descriptions(story_text, comic_markdown, style)
    
    print("Extracting page and panel information from JSON...")
    page_panel_info = extract_page_panel_info_from_json(comic_json)
    
    if character_descriptions:
        character_descriptions["comic_structure"] = page_panel_info
        
        char_desc_path = os.path.join('output', 'character_descriptions.json')
        with open(char_desc_path, 'w', encoding='utf-8') as f:
            json.dump(character_descriptions, f, indent=2)
        print(f"Character descriptions with variations saved to {char_desc_path}")
        print(f"Comic structure: {page_panel_info['total_pages']} pages with {page_panel_info['panels_per_page']} panels per page")
        
        if generate_reference_images:
            print("\nGenerating character reference images...")
            os.makedirs('character_references', exist_ok=True)
            
            character_index = 1
            for char_name, char_data in character_descriptions.items():
                if char_name == "comic_structure":
                    continue
                    
                char_desc = char_data.get('main', char_data.get('base', ''))
                if char_desc:
                    print(f"\nProcessing character {character_index}: {char_name}")
                    print(f"Description: {char_desc}")
                    
                    image_path = generate_character_reference_image(character_index, char_name, char_desc, style)
                    print(f"Reference image created: {image_path}")
                    print(f"Prompt saved: character_references/reference{character_index}_prompt.json")
                    
                    character_index += 1
        else:
            print("\nSkipping reference image generation (disabled)")
        
        print(f"\nComic conversion complete!")
        print(f"Comic script: {output_file}")
        print(f"Character descriptions: {char_desc_path}")
        if generate_reference_images:
            print(f"Reference images: character_references/ folder")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python st2nar.py <input_file> <output_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    style = "Anime"
    
    generate_reference_images = False
    
    process_story_to_comic(input_file, output_file, style, generate_reference_images)
