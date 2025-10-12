import cv2
import numpy as np
from PIL import Image

def preprocess_image(image_path, target_size=(224, 224)):
    img = cv2.imread(image_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    resized = cv2.resize(img_rgb, target_size, interpolation=cv2.INTER_LANCZOS4)
    
    normalized = resized.astype(np.float32) / 255.0
    
    return normalized

def extract_performative_features(image):
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    
    sift = cv2.SIFT_create()
    keypoints, descriptors = sift.detectAndCompute(gray, None)
    
    orb = cv2.ORB_create()
    kp_orb, desc_orb = orb.detectAndCompute(gray, None)
    
    edges = cv2.Canny(gray, 50, 150)
    
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    hist_r = cv2.calcHist([image], [0], None, [256], [0, 256])
    hist_g = cv2.calcHist([image], [1], None, [256], [0, 256])
    hist_b = cv2.calcHist([image], [2], None, [256], [0, 256])
    
    features = {
        'sift_keypoints': len(keypoints) if keypoints else 0,
        'orb_keypoints': len(kp_orb) if kp_orb else 0,
        'contour_count': len(contours),
        'edge_density': np.sum(edges > 0) / edges.size,
        'color_variance': np.var(image),
        'brightness': np.mean(cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)),
        'contrast': np.std(cv2.cvtColor(image, cv2.COLOR_RGB2GRAY))
    }
    
    return features

def detect_objects_cascade(image):
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    eyes = eye_cascade.detectMultiScale(gray, 1.1, 4)
    
    return {
        'faces': len(faces),
        'eyes': len(eyes),
        'face_boxes': faces.tolist() if len(faces) > 0 else [],
        'eye_boxes': eyes.tolist() if len(eyes) > 0 else []
    }

def apply_aesthetic_filters(image):
    vintage_filter = cv2.applyColorMap(image, cv2.COLORMAP_AUTUMN)
    
    sepia_kernel = np.array([[0.272, 0.534, 0.131],
                            [0.349, 0.686, 0.168],
                            [0.393, 0.769, 0.189]])
    sepia = cv2.transform(image, sepia_kernel)
    
    blur = cv2.GaussianBlur(image, (15, 15), 0)
    
    return {
        'vintage': vintage_filter,
        'sepia': sepia,
        'blur': blur
    }

def analyze_composition(image):
    height, width = image.shape[:2]
    
    rule_of_thirds_x = [width // 3, 2 * width // 3]
    rule_of_thirds_y = [height // 3, 2 * height // 3]
    
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    corners = cv2.goodFeaturesToTrack(gray, maxCorners=100, qualityLevel=0.01, minDistance=10)
    
    center_weight = 0
    if corners is not None:
        for corner in corners:
            x, y = corner.ravel()
            if (rule_of_thirds_x[0] - 20 <= x <= rule_of_thirds_x[0] + 20 or
                rule_of_thirds_x[1] - 20 <= x <= rule_of_thirds_x[1] + 20) and \
               (rule_of_thirds_y[0] - 20 <= y <= rule_of_thirds_y[0] + 20 or
                rule_of_thirds_y[1] - 20 <= y <= rule_of_thirds_y[1] + 20):
                center_weight += 1
    
    symmetry_score = calculate_symmetry(gray)
    
    return {
        'rule_of_thirds_score': center_weight,
        'symmetry_score': symmetry_score,
        'corner_count': len(corners) if corners is not None else 0
    }

def calculate_symmetry(gray_image):
    height, width = gray_image.shape
    left_half = gray_image[:, :width//2]
    right_half = cv2.flip(gray_image[:, width//2:], 1)
    
    min_width = min(left_half.shape[1], right_half.shape[1])
    left_half = left_half[:, :min_width]
    right_half = right_half[:, :min_width]
    
    diff = cv2.absdiff(left_half, right_half)
    symmetry = 1.0 - (np.mean(diff) / 255.0)
    
    return symmetry

def enhance_image_quality(image):
    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    l = clahe.apply(l)
    
    enhanced = cv2.merge([l, a, b])
    enhanced_rgb = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
    
    return enhanced_rgb