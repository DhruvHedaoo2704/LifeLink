import ChatMessage from '../models/ChatMessage.js';

// Get Chat History for current user
export const getChatHistory = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user.id })
      .sort({ timestamp: 1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// Send message & generate AI response
export const sendChatMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    // Save user message
    const userMsg = await ChatMessage.create({
      userId: req.user.id,
      sender: 'user',
      text: text.trim()
    });

    // Generate response matching Mockup 12 rules
    let responseText = "I'm your LifeLink AI Assistant. You can ask me about blood donation eligibility, nearest hospitals, or compatibility rules.";
    const query = text.toLowerCase();

    if (query.includes('fever') || query.includes('cold') || query.includes('sick')) {
      responseText = "You should wait at least 7 days after full recovery and be fever-free for minimum 7 days before donating.";
    } else if (query.includes('hospital') || query.includes('nearest') || query.includes('where') || query.includes('o+')) {
      responseText = "Care Hospital, Banjara Hills is located 2.4 km away (Phone: 040-12345678). They currently have O+ blood reserves available.";
    } else if (query.includes('eligibility') || query.includes('can i') || query.includes('weight') || query.includes('age')) {
      responseText = "To donate blood, you must be between 18-65 years old, weigh at least 45kg (99 lbs), have a hemoglobin level above 12.5 g/dL, and have no active infections.";
    } else if (query.includes('guidelines') || query.includes('how to')) {
      responseText = "Before donating: sleep well (6+ hours), drink plenty of water, eat a healthy meal, and avoid alcohol for 24 hours prior.";
    } else if (query.includes('compatibility') || query.includes('blood group')) {
      responseText = "O- is the universal donor, while AB+ is the universal recipient. A+ can receive from A+, A-, O+, O-.";
    }

    // Save bot message
    const botMsg = await ChatMessage.create({
      userId: req.user.id,
      sender: 'bot',
      text: responseText
    });

    res.status(201).json({
      success: true,
      data: {
        userMessage: userMsg,
        botMessage: botMsg
      }
    });
  } catch (error) {
    next(error);
  }
};
