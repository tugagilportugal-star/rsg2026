export const generateTicketEmail = (
  name: string,
  ticketName: string,
  qrCodeDataUrl: string,
  ticketId: string
) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: sans-serif; background-color: #f4f4f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .logo { height: 50px; margin-bottom: 20px; }
          .h1 { color: #003F59; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .p { color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px; }
          .ticket-box { border: 2px dashed #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; background: #fafafa; }
          .qr-code { width: 200px; height: 200px; margin: 10px auto; }
          .footer { margin-top: 30px; font-size: 12px; color: #999; }
          .highlight { color: #F47A20; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="h1">Olá, ${name}!</h1>
          <p class="p">O seu lugar no <strong>Regional Scrum Gathering Lisbon 2026</strong> está garantido.</p>
          
          <div class="ticket-box">
            <p style="margin: 0; font-weight: bold; color: #003F59;">${ticketName}</p>
            <p style="margin: 5px 0 15px 0; color: #888; font-size: 12px;">ID: ${ticketId}</p>
            
            <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code" />
            
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
              Apresente este código na entrada do evento.
            </p>
          </div>

          <p class="p">
            Estamos ansiosos para te ver em Lisboa!
            <br/>Se precisares de fatura, ela será enviada num e-mail separado.
          </p>

          <div class="footer">
            <p>Enviado por TugÁgil • RSG Lisbon 2026</p>
          </div>
        </div>
      </body>
    </html>
  `;
};