const nodemailer = require('nodemailer');

// Configuration du transporteur email
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  if (emailService === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else if (emailService === 'outlook') {
    return nodemailer.createTransporter({
      service: 'outlook',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Configuration SMTP personnalisée
    return nodemailer.createTransporter({
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

// Template pour les devis
const generateQuoteEmailTemplate = (quote, client) => {
  const lines = quote.lines.map(line => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${line.description}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.unitPrice.toFixed(2)} €</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.totalHT.toFixed(2)} €</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.totalTTC.toFixed(2)} €</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Devis ${quote.number}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          Devis ${quote.number}
        </h1>
        
        <div style="margin-bottom: 30px;">
          <h3>Informations client</h3>
          <p><strong>Nom:</strong> ${client.name}</p>
          ${client.email ? `<p><strong>Email:</strong> ${client.email}</p>` : ''}
          ${client.phone ? `<p><strong>Téléphone:</strong> ${client.phone}</p>` : ''}
          ${client.address ? `<p><strong>Adresse:</strong> ${client.address}</p>` : ''}
        </div>

        <div style="margin-bottom: 30px;">
          <h3>Détails du devis</h3>
          <p><strong>Date:</strong> ${new Date(quote.date).toLocaleDateString('fr-FR')}</p>
          <p><strong>Statut:</strong> ${quote.status}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Quantité</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Prix unitaire</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total HT</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total TTC</th>
            </tr>
          </thead>
          <tbody>
            ${lines}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 30px;">
          <div style="font-size: 18px; font-weight: bold;">
            <p>Total HT: ${quote.totalHT.toFixed(2)} €</p>
            <p>Total TTC: ${quote.totalTTC.toFixed(2)} €</p>
          </div>
        </div>

        <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <p>Ce devis est valable 30 jours à compter de sa date d'émission.</p>
          <p>Pour toute question, n'hésitez pas à nous contacter.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template pour les factures
const generateInvoiceEmailTemplate = (invoice, client) => {
  const lines = invoice.lines.map(line => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${line.description}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.unitPrice.toFixed(2)} €</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.totalHT.toFixed(2)} €</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${line.totalTTC.toFixed(2)} €</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Facture ${invoice.number}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
          Facture ${invoice.number}
        </h1>
        
        <div style="margin-bottom: 30px;">
          <h3>Informations client</h3>
          <p><strong>Nom:</strong> ${client.name}</p>
          ${client.email ? `<p><strong>Email:</strong> ${client.email}</p>` : ''}
          ${client.phone ? `<p><strong>Téléphone:</strong> ${client.phone}</p>` : ''}
          ${client.address ? `<p><strong>Adresse:</strong> ${client.address}</p>` : ''}
        </div>

        <div style="margin-bottom: 30px;">
          <h3>Détails de la facture</h3>
          <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
          <p><strong>Date d'échéance:</strong> ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
          <p><strong>Statut:</strong> ${invoice.status}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Quantité</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Prix unitaire</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total HT</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total TTC</th>
            </tr>
          </thead>
          <tbody>
            ${lines}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 30px;">
          <div style="font-size: 18px; font-weight: bold;">
            <p>Total HT: ${invoice.totalHT.toFixed(2)} €</p>
            <p>Total TTC: ${invoice.totalTTC.toFixed(2)} €</p>
          </div>
        </div>

        <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <p><strong>Conditions de paiement:</strong></p>
          <p>Paiement à réception de facture, délai de paiement: 30 jours.</p>
          <p>En cas de retard de paiement, des pénalités seront appliquées.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.sendQuoteEmail = async (quote, client, recipientEmail) => {
  try {
    const transporter = createTransporter();
    const htmlContent = generateQuoteEmailTemplate(quote, client);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Devis ${quote.number} - ${client.name}`,
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
    const transporter = createTransporter();
    const htmlContent = generateInvoiceEmailTemplate(invoice, client);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Facture ${invoice.number} - ${client.name}`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw new Error('Failed to send invoice email');
  }
}; 