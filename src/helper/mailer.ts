import nodemailer from 'nodemailer';

const mailSender = async (email: string, title: string, body: string) => {
  try {
    // Configure with your email service (Gmail, Outlook, AWS SES, etc.)
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, // e.g., smtp.gmail.com
      auth: {
        user: process.env.MAIL_USER, // your college email or generic admin email
        pass: process.env.MAIL_PASS, // app password
      },
    });

    let info = await transporter.sendMail({
      from: `"College Admin" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    return info;
  } catch (error: any) {
    console.log(error.message);
  }
};

export default mailSender;