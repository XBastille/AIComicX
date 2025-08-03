import requests
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import textwrap
import math
import random
import os

class SpeechBubbleGenerator:
    def __init__(self, image_path, api_key, detection_prompt=None, 
                 bubble_padding=15, arrow_size=20, font_path="animeace2bb_tt/animeace2_bld.ttf", 
                 bubble_color=(255, 255, 255), text_color=(0, 0, 0), border_width=2, border_color=(0, 0, 0),
                 narration_bg_color=(0, 0, 0), narration_text_color=(255, 255, 255), narration_padding=20):
        """Initialize the speech bubble generator."""
        self.image_path = image_path
        self.api_key = api_key
        self.bubble_padding = bubble_padding
        self.arrow_size = arrow_size
        
        if not os.path.isabs(font_path):
            script_dir = os.path.dirname(os.path.abspath(__file__))
            self.font_path = os.path.join(script_dir, font_path)
        else:
            self.font_path = font_path
            
        if not os.path.exists(self.font_path):
            print(f"Warning: Font file not found at {self.font_path}")
            print(f"Trying alternative font paths...")
            
            script_dir = os.path.dirname(os.path.abspath(__file__))
            alternative_paths = [
                os.path.join(script_dir, "animeace2bb_tt", "animeace2_bld.ttf"),
                os.path.join(script_dir, "..", "animeace2bb_tt", "animeace2_bld.ttf"),
                os.path.join(script_dir, "..", "..", "Frontend", "src", "animeace2bb_tt", "animeace2_bld.ttf")
            ]
            
            for alt_path in alternative_paths:
                if os.path.exists(alt_path):
                    self.font_path = alt_path
                    print(f"Found font at: {self.font_path}")
                    break
            else:
                print(f"ERROR: Could not find font file. Using system default font.")
                self.font_path = None
                
        self.bubble_color = bubble_color
        self.text_color = text_color
        self.border_width = border_width
        self.border_color = border_color
        
        self.narration_bg_color = narration_bg_color
        self.narration_text_color = narration_text_color
        self.narration_padding = narration_padding
        
        self.original_image = Image.open(image_path)
        self.image = self.original_image.copy()
        self.width, self.height = self.image.size
        self.draw = ImageDraw.Draw(self.image)
        
        self.character_boxes = []
        self.character_descriptions = {}
        
    def detect_character(self, description):
        """Detect a specific character or object using the agentic-object-detection API."""
        url = "https://api.va.landing.ai/v1/tools/agentic-object-detection"
        
        try:
            files = {"image": open(self.image_path, "rb")}
            data = {"prompts": f"Detect {description}", "model": "agentic"}
            headers = {"Authorization": f"Basic {self.api_key}"}
            
            print(f"Detecting: {description}")
            
            response = requests.post(url, files=files, data=data, headers=headers)
            
            if response.status_code != 200:
                print(f"API Error: Status code {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
            result = response.json()
            print(f"API Response for '{description}':", result)  
            
            if 'data' in result and isinstance(result['data'], list) and len(result['data']) > 0:
                for detection_list in result['data']:
                    if detection_list and len(detection_list) > 0:
                        detection = detection_list[0]
                        if 'bounding_box' in detection:
                            x1, y1, x2, y2 = detection['bounding_box']
                            char_box = {
                                'bbox': [x1, y1, x2, y2],
                                'center': [(x1 + x2) / 2, (y1 + y2) / 2],
                                'description': description
                            }
                            print(f"Found '{description}' at position {char_box['bbox']}")
                            return char_box
            
            print(f"No detection for '{description}'")
            return None
            
        except Exception as e:
            print(f"Error in character/object detection for '{description}': {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def calculate_text_size(self, text, font_size=20):
        """Calculate the dimensions needed for the text."""
        try:
            if self.font_path and os.path.exists(self.font_path):
                font = ImageFont.truetype(self.font_path, font_size)
            else:
                print("Using default font for text calculation")
                font = ImageFont.load_default()
        except Exception as e:
            print(f"Error loading font: {e}. Using default font.")
            font = ImageFont.load_default()
        
        max_width_scale = 0.25  
        max_line_width = int(self.width * max_width_scale)
        
        avg_char_width = font.getlength("X")
        chars_per_line = max(8, int(max_line_width / avg_char_width))
        lines = textwrap.wrap(text, width=chars_per_line)
        
        line_heights = []
        line_widths = []
        for line in lines:
            left, top, right, bottom = font.getbbox(line)
            line_widths.append(right - left)
            line_heights.append(bottom - top)
        
        if not line_heights or not line_widths:  
            return 0, 0, []
            
        text_width = max(line_widths)
        text_height = sum(line_heights)
        
        return text_width, text_height, lines
    
    def calculate_narration_size(self, text, font_size=20):
        """Calculate the dimensions needed for narration text."""
        try:
            if self.font_path and os.path.exists(self.font_path):
                font = ImageFont.truetype(self.font_path, font_size)
            else:
                print("Using default font for narration calculation")
                font = ImageFont.load_default()
        except Exception as e:
            print(f"Error loading font: {e}. Using default font.")
            font = ImageFont.load_default()
        
        max_width_scale = 0.9  
        max_line_width = int(self.width * max_width_scale)
        
        avg_char_width = font.getlength("X")
        chars_per_line = max(8, int(max_line_width / avg_char_width))
        lines = textwrap.wrap(text, width=chars_per_line)
        
        line_heights = []
        line_widths = []
        for line in lines:
            left, top, right, bottom = font.getbbox(line)
            line_widths.append(right - left)
            line_heights.append(bottom - top)
        
        if not line_heights or not line_widths:  
            return 0, 0, []
            
        text_width = max(line_widths)
        text_height = sum(line_heights)
        
        return text_width, text_height, lines
    
    def find_optimal_bubble_position(self, char_box, text, used_areas, font_size=20, attempt=0):
        """Find the optimal position for a speech bubble for a specific character."""
        if not char_box:
            if attempt == 0:
                print(f"No character box provided. Using random placement.")
                return self.find_any_open_space(text, used_areas, font_size)
            return None, None, None, None  
            
        char_center = char_box['center']
        
        text_width, text_height, lines = self.calculate_text_size(text, font_size)
        
        width_padding = self.bubble_padding * 1.5  
        height_padding = self.bubble_padding
        
        bubble_width = text_width + width_padding * 2
        bubble_height = text_height + height_padding * 2
        
        candidate_positions = [
            (char_center[0] - bubble_width/2, char_box['bbox'][1] - bubble_height - self.arrow_size),  
            (char_box['bbox'][2] + self.arrow_size, char_center[1] - bubble_height/2),               
            (char_box['bbox'][0] - bubble_width - self.arrow_size, char_center[1] - bubble_height/2),  
            (char_box['bbox'][0] - bubble_width, char_box['bbox'][1] - bubble_height),                
            (char_box['bbox'][2], char_box['bbox'][1] - bubble_height),                              
            (char_center[0] - bubble_width/2, char_box['bbox'][3] + self.arrow_size)                 
        ]
        
        for _ in range(3):
            rand_x = max(0, min(self.width - bubble_width, char_center[0] + random.randint(-200, 200)))
            rand_y = max(0, min(self.height - bubble_height, char_center[1] + random.randint(-200, 200)))
            candidate_positions.append((rand_x, rand_y))
        
        best_pos = None
        best_score = float('-inf')
        best_arrow_pos = None
        
        for pos_x, pos_y in candidate_positions:
            margin = 5
            if (pos_x < margin or pos_y < margin or 
                pos_x + bubble_width > self.width - margin or 
                pos_y + bubble_height > self.height - margin):
                continue
                
            bubble_rect = [pos_x, pos_y, pos_x + bubble_width, pos_y + bubble_height]
            
            overlaps = False
            for area in used_areas:
                if self.check_overlap(bubble_rect, area):
                    overlaps = True
                    break
                    
            if overlaps:
                continue
                
            arrow_pos = self.calculate_arrow_position_for_oval(bubble_rect, char_center)
            
            distance_to_char = math.sqrt(
                (arrow_pos[0] - char_center[0])**2 + 
                (arrow_pos[1] - char_center[1])**2
            )
            
            height_score = self.height - pos_y
            
            centrality = -abs(pos_x + bubble_width/2 - self.width/2) + (self.height - pos_y)
            
            score = -distance_to_char + height_score * 0.5 + centrality * 0.3
            
            if score > best_score:
                best_score = score
                best_pos = (pos_x, pos_y, bubble_width, bubble_height)
                best_arrow_pos = arrow_pos
                
        if best_pos:
            return best_pos, best_arrow_pos, lines, font_size
        
        if font_size > 10:
            return self.find_optimal_bubble_position(char_box, text, used_areas, font_size - 2, attempt)
        
        if attempt < 1:
            print(f"Couldn't find position for character. Trying random placement.")
            return self.find_any_open_space(text, used_areas, font_size)
        
        return None, None, None, None
    
    def find_off_panel_bubble_position(self, text, used_areas, font_size=20):
        """Find position for a speech bubble for off-panel dialogue following priority order."""
        text_width, text_height, lines = self.calculate_text_size(text, font_size)
        
        width_padding = self.bubble_padding * 1.5
        height_padding = self.bubble_padding
        
        bubble_width = text_width + width_padding * 2
        bubble_height = text_height + height_padding * 2
        
        priority_positions = [
            (self.bubble_padding, self.height - bubble_height - self.bubble_padding),
            (self.width - bubble_width - self.bubble_padding, self.height - bubble_height - self.bubble_padding),
            (self.bubble_padding, self.bubble_padding),
            (self.width - bubble_width - self.bubble_padding, self.bubble_padding),
        ]
        
        for pos_x, pos_y in priority_positions:
            bubble_rect = [pos_x, pos_y, pos_x + bubble_width, pos_y + bubble_height]
            
            if (pos_x < 0 or pos_y < 0 or 
                pos_x + bubble_width > self.width or 
                pos_y + bubble_height > self.height):
                continue
                
            overlaps = False
            for area in used_areas:
                if self.check_overlap(bubble_rect, area):
                    overlaps = True
                    break
                    
            if not overlaps:
                print(f"Placed off-panel bubble at position ({pos_x}, {pos_y})")
                return (pos_x, pos_y, bubble_width, bubble_height), lines, font_size
        
        grid_size = 6
        for i in range(grid_size):
            for j in range(grid_size):
                pos_x = i * (self.width - bubble_width) / (grid_size - 1)
                pos_y = j * (self.height - bubble_height) / (grid_size - 1)
                
                bubble_rect = [pos_x, pos_y, pos_x + bubble_width, pos_y + bubble_height]
                
                overlaps = False
                for area in used_areas:
                    if self.check_overlap(bubble_rect, area):
                        overlaps = True
                        break
                        
                if not overlaps:
                    print(f"Placed off-panel bubble at grid position ({pos_x}, {pos_y})")
                    return (pos_x, pos_y, bubble_width, bubble_height), lines, font_size
        
        if font_size > 10:
            print(f"Couldn't place off-panel bubble. Trying smaller font size.")
            return self.find_off_panel_bubble_position(text, used_areas, font_size - 2)
            
        print("Failed to place off-panel bubble at any position.")
        return None, None, None
    
    def find_any_open_space(self, text, used_areas, font_size=20):
        """Find any open space for a speech bubble when normal positioning fails."""
        text_width, text_height, lines = self.calculate_text_size(text, font_size)
        
        width_padding = self.bubble_padding * 1.5
        height_padding = self.bubble_padding
        
        bubble_width = text_width + width_padding * 2
        bubble_height = text_height + height_padding * 2
        
        grid_size = 10
        for i in range(grid_size):
            for j in range(grid_size):
                pos_x = i * (self.width - bubble_width) / (grid_size - 1)
                pos_y = j * (self.height - bubble_height) / (grid_size - 1)
                
                bubble_rect = [pos_x, pos_y, pos_x + bubble_width, pos_y + bubble_height]
                
                overlaps = False
                for area in used_areas:
                    if self.check_overlap(bubble_rect, area):
                        overlaps = True
                        break
                        
                if not overlaps:
                    arrow_pos = (pos_x + bubble_width/2, pos_y + bubble_height)
                    return (pos_x, pos_y, bubble_width, bubble_height), arrow_pos, lines, font_size
        
        if font_size > 10:
            return self.find_any_open_space(text, used_areas, font_size - 2)
        
        return None, None, None, None
    
    def check_overlap(self, rect1, rect2):
        """Check if two rectangles overlap."""
        return not (rect1[2] < rect2[0] or  
                   rect1[0] > rect2[2] or  
                   rect1[3] < rect2[1] or  
                   rect1[1] > rect2[3])   
                   
    def calculate_arrow_position_for_oval(self, bubble_rect, char_center):
        """Calculate the best position for the speech bubble arrow, accounting for oval shape."""
        x_center = (bubble_rect[0] + bubble_rect[2]) / 2
        y_center = (bubble_rect[1] + bubble_rect[3]) / 2
        a = (bubble_rect[2] - bubble_rect[0]) / 2  
        b = (bubble_rect[3] - bubble_rect[1]) / 2  
        
        dx = char_center[0] - x_center
        dy = char_center[1] - y_center
        
        if dx == 0:
            theta = math.pi/2 if dy > 0 else -math.pi/2
        else:
            theta = math.atan(dy / dx)
            if dx < 0:
                theta += math.pi
        
        x = x_center + a * math.cos(theta)
        y = y_center + b * math.sin(theta)
        
        return (x, y)
    
    def draw_speech_bubble(self, pos, arrow_pos, lines, font_size, draw_arrow=True):
        """Draw a speech bubble and its text."""
        x, y, width, height = pos
        
        bubble_rect = (x, y, x + width, y + height)
        
        self.draw.ellipse(bubble_rect, fill=self.bubble_color)
        self.draw.ellipse(bubble_rect, outline=self.border_color, width=self.border_width)
        
        if draw_arrow and arrow_pos:
            bubble_center_x = x + width / 2
            bubble_center_y = y + height / 2
            
            vector_x = arrow_pos[0] - bubble_center_x
            vector_y = arrow_pos[1] - bubble_center_y
            
            magnitude = math.sqrt(vector_x**2 + vector_y**2)
            if magnitude < 0.001:  
                vector_x, vector_y = 0, -1  
            else:
                vector_x /= magnitude
                vector_y /= magnitude
                
            target_x = arrow_pos[0] + vector_x * self.arrow_size * 1.5
            target_y = arrow_pos[1] + vector_y * self.arrow_size * 1.5
            
            perp_x = -vector_y
            perp_y = vector_x
            base_half_width = self.arrow_size / 2
            
            arrow_points = [
                (target_x, target_y),
                (arrow_pos[0] + perp_x * base_half_width, arrow_pos[1] + perp_y * base_half_width),
                (arrow_pos[0] - perp_x * base_half_width, arrow_pos[1] - perp_y * base_half_width)
            ]
            
            self.draw.polygon(arrow_points, fill=self.bubble_color)
            
            self.draw.line([arrow_points[0], arrow_points[1]], fill=self.border_color, width=self.border_width)
            self.draw.line([arrow_points[0], arrow_points[2]], fill=self.border_color, width=self.border_width)
            self.draw.line([arrow_points[1], arrow_points[2]], fill=self.border_color, width=self.border_width)
        
        try:
            if self.font_path and os.path.exists(self.font_path):
                font = ImageFont.truetype(self.font_path, font_size)
            else:
                print("Using default font for speech bubble drawing")
                font = ImageFont.load_default()
        except Exception as e:
            print(f"Error loading font: {e}. Using default font.")
            font = ImageFont.load_default()
            
        text_y = y + self.bubble_padding
        
        for line in lines:
            left, top, right, bottom = font.getbbox(line)
            line_width = right - left
            line_height = bottom - top
            
            text_x = x + (width - line_width) / 2
            self.draw.text((text_x, text_y), line, fill=self.text_color, font=font)
            text_y += line_height
    
    def add_narration(self, narration_text, position="top", font_size=20):
        """
        Add narration text at the top or bottom of the image.
        
        Args:
            narration_text: The narration text to add
            position: "top" or "bottom" - where to place the narration
            font_size: Size of the font for narration text
        
        Returns:
            PIL Image with narration added
        """
        if not narration_text:
            return self.image
            
        print(f"Adding narration text at {position}")
        
        text_width, text_height, lines = self.calculate_narration_size(narration_text, font_size)
        
        total_height = text_height + self.narration_padding * 2
        
        if position.lower() == "top":
            new_height = self.height + total_height
            new_img = Image.new('RGB', (self.width, new_height), self.narration_bg_color)
            new_img.paste(self.image, (0, total_height))
            narration_y = self.narration_padding
        else:  
            new_height = self.height + total_height
            new_img = Image.new('RGB', (self.width, new_height), self.narration_bg_color)
            new_img.paste(self.image, (0, 0))
            narration_y = self.height + self.narration_padding
        
        draw = ImageDraw.Draw(new_img)
        try:
            if self.font_path and os.path.exists(self.font_path):
                font = ImageFont.truetype(self.font_path, font_size)
            else:
                print("Using default font for narration")
                font = ImageFont.load_default()
        except Exception as e:
            print(f"Error loading font: {e}. Using default font.")
            font = ImageFont.load_default()
        
        for line in lines:
            left, top, right, bottom = font.getbbox(line)
            line_width = right - left
            line_height = bottom - top
            
            text_x = (self.width - line_width) / 2
            
            draw.text((text_x, narration_y), line, fill=self.narration_text_color, font=font)
            narration_y += line_height
        
        self.image = new_img
        self.draw = ImageDraw.Draw(self.image)
        
        return self.image
    
    def add_both_narrations(self, top_narration, bottom_narration, font_size=20):
        """
        Add both top and bottom narrations with proper black backgrounds.
        
        Args:
            top_narration: Text for top narration (can be None)
            bottom_narration: Text for bottom narration (can be None)
            font_size: Size of the font for narration text
        
        Returns:
            PIL Image with both narrations added
        """
        top_height = 0
        bottom_height = 0
        top_lines = []
        bottom_lines = []
        
        if top_narration:
            _, text_height, lines = self.calculate_narration_size(top_narration, font_size)
            top_height = text_height + self.narration_padding * 2
            top_lines = lines
        
        if bottom_narration:
            _, text_height, lines = self.calculate_narration_size(bottom_narration, font_size)
            bottom_height = text_height + self.narration_padding * 2
            bottom_lines = lines
        
        new_height = self.height + top_height + bottom_height
        new_img = Image.new('RGB', (self.width, new_height), (255, 255, 255))  
        
        if top_height > 0:
            top_bg = Image.new('RGB', (self.width, top_height), self.narration_bg_color)
            new_img.paste(top_bg, (0, 0))
        
        new_img.paste(self.image, (0, top_height))
        
        if bottom_height > 0:
            bottom_bg = Image.new('RGB', (self.width, bottom_height), self.narration_bg_color)
            new_img.paste(bottom_bg, (0, top_height + self.height))
        
        draw = ImageDraw.Draw(new_img)
        try:
            if self.font_path and os.path.exists(self.font_path):
                font = ImageFont.truetype(self.font_path, font_size)
            else:
                print("Using default font for both narrations")
                font = ImageFont.load_default()
        except Exception as e:
            print(f"Error loading font: {e}. Using default font.")
            font = ImageFont.load_default()
        
        if top_narration:
            narration_y = self.narration_padding
            for line in top_lines:
                left, top, right, bottom = font.getbbox(line)
                line_width = right - left
                line_height = bottom - top
                
                text_x = (self.width - line_width) / 2
                draw.text((text_x, narration_y), line, fill=self.narration_text_color, font=font)
                narration_y += line_height
        
        if bottom_narration:
            narration_y = top_height + self.height + self.narration_padding
            for line in bottom_lines:
                left, top, right, bottom = font.getbbox(line)
                line_width = right - left
                line_height = bottom - top
                
                text_x = (self.width - line_width) / 2
                draw.text((text_x, narration_y), line, fill=self.narration_text_color, font=font)
                narration_y += line_height
        
        self.image = new_img
        self.draw = ImageDraw.Draw(self.image)
        
        return self.image
    
    def detect_all_heads(self):
        """
        Detect all heads in the image using a generic prompt.
        This helps catch heads that might be missed by specific character detection.
        
        Returns:
            List of detected head boxes
        """
        url = "https://api.va.landing.ai/v1/tools/agentic-object-detection"
        
        try:
            files = {"image": open(self.image_path, "rb")}
            data = {"prompts": "Detect all human and humanoid heads", "model": "agentic"}
            headers = {"Authorization": f"Basic {self.api_key}"}
            
            print(f"Detecting all heads in the image...")
            
            response = requests.post(url, files=files, data=data, headers=headers)
            
            if response.status_code != 200:
                print(f"API Error: Status code {response.status_code}")
                print(f"Response: {response.text}")
                return []
                
            result = response.json()
            print(f"API Response for all heads detection:", result)  
            
            head_boxes = []
            if 'data' in result and isinstance(result['data'], list) and len(result['data']) > 0:
                for detection_list in result['data']:
                    if detection_list and len(detection_list) > 0:
                        for detection in detection_list:
                            if 'bounding_box' in detection:
                                x1, y1, x2, y2 = detection['bounding_box']
                                head_box = {
                                    'bbox': [x1, y1, x2, y2],
                                    'center': [(x1 + x2) / 2, (y1 + y2) / 2],
                                    'description': "generic_head",
                                    'detection_type': 'generic'
                                }
                                head_boxes.append(head_box)
                                print(f"Found generic head at position {head_box['bbox']}")
            
            return head_boxes
            
        except Exception as e:
            print(f"Error in generic head detection: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def save_debug_image(self, filename, character_boxes=None):
        """
        Save a debug image with colored bounding boxes for detected heads.
        
        Args:
            filename: Path to save the debug image
            character_boxes: List of character boxes to draw
        """
        debug_img = self.original_image.copy()
        draw = ImageDraw.Draw(debug_img)
        
        for box in self.all_head_boxes:
            x1, y1, x2, y2 = box['bbox']
            draw.rectangle([x1, y1, x2, y2], outline=(255, 0, 0), width=3)
        
        if character_boxes:
            for box in character_boxes:
                x1, y1, x2, y2 = box['bbox']
                draw.rectangle([x1, y1, x2, y2], outline=(0, 0, 255), width=2)
        
        debug_img.save(filename)
        print(f"Saved debug image with bounding boxes to: {filename}")
        
    def generate_speech_bubbles(self, dialogues, narration=None, narration_position="top", top_narration=None, bottom_narration=None):
        """
        Generate speech bubbles for the given dialogues and add narrations.
        
        Args:
            dialogues: List of dialogue dictionaries
            narration: Optional single narration text (legacy parameter)
            narration_position: "top" or "bottom" - where to place the single narration
            top_narration: Optional narration text to place at the top
            bottom_narration: Optional narration text to place at the bottom
        """
        self.image = self.original_image.copy()
        self.draw = ImageDraw.Draw(self.image)
        
        has_character_dialogues = any(
            dialogue.get('character_description') and 
            not dialogue.get('is_off_panel', False) 
            for dialogue in dialogues
        )
        
        has_human_speakers = any(
            dialogue.get('character_description') and 
            not dialogue.get('is_off_panel', False) and
            'head' in dialogue.get('character_description', '').lower()
            for dialogue in dialogues
        )
        
        if has_human_speakers:
            self.all_head_boxes = self.detect_all_heads()
            print(f"Detected {len(self.all_head_boxes)} generic heads in the image")
        else:
            self.all_head_boxes = []
            print("No human speakers found - skipping head detection for optimization")
        
        dialogues = dialogues[:5]
        print(f"Processing {len(dialogues)} dialogues")
        
        on_panel_dialogues = []
        off_panel_dialogues = []
        
        all_detected_boxes = []
        all_detected_boxes.extend(self.all_head_boxes)
        
        character_boxes = []
        
        for dialogue in dialogues:
            if 'character_description' in dialogue and not dialogue.get('is_off_panel', False):
                char_box = self.detect_character(dialogue['character_description'])
                if char_box:
                    char_box['detection_type'] = 'specific'
                    character_boxes.append(char_box)
                    all_detected_boxes.append(char_box)
                    on_panel_dialogues.append(dialogue)
                else:
                    print(f"Character/object '{dialogue['character_description']}' not detected. Making dialogue off-panel.")
                    off_panel_dialogues.append(dialogue)
            else:
                off_panel_dialogues.append(dialogue)
        
        print(f"On-panel dialogues: {len(on_panel_dialogues)}, Off-panel dialogues: {len(off_panel_dialogues)}")
        
        on_panel_dialogues = on_panel_dialogues[:3]  
        
        used_areas = [box['bbox'] for box in all_detected_boxes] if all_detected_boxes else []
        
        debug_image_path = self.image_path.replace('.png', '_debug.png')
        self.save_debug_image(debug_image_path, character_boxes)
        
        if character_boxes:
            for i, dialogue in enumerate(on_panel_dialogues):
                char_box = None
                if 'character_description' in dialogue:
                    for box in character_boxes:
                        if box['description'] == dialogue['character_description']:
                            char_box = box
                            break
                
                text = dialogue.get('text', '')
                
                if not text:
                    continue
                    
                char_desc = dialogue.get('character_description', 'Unknown')
                print(f"Generating on-panel bubble {i+1} for character/object '{char_desc}': '{text[:20]}...'")
                
                pos, arrow_pos, lines, font_size = self.find_optimal_bubble_position(
                    char_box, text, used_areas
                )
                
                if pos:
                    print(f"Placed on-panel bubble {i+1} at position {pos}")
                    used_areas.append([pos[0], pos[1], pos[0] + pos[2], pos[1] + pos[3]])
                    
                    is_device = not ('head' in char_desc.lower())
                    self.draw_speech_bubble(pos, arrow_pos, lines, font_size, draw_arrow=True)
                else:
                    print(f"Failed to place on-panel bubble {i+1}")
        
        for i, dialogue in enumerate(off_panel_dialogues):
            text = dialogue.get('text', '')
            
            if not text:
                continue
                
            speaker = dialogue.get('character_description', 'Unknown speaker')
            character_name = dialogue.get('character_name', '')
            
            if character_name:
                formatted_text = f"{character_name}: \"{text}\""
            else:
                formatted_text = text
            
            print(f"Generating off-panel bubble {i+1} for '{speaker}' ({character_name}): '{formatted_text[:20]}...'")
            
            pos, lines, font_size = self.find_off_panel_bubble_position(formatted_text, used_areas)
            
            if pos:
                print(f"Placed off-panel bubble {i+1} at position {pos}")
                used_areas.append([pos[0], pos[1], pos[0] + pos[2], pos[1] + pos[3]])
                
                self.draw_speech_bubble(pos, None, lines, font_size, draw_arrow=False)
            else:
                print(f"Failed to place off-panel bubble {i+1}")
    
        if top_narration and bottom_narration:
            self.add_both_narrations(top_narration, bottom_narration)
        elif narration:  
            self.add_narration(narration, narration_position)
        elif top_narration:  
            self.add_narration(top_narration, "top")
        elif bottom_narration: 
            self.add_narration(bottom_narration, "bottom")
        
        return self.image
    
    def save(self, output_path):
        """Save the image with speech bubbles."""
        self.image.save(output_path)

