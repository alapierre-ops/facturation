const nodemailer = require('nodemailer');

const createTransport = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  if (emailService === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else if (emailService === 'outlook') {
    return nodemailer.createTransport({
      service: 'outlook',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
};

const generateQuoteEmailTemplate = (quote, client) => {
  const currencySymbol = '€';
  
  const lines = quote.lines.map(line => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${line.description}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.unitPrice.toFixed(2)} ${currencySymbol}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.amount.toFixed(2)} ${currencySymbol}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Quote ${quote.number}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          Quote ${quote.number}
        </h1>
        
        <div style="margin-bottom: 30px;">
          <h3>Client Information</h3>
          <p><strong>Name:</strong> ${client.name}</p>
          ${client.email ? `<p><strong>Email:</strong> ${client.email}</p>` : ''}
          ${client.phone ? `<p><strong>Phone:</strong> ${client.phone}</p>` : ''}
          ${client.address ? `<p><strong>Address:</strong> ${client.address}</p>` : ''}
        </div>

        <div style="margin-bottom: 30px;">
          <h3>Quote Details</h3>
          <p><strong>Date:</strong> ${new Date(quote.date).toLocaleDateString('en-US')}</p>
          ${quote.paymentType ? `<p><strong>Payment Type:</strong> ${quote.paymentType}</p>` : ''}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Quantity</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lines}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 30px;">
          <div style="font-size: 18px; font-weight: bold;">
            <p>Total: ${quote.amount.toFixed(2)} ${currencySymbol}</p>
          </div>
        </div>

        ${quote.notes ? `
        <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #3498db;">
          <h4>Notes:</h4>
          <p>${quote.notes}</p>
        </div>
        ` : ''}

        <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <p>This quote is valid for 30 days from its date of issue.</p>
          <p>For any questions, please contact us.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateInvoiceEmailTemplate = (invoice, client) => {
  const currencySymbol = '€';
  
  const lines = invoice.lines.map(line => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${line.description}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.unitPrice.toFixed(2)} ${currencySymbol}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.amount.toFixed(2)} ${currencySymbol}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.number}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
          Invoice ${invoice.number}
        </h1>
        
        <div style="margin-bottom: 30px;">
          <h3>Client Information</h3>
          <p><strong>Name:</strong> ${client.name}</p>
          ${client.email ? `<p><strong>Email:</strong> ${client.email}</p>` : ''}
          ${client.phone ? `<p><strong>Phone:</strong> ${client.phone}</p>` : ''}
          ${client.address ? `<p><strong>Address:</strong> ${client.address}</p>` : ''}
        </div>

        <div style="margin-bottom: 30px;">
          <h3>Invoice Details</h3>
          <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('en-US')}</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString('en-US')}</p>
          ${invoice.paymentType ? `<p><strong>Payment Type:</strong> ${invoice.paymentType}</p>` : ''}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Quantity</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lines}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 30px;">
          <div style="font-size: 18px; font-weight: bold;">
            <p>Total: ${invoice.amount.toFixed(2)} ${currencySymbol}</p>
          </div>
        </div>

        ${invoice.notes ? `
        <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #e74c3c;">
          <h4>Notes:</h4>
          <p>${invoice.notes}</p>
        </div>
        ` : ''}

        <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <p><strong>Payment Terms:</strong></p>
          <p>Payment upon receipt of invoice, payment deadline: 30 days.</p>
          <p>In case of late payment, penalties will be applied.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.sendQuoteEmail = async (quote, client, recipientEmail) => {
  try {
    const transporter = createTransport();
    const htmlContent = generateQuoteEmailTemplate(quote, client);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Quote ${quote.number} - ${client.name}`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending quote email:', error);
    throw new Error('Failed to send quote email');
  }
};

exports.sendInvoiceEmail = async (invoice, client, recipientEmail) => {
  try {
    const transporter = createTransport();
    const htmlContent = generateInvoiceEmailTemplate(invoice, client);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Invoice ${invoice.number} - ${client.name}`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw new Error('Failed to send invoice email');
  }
};