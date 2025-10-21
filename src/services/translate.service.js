const axios = require('axios');

exports.translate = async (text, sourceLang, targetLang) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Limit text length for API constraints
    const textToTranslate = text.length > 5000 ? text.substring(0, 5000) : text;

    console.log(`Translating: "${textToTranslate.substring(0, 50)}..." from ${sourceLang} to ${targetLang}`);

    // If sourceLang is 'auto', detect the language first
    let actualSourceLang = sourceLang;
    if (sourceLang === 'auto') {
      actualSourceLang = await this.detectLanguage(text);
      console.log(`Auto-detected language: ${actualSourceLang}`);
    }

    // Try MyMemory Translation API
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: textToTranslate,
        langpair: `${actualSourceLang}|${targetLang}`,
        de: 'transly-app@example.com'
      },
      timeout: 10000
    });

    console.log('MyMemory API Response:', response.data);

    if (response.data?.responseStatus === 200 && response.data?.responseData?.translatedText) {
      return response.data.responseData.translatedText;
    } else if (response.data?.responseStatus === 429) {
      throw new Error('Translation API rate limit exceeded. Please try again later.');
    } else {
      throw new Error('Translation service returned an error: ' + (response.data?.responseDetails || 'Unknown error'));
    }
  } catch (error) {
    console.error('Translation API Error:', error.message);
    
    // Fallback to mock translation
    return await this.mockTranslate(text, sourceLang, targetLang);
  }
};

// Improved language detection
exports.detectLanguage = async (text) => {
  try {
    if (!text || text.trim().length === 0) {
      return 'en'; // Default to English for empty text
    }

    // More comprehensive language detection
    const languagePatterns = {
      en: {
        words: ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'for', 'you', 'with', 'on', 'this', 'but', 'are'],
        threshold: 0.1
      },
      hi: {
        words: ['और', 'है', 'में', 'की', 'से', 'को', 'ने', 'यह', 'वह', 'तो', 'पर', 'कर', 'हो', 'था', 'गया', 'चाहिए'],
        threshold: 0.2
      },
      gu: {
        words: ['અને', 'છે', 'માં', 'ની', 'થી', 'ને', 'આ', 'તે', 'પણ', 'કે', 'માટે', 'પર', 'હતો', 'કરવા', 'છો', 'છીએ'],
        threshold: 0.2
      },
      es: {
        words: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'por', 'con', 'una', 'su', 'para', 'como'],
        threshold: 0.1
      },
      fr: {
        words: ['le', 'de', 'et', 'la', 'les', 'des', 'un', 'une', 'est', 'pas', 'pour', 'dans', 'qui', 'sur', 'avec', 'son'],
        threshold: 0.1
      }
    };

    const cleanText = text.toLowerCase().replace(/[^\w\s\u0900-\u097F\u0A80-\u0AFF]/g, ' ');
    const words = cleanText.split(/\s+/).filter(word => word.length > 2);
    
    let bestLang = 'en';
    let bestScore = 0;

    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      let score = 0;
      let matches = 0;
      
      for (const word of words) {
        if (pattern.words.includes(word)) {
          matches++;
        }
      }
      
      score = matches / Math.max(words.length, 1);
      
      if (score > pattern.threshold && score > bestScore) {
        bestScore = score;
        bestLang = lang;
      }
    }

    console.log(`Detected language: ${bestLang} with confidence: ${(bestScore * 100).toFixed(1)}%`);
    return bestLang;

  } catch (error) {
    console.error('Language detection failed:', error.message);
    return 'en'; // Default to English
  }
};

// Google Translate Fallback
exports.googleTranslateFallback = async (text, sourceLang, targetLang) => {
  try {
    console.log('Trying Google Translate fallback...');
    
    // If sourceLang is 'auto', detect it first
    let actualSourceLang = sourceLang;
    if (sourceLang === 'auto') {
      actualSourceLang = await this.detectLanguage(text);
    }

    const response = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${actualSourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.data && response.data[0]) {
      const translatedText = response.data[0]
        .map(item => item[0])
        .join('');
      return translatedText;
    }
    throw new Error('Google Translate fallback failed');
  } catch (error) {
    console.error('Google Translate fallback failed:', error.message);
    throw new Error('Google Translate service unavailable');
  }
};

// Improved mock translation
exports.mockTranslate = async (text, sourceLang, targetLang) => {
  console.log('Using mock translation');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockTranslations = {
    'hello': {
      'hi': 'नमस्ते',
      'gu': 'નમસ્તે',
      'es': 'Hola',
      'fr': 'Bonjour'
    },
    'how are you': {
      'hi': 'आप कैसे हैं',
      'gu': 'તમે કેમ છો', 
      'es': '¿Cómo estás?',
      'fr': 'Comment allez-vous?'
    },
    'thank you': {
      'hi': 'धन्यवाद',
      'gu': 'આભાર',
      'es': 'Gracias',
      'fr': 'Merci'
    },
    'good morning': {
      'hi': 'शुभ प्रभात',
      'gu': 'સુપ્રભાત',
      'es': 'Buenos días',
      'fr': 'Bonjour'
    },
    'what is your name': {
      'hi': 'आपका नाम क्या है',
      'gu': 'તમારું નામ શું છે',
      'es': '¿Cómo te llamas?',
      'fr': 'Comment vous appelez-vous?'
    },
    'i love you': {
      'hi': 'मैं तुमसे प्यार करता हूँ',
      'gu': 'હું તને પ્રેમ કરું છું',
      'es': 'Te amo',
      'fr': 'Je t\'aime'
    },
    'please help me': {
      'hi': 'कृपया मेरी मदद करें',
      'gu': 'કૃપા કરીને મને મદદ કરો',
      'es': 'Por favor ayúdame',
      'fr': 'S\'il vous plaît aidez-moi'
    },
    'where is the hotel': {
      'hi': 'होटल कहाँ है',
      'gu': 'હોટેલ ક્યાં છે',
      'es': '¿Dónde está el hotel?',
      'fr': 'Où est l\'hôtel?'
    },
    'how much does it cost': {
      'hi': 'इसकी कीमत कितनी है',
      'gu': 'તેની કિંમત કેટલી છે',
      'es': '¿Cuánto cuesta?',
      'fr': 'Combien ça coûte?'
    },
    'can you help me': {
      'hi': 'क्या आप मेरी मदद कर सकते हैं',
      'gu': 'શું તમે મને મદદ કરી શકો છો',
      'es': '¿Puedes ayudarme?',
      'fr': 'Pouvez-vous m\'aider?'
    }
  };
  
  const lowerText = text.toLowerCase().trim();
  
  // Try exact match first
  if (mockTranslations[lowerText] && mockTranslations[lowerText][targetLang]) {
    return mockTranslations[lowerText][targetLang];
  }
  
  // Try partial match
  for (const [key, translations] of Object.entries(mockTranslations)) {
    if (lowerText.includes(key) && translations[targetLang]) {
      return translations[targetLang];
    }
  }
  
  // Generic mock translation based on language
  const genericTranslations = {
    'hi': `[हिंदी अनुवाद: ${text}]`,
    'gu': `[ગુજરાતી અનુવાદ: ${text}]`,
    'es': `[Traducción al español: ${text}]`,
    'fr': `[Traduction française: ${text}]`,
    'de': `[Deutsche Übersetzung: ${text}]`
  };
  
  return genericTranslations[targetLang] || `[${targetLang.toUpperCase()}: ${text}]`;
};

exports.getSupportedLanguages = () => {
  return {
    'auto': 'Auto Detect',
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'hi': 'Hindi',
    'gu': 'Gujarati',
    'ar': 'Arabic',
    'tr': 'Turkish',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'pl': 'Polish'
  };
};

// New function to translate with auto-detection
exports.translateWithAutoDetection = async (text, targetLang) => {
  const sourceLang = await this.detectLanguage(text);
  return await this.translate(text, sourceLang, targetLang);
};