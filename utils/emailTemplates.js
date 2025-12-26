export const passwordResetTemplate = (resetUrl, userName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          background-color: #050505;
          color: #ffffff;
          font-family: 'Inter', -apple-system, sans-serif;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .container {
          max-width: 600px;
          margin: 20px;
          background: rgba(20, 20, 20, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 0 40px rgba(0, 255, 255, 0.1);
        }
        .logo {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -1px;
          margin-bottom: 30px;
          background: linear-gradient(90deg, #00f2fe 0%, #4facfe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 20px;
          background: linear-gradient(90deg, #ffffff 0%, #a0a0a0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          color: #a0a0a0;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .btn {
          display: inline-block;
          padding: 16px 32px;
          background: linear-gradient(90deg, #00f2fe 0%, #4facfe 100%);
          color: #000000;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 20px rgba(0, 242, 254, 0.3);
        }
        .footer {
          margin-top: 40px;
          font-size: 12px;
          color: #555555;
        }
        .accent {
          color: #00f2fe;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">ANTIGRAVITY</div>
        <h1>Reset Your Access</h1>
        <p>Hello <span class="accent">${userName}</span>, we received a request to recalibrate your account access. If this was you, please click the button below to set a new password.</p>
        <a href="${resetUrl}" class="btn">RESET PASSWORD</a>
        <p style="margin-top: 30px; font-size: 14px;">This link will expire in 10 minutes for your security.</p>
        <div class="footer">
          If you didn't request this, you can safely ignore this transmission.
        </div>
      </div>
    </body>
    </html>
  `;
};
