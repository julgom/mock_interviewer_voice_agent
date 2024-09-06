import sgMail from "@sendgrid/mail";

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to, subject, content) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL_ADDRESS,
    subject,
    text: content,
    html: content, // Assuming the content is already formatted in HTML/Markdown
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
