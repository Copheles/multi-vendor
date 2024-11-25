import nodemailer from 'nodemailer';

class Email {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'norbert.sawayn@ethereal.email',
        pass: 'dferEsntrBKghumhSG'
      }
    });
  }

  public async send(from: string, to: string, subject: string, text: string, html: string) {
    await this.transporter.sendMail({
      from, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html // html body
    });

    console.log('send email successfully');
  }
}

export const email: Email = new Email();
