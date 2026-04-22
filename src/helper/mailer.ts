import nodemailer from 'nodemailer';

const mailSender = async (email: string, title: string, body: string) => {
  try {
    const mailHost = process.env.MAIL_HOST;
    const mailUser = process.env.MAIL_USER;
    const mailPass = process.env.MAIL_PASSWORD ?? process.env.MAIL_PASS;

    if (!mailHost || !mailUser || !mailPass) {
      throw new Error('Mail configuration missing: set MAIL_HOST, MAIL_USER, and MAIL_PASSWORD (or MAIL_PASS)');
    }

    // Configure with your email service (Gmail, Outlook, AWS SES, etc.)
    let transporter = nodemailer.createTransport({
      host: mailHost, // e.g., smtp.gmail.com
      auth: {
        user: mailUser, // your college email or generic admin email
        pass: mailPass, // app password
      },
    });

    let info = await transporter.sendMail({
      from: `"College Admin" <${mailUser}>`,
      to: email,
      subject: title,
      html: body,
    });

    return info;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to send email');
  }
};

export default mailSender;