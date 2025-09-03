# Fish Ledger

![Fish Ledger](https://i.imgur.com/179fcc28.jpeg)

Fish Ledger is a web application for fish shop owners to manage real-time inventory and process sales quickly.

## Features

- **Real-time Inventory Dashboard**: Track current stock levels for all fish types with alerts for low stock.
- **Simple Point of Sale (POS) Interface**: Quickly add items to a customer's order, calculate the total, and record the sale.
- **Low Stock Notifications**: Receive automated alerts when fish types reach a predefined low stock threshold.
- **User Authentication**: Secure user accounts with email/password authentication.
- **Subscription Plans**: Choose from Free, Basic, or Premium plans based on your business needs.
- **Cloud Storage**: All data is securely stored in the cloud and accessible from anywhere.
- **Responsive Design**: Works on desktop, tablet, and mobile devices.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payment Processing**: Stripe
- **Notifications**: Browser notifications, Email (via Supabase Edge Functions)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account
- Stripe account (for payment processing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vistara-apps/this-is-a-1019.git
   cd this-is-a-1019
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   VITE_APP_URL=http://localhost:5173
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Supabase Setup

1. Create a new Supabase project.
2. Set up the following tables in your Supabase database:
   - `fish_items`: Stores inventory items
   - `sales`: Stores sales records
   - `sale_items`: Stores items included in sales
   - `profiles`: Stores user profile information
   - `subscriptions`: Stores subscription information
   - `notification_preferences`: Stores user notification preferences
   - `invoices`: Stores invoice information
   - `notification_history`: Stores notification history

3. Deploy the Edge Functions:
   ```bash
   cd supabase/functions
   supabase functions deploy send-notification
   supabase functions deploy check-inventory
   ```

4. Set up a scheduled task to run the `check-inventory` function daily.

### Stripe Setup

1. Create a Stripe account and set up the following products and prices:
   - Basic Plan: $15/month
   - Premium Plan: $25/month

2. Set up webhook endpoints to handle Stripe events.

## Usage

### Inventory Management

1. Add new fish types with details like name, unit, price, and low stock threshold.
2. Update stock quantities as inventory changes.
3. Receive alerts when items are running low.

### Sales Processing

1. Add items to a customer's order.
2. Adjust quantities as needed.
3. Process the sale, which automatically updates inventory.
4. View sales history and reports.

### Account Management

1. Update shop profile information.
2. Manage subscription plan.
3. Configure notification preferences.

## Subscription Plans

| Feature | Free | Basic | Premium |
|---------|------|-------|---------|
| Inventory Limit | 10 items | 50 items | Unlimited |
| Low Stock Alerts | ❌ | ✅ | ✅ |
| Customer Notifications | ❌ | ❌ | ✅ |
| Advanced Reporting | ❌ | ❌ | ✅ |
| Price | $0 | $15/month | $25/month |

## Development

### Project Structure

```
fish-ledger/
├── docs/                  # Documentation
│   └── api/               # API documentation
├── public/                # Public assets
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── Account/       # Account management components
│   │   ├── Auth/          # Authentication components
│   │   ├── common/        # Common UI components
│   │   ├── Migration/     # Data migration components
│   │   ├── Onboarding/    # User onboarding components
│   │   └── Subscription/  # Subscription management components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API service modules
│   └── utils/             # Utility functions
├── supabase/              # Supabase configuration
│   └── functions/         # Supabase Edge Functions
└── .env.example           # Example environment variables
```

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the production version
- `npm run preview`: Preview the production build locally

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Stripe](https://stripe.com/)
- [Lucide Icons](https://lucide.dev/)

