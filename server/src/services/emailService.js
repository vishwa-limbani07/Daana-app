// emailService.js — Nodemailer wrapper for transactional emails.
//
// PATTERN: fire-and-forget.
//   Email sending is SLOW (network call to SMTP server). We never want to
//   block an HTTP response on it. Callers do:
//
//       sendDonationReceipt(...).catch(err => console.error(...))
//
//   so the promise runs in the background and a failure just logs.
//   The user already got their payment confirmation — a missing email is
//   not a payment failure.
//
// GRACEFUL DEGRADATION: if EMAIL_USER / EMAIL_PASS aren't configured,
// emails become no-ops. The app still works for contributors who haven't
// set up Gmail yet.
//
// GMAIL SETUP:
//   1. Enable 2-Step Verification on the Google account.
//   2. Visit https://myaccount.google.com/apppasswords
//   3. Create an "App Password" — Google gives you a 16-char string.
//   4. Put that string in EMAIL_PASS. Your real Gmail password DOES NOT work
//      for SMTP since Google disabled less-secure apps.

import nodemailer from 'nodemailer';

let transporter = null;
let warned = false;

const getTransporter = () => {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) {
    if (!warned) {
      console.warn('[email] EMAIL_USER/EMAIL_PASS not set — emails disabled');
      warned = true;
    }
    return null;
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: false, // port 587 uses STARTTLS, not implicit TLS
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
};

/**
 * Send a thank-you receipt to a donor.
 * Safe to call without configured SMTP — becomes a no-op.
 */
export const sendDonationReceipt = async ({
  to,
  donorName,
  amount,
  campaignTitle,
  campaignId,
}) => {
  const t = getTransporter();
  if (!t) return;

  const campaignUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/campaigns/${campaignId}`;
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

  await t.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: `Thank you for supporting ${campaignTitle}!`,
    html: receiptTemplate({ donorName, formattedAmount, campaignTitle, campaignUrl }),
  });
};

/**
 * Reusable HTML template for the receipt.
 * Inline styles only — most email clients strip <style> tags.
 */
const receiptTemplate = ({ donorName, formattedAmount, campaignTitle, campaignUrl }) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f2937;">
  <h1 style="color: #4f46e5; margin: 0 0 16px 0;">Thank you, ${escapeHtml(donorName)} 💜</h1>

  <p style="font-size: 16px; line-height: 1.5;">
    Your donation of <strong>${formattedAmount}</strong> to
    <strong>${escapeHtml(campaignTitle)}</strong> was received successfully.
  </p>

  <p style="font-size: 14px; color: #6b7280;">
    Every contribution helps move this campaign closer to its goal.
  </p>

  <a href="${campaignUrl}"
     style="display: inline-block; margin-top: 16px; padding: 10px 18px;
            background: #4f46e5; color: #fff; text-decoration: none; border-radius: 6px;">
    View campaign
  </a>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

  <p style="font-size: 12px; color: #9ca3af;">
    You received this email because you made a donation through CrowdFund.
    Keep this email for your records.
  </p>
</div>
`;

// Tiny HTML-escape — never inject user input into HTML raw.
// (donorName and campaignTitle both come from user-controlled DB rows.)
const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
