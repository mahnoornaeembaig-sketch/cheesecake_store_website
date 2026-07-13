🍰 The Cheesecake Method
A full-stack, custom e-commerce storefront and secure admin management system built for a boutique cheesecake business.

This project provides a beautiful, responsive, and conversion-optimized customer-facing menu, while powering a private, highly secure backend for the business owner to manage orders, update statuses, and interact with customers.

✨ Features
🛒 Customer Storefront
Artisanal UI/UX: A warm, retro-inspired aesthetic featuring responsive design, smooth cascading entrance animations, and clean typography.

Verified Reviews: Integrated OAuth ensures that only real, authenticated users can leave reviews, keeping the platform bot-resistant and authentic.

Seamless Ordering: A streamlined cart and checkout flow optimized for mobile and desktop viewing.

🔒 Secure Admin Dashboard
Private Management Hub: A completely hidden admin panel protected by strict Supabase Row-Level Security (RLS) and custom SQL policies. Customer data is never exposed to the public.

One-Click WhatsApp Updates: A lightweight, cost-free communication pipeline. When an order status changes, the dashboard dynamically generates a pre-filled wa.me deep link. The owner simply clicks the button to open WhatsApp with a formatted update ready to send—zero manual typing required.

🛠️ Tech Stack
Frontend: React / Vite (UI generated via Lovable)

Backend & Database: Supabase (PostgreSQL)

Authentication: Supabase Auth (OAuth integration)

Deployment: Vercel

🚀 How It Works (The WhatsApp Integration)
To keep operating costs at $0 for the business owner, this project deliberately bypasses the official paid WhatsApp Business API.

Instead, the system utilizes the Click to Chat API. The frontend pulls the customer's phone number and order status from the database, dynamically formats a custom message string, and URL-encodes it. This generates a deep link that seamlessly hands off the payload to the native WhatsApp application on the admin's device.

💻 Local Setup
Clone the repository:

Bash
git clone https://github.com/your-username/the-cheesecake-method.git
Install dependencies:

Bash
npm install
Set up your environment variables (ensure these are added to your .gitignore):

Bash
.env
.env.local
.env.*.local
Start the development server:

Bash
npm run dev
