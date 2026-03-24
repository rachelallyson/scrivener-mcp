import { splitIntoSentences } from '../../../utils/text-metrics.js';
export class EmotionEnhancer {
    constructor(classifier) {
        this.classifier = classifier;
    }
    showDontTell(content, changes) {
        const sentences = splitIntoSentences(content);
        const processedSentences = [];
        for (const sentence of sentences) {
            if (!sentence.trim()) {
                processedSentences.push(sentence);
                continue;
            }
            const tellingPatterns = this.detectTellingPatterns(sentence);
            let enhanced = sentence;
            for (const pattern of tellingPatterns) {
                const showing = this.convertToShowing(pattern.text, pattern.type, pattern.emotion);
                if (showing && showing !== pattern.text) {
                    changes.push({
                        type: 'show-dont-tell',
                        original: pattern.text,
                        replacement: showing,
                        reason: `Converted telling "${pattern.text}" to showing "${showing}"`,
                        location: { start: 0, end: pattern.text.length },
                    });
                    enhanced = enhanced.replace(pattern.text, showing);
                }
            }
            processedSentences.push(enhanced);
        }
        return processedSentences.join(' ');
    }
    detectTellingPatterns(sentence) {
        const patterns = [];
        // Emotion telling patterns
        const emotionPatterns = [
            { regex: /\b(he|she|they|I)\s+(was|were|am|is)\s+(angry|mad|furious)\b/gi, type: 'emotion', emotion: 'anger' },
            { regex: /\b(he|she|they|I)\s+(was|were|am|is)\s+(sad|depressed|unhappy)\b/gi, type: 'emotion', emotion: 'sadness' },
            { regex: /\b(he|she|they|I)\s+(was|were|am|is)\s+(happy|joyful|excited)\b/gi, type: 'emotion', emotion: 'happiness' },
            { regex: /\b(he|she|they|I)\s+(was|were|am|is)\s+(scared|afraid|frightened)\b/gi, type: 'emotion', emotion: 'fear' },
        ];
        for (const pattern of emotionPatterns) {
            const matches = [...sentence.matchAll(pattern.regex)];
            for (const match of matches) {
                patterns.push({
                    text: match[0],
                    type: pattern.type,
                    emotion: pattern.emotion
                });
            }
        }
        // Physical state telling patterns
        const physicalPatterns = [
            { regex: /\b(he|she|they|I)\s+(was|were|am|is)\s+(tired|exhausted)\b/gi, type: 'physical', emotion: 'fatigue' },
            { regex: /\b(he|she|they|I)\s+(was|were|am|is)\s+(hungry|starving)\b/gi, type: 'physical', emotion: 'hunger' },
        ];
        for (const pattern of physicalPatterns) {
            const matches = [...sentence.matchAll(pattern.regex)];
            for (const match of matches) {
                patterns.push({
                    text: match[0],
                    type: pattern.type,
                    emotion: pattern.emotion
                });
            }
        }
        return patterns;
    }
    convertToShowing(text, type, emotion) {
        if (type === 'emotion' && emotion) {
            const showingVersions = this.generateEmotionResponse(emotion);
            if (showingVersions) {
                // Extract pronoun to maintain consistency
                const pronounMatch = text.match(/\b(he|she|they|I)\b/i);
                const pronoun = pronounMatch ? pronounMatch[0].toLowerCase() : 'he';
                return showingVersions.replace(/\bhe\b/gi, pronoun);
            }
        }
        if (type === 'physical' && emotion) {
            return this.generatePhysicalResponse(emotion, text);
        }
        return text;
    }
    generateEmotionResponse(emotion) {
        const responses = {
            anger: [
                'His fists clenched at his sides',
                'Her face flushed red as she gritted her teeth',
                'He slammed his hand on the table',
                'She turned away, jaw tight with fury'
            ],
            sadness: [
                'Tears welled in his eyes',
                'Her shoulders sagged as she looked down',
                'He wiped his eyes with the back of his hand',
                'She bit her lip to keep from crying'
            ],
            happiness: [
                'A wide smile spread across his face',
                'Her eyes lit up with delight',
                'He couldn\'t stop grinning',
                'She clapped her hands together in joy'
            ],
            fear: [
                'His heart pounded in his chest',
                'She took a step backward, eyes wide',
                'He felt his palms grow sweaty',
                'She wrapped her arms around herself'
            ]
        };
        const options = responses[emotion];
        return options ? options[Math.floor(Math.random() * options.length)] : null;
    }
    generatePhysicalResponse(emotion, originalText) {
        const responses = {
            fatigue: [
                'His eyelids drooped as he struggled to stay awake',
                'She rubbed her temples, feeling drained',
                'He leaned against the wall for support',
                'She yawned despite trying to stay alert'
            ],
            hunger: [
                'His stomach growled audibly',
                'She felt lightheaded from lack of food',
                'He couldn\'t stop thinking about his next meal',
                'She pressed her hand to her empty stomach'
            ]
        };
        const options = responses[emotion];
        if (options) {
            const response = options[Math.floor(Math.random() * options.length)];
            // Maintain pronoun consistency
            const pronounMatch = originalText.match(/\b(he|she|they|I)\b/i);
            const pronoun = pronounMatch ? pronounMatch[0].toLowerCase() : 'he';
            return response.replace(/\b(he|his|him|she|her|they|their|them|I|my|me)\b/gi, (match) => {
                if (pronoun === 'she') {
                    const femalePronouns = {
                        'he': 'she', 'his': 'her', 'him': 'her',
                        'He': 'She', 'His': 'Her', 'Him': 'Her'
                    };
                    return femalePronouns[match] || match;
                }
                return match;
            });
        }
        return originalText;
    }
}
//# sourceMappingURL=emotion-enhancer.js.map