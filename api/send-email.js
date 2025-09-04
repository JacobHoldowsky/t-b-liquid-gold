import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, email, number, message } = req.body;
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      // Send email to admin
      await resend.emails.send({
        from: process.env.JJ_EMAIL, // Update this with your verified domain
        to: process.env.PERSONAL_EMAIL,
        subject: "New Contact Form Submission",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #7c2234; border-bottom: 2px solid #ddd; padding-bottom: 10px;">New Contact Form Submission</h2>
            <p style="font-size: 16px;">You have received a new message from your website's contact form.</p>
            <p style="font-size: 16px;"><strong>Name:</strong> ${name}</p>
            <p style="font-size: 16px;"><strong>Email:</strong> ${email}</p>
            <p style="font-size: 16px;"><strong>Phone Number:</strong> ${number}</p>
            <p style="font-size: 16px;"><strong>Message:</strong></p>
            <p style="font-size: 16px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
            <p style="font-size: 14px; color: #777; margin-top: 20px; text-align: center;">This email was sent from your website's contact form.</p>
          </div>
        `,
      });

      // Send confirmation email to sender
      await resend.emails.send({
        from: process.env.JJ_EMAIL, // Update this with your verified domain
        to: email,
        subject: "Thank you for contacting us",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #7c2234; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Thank You for Reaching Out</h2>
            <p style="font-size: 16px;">Dear ${name},</p>
            <p style="font-size: 16px;">Thank you for reaching out to us. We will respond to your inquiry shortly.</p>
            <p style="font-size: 14px; color: #777; margin-top: 20px; text-align: center;">This is an automated response to confirm we have received your message.</p>
          </div>
        `,
      });

      res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).json({ success: false, message: "Failed to send email" });
    }
  } else {
    res.status(405).json({ message: "Only POST requests are allowed" });
  }
}
