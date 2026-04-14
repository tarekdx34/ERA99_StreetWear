1. META_ACCESS_TOKEN (Facebook Conversions API)
   1. Go to [Meta Business Suite](https://business.facebook.com/)
   2. Navigate to Events Manager (or go directly to eventsmanager.facebook.com (https://eventsmanager.facebook.com/))
   3. Select your Data Source (your pixel)
   4. Click Settings tab
   5. Scroll down to Conversions API section
   6. Click Generate Access Token
   7. Copy the token (starts with EAA...)

   ***
   2. NEXT_PUBLIC_META_PIXEL_ID (Facebook Pixel ID)

   1. Go to [Meta Events Manager](https://eventsmanager.facebook.com/)
   1. Select your Pixel from the left sidebar
   1. Go to Settings → Pixel ID
   1. Copy the numeric ID (e.g., 1234567890123456)

   If you don't have a pixel yet:
   - Click Connect Data Sources → Web → Meta Pixel → Create a Pixel
   - Give it a name (e.g., "QUTB Pixel")

   ***
   3. NEXT_PUBLIC_GA_ID (Google Analytics 4 Measurement ID)

   1. Go to [Google Analytics](https://analytics.google.com/)
   1. Select your QUTB property
   1. Click the gear icon (Admin) in the bottom-left
   1. Under Data collection and modification, click Data Streams
   1. Click your Web stream
   1. Copy the Measurement ID (format: G-XXXXXXXXXX)

   If you don't have a GA4 property yet:
   - Click Create Property → Enter name → Follow setup wizard
   - Create a Web data stream with your website URL

   ***

   ⚠️ Note

   These variables are optional — the app will work without them. The tracking hooks already check if the IDs exist before firing:

   1 // Google Analytics
   2 if (!gaId) return null;
   3
   4 // Meta Pixel
   5 if (!accessToken || !pixelId) {
   6 return { success: false, status: 0, body: { error: "Missing credentials" } };
   7 }

   So you can add them later when you're ready to start running ads.
