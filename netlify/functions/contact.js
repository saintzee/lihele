const sgMail = require('@sendgrid/mail');

export default async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, property, dates, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields: name, email, message' });
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Email to your address
    const emailToYou = {
      to: process.env.CONTACT_EMAIL || 'your-email@example.com',
      from: process.env.FROM_EMAIL || 'noreply@lihele.it',
      subject: `New enquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Property:</strong> ${property || '(not specified)'}</p>
        <p><strong>Dates:</strong> ${dates || '(not specified)'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    // Confirmation email to user
    const confirmationEmail = {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@lihele.it',
      subject: 'We received your enquiry',
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>We've received your enquiry and will get back to you within a few hours.</p>
        <p>In the meantime, feel free to reach out on WhatsApp for faster response.</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          <strong>Your message:</strong><br>
          ${message.replace(/\n/g, '<br>')}
        </p>
      `
    };

    // Send both emails
    await sgMail.send(emailToYou);
    await sgMail.send(confirmationEmail);

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('SendGrid error:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
};
