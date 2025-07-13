const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth login route
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    if (user) {
      // Update user with Google info if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name: name,
        email: email,
        googleId: googleId,
        avatar: picture,
        role: 'user', // Default role for Google sign-up users
        isEmailVerified: true, // Email is verified by Google
      });

      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    
    if (error.message && error.message.includes('Token used too early')) {
      return res.status(400).json({ message: 'Invalid token timing. Please try again.' });
    }
    
    if (error.message && error.message.includes('Invalid token')) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    res.status(500).json({ 
      message: 'Google authentication failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
