import cv2
import numpy as np
from sklearn.cluster import KMeans
import os

class PerformativeFeatureExtractor:
    def __init__(self):
        self.sift = cv2.SIFT_create(nfeatures=500)
        self.orb = cv2.ORB_create(nfeatures=500)
        self.surf = None
        
        try:
            self.surf = cv2.xfeatures2d.SURF_create(hessianThreshold=400)
        except:
            pass
    
    def extract_color_features(self, image):
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        hist_h = cv2.calcHist([hsv], [0], None, [180], [0, 180])
        hist_s = cv2.calcHist([hsv], [1], None, [256], [0, 256])
        hist_v = cv2.calcHist([hsv], [2], None, [256], [0, 256])
        
        dominant_colors = self._extract_dominant_colors(image)
        
        color_moments = self._calculate_color_moments(image)
        
        return {
            'hue_histogram': hist_h.flatten(),
            'saturation_histogram': hist_s.flatten(),
            'value_histogram': hist_v.flatten(),
            'dominant_colors': dominant_colors,
            'color_moments': color_moments
        }
    
    def _extract_dominant_colors(self, image, k=5):
        data = image.reshape((-1, 3))
        data = np.float32(data)
        
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, labels, centers = cv2.kmeans(data, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        return centers.astype(int).tolist()
    
    def _calculate_color_moments(self, image):
        moments = []
        for channel in range(3):
            channel_data = image[:, :, channel].flatten()
            mean = np.mean(channel_data)
            std = np.std(channel_data)
            skewness = np.mean(((channel_data - mean) / std) ** 3)
            moments.extend([mean, std, skewness])
        
        return moments
    
    def extract_texture_features(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        lbp_features = self._calculate_lbp(gray)
        
        glcm_features = self._calculate_glcm(gray)
        
        gabor_features = self._calculate_gabor_features(gray)
        
        return {
            'lbp': lbp_features,
            'glcm': glcm_features,
            'gabor': gabor_features
        }
    
    def _calculate_lbp(self, gray_image, radius=3, n_points=24):
        lbp = np.zeros_like(gray_image)
        
        for i in range(radius, gray_image.shape[0] - radius):
            for j in range(radius, gray_image.shape[1] - radius):
                center = gray_image[i, j]
                binary_string = ''
                
                for k in range(n_points):
                    angle = 2 * np.pi * k / n_points
                    x = int(i + radius * np.cos(angle))
                    y = int(j + radius * np.sin(angle))
                    
                    if gray_image[x, y] >= center:
                        binary_string += '1'
                    else:
                        binary_string += '0'
                
                lbp[i, j] = int(binary_string, 2)
        
        hist, _ = np.histogram(lbp.ravel(), bins=256, range=(0, 256))
        return hist
    
    def _calculate_glcm(self, gray_image):
        from skimage.feature import greycomatrix, greycoprops
        
        distances = [1, 2, 3]
        angles = [0, np.pi/4, np.pi/2, 3*np.pi/4]
        
        glcm = greycomatrix(gray_image, distances=distances, angles=angles, 
                           levels=256, symmetric=True, normed=True)
        
        properties = ['contrast', 'dissimilarity', 'homogeneity', 'energy']
        features = []
        
        for prop in properties:
            feature_values = greycoprops(glcm, prop)
            features.extend(feature_values.flatten())
        
        return features
    
    def _calculate_gabor_features(self, gray_image):
        features = []
        
        for theta in range(0, 180, 30):
            for frequency in [0.1, 0.3, 0.5]:
                kernel = cv2.getGaborKernel((21, 21), 5, np.radians(theta), 
                                         2*np.pi*frequency, 0.5, 0, ktype=cv2.CV_32F)
                filtered = cv2.filter2D(gray_image, cv2.CV_8UC3, kernel)
                
                features.append(np.mean(filtered))
                features.append(np.std(filtered))
        
        return features
    
    def extract_shape_features(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        shape_features = {
            'contour_count': len(contours),
            'total_area': 0,
            'total_perimeter': 0,
            'aspect_ratios': [],
            'solidity_values': [],
            'extent_values': []
        }
        
        for contour in contours:
            area = cv2.contourArea(contour)
            perimeter = cv2.arcLength(contour, True)
            
            if area > 100:
                shape_features['total_area'] += area
                shape_features['total_perimeter'] += perimeter
                
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = float(w) / h
                shape_features['aspect_ratios'].append(aspect_ratio)
                
                hull = cv2.convexHull(contour)
                hull_area = cv2.contourArea(hull)
                if hull_area > 0:
                    solidity = float(area) / hull_area
                    shape_features['solidity_values'].append(solidity)
                
                rect_area = w * h
                extent = float(area) / rect_area
                shape_features['extent_values'].append(extent)
        
        return shape_features
    
    def extract_keypoint_features(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        features = {}
        
        if self.sift:
            kp_sift, desc_sift = self.sift.detectAndCompute(gray, None)
            features['sift_keypoints'] = len(kp_sift) if kp_sift else 0
            features['sift_descriptors'] = desc_sift.shape if desc_sift is not None else (0, 0)
        
        if self.orb:
            kp_orb, desc_orb = self.orb.detectAndCompute(gray, None)
            features['orb_keypoints'] = len(kp_orb) if kp_orb else 0
            features['orb_descriptors'] = desc_orb.shape if desc_orb is not None else (0, 0)
        
        if self.surf:
            kp_surf, desc_surf = self.surf.detectAndCompute(gray, None)
            features['surf_keypoints'] = len(kp_surf) if kp_surf else 0
            features['surf_descriptors'] = desc_surf.shape if desc_surf is not None else (0, 0)
        
        corners = cv2.goodFeaturesToTrack(gray, maxCorners=100, qualityLevel=0.01, minDistance=10)
        features['corner_count'] = len(corners) if corners is not None else 0
        
        return features
    
    def extract_all_features(self, image):
        all_features = {}
        
        all_features.update(self.extract_color_features(image))
        all_features.update(self.extract_texture_features(image))
        all_features.update(self.extract_shape_features(image))
        all_features.update(self.extract_keypoint_features(image))
        
        return all_features

def analyze_performative_aesthetics(image_path):
    extractor = PerformativeFeatureExtractor()
    
    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    features = extractor.extract_all_features(image_rgb)
    
    aesthetic_score = calculate_aesthetic_score(features)
    
    return {
        'features': features,
        'aesthetic_score': aesthetic_score,
        'performative_indicators': detect_performative_indicators(features)
    }

def calculate_aesthetic_score(features):
    score = 0
    
    if 'dominant_colors' in features:
        muted_colors = sum(1 for color in features['dominant_colors'] 
                          if all(50 <= c <= 200 for c in color))
        score += muted_colors * 5
    
    if 'sift_keypoints' in features:
        if features['sift_keypoints'] > 100:
            score += 10
    
    if 'contour_count' in features:
        if 10 <= features['contour_count'] <= 50:
            score += 8
    
    return min(score, 100)

def detect_performative_indicators(features):
    indicators = []
    
    if features.get('sift_keypoints', 0) > 200:
        indicators.append('high_detail_complexity')
    
    if features.get('corner_count', 0) > 50:
        indicators.append('geometric_composition')
    
    if len(features.get('aspect_ratios', [])) > 0:
        avg_ratio = np.mean(features['aspect_ratios'])
        if 0.8 <= avg_ratio <= 1.2:
            indicators.append('square_composition')
    
    return indicators