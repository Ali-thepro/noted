const nodemailer = require('nodemailer')
const config = require('../utils/config')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  }
})

const sendPasswordResetEmail = async (email, resetLink) => {
  const mailOptions = {
    from: config.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    text: 'This is a password reset request. Click the link below to reset it:',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Password Reset</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto; color: #333;">
  
  <div style="background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px; text-align: center;">Password Reset Request</h1>
    
    <p style="margin-bottom: 20px;">Hello,</p>
    
    <p style="margin-bottom: 20px;">We received a request to reset your password for your Noted account. Click the button below to reset it:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="background: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 600;">Reset Password</a>
    </div>
    
    <p style="margin-bottom: 10px;">This link will expire in 1 hour.</p>
    
    <p style="margin-bottom: 20px;">If you didn't request this password reset, you can safely ignore this email - your password won't be changed.</p>
    
    <div style="border-top: 1px solid #e5e5e5; margin-top: 30px; padding-top: 20px;">
      <p style="color: #666666; font-size: 14px; margin: 0;">Best regards,<br>The Noted Team</p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #666666; font-size: 12px;">
    <p>This is an automated message, please do not reply to this email.</p>
    <p>Noted</p>
  </div>
</body>
</html>
`
  }

  return transporter.sendMail(mailOptions)
}

module.exports = {
  sendPasswordResetEmail
}
