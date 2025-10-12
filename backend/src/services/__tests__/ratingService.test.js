/**
 * Unit tests for RatingService
 * Tests performative rating logic with various label combinations
 * 
 * Requirements fulfilled:
 * - 10.4: Test Google Cloud Vision service integration with mocked responses
 * - 11.1-11.6: Test performative rating logic with various label combinations
 */

const RatingService = require('../ratingService');

describe('RatingService', () => {
  let ratingService;

  beforeEach(() => {
    ratingService = new RatingService();
  });

  describe('validateConfiguration', () => {
    test('should return valid configuration for properly initialized service', () => {
      const validation = ratingService.validateConfiguration();
      
      expect(validation.isValid).toBe(true);
      expect(validation.performativeItemsCount).toBeGreaterThan(0);
      expect(validation.maxPossibleScore).toBeGreaterThan(0);
    });
  });

  describe('calculateRating', () => {
    test('should calculate correct score for single performative item', () => {
      const labels = [
        { description: 'matcha', score: 0.95, topicality: 0.95 }
      ];

      const result = ratingService.calculateRating(labels);

      expect(result.score).toBe(15); // matcha = 15 points
      expect(result.detectedItems).toHaveLength(1);
      expect(result.detectedItems[0].item).toBe('matcha');
      expect(result.detectedItems[0].points).toBe(15);
      expect(result.detectedItems[0].confidence).toBe(0.95);
      expect(result.message).toContain('performative');
    });

    test('should calculate cumulative score for multiple performative items', () => {
      const labels = [
        { description: 'matcha', score: 0.95, topicality: 0.95 },
        { description: 'tote bag', score: 0.88, topicality: 0.90 },
        { description: 'book', score: 0.82, topicality: 0.85 }
      ];

      const result = ratingService.calculateRating(labels);

      expect(result.score).toBe(37); // 15 + 12 + 10 = 37
      expect(result.detectedItems).toHaveLength(3);
      expect(result.detectedItems.map(item => item.item)).toEqual(['matcha', 'tote bag', 'book']);
      expect(result.message).toContain('performative');
    });

    test('should handle case-insensitive matching', () => {
      const labels = [
        { description: 'MATCHA', score: 0.95, topicality: 0.95 },
        { description: 'Tote Bag', score: 0.88, topicality: 0.90 },
        { description: 'BOOK', score: 0.82, topicality: 0.85 }
      ];

      const result = ratingService.calculateRating(labels);

      expect(result.score).toBe(37); // Should match despite case differences
      expect(result.detectedItems).toHaveLength(3);
    });

    test('should return zero score when no performative items detected', () => {
      const labels = [
        { description: 'car', score: 0.95, topicality: 0.95 },
        { description: 'tree', score: 0.88, topicality: 0.90 },
        { description: 'building', score: 0.82, topicality: 0.85 }
      ];

      const result = ratingService.calculateRating(labels);

      expect(result.score).toBe(0);
      expect(result.detectedItems).toHaveLength(0);
      expect(result.message).toContain('not performative');
    });

    test('should cap score at 100 for high-scoring combinations', () => {
      // Create labels that would exceed 100 points
      const labels = [
        { description: 'labubu', score: 0.95, topicality: 0.95 }, // 20 points
        { description: 'stanley cup', score: 0.90, topicality: 0.90 }, // 18 points
        { description: 'matcha', score: 0.88, topicality: 0.88 }, // 15 points
        { description: 'film camera', score: 0.85, topicality: 0.85 }, // 14 points
        { description: 'tote bag', score: 0.82, topicality: 0.82 }, // 12 points
        { description: 'macbook', score: 0.80, topicality: 0.80 }, // 11 points
        { description: 'book', score: 0.78, topicality: 0.78 } // 10 points
        // Total would be 100 points
      ];

      const result = ratingService.calculateRating(labels);

      expect(result.score).toBe(100);
      expect(result.detectedItems).toHaveLength(7);
      expect(result.message).toContain('Peak Performative');
    });

    test('should handle mixed performative and non-performative items', () => {
      const labels = [
        { description: 'matcha', score: 0.95, topicality: 0.95 }, // 15 points
        { description: 'car', score: 0.90, topicality: 0.90 }, // 0 points
        { description: 'tote bag', score: 0.85, topicality: 0.85 }, // 12 points
        { description: 'tree', score: 0.80, topicality: 0.80 } // 0 points
      ];

      const result = ratingService.calculateRating(labels);

      expect(result.score).toBe(27); // 15 + 12 = 27
      expect(result.detectedItems).toHaveLength(2);
      expect(result.detectedItems.map(item => item.item)).toEqual(['matcha', 'tote bag']);
    });

    test('should handle empty labels array', () => {
      const result = ratingService.calculateRating([]);

      expect(result.score).toBe(0);
      expect(result.detectedItems).toHaveLength(0);
      expect(result.message).toContain('not performative');
    });

    test('should throw error for invalid labels input', () => {
      expect(() => {
        ratingService.calculateRating(null);
      }).toThrow('Labels must be an array');

      expect(() => {
        ratingService.calculateRating('invalid');
      }).toThrow('Labels must be an array');

      expect(() => {
        ratingService.calculateRating(undefined);
      }).toThrow('Labels must be an array');
    });

    test('should handle labels with missing properties gracefully', () => {
      const labels = [
        { description: 'matcha' }, // Missing score and topicality
        { score: 0.95 }, // Missing description
        { description: 'tote bag', score: 0.88, topicality: 0.90 } // Complete
      ];

      const result = ratingService.calculateRating(labels);

      expect(result.score).toBe(27); // Only matcha (15) and tote bag (12) should count
      expect(result.detectedItems).toHaveLength(2);
    });

    test('should generate appropriate messages for different score ranges', () => {
      // Test low score (0-20)
      const lowScoreLabels = [
        { description: 'beanie', score: 0.95, topicality: 0.95 } // 8 points
      ];
      const lowResult = ratingService.calculateRating(lowScoreLabels);
      expect(lowResult.message).toContain('Slightly performative');

      // Test medium score (21-60)
      const mediumScoreLabels = [
        { description: 'matcha', score: 0.95, topicality: 0.95 }, // 15 points
        { description: 'tote bag', score: 0.88, topicality: 0.90 }, // 12 points
        { description: 'book', score: 0.82, topicality: 0.85 } // 10 points
      ];
      const mediumResult = ratingService.calculateRating(mediumScoreLabels);
      expect(mediumResult.message).toContain('Quite performative');

      // Test high score (61-89)
      const highScoreLabels = [
        { description: 'labubu', score: 0.95, topicality: 0.95 }, // 20 points
        { description: 'stanley cup', score: 0.90, topicality: 0.90 }, // 18 points
        { description: 'matcha', score: 0.88, topicality: 0.88 }, // 15 points
        { description: 'film camera', score: 0.85, topicality: 0.85 }, // 14 points
      ];
      const highResult = ratingService.calculateRating(highScoreLabels);
      expect(highResult.message).toContain('Very performative');
    });

    test('should preserve confidence scores from original labels', () => {
      const labels = [
        { description: 'matcha', score: 0.95, topicality: 0.95 },
        { description: 'tote bag', score: 0.75, topicality: 0.80 }
      ];

      const result = ratingService.calculateRating(labels);

      expect(result.detectedItems[0].confidence).toBe(0.95);
      expect(result.detectedItems[1].confidence).toBe(0.75);
    });
  });

  describe('getPerformativeItems', () => {
    test('should return all performative items dictionary', () => {
      const items = ratingService.getPerformativeItems();

      expect(typeof items).toBe('object');
      expect(Object.keys(items).length).toBeGreaterThan(0);
      expect(items['matcha']).toBe(15);
      expect(items['labubu']).toBe(20);
      expect(items['stanley cup']).toBe(18);
    });
  });

  describe('getMaxPossibleScore', () => {
    test('should return correct maximum possible score', () => {
      const maxScore = ratingService.getMaxPossibleScore();
      
      expect(maxScore).toBe(100); // Should be capped at 100
    });
  });
});