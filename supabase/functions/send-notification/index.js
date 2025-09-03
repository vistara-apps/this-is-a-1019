// Supabase Edge Function for sending notifications
// This function is deployed to Supabase Edge Functions

// Import required modules
// Note: In a real deployment, you would use the Supabase Edge Runtime
// which provides access to these modules
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize email transporter
// In production, you would use a service like SendGrid, Mailgun, etc.
const transporter = nodemailer.createTransport({
  host: Deno.env.get('SMTP_HOST'),
  port: Deno.env.get('SMTP_PORT'),
  secure: Deno.env.get('SMTP_SECURE') === 'true',
  auth: {
    user: Deno.env.get('SMTP_USER'),
    pass: Deno.env.get('SMTP_PASS')
  }
});

// Function to get user email from userId
async function getUserEmail(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data.email;
}

// Function to get user notification preferences
async function getNotificationPreferences(userId) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('userId', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw error;
  }
  
  // Return default preferences if none found
  return data || {
    userId,
    emailEnabled: true,
    browserEnabled: true,
    lowStockAlerts: true,
    salesSummary: true,
    newFeatures: true
  };
}

// Function to send email notification
async function sendEmail(to, subject, html) {
  const info = await transporter.sendMail({
    from: `"Fish Ledger" <${Deno.env.get('EMAIL_FROM')}>`,
    to,
    subject,
    html
  });
  
  return info;
}

// Function to generate email content for low stock alerts
function generateLowStockEmailContent(items) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0066cc;">Low Stock Alert</h2>
      <p>The following items are running low on stock:</p>
      <ul>
        ${items.map(item => `
          <li>
            <strong>${item.itemName}</strong>: ${item.currentStock} ${item.unit} remaining
            (below threshold of ${item.lowStockThreshold} ${item.unit})
          </li>
        `).join('')}
      </ul>
      <p>
        <a href="${Deno.env.get('APP_URL')}/inventory" style="background-color: #0066cc; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
          View Inventory
        </a>
      </p>
    </div>
  `;
}

// Function to generate email content for sales summary
function generateSalesSummaryEmailContent(summaryData) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0066cc;">Sales Summary</h2>
      <p>Here's a summary of your recent sales:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <p><strong>Total Sales:</strong> ${summaryData.totalSales}</p>
        <p><strong>Total Revenue:</strong> $${summaryData.totalAmount.toFixed(2)}</p>
        <p><strong>Average Sale Value:</strong> $${summaryData.averageSaleValue.toFixed(2)}</p>
      </div>
      <p>
        <a href="${Deno.env.get('APP_URL')}/dashboard" style="background-color: #0066cc; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
          View Dashboard
        </a>
      </p>
    </div>
  `;
}

// Main handler function
Deno.serve(async (req) => {
  try {
    // Parse request body
    const { userId, type, data } = await req.json();
    
    if (!userId || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user email and notification preferences
    const [email, preferences] = await Promise.all([
      getUserEmail(userId),
      getNotificationPreferences(userId)
    ]);
    
    // Check if email notifications are enabled
    if (!preferences.emailEnabled) {
      return new Response(
        JSON.stringify({ message: 'Email notifications disabled for this user' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle different notification types
    let subject, html;
    
    switch (type) {
      case 'low-stock-alert':
        // Check if low stock alerts are enabled
        if (!preferences.lowStockAlerts) {
          return new Response(
            JSON.stringify({ message: 'Low stock alerts disabled for this user' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        subject = 'Low Stock Alert - Fish Ledger';
        html = generateLowStockEmailContent(data.items);
        break;
        
      case 'sales-summary':
        // Check if sales summary notifications are enabled
        if (!preferences.salesSummary) {
          return new Response(
            JSON.stringify({ message: 'Sales summary notifications disabled for this user' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        subject = 'Sales Summary - Fish Ledger';
        html = generateSalesSummaryEmailContent(data);
        break;
        
      case 'new-features':
        // Check if new feature notifications are enabled
        if (!preferences.newFeatures) {
          return new Response(
            JSON.stringify({ message: 'New feature notifications disabled for this user' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        subject = data.subject || 'New Features Available - Fish Ledger';
        html = data.html || `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0066cc;">New Features Available</h2>
            <p>${data.message || 'Check out the latest features in Fish Ledger!'}</p>
            <p>
              <a href="${Deno.env.get('APP_URL')}" style="background-color: #0066cc; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Open Fish Ledger
              </a>
            </p>
          </div>
        `;
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid notification type' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
    
    // Send email
    await sendEmail(email, subject, html);
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

