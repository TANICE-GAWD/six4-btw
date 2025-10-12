class RatingService {
  constructor() {
    
    this.performativeItems = {
      'matcha': 15,
      'tote bag': 12,
      'book': 10,
      'beanie': 8,
      'sunglasses': 7,
      'labubu': 20,
      'toy': 15,
      'figurine': 18,
      'collectible': 16,
      'doll': 14,
      'plush': 12,
      'stuffed animal': 10,
      'stanley cup': 18,
      'airpods': 9,
      'macbook': 11,
      'film camera': 14,
      'coffee': 6,
      'latte': 8,
      'cappuccino': 7,
      'espresso': 6,
      'croissant': 9,
      'avocado': 10,
      'toast': 8,
      'bagel': 7,
      'smoothie': 9,
      'acai bowl': 12,
      'granola': 8,
      'yoga mat': 11,
      'meditation': 9,
      'journal': 10,
      'notebook': 8,
      'planner': 9,
      'succulent': 7,
      'plant': 6,
      'monstera': 10,
      'fiddle leaf fig': 12,
      'pampas grass': 11,
      'candle': 8,
      'diffuser': 9,
      'crystals': 10,
      'sage': 8,
      'incense': 7,
      'vintage': 9,
      'thrift': 8,
      'sustainable': 10,
      'organic': 8,
      'vegan': 9,
      'gluten free': 7,
      'kombucha': 9,
      'green juice': 10,
      'protein shake': 6,
      'workout': 7,
      'gym': 5,
      'pilates': 9,
      'barre': 8,
      'hiking': 7,
      'nature': 6,
      'sunset': 8,
      'golden hour': 12,
      'aesthetic': 15,
      'minimalist': 11,
      'scandinavian': 10,
      'boho': 9,
      'cottagecore': 11,
      'dark academia': 13,
      'light academia': 12,
      'soft girl': 10,
      'clean girl': 11,
      'that girl': 14,

      

      
      'tote bag': 18,           
      'canvas bag': 16,
      'new yorker': 20,         
      'bookstore bag': 19,
      'carhartt': 17,           
      'beanie': 12,
      'workwear': 14,
      'film camera': 16,        
      'vintage camera': 18,
      'analog camera': 17,
      'blundstone': 19,         
      'chelsea boots': 16,
      'leather boots': 14,
      'boots': 8,
      'minimalist jewelry': 15,
      'silver ring': 12,
      'chain necklace': 13,
      'simple jewelry': 11,

      
      'a24': 22,                
      'wes anderson': 21,       
      'greta gerwig': 20,       
      'indie film': 18,
      'arthouse': 17,
      'criterion': 19,          
      'vinyl records': 16,
      'record player': 15,
      'turntable': 14,
      'vinyl': 13,
      'records': 11,
      'natural wine': 18,
      'organic wine': 16,
      'biodynamic': 17,
      'craft beer': 12,
      'local brewery': 14,
      'ipa': 10,
      'pour over coffee': 17,
      'chemex': 18,
      'v60': 19,
      'coffee dripper': 16,
      'coffee filter': 12,
      'bouldering': 15,
      'climbing': 10,
      'rock climbing': 12,
      'climbing shoes': 13,

      
      'feminist': 16,           
      'ally': 15,
      'therapy': 14,
      'boundaries': 17,
      'emotional bandwidth': 18,
      'holding space': 19,
      'oat milk': 16,
      'oat latte': 17,
      'plant milk': 14,
      'non dairy': 12,
      'vulnerability': 15,
      'authentic': 13,
      'mindfulness': 14,
      'philosophy': 16,
      'podcast': 11,
      'intellectual': 15,

      
      'taylor swift': 18,       
      'clairo': 20,             
      'phoebe bridgers': 19,    
      'mitski': 18,             
      'fiona apple': 17,        
      'joni mitchell': 16,      
      'bjork': 15,              
      'lana del rey': 14,       
      'solange': 16,            
      'frank ocean': 17,        
      'japanese breakfast': 18, 
      'soccer mommy': 17,       
      'snail mail': 16,         
      'boygenius': 19,          
      'lucy dacus': 17,         
      'julien baker': 18,       
      'big thief': 16,          
      'angel olsen': 15,        
      'cat power': 14,          
      'beach house': 15,        
      'grimes': 13,             
      'st vincent': 16,         
      'perfume genius': 17,     

      
      'gym selfie': 8,          
      'protein powder': 6,
      'gaming setup': 7,
      'mechanical keyboard': 5,
      'crypto': 9,
      'nft': 10,
      'tesla': 12,
      'rolex': 11,
      'supreme': 9,
      'jordan': 8,
      'sneakers': 4,
      'beard oil': 6,
      'whiskey': 5,
      'cigar': 7,
      'motorcycle': 8,
      'watch': 6,
      'cologne': 4,
      'suit': 5,
      'tie': 3,
      'briefcase': 4,

      
      
      'green tea': 15,          
      'tea': 8,
      'coffee cup': 12,         
      'espresso cup': 14,       
      'latte art': 16,          
      'beverage': 5,
      'juice': 7,
      'green juice': 12,        
      'smoothie': 9,
      'drink': 4,
      'avocado toast': 15,      
      'sourdough': 11,          
      'pastry': 6,
      'croissant': 10,          
      'bowl': 5,                
      'acai': 14,               
      'quinoa': 12,             
      'kale': 11,               
      'food': 3,
      'organic': 9,             
      'local': 8,               

      
      'handbag': 10,            
      'messenger bag': 14,      
      'canvas bag': 16,         
      'bag': 6,
      'purse': 8,
      'backpack': 4,
      'leather bag': 11,        
      'eyewear': 6,             
      'glasses': 5,
      'reading glasses': 12,    
      'vintage glasses': 15,    
      'hat': 5,
      'cap': 4,
      'knit hat': 10,           
      'wool hat': 11,           
      'wristwatch': 12,         
      'vintage watch': 16,      
      'jewelry': 8,
      'necklace': 6,
      'silver jewelry': 12,     
      'bracelet': 5,
      'ring': 4,
      'wedding ring': 2,        
      'shoes': 4,
      'leather shoes': 8,       
      'boots': 7,
      'dress shoes': 5,
      'sneakers': 3,
      'footwear': 3,

      
      'water bottle': 8,        
      'bottle': 5,
      'tumbler': 10,
      'headphones': 7,          
      'earbuds': 8,
      'wireless earphones': 9,
      'laptop': 8,              
      'computer': 6,
      'apple': 10,              
      'iphone': 9,
      'smartphone': 6,
      'phone': 4,
      'tablet': 5,
      'ipad': 8,

      
      'camera': 8,
      'vintage camera': 12,
      'polaroid': 11,
      'photography': 6,
      'lens': 5,

      
      'exercise mat': 9,        
      'yoga': 8,
      'dumbbell': 6,
      'weight': 5,
      'fitness': 4,
      'supplement': 8,
      'shaker bottle': 7,

      
      'houseplant': 8,
      'potted plant': 7,
      'flower': 4,
      'vase': 5,
      'pot': 3,
      'scented candle': 9,
      'essential oil': 8,
      'crystal': 9,
      'gemstone': 8,

      
      'gaming': 8,
      'video game': 6,
      'controller': 7,
      'keyboard': 6,
      'mouse': 4,
      'headset': 7,
      'monitor': 5,
      'pc': 6,
      'gaming chair': 9,

      
      'car': 8,
      'luxury car': 15,
      'sports car': 12,
      'vehicle': 5,
      'luxury watch': 16,
      'expensive watch': 14,
      'formal wear': 8,
      'dress shirt': 7,
      'leather bag': 9,

      
      'beer': 7,
      'alcohol': 6,
      'bourbon': 9,
      'wine': 5,

      'cocktail': 6,

      
      'protein': 8,
      'whey protein': 9,
      'supplement bottle': 7,
      'gym equipment': 6,
      'barbell': 7,
      'weight plate': 5,

      
      'beard': 6,
      'mustache': 5,
      'perfume': 6,
      'grooming': 5,
      'razor': 4,
      'shaving': 3,

      
      'cigarette': 5,
      'smoking': 4,
      'tobacco': 6,

      
      'bike': 6,
      'bicycle': 4,
      'scooter': 5,

      
      'vinyl record': 14,
      'record': 10,
      'turntable': 15,
      'record player': 13,
      'vintage stereo': 12,
      'speaker': 6,
      'audio equipment': 8,
      'headphones': 7,
      'earbuds': 6,
      'music': 4,
      'album': 8,
      'cd': 5,
      'cassette': 11,
      'tape': 9,

      
      'book': 10,
      'novel': 12,
      'poetry': 14,
      'literature': 15,
      'paperback': 8,
      'hardcover': 9,
      'bookmark': 7,
      'reading': 6,
      'library': 8,
      'bookstore': 12,
      'independent bookstore': 16,

      
      'nike': 8,
      'adidas': 7,
      'apple logo': 10,
      'brand': 5,
      'logo': 4
    };

    
    this.scoreMessages = {
      0: "Refreshingly authentic - no performative signaling detected!",
      5: "Barely registering on the aesthetic consciousness scale",
      15: "Subtle hints of curated lifestyle choices",
      25: "Some performative awareness emerging",
      35: "Entering soft boy adjacent territory",
      45: "Moderate indie aesthetic energy",
      55: "Solidly in the 'that guy who reads' zone",
      65: "Strong performative cultural signaling",
      75: "Peak indie boy energy with literary pretensions",
      85: "Maximum cultural capital flexing detected",
      95: "Elite performative male status achieved",
      100: "Transcendent level of curated masculinity - you've become the aesthetic!"
    };
  }

  /**
   * Calculate performative score based on detected labels from AI vision service
   * @param {Array} labels - Array of label objects from Google Cloud Vision
   * @param {Object} options - Optional parameters for scoring (textAnnotations, etc.)
   * @returns {Object} Rating result with score, message, and detected items
   */
  calculateRating(labels, options = {}) {
    if (!Array.isArray(labels)) {
      throw new Error('Labels must be an array');
    }

    let totalScore = 0;
    const detectedItems = [];
    const processedLabels = [];
    const usedKeywords = new Map(); 

    
    if (options.textAnnotations && Array.isArray(options.textAnnotations)) {
      const textMatches = this.processTextAnnotations(options.textAnnotations);
      textMatches.forEach(match => {
        const keywordKey = `text:${match.item}`;
        if (!usedKeywords.has(keywordKey)) {
          totalScore += match.points;
          usedKeywords.set(keywordKey, match);
          detectedItems.push(match);
        }
      });
    }

    
    console.log('Processing labels for performative items:', labels.map(l => l.description));

    labels.forEach(label => {
      if (!label || !label.description) {
        return;
      }

      const labelText = label.description.toLowerCase().trim();
      const confidence = label.score || 0;

      
      processedLabels.push({
        original: label.description,
        processed: labelText,
        confidence: confidence
      });

      console.log(`Checking label: "${labelText}"`);

      
      const matches = this.findMatches(labelText, confidence, labels);

      matches.forEach(match => {
        const keywordKey = `label:${match.keyword}:${labelText}`;
        if (!usedKeywords.has(keywordKey)) {
          totalScore += match.adjustedPoints;
          usedKeywords.set(keywordKey, match);

          console.log(`✅ ${match.matchType.toUpperCase()} MATCH: "${labelText}" -> "${match.keyword}" = ${match.adjustedPoints} points (confidence: ${confidence})`);

          detectedItems.push({
            item: match.keyword,
            points: match.adjustedPoints,
            confidence: confidence,
            matchType: match.matchType,
            originalLabel: label.description,
            matchScore: match.matchScore
          });
        }
      });
    });

    console.log(`Final detected items:`, detectedItems);
    console.log(`Total score before context: ${totalScore}`);

    
    const contextAdjustment = this.calculateContextualAdjustments(detectedItems, labels);
    totalScore += contextAdjustment.adjustment;

    console.log(`Context adjustment: ${contextAdjustment.adjustment} (${contextAdjustment.reason})`);
    console.log(`Total score after context: ${totalScore}`);

    
    const finalScore = Math.min(totalScore, 100);

    
    const message = this.generateMessage(finalScore);

    
    const metadata = {
      totalLabelsProcessed: labels.length,
      performativeItemsFound: detectedItems.length,
      rawScore: totalScore,
      cappedScore: finalScore,
      processedAt: new Date().toISOString()
    };

    return {
      score: finalScore,
      message: message,
      detectedItems: detectedItems.map(item => ({
        item: item.item,
        points: item.points,
        confidence: Math.round(item.confidence * 100) / 100,
        matchType: item.matchType,
        ...(item.originalLabel && { originalLabel: item.originalLabel })
      })),
      metadata: metadata,
      debug: {
        processedLabels: processedLabels
      }
    };
  }

  /**
   * Enhanced matching algorithm with fuzzy matching and confidence weighting
   * @param {string} labelText - Processed label text
   * @param {number} confidence - Vision API confidence score
   * @param {Array} allLabels - All labels for context
   * @returns {Array} Array of match objects
   */
  findMatches(labelText, confidence, allLabels = []) {
    const matches = [];

    
    if (this.performativeItems.hasOwnProperty(labelText)) {
      matches.push({
        keyword: labelText,
        matchType: 'exact',
        matchScore: 1.0,
        adjustedPoints: Math.round(this.performativeItems[labelText] * confidence)
      });
      return matches; 
    }

    
    const semanticMatches = this.getSemanticMatches(labelText, allLabels);
    semanticMatches.forEach(match => {
      matches.push({
        keyword: match.keyword,
        matchType: 'semantic',
        matchScore: match.score,
        adjustedPoints: Math.round(match.points * confidence * match.score)
      });
    });

    
    if (matches.length === 0) {
      for (const [keyword, points] of Object.entries(this.performativeItems)) {
        const similarity = this.calculateStringSimilarity(labelText, keyword);

        if (similarity > 0.5) { 
          matches.push({
            keyword: keyword,
            matchType: 'partial',
            matchScore: similarity,
            adjustedPoints: Math.round(points * confidence * similarity)
          });
        }
      }
    }

    
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  }

  /**
   * Map generic Vision API labels to specific performative items
   * @param {string} labelText - Generic label from Vision API
   * @param {Array} allLabels - All labels for context
   * @returns {Array} Array of semantic matches
   */
  getSemanticMatches(labelText, allLabels = []) {
    const semanticMap = {
      
      'beverage': [
        { keyword: 'matcha', score: 0.4, condition: (text) => text.includes('green') || text.includes('tea') },
        { keyword: 'coffee', score: 0.7 },
        { keyword: 'oat milk', score: 0.4, condition: (text) => text.includes('milk') }
      ],
      'drink': [
        { keyword: 'matcha', score: 0.3, condition: (text) => text.includes('green') || text.includes('tea') },
        { keyword: 'kombucha', score: 0.3 },
        { keyword: 'green juice', score: 0.4 },
        { keyword: 'coffee', score: 0.6 }
      ],
      'coffee cup': [
        { keyword: 'pour over coffee', score: 0.8 },
        { keyword: 'coffee', score: 0.9 }
      ],
      'tea': [
        { keyword: 'matcha', score: 0.9 },
        { keyword: 'green tea', score: 0.8 }
      ],
      'green tea': [
        { keyword: 'matcha', score: 0.9 }
      ],
      'latte': [
        { keyword: 'matcha latte', score: 0.6, condition: (text) => text.includes('green') || text.includes('matcha') },
        { keyword: 'oat latte', score: 0.7 }
      ],

      
      'bag': [
        { keyword: 'tote bag', score: 0.7 },
        { keyword: 'canvas bag', score: 0.6 }
      ],
      'handbag': [
        { keyword: 'tote bag', score: 0.8 },
        { keyword: 'canvas bag', score: 0.7 }
      ],
      'eyewear': [
        { keyword: 'sunglasses', score: 0.9 }
      ],
      'sunglasses': [
        { keyword: 'sunglasses', score: 1.0 }
      ],
      'hat': [
        { keyword: 'beanie', score: 0.6 }
      ],

      
      'toy': [
        { keyword: 'labubu', score: 0.4 },
        { keyword: 'designer toy', score: 0.7 },
        { keyword: 'collectible', score: 0.6 }
      ],
      'figurine': [
        { keyword: 'labubu', score: 0.5 },
        { keyword: 'collectible figure', score: 0.8 },
        { keyword: 'art toy', score: 0.7 }
      ],
      'doll': [
        { keyword: 'labubu', score: 0.6 },
        { keyword: 'designer toy', score: 0.5 }
      ],
      'collectible': [
        { keyword: 'labubu', score: 0.4 },
        { keyword: 'art toy', score: 0.6 }
      ],

      
      'laptop': [
        { keyword: 'macbook', score: 0.7, condition: (text) => text.includes('apple') || text.includes('mac') }
      ],
      'headphones': [
        { keyword: 'airpods', score: 0.6, condition: (text) => text.includes('wireless') || text.includes('apple') }
      ],
      'water bottle': [
        { keyword: 'stanley cup', score: 0.4 },
        { keyword: 'tumbler', score: 0.6 }
      ],

      
      'camera': [
        { keyword: 'film camera', score: 0.7, condition: (text) => text.includes('vintage') || text.includes('analog') },
        { keyword: 'vintage camera', score: 0.8 }
      ],

      
      'plant': [
        { keyword: 'monstera', score: 0.3 },
        { keyword: 'fiddle leaf fig', score: 0.2 },
        { keyword: 'succulent', score: 0.4 }
      ],
      'houseplant': [
        { keyword: 'monstera', score: 0.4 },
        { keyword: 'fiddle leaf fig', score: 0.3 },
        { keyword: 'succulent', score: 0.5 }
      ],

      
      'food': [
        { keyword: 'avocado toast', score: 0.3, condition: (text) => text.includes('avocado') || text.includes('toast') },
        { keyword: 'croissant', score: 0.4 },
        { keyword: 'acai bowl', score: 0.3 }
      ],
      'pastry': [
        { keyword: 'croissant', score: 0.8 }
      ],

      
      'exercise mat': [
        { keyword: 'yoga mat', score: 0.9 }
      ],
      'supplement': [
        { keyword: 'protein shake', score: 0.6 },
        { keyword: 'protein powder', score: 0.7 }
      ],

      
      'music': [
        { keyword: 'vinyl records', score: 0.4 },
        { keyword: 'indie music', score: 0.5 }
      ],
      'album': [
        { keyword: 'vinyl record', score: 0.7 },
        { keyword: 'indie album', score: 0.6 }
      ],
      'record': [
        { keyword: 'vinyl record', score: 0.8 }
      ],
      'audio equipment': [
        { keyword: 'turntable', score: 0.7 },
        { keyword: 'record player', score: 0.8 }
      ],

      
      'person': [
        {
          keyword: 'indie artist', score: 0.2, condition: (text, allLabels) =>
            allLabels.some(l => ['music', 'performance', 'singer', 'musician', 'artist'].includes(l.toLowerCase()))
        }
      ],
      'woman': [
        {
          keyword: 'female artist', score: 0.3, condition: (text, allLabels) =>
            allLabels.some(l => ['music', 'performance', 'singer', 'musician', 'artist'].includes(l.toLowerCase()))
        }
      ],
      'performer': [
        { keyword: 'indie artist', score: 0.6 }
      ],
      'musician': [
        { keyword: 'indie artist', score: 0.7 }
      ],
      'singer': [
        { keyword: 'indie artist', score: 0.7 }
      ],
      'artist': [
        { keyword: 'indie artist', score: 0.5 }
      ],

      
      'book': [
        { keyword: 'feminist literature', score: 0.3, condition: (text) => text.includes('feminist') || text.includes('women') },
        { keyword: 'indie literature', score: 0.4 },
        { keyword: 'poetry', score: 0.3 }
      ],
      'novel': [
        { keyword: 'literary fiction', score: 0.6 },
        { keyword: 'indie novel', score: 0.5 }
      ],
      'literature': [
        { keyword: 'feminist literature', score: 0.5 },
        { keyword: 'contemporary literature', score: 0.4 }
      ]
    };

    const matches = [];

    if (semanticMap[labelText]) {
      semanticMap[labelText].forEach(mapping => {
        
        if (!mapping.condition || mapping.condition(labelText, allLabels.map(l => l.description || l))) {
          matches.push({
            keyword: mapping.keyword,
            score: mapping.score,
            points: this.performativeItems[mapping.keyword] || 0
          });
        }
      });
    }

    return matches.filter(match => match.points > 0);
  }

  /**
   * Calculate string similarity using Levenshtein distance
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score between 0 and 1
   */
  calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Process text annotations to detect performative brands, books, etc.
   * @param {Array} textAnnotations - Text annotations from Vision API
   * @returns {Array} Array of detected performative text items
   */
  processTextAnnotations(textAnnotations) {
    const detectedTextItems = [];

    
    const textPatterns = {
      
      'new yorker': 20,
      'the new yorker': 20,
      'criterion': 19,
      'a24': 22,
      'penguin classics': 18,
      'verso': 17,
      'mcsweeney': 16,

      
      'blue bottle': 16,
      'intelligentsia': 15,
      'stumptown': 14,
      'counter culture': 13,
      'whole foods': 12,
      'trader joe': 10,

      
      'patagonia': 14,
      'everlane': 15,
      'uniqlo': 11,
      'muji': 13,
      'cos': 12,
      'arket': 11,

      
      'apple': 10,
      'macbook': 12,
      'iphone': 8,
      'airpods': 9,

      
      'david foster wallace': 20,
      'zadie smith': 18,
      'elena ferrante': 17,
      'knausgård': 19,
      'karl ove': 19,
      'sally rooney': 16,
      'ocean vuong': 15,
      'joan didion': 17,
      'susan sontag': 18,
      'haruki murakami': 14,
      'normal people': 16,
      'conversations with friends': 15,
      'my struggle': 19,
      'outline': 17,
      'transit': 16,
      'kudos': 16,

      
      'simone de beauvoir': 19,
      'the second sex': 19,
      'bell hooks': 18,
      'all about love': 17,
      'feminism is for everybody': 18,
      'audre lorde': 18,
      'sister outsider': 17,
      'roxane gay': 16,
      'bad feminist': 16,
      'hunger': 15,
      'chimamanda ngozi adichie': 17,
      'we should all be feminists': 17,
      'americanah': 16,
      'margaret atwood': 15,
      'the handmaids tale': 16,
      'cat\'s eye': 14,
      'sylvia plath': 17,
      'the bell jar': 17,
      'ariel': 16,
      'virginia woolf': 18,
      'a room of one\'s own': 18,
      'mrs dalloway': 16,
      'to the lighthouse': 15,
      'toni morrison': 17,
      'beloved': 16,
      'the bluest eye': 15,
      'song of solomon': 15,
      'maya angelou': 15,
      'i know why the caged bird sings': 15,
      'adrienne rich': 16,
      'diving into the wreck': 16,
      'naomi wolf': 14,
      'the beauty myth': 14,
      'gloria steinem': 15,
      'my life on the road': 14,
      'rebecca solnit': 17,
      'men explain things to me': 18,
      'hope in the dark': 16,
      'maggie nelson': 18,
      'the argonauts': 18,
      'bluets': 17,
      'anne carson': 19,
      'autobiography of red': 19,
      'nox': 18,
      'jenny holzer': 16,
      'truisms': 16,
      'kathy acker': 17,
      'blood and guts in high school': 17,
      'chris kraus': 18,
      'i love dick': 18,
      'eileen myles': 17,
      'chelsea girls': 17,
      'jia tolentino': 16,
      'trick mirror': 16,
      'ottessa moshfegh': 15,
      'my education': 15,
      'eileen': 14,
      'rachel cusk': 17,
      'outline trilogy': 17,
      'a life\'s work': 16,
      'jenny offill': 16,
      'dept of speculation': 16,
      'weather': 15,
      'lydia davis': 17,
      'the collected stories': 17,
      'sheila heti': 16,
      'how should a person be': 16,
      'motherhood': 15,
      'miranda july': 16,
      'the first bad man': 16,
      'no one belongs here more than you': 15,

      
      'n+1': 19,
      'paris review': 18,
      'granta': 17,
      'london review': 18,
      'artforum': 16,
      'frieze': 15,
      'monocle': 14,
      'pitchfork': 15,
      'the fader': 14,
      'rolling stone': 10,

      
      'taylor swift': 18,
      'clairo': 20,
      'claire cottrill': 20,  
      'phoebe bridgers': 19,
      'mitski': 18,
      'fiona apple': 17,
      'joni mitchell': 16,
      'bjork': 15,
      'lana del rey': 14,
      'solange': 16,
      'japanese breakfast': 18,
      'soccer mommy': 17,
      'snail mail': 16,
      'boygenius': 19,
      'lucy dacus': 17,
      'julien baker': 18,
      'big thief': 16,
      'angel olsen': 15,
      'cat power': 14,
      'beach house': 15,
      'grimes': 13,
      'st vincent': 16,
      'perfume genius': 17,
      'weyes blood': 16,
      'king woman': 15,
      'frankie cosmos': 15,
      'girlpool': 16,
      'y la bamba': 14,
      'waxahatchee': 17,
      'courtney barnett': 15,
      'sharon van etten': 16,
      'patti smith': 17,
      'kim deal': 16,
      'kim gordon': 17,
      'thurston moore': 15,
      'sonic youth': 16,

      
      'labubu': 20,
      'pop mart': 18,
      'sonny angel': 16,
      'molly': 15,
      'kaws': 17,
      'bearbrick': 16,
      'funko': 12,
      'designer toy': 18,
      'art toy': 17,
      'collectible figure': 16,

      
      'matcha': 15,
      'matcha latte': 17,
      'green tea latte': 16,
      'ceremonial matcha': 18,
      'oat milk matcha': 19,

      
      'sub pop': 16,
      'matador': 17,
      'merge': 15,
      'domino': 14,
      'rough trade': 16,
      '4ad': 17,
      'kranky': 15,
      'constellation': 16,
      'thrill jockey': 15,
      'drag city': 16
    };

    
    const allText = textAnnotations
      .map(annotation => annotation.description || '')
      .join(' ')
      .toLowerCase();

    
    Object.entries(textPatterns).forEach(([pattern, points]) => {
      
      if (allText.includes(pattern)) {
        detectedTextItems.push({
          item: pattern,
          points: points,
          confidence: 0.9,
          matchType: 'text',
          originalLabel: `Text: "${pattern}"`
        });
      } else {
        
        const patternWords = pattern.split(' ');
        if (patternWords.length === 1) {
          
          textAnnotations.forEach(annotation => {
            const text = (annotation.description || '').toLowerCase();
            if (text.includes(pattern) && text.length <= pattern.length + 3) {
              detectedTextItems.push({
                item: pattern,
                points: Math.round(points * 0.8), 
                confidence: 0.8,
                matchType: 'text-partial',
                originalLabel: `Text: "${annotation.description}"`
              });
            }
          });
        }
      }
    });

    return detectedTextItems;
  }

  /**
   * Calculate contextual adjustments based on item combinations and patterns
   * @param {Array} detectedItems - Items detected in the image
   * @param {Array} allLabels - All labels from Vision API
   * @returns {Object} Adjustment object with score and reason
   */
  calculateContextualAdjustments(detectedItems, allLabels) {
    let adjustment = 0;
    const reasons = [];

    
    const itemNames = detectedItems.map(item => item.item);
    const allLabelTexts = allLabels.map(label => label.description.toLowerCase());

    
    const synergies = [
      {
        items: ['tote bag', 'book'],
        bonus: 8,
        reason: 'Literary aesthetic combo'
      },
      {
        items: ['film camera', 'vintage'],
        bonus: 6,
        reason: 'Nostalgic photography aesthetic'
      },
      {
        items: ['matcha', 'oat milk'],
        bonus: 5,
        reason: 'Peak alternative beverage combo'
      },
      {
        items: ['beanie', 'tote bag'],
        bonus: 4,
        reason: 'Indie boy starter pack'
      },
      {
        items: ['macbook', 'coffee'],
        bonus: 3,
        reason: 'Digital nomad aesthetic'
      },
      {
        items: ['yoga mat', 'plant'],
        bonus: 4,
        reason: 'Wellness lifestyle combo'
      },
      {
        items: ['vinyl', 'clairo'],
        bonus: 7,
        reason: 'Indie music connoisseur aesthetic'
      },
      {
        items: ['book', 'feminist'],
        bonus: 6,
        reason: 'Performative feminist reading'
      },
      {
        items: ['tote bag', 'feminist literature'],
        bonus: 8,
        reason: 'Peak performative male feminist aesthetic'
      },
      {
        items: ['coffee', 'book', 'female author'],
        bonus: 5,
        reason: 'Intellectual feminist ally vibes'
      },
      {
        items: ['vinyl records', 'female artist'],
        bonus: 6,
        reason: 'Supporting female musicians (performatively)'
      }
    ];

    
    synergies.forEach(synergy => {
      const hasAllItems = synergy.items.every(item =>
        itemNames.some(detected => detected.includes(item) || item.includes(detected))
      );

      if (hasAllItems) {
        adjustment += synergy.bonus;
        reasons.push(synergy.reason);
      }
    });

    
    const contextPenalties = [
      {
        condition: () => allLabelTexts.some(label =>
          ['gym', 'workout', 'fitness', 'muscle', 'bodybuilding'].some(term => label.includes(term))
        ),
        penalty: -5,
        reason: 'Traditional gym culture detected'
      },
      {
        condition: () => allLabelTexts.some(label =>
          ['gaming', 'video game', 'controller', 'xbox', 'playstation'].some(term => label.includes(term))
        ),
        penalty: -3,
        reason: 'Gaming culture detected'
      },
      {
        condition: () => allLabelTexts.some(label =>
          ['suit', 'tie', 'formal', 'business'].some(term => label.includes(term))
        ),
        penalty: -4,
        reason: 'Corporate aesthetic detected'
      }
    ];

    
    contextPenalties.forEach(penalty => {
      if (penalty.condition()) {
        adjustment += penalty.penalty;
        reasons.push(penalty.reason);
      }
    });

    
    const categories = {
      beverages: ['matcha', 'coffee', 'tea', 'kombucha', 'oat milk'],
      fashion: ['tote bag', 'beanie', 'sunglasses', 'boots'],
      tech: ['macbook', 'airpods', 'film camera'],
      lifestyle: ['yoga mat', 'plant', 'book', 'candle'],
      music: ['vinyl', 'clairo', 'phoebe bridgers', 'mitski', 'taylor swift', 'record player'],
      literature: ['feminist', 'sally rooney', 'joan didion', 'susan sontag', 'book', 'novel'],
      cultural: ['new yorker', 'criterion', 'a24', 'pitchfork', 'paris review']
    };

    const categoriesRepresented = Object.keys(categories).filter(category =>
      categories[category].some(item => itemNames.includes(item))
    );

    if (categoriesRepresented.length >= 3) {
      adjustment += 6;
      reasons.push('Multi-category performative lifestyle');
    } else if (categoriesRepresented.length === 2) {
      adjustment += 3;
      reasons.push('Cross-category aesthetic awareness');
    }

    
    const highConfidenceItems = detectedItems.filter(item =>
      item.confidence > 0.85 && item.points >= 10
    );

    if (highConfidenceItems.length >= 2) {
      adjustment += 4;
      reasons.push('High-confidence performative items detected');
    }

    return {
      adjustment: Math.round(adjustment),
      reason: reasons.join('; ') || 'No contextual adjustments'
    };
  }

  /**
   * Generate descriptive message based on score range
   * @param {number} score - Calculated performative score (0-100)
   * @returns {string} Descriptive message
   */
  generateMessage(score) {
    
    const scoreRanges = Object.keys(this.scoreMessages)
      .map(Number)
      .sort((a, b) => b - a); 

    for (const threshold of scoreRanges) {
      if (score >= threshold) {
        return this.scoreMessages[threshold];
      }
    }

    
    return this.scoreMessages[0];
  }

  /**
   * Get all available performative items and their scores
   * @returns {Object} Dictionary of performative items
   */
  getPerformativeItems() {
    return { ...this.performativeItems };
  }

  /**
   * Add or update performative items (for future extensibility)
   * @param {Object} newItems - Object with item names as keys and scores as values
   */
  updatePerformativeItems(newItems) {
    if (typeof newItems !== 'object' || newItems === null) {
      throw new Error('New items must be an object');
    }

    for (const [item, score] of Object.entries(newItems)) {
      if (typeof score !== 'number' || score < 0 || score > 100) {
        throw new Error(`Invalid score for item "${item}": must be a number between 0 and 100`);
      }
      this.performativeItems[item.toLowerCase()] = score;
    }
  }

  /**
   * Get statistics about the performative dictionary
   * @returns {Object} Statistics about available items and score distribution
   */
  getStatistics() {
    const scores = Object.values(this.performativeItems);
    const itemCount = scores.length;
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / itemCount;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    return {
      totalItems: itemCount,
      averageScore: Math.round(averageScore * 100) / 100,
      maxScore: maxScore,
      minScore: minScore,
      scoreDistribution: {
        low: scores.filter(s => s <= 5).length,
        medium: scores.filter(s => s > 5 && s <= 10).length,
        high: scores.filter(s => s > 10 && s <= 15).length,
        veryHigh: scores.filter(s => s > 15).length
      }
    };
  }

  /**
   * Validate rating service configuration
   * @returns {Object} Validation result
   */
  validateConfiguration() {
    const itemCount = Object.keys(this.performativeItems).length;
    const messageCount = Object.keys(this.scoreMessages).length;

    return {
      isValid: itemCount > 0 && messageCount > 0,
      performativeItemsCount: itemCount,
      scoreMessagesCount: messageCount,
      hasValidScores: Object.values(this.performativeItems).every(
        score => typeof score === 'number' && score >= 0 && score <= 100
      )
    };
  }
}

module.exports = RatingService;