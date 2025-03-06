import requests
from PIL import Image, ImageDraw, ImageFont
import os
import math
import textwrap
from math import sin, cos, pi

def detect_character(image_path, prompt):
    """Call the API and extract bounding box coordinates"""
    url = "https://api.landing.ai/v1/tools/agentic-object-detection"
    
    with open(image_path, "rb") as img_file:
        files = {"image": img_file}
        
        data = {
            "prompts": prompt,
            "model": "agentic"
        }
        
        headers = {
            "Authorization": f"Basic {os.environ.get('LANDING_AI_API_KEY')}"
        }
        
        response = requests.post(url, files=files, data=data, headers=headers)
        result = response.json()
        
        print("API response:", result)
        
        try:
            bounding_box = result['data'][0][0]['bounding_box']
            return bounding_box
        except (KeyError, IndexError) as e:
            print(f"Error extracting bounding box: {e}")
            return None

def wrap_text(text, font, max_width):
    """Wrap text to fit within maximum width"""
    words = text.split(' ')
    wrapped_lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        text_bbox = font.getbbox(test_line)
        width = text_bbox[2] - text_bbox[0]
        
        if width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                wrapped_lines.append(' '.join(current_line))
                current_line = [word]
            else:
                if len(word) > 10: 
                    half = len(word) // 2
                    wrapped_lines.append(word[:half] + "-")
                    current_line = [word[half:]]
                else:
                    wrapped_lines.append(word)
                    current_line = []
    
    if current_line:
        wrapped_lines.append(' '.join(current_line))
        
    return wrapped_lines

def calculate_text_dimensions(lines, font, line_spacing):
    """Calculate the total dimensions needed for the text block"""
    max_width = 0
    total_height = 0
    line_heights = []
    
    for line in lines:
        text_bbox = font.getbbox(line)
        line_width = text_bbox[2] - text_bbox[0]
        line_height = text_bbox[3] - text_bbox[1]
        line_heights.append(line_height)
        max_width = max(max_width, line_width)
        total_height += line_height
    
    if len(lines) > 1:
        total_height += line_spacing * (len(lines) - 1)
    
    return max_width, total_height, line_heights

def draw_comic_tail(draw, bubble_x, bubble_y, bubble_width, bubble_height, target_x, target_y, pointer_position):
    """Draw a comic-style pointy speech bubble tail"""
    if pointer_position == "bottom":
        bubble_bottom = bubble_y + bubble_height
        bubble_center_x = bubble_x + bubble_width / 2
        
        tail_width_at_bubble = min(60, bubble_width / 4)
        
        left_base_x = bubble_center_x - tail_width_at_bubble / 2
        right_base_x = bubble_center_x + tail_width_at_bubble / 2
        
        points = [
            (left_base_x, bubble_bottom),  
            (target_x, target_y),          
            (right_base_x, bubble_bottom)  
        ]
        
        draw.polygon(points, fill="white", outline="black", width=2)
        
    elif pointer_position == "left":
        bubble_left = bubble_x
        bubble_center_y = bubble_y + bubble_height / 2
        
        tail_height_at_bubble = min(60, bubble_height / 4)
        
        top_base_y = bubble_center_y - tail_height_at_bubble / 2
        bottom_base_y = bubble_center_y + tail_height_at_bubble / 2
        
        points = [
            (bubble_left, top_base_y),    
            (target_x, target_y),         
            (bubble_left, bottom_base_y)  
        ]
        
        draw.polygon(points, fill="white", outline="black", width=2)
        
    elif pointer_position == "right":
        bubble_right = bubble_x + bubble_width
        bubble_center_y = bubble_y + bubble_height / 2
        
        tail_height_at_bubble = min(60, bubble_height / 4)
        
        top_base_y = bubble_center_y - tail_height_at_bubble / 2
        bottom_base_y = bubble_center_y + tail_height_at_bubble / 2
        
        points = [
            (bubble_right, top_base_y),  
            (target_x, target_y),          
            (bubble_right, bottom_base_y) 
        ]
        
        draw.polygon(points, fill="white", outline="black", width=2)

def draw_speech_bubble(image_path, bounding_box, text="Hello!"):
    """Draw a comic-style speech bubble pointing to the character with proper text wrapping"""
    
    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)
    
    img_width, img_height = img.size
    
    x1, y1, x2, y2 = bounding_box
    box_width = x2 - x1
    box_height = y2 - y1
    box_center_x = (x1 + x2) // 2
    box_center_y = (y1 + y2) // 2
    
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except IOError:
        try:
            font = ImageFont.truetype("C:/Windows/Fonts/Arial.ttf", 20)
        except IOError:
            font = ImageFont.load_default()
    
    max_bubble_width = min(350, img_width // 2)
    
    text_length = len(text)
    if text_length < 20:  
        horizontal_padding = 40
        vertical_padding = 30
    else: 
        horizontal_padding = 60
        vertical_padding = 40
    
    wrap_width = max_bubble_width - horizontal_padding
    
    wrapped_lines = wrap_text(text, font, wrap_width)
    
    line_spacing = 8
    text_width, text_height, line_heights = calculate_text_dimensions(wrapped_lines, font, line_spacing)
    
    if text_length < 20:
        padding_factor = max(1.0, min(1.5, text_length / 10)) 
        bubble_width = text_width + int(horizontal_padding * padding_factor)
        bubble_height = text_height + int(vertical_padding * padding_factor)
        
        if text_length < 10:
            avg_size = (bubble_width + bubble_height) / 2
            bubble_width = max(int(avg_size * 1.2), bubble_width)
            bubble_height = max(int(avg_size * 0.9), bubble_height)
    else:
        bubble_width = text_width + horizontal_padding
        bubble_height = text_height + vertical_padding
    
    min_bubble_width = max(120, int(text_width * 1.2))
    min_bubble_height = max(80, int(text_height * 1.5))
    
    bubble_width = max(bubble_width, min_bubble_width)
    bubble_height = max(bubble_height, min_bubble_height)
    
    optimal_aspect_ratio = 1.5
    current_ratio = bubble_width / bubble_height
    
    if text_length < 20:
        if current_ratio > 2.2:  
            bubble_height = bubble_width / 1.8
        elif current_ratio < 0.8:  
            bubble_width = bubble_height * 1.2
    else:
        
        if current_ratio > 2.0:
            bubble_height = bubble_width / optimal_aspect_ratio
        elif current_ratio < 1.0:
            bubble_width = bubble_height * optimal_aspect_ratio
    
    
    bubble_margin = 50
    
    
    if y1 > bubble_height + bubble_margin:  
        bubble_x = box_center_x - bubble_width // 2
        bubble_y = y1 - bubble_height - 30
        pointer_position = "bottom"
        target_x = box_center_x
        target_y = y1 
    elif img_width - x2 > bubble_width + bubble_margin:  
        bubble_x = x2 + 30
        bubble_y = box_center_y - bubble_height // 2
        pointer_position = "left"
        target_x = x2  
        target_y = box_center_y
    elif x1 > bubble_width + bubble_margin:  
        bubble_x = x1 - bubble_width - 30
        bubble_y = box_center_y - bubble_height // 2
        pointer_position = "right"
        target_x = x1  
        target_y = box_center_y
    else:
        bubble_x = box_center_x - bubble_width // 2
        bubble_y = y1 - bubble_height - 30
        pointer_position = "bottom"
        target_x = box_center_x
        target_y = y1  
    
    
    bubble_padding = 20
    bubble_x = max(bubble_padding, min(img_width - bubble_width - bubble_padding, bubble_x))
    bubble_y = max(bubble_padding, min(img_height - bubble_height - bubble_padding, bubble_y))
    
    
    ellipse_box = (bubble_x, bubble_y, bubble_x + bubble_width, bubble_y + bubble_height)
    
    
    draw.ellipse(ellipse_box, fill="white", outline=None)
    
   
    num_points = 60
    bubble_center_x = bubble_x + bubble_width / 2
    bubble_center_y = bubble_y + bubble_height / 2
    
    a = bubble_width / 2  
    b = bubble_height / 2  
    
    prev_x, prev_y = None, None
    for i in range(num_points + 1):
        theta = 2 * pi * i / num_points
        wobble = math.sin(theta * 6) * 2 
        x = bubble_center_x + (a + wobble) * cos(theta)
        y = bubble_center_y + (b + wobble) * sin(theta)
        
        if prev_x is not None:
            draw.line([(prev_x, prev_y), (x, y)], fill="black", width=2)
        
        prev_x, prev_y = x, y
    
    draw_comic_tail(draw, bubble_x, bubble_y, bubble_width, bubble_height, target_x, target_y, pointer_position)
    
    remaining_height = bubble_height - text_height
    top_padding = remaining_height // 2  
    
    y_offset = bubble_y + top_padding
    
    for i, line in enumerate(wrapped_lines):
        text_bbox = font.getbbox(line)
        line_width = text_bbox[2] - text_bbox[0]
        line_height = line_heights[i]
        
        text_x = bubble_x + (bubble_width - line_width) // 2
        
        draw.text((text_x, y_offset), line, fill="black", font=font)
        y_offset += line_height + line_spacing
    
    base_name = os.path.splitext(image_path)[0]
    output_path = f"{base_name}_with_bubble.jpg"
    img.save(output_path)
    print(f"Image saved as {output_path}")
    
    return output_path

def main():
    image_path = "testing_2.jpg"
    prompt = "girl's head"
    text_for_bubble = "hello!! "
    
    bounding_box = detect_character(image_path, prompt)
    
    if bounding_box:
        print(f"Bounding box coordinates: {bounding_box}")
        output_path = draw_speech_bubble(image_path, bounding_box, text_for_bubble)
        print(f"Speech bubble added. Output saved to: {output_path}")
    else:
        print("Failed to detect character or extract bounding box.")

if __name__ == "__main__":
    main()