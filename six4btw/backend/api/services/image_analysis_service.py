import os
import io
import base64
import numpy as np
import cv2
from PIL import Image
import torch
import torchvision.transforms as transforms
from flask import Flask, request, jsonify
import logging
from datetime import datetime
import json
import hashlib
import redis
from typing import Dict, List, Tuple, Optional
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor
import multiprocessing as mp

class ImageAnalysisService:
    def __init__(self, model_path: str, redis_host: str = 'localhost', redis_port: int = 6379):
        self.model_path = model_path
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.transform = None
        self.redis_client = None
        self.executor = ThreadPoolExecutor(max_workers=mp.cpu_count())
        
        self.performative_items_db = {
            'vintage_camera': {'score': 15, 'keywords': ['camera', 'vintage', 'film', 'analog', 'leica', 'canon', 'nikon']},
            'tote_bag': {'score': 12, 'keywords': ['bag', 'tote', 'canvas', 'shopping', 'eco', 'reusable']},
            'record_player': {'score': 18, 'keywords': ['turntable', 'vinyl', 'record', 'player', 'technics', 'audio']},
            'typewriter': {'score': 20, 'keywords': ['typewriter', 'vintage', 'mechanical', 'writing', 'antique']},
            'coffee_artisan': {'score': 8, 'keywords': ['coffee', 'espresso', 'latte', 'cappuccino', 'barista', 'artisan']},
            'books_literature': {'score': 10, 'keywords': ['book', 'novel', 'literature', 'reading', 'library', 'poetry']},
            'thick_rim_glasses': {'score': 11, 'keywords': ['glasses', 'eyewear', 'spectacles', 'frames', 'hipster']},
            'groomed_beard': {'score': 8, 'keywords': ['beard', 'facial hair', 'mustache', 'goatee', 'groomed']},
            'flannel_shirt': {'score': 9, 'keywords': ['flannel', 'plaid', 'checkered', 'shirt', 'lumber']},
            'fixed_gear_bicycle': {'score': 13, 'keywords': ['bicycle', 'bike', 'cycling', 'fixed gear', 'fixie']},
            'art_supplies': {'score': 14, 'keywords': ['paint', 'brush', 'canvas', 'art', 'creative', 'studio']},
            'indie_band_merch': {'score': 16, 'keywords': ['band', 'music', 'indie', 'concert', 'merch', 'vinyl']},
            'craft_beer': {'score': 7, 'keywords': ['beer', 'craft', 'brewery', 'ipa', 'hops', 'artisan']},
            'thrift_clothing': {'score': 9, 'keywords': ['thrift', 'vintage', 'secondhand', 'retro', 'used']},
            'polaroid_camera': {'score': 17, 'keywords': ['polaroid', 'instant', 'film', 'photo', 'vintage']},
            'moleskine_notebook': {'score': 6, 'keywords': ['notebook', 'moleskine', 'journal', 'writing', 'leather']},
            'beanie_hat': {'score': 5, 'keywords': ['beanie', 'hat', 'knit', 'winter', 'wool']},
            'suspenders': {'score': 12, 'keywords': ['suspenders', 'braces', 'vintage', 'retro', 'formal']},
            'bow_tie': {'score': 10, 'keywords': ['bow tie', 'formal', 'vintage', 'dapper', 'classic']},
            'pocket_watch': {'score': 19, 'keywords': ['watch', 'pocket', 'vintage', 'antique', 'timepiece']}
        }
        
        self.setup_logging()
        self.initialize_services()
    
    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('image_analysis_service.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def initialize_services(self):
        try:
            self.redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
            self.redis_client.ping()
            self.logger.info("Redis connection established")
        except Exception as e:
            self.logger.warning(f"Redis connection failed: {e}")
            self.redis_client = None
        
        self.load_model()
        self.setup_transforms()
    
    def load_model(self):
        try:
            from performative_net import PerformativeNet
            self.model = PerformativeNet(num_classes=2)
            
            if os.path.exists(self.model_path):
                checkpoint = torch.load(self.model_path, map_location=self.device)
                self.model.load_state_dict(checkpoint['model_state_dict'])
                self.logger.info(f"Model loaded from {self.model_path}")
            else:
                self.logger.warning(f"Model file not found: {self.model_path}")
            
            self.model.to(self.device)
            self.model.eval()
            
        except Exception as e:
            self.logger.error(f"Error loading model: {e}")
            self.model = None
    
    def setup_transforms(self):
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def preprocess_image(self, image_data: bytes) -> torch.Tensor:
        try:
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            tensor = self.transform(image).unsqueeze(0)
            return tensor.to(self.device)
        except Exception as e:
            self.logger.error(f"Error preprocessing image: {e}")
            raise ValueError("Invalid image format")
    
    def extract_opencv_features(self, image_data: bytes) -> Dict:
        try:
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
            
            sift = cv2.SIFT_create()
            keypoints, descriptors = sift.detectAndCompute(gray, None)
            
            orb = cv2.ORB_create()
            kp_orb, desc_orb = orb.detectAndCompute(gray, None)
            
            edges = cv2.Canny(gray, 50, 150)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            hist_r = cv2.calcHist([image_rgb], [0], None, [256], [0, 256])
            hist_g = cv2.calcHist([image_rgb], [1], None, [256], [0, 256])
            hist_b = cv2.calcHist([image_rgb], [2], None, [256], [0, 256])
            
            features = {
                'sift_keypoints': len(keypoints) if keypoints else 0,
                'orb_keypoints': len(kp_orb) if kp_orb else 0,
                'contour_count': len(contours),
                'edge_density': float(np.sum(edges > 0) / edges.size),
                'brightness': float(np.mean(gray)),
                'contrast': float(np.std(gray)),
                'color_variance': float(np.var(image_rgb)),
                'image_size': image_rgb.shape[:2],
                'color_histograms': {
                    'red': hist_r.flatten().tolist()[:50],
                    'green': hist_g.flatten().tolist()[:50],
                    'blue': hist_b.flatten().tolist()[:50]
                }
            }
            
            return features
            
        except Exception as e:
            self.logger.error(f"Error extracting OpenCV features: {e}")
            return {}
    
    def detect_performative_items(self, opencv_features: Dict, mock_labels: List[str] = None) -> List[Dict]:
        detected_items = []
        
        if mock_labels is None:
            mock_labels = self.generate_mock_labels(opencv_features)
        
        for label in mock_labels:
            label_lower = label.lower()
            
            for item_name, item_data in self.performative_items_db.items():
                for keyword in item_data['keywords']:
                    if keyword in label_lower:
                        confidence = min(0.95, max(0.6, np.random.normal(0.8, 0.1)))
                        
                        detected_items.append({
                            'item': item_name.replace('_', ' ').title(),
                            'points': item_data['score'],
                            'confidence': float(confidence),
                            'matched_keyword': keyword,
                            'original_label': label,
                            'match_type': 'exact' if keyword == label_lower else 'partial'
                        })
                        break
        
        detected_items = sorted(detected_items, key=lambda x: x['points'], reverse=True)
        return detected_items[:8]
    
    def generate_mock_labels(self, opencv_features: Dict) -> List[str]:
        base_labels = [
            'person', 'clothing', 'face', 'hair', 'hand', 'furniture', 
            'wall', 'floor', 'window', 'door', 'table', 'chair'
        ]
        
        performative_labels = []
        
        if opencv_features.get('sift_keypoints', 0) > 100:
            performative_labels.extend(['vintage camera', 'typewriter', 'record player'])
        
        if opencv_features.get('brightness', 128) < 100:
            performative_labels.extend(['coffee shop', 'dim lighting', 'artistic'])
        
        if opencv_features.get('contour_count', 0) > 50:
            performative_labels.extend(['books', 'art supplies', 'cluttered desk'])
        
        edge_density = opencv_features.get('edge_density', 0)
        if edge_density > 0.1:
            performative_labels.extend(['glasses', 'geometric patterns', 'detailed objects'])
        
        contrast = opencv_features.get('contrast', 50)
        if contrast > 60:
            performative_labels.extend(['high contrast', 'dramatic lighting', 'black and white'])
        
        all_labels = base_labels + performative_labels
        return np.random.choice(all_labels, size=min(len(all_labels), 12), replace=False).tolist()
    
    def calculate_performative_score(self, detected_items: List[Dict], opencv_features: Dict) -> int:
        base_score = sum(item['points'] * item['confidence'] for item in detected_items)
        
        aesthetic_bonus = 0
        
        if opencv_features.get('sift_keypoints', 0) > 150:
            aesthetic_bonus += 5
        
        if 80 < opencv_features.get('brightness', 128) < 120:
            aesthetic_bonus += 3
        
        if opencv_features.get('contrast', 50) > 55:
            aesthetic_bonus += 4
        
        edge_density = opencv_features.get('edge_density', 0)
        if 0.05 < edge_density < 0.15:
            aesthetic_bonus += 3
        
        total_score = int(min(100, base_score + aesthetic_bonus))
        
        return max(0, total_score)
    
    def generate_performative_message(self, score: int, detected_items: List[Dict]) -> str:
        messages = {
            (80, 100): [
                "Peak performative energy detected! You've mastered the art of curated authenticity.",
                "Congratulations, you've achieved maximum indie credibility points.",
                "Your aesthetic game is so strong it's practically a performance art piece."
            ],
            (60, 79): [
                "Strong performative vibes! You're well on your way to indie stardom.",
                "Impressive collection of carefully curated lifestyle choices.",
                "Your performative masculinity is showing, and honestly, we're here for it."
            ],
            (40, 59): [
                "Moderate performative energy. You're dipping your toes in the indie waters.",
                "Some solid performative elements, but there's room for more curation.",
                "You're getting there! A few more vintage items should do the trick."
            ],
            (20, 39): [
                "Mild performative tendencies detected. Still mostly authentic.",
                "Just a hint of performative energy. Keep it subtle, we respect that.",
                "Low-key performative vibes. The understated approach works too."
            ],
            (0, 19): [
                "Refreshingly authentic! No performative energy detected.",
                "Genuinely authentic vibes. Respect for keeping it real.",
                "Zero performative points. You're either very authentic or very good at hiding it."
            ]
        }
        
        for (min_score, max_score), message_list in messages.items():
            if min_score <= score <= max_score:
                return np.random.choice(message_list)
        
        return "Unable to determine performative level. Try again with a clearer image."
    
    def get_cache_key(self, image_data: bytes) -> str:
        return f"performative_analysis:{hashlib.md5(image_data).hexdigest()}"
    
    def get_cached_result(self, cache_key: str) -> Optional[Dict]:
        if not self.redis_client:
            return None
        
        try:
            cached = self.redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            self.logger.error(f"Error retrieving from cache: {e}")
        
        return None
    
    def cache_result(self, cache_key: str, result: Dict, ttl: int = 3600):
        if not self.redis_client:
            return
        
        try:
            self.redis_client.setex(cache_key, ttl, json.dumps(result))
        except Exception as e:
            self.logger.error(f"Error caching result: {e}")
    
    async def analyze_image(self, image_data: bytes) -> Dict:
        start_time = datetime.now()
        
        cache_key = self.get_cache_key(image_data)
        cached_result = self.get_cached_result(cache_key)
        
        if cached_result:
            self.logger.info("Returning cached result")
            return cached_result
        
        try:
            opencv_features = await asyncio.get_event_loop().run_in_executor(
                self.executor, self.extract_opencv_features, image_data
            )
            
            detected_items = self.detect_performative_items(opencv_features)
            
            score = self.calculate_performative_score(detected_items, opencv_features)
            
            message = self.generate_performative_message(score, detected_items)
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            result = {
                'score': score,
                'message': message,
                'detectedItems': detected_items,
                'processingTime': int(processing_time),
                'metadata': {
                    'totalLabelsFound': len(detected_items) + 5,
                    'performativeItemsDetected': len(detected_items),
                    'visionProcessingTime': int(processing_time * 0.7),
                    'ratingProcessingTime': int(processing_time * 0.3),
                    'timestamp': datetime.now().isoformat()
                },
                'debug': {
                    'processedLabels': [
                        {
                            'original': item['original_label'],
                            'processed': item['matched_keyword'],
                            'confidence': item['confidence']
                        } for item in detected_items
                    ],
                    'opencv_features': {
                        'sift_keypoints': opencv_features.get('sift_keypoints', 0),
                        'contour_count': opencv_features.get('contour_count', 0),
                        'edge_density': round(opencv_features.get('edge_density', 0), 4),
                        'brightness': round(opencv_features.get('brightness', 0), 2),
                        'contrast': round(opencv_features.get('contrast', 0), 2)
                    }
                },
                'performativeItems': {item['item']: item['points'] for item in detected_items}
            }
            
            self.cache_result(cache_key, result)
            
            self.logger.info(f"Analysis completed in {processing_time:.2f}ms, score: {score}")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error during image analysis: {e}")
            raise Exception(f"Analysis failed: {str(e)}")
    
    def health_check(self) -> Dict:
        return {
            'status': 'healthy',
            'model_loaded': self.model is not None,
            'device': str(self.device),
            'redis_connected': self.redis_client is not None,
            'timestamp': datetime.now().isoformat()
        }

app = Flask(__name__)
service = ImageAnalysisService(model_path='models/best_performative_model.pth')

@app.route('/health', methods=['GET'])
def health():
    return jsonify(service.health_check())

@app.route('/analyze', methods=['POST'])
async def analyze():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        image_data = image_file.read()
        
        if len(image_data) == 0:
            return jsonify({'error': 'Empty image file'}), 400
        
        result = await service.analyze_image(image_data)
        return jsonify({'data': result})
        
    except Exception as e:
        app.logger.error(f"Analysis error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)