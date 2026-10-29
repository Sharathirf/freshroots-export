# FreshRoots Export — Comprehensive Owner Action Checklist

**Target User**: Business Owner / Founder  
**Location**: Kikkeri, Mandya, Karnataka, India  
**Objective**: Guide the owner step-by-step through every non-technical, legal, commercial, and operational action required to launch FreshRoots Export into live commercial operations.

---

## Section 1: Business Decisions & Commercial Policies

- [ ] **Finalize Retail Minimum Order Quantities (MOQ)**:
  - Confirm the 25-piece bag for Semi-Husked Mature Coconuts (`₹1,479` including 100% free delivery across India).
  - Confirm that single-piece retail coconut orders are prohibited to preserve logistics margin.
- [ ] **Verify Delivery Fee Policy**:
  - The application currently offers **100% Free Doorstep Delivery** nationwide by baking freight costs directly into product pricing. Review if this model is profitable for distant non-metro PIN codes (North-East, Jammu & Kashmir).
- [ ] **Establish Wholesale Minimum Lots**:
  - Verify that Chali Arecanut wholesale MOQ remains at **1 Quintal (100 kg)**.
  - Verify that Tiptur Ball Copra wholesale MOQ remains at **15 kg box** (or 100 kg for export lots).
- [ ] **Payment Terms for High-Tonnage Orders**:
  - Confirm the B2B payment terms: 50% advance upon order placement, 50% upon bill of lading (BL) / dispatch receipt.

---

## Section 2: Product & Supplier Information (Kikkeri & Mandya)

- [ ] **Lock In Local Farm Sourcing Partnerships**:
  - Partner with at least 3 certified coconut groves in the Kikkeri / K.R. Pet / Channarayapatna belt for consistent mature coconut supply (weight: 550g - 650g per de-husked nut).
  - Establish supply lines with Tiptur APMC copra dryers ensuring moisture content strictly ≤ 5.5% and sulfur-free natural drying.
- [ ] **Packaging Procurement**:
  - Order branded high-tensile HDPE mesh bags (capacity 25 nuts) with FreshRoots Export tag.
  - Procure 5-ply corrugated export cartons for Ball Copra (15 kg capacity with moisture-barrier inner liners).
  - Source food-grade HDPE bottles (1L & 5L) for wood-pressed cold extraction oils and glass jars for A2 Bilona Ghee.
- [ ] **Conduct Initial Physical Stock Inventory**:
  - Enter initial live inventory counts into the Admin Dashboard (`/admin`) for each of the 11 catalog commodities.

---

## Section 3: Domain, DNS & Production Deployment

- [ ] **Domain Name Registration**:
  - Purchase `freshrootsexport.com` (or primary commercial domain) on GoDaddy, Namecheap, or Cloudflare Registrar.
- [ ] **DNS & SSL Setup**:
  - Point DNS `A` records and `CNAME` records to your production server (Vercel, AWS Amplify, or DigitalOcean VPS).
  - Enable Automatic HTTPS (Let's Encrypt or Cloudflare Universal SSL).
- [ ] **Configure Environment Variables in Production**:
  - Copy `.env.example` to the hosting platform's environment settings:
    - `DATABASE_URL`: Production PostgreSQL database connection string (e.g. Supabase, Neon, AWS RDS).
    - `ADMIN_TOKEN`: A secure 32+ character random secret string for dashboard access.
    - `CRON_SECRET`: Random secret string to authorize scheduled maintenance runs.
    - `NEXT_PUBLIC_BASE_URL`: `https://freshrootsexport.com`

---

## Section 4: External Accounts & Integrations

- [ ] **Google Search Console**:
  - Verify site ownership via DNS TXT record or HTML meta tag.
  - Submit the dynamic sitemap URL: `https://freshrootsexport.com/sitemap.xml`.
- [ ] **Google Analytics 4 (GA4)**:
  - Create a GA4 property and copy the Measurement ID (`G-XXXXXXXXXX`).
  - Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in production environment settings.
- [ ] **Merchant UPI VPA (Direct Bank Settlement)**:
  - Configure your business current account UPI ID (e.g., `freshrootsexport@icici` or `9876543210@okbizaxis`).
  - Set `NEXT_PUBLIC_UPI_VPA` in production environment variables.
  - The website will automatically generate dynamic UPI QR codes containing the specific Order ID for instant reconciliation.
- [ ] **SMS Gateway (Fast2SMS / Twilio)**:
  - Register with Fast2SMS or Twilio for programmatic transactional OTP delivery.
  - Obtain DLT approval for the transactional SMS template in India.
  - Set `SMS_GATEWAY_API_KEY` in production environment variables.
- [ ] **WhatsApp Business Cloud API**:
  - Register your business mobile number on Meta Business Manager.
  - Set up automated webhook or link click-to-chat to `+91 94812 34567` (replace with your active operational number).
- [ ] **Logistics & Courier Partner (Shiprocket / Delhivery / V-Trans)**:
  - Open a B2B + B2C logistics account with Shiprocket or Delhivery.
  - For heavy B2B cargo (> 100 kg), partner with regional surface transporters (VRL Logistics, ARC, or Navata Transport).
- [ ] **Payment Gateway (Razorpay Live)**:
  - Complete business KYC on Razorpay (submit Certificate of Incorporation, PAN, Bank Details).
  - Generate live `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` and add to production environment variables.

---

## Section 5: Legal & Statutory Compliance (India & Export)

- [ ] **GST Registration**:
  - Obtain regular GST registration for Karnataka State (Mandya jurisdiction).
  - Update `GSTIN` in `src/lib/constants.ts` and invoice templates.
- [ ] **FSSAI Food Safety License**:
  - Secure FSSAI State License for processing and trading agricultural food items (Coconuts, Copra, Ghee, Edible Oils).
  - Print FSSAI License Number on retail packaging and footer disclosures.
- [ ] **Import Export Code (IEC)**:
  - Apply online via DGFT portal (`dgft.gov.in`) to obtain the 10-digit IEC.
- [ ] **Export Promotion Council Registration (RCMC)**:
  - Register with the **Coconut Development Board (CDB)** for coconut products.
  - Register with **APEDA** for processed agri-commodities.
- [ ] **MSME / Udyam Registration**:
  - Complete free Udyam registration to access agricultural priority credit and MSME benefits.

---

## Section 6: Marketing, Sales & Organic Growth Execution

- [ ] **Google Business Profile (Local SEO)**:
  - Create and verify a Google Business Profile for *"FreshRoots Export - Agricultural Procurement & Wholesale"* located in Kikkeri, Mandya.
  - Add photos of the Mandya processing unit, sorting facility, and coconut packaging.
- [ ] **Execute Outbound B2B Outreach (GCC & Domestic Buyers)**:
  - Use the generated buyer directory (`Desiccated_Coconut_Global_Buyers_100.xlsx` / `generate_buyers_excel.py`).
  - Send personalized introduction emails and WhatsApp catalogs to procurement heads of confectionery brands, oil millers, and temple trusts.
- [ ] **Sample Box Distribution**:
  - Prepare 10 sample boxes containing 2 vacuum-packed Tiptur Ball Copras, 100ml cold-pressed oil samples, and a quality test certificate.
  - Ship sample boxes to high-potential institutional buyers.
- [ ] **Local Trade Network Activation**:
  - Distribute physical wholesale price circulars to APMC commission agents in Mandya, Mysuru, and Bengaluru Yeshwanthpur market.

---

## Section 7: Testing, Approvals & Final Launch Sign-Off

- [ ] **Perform End-to-End Test Transaction**:
  - Add a 25-piece coconut bag to the cart.
  - Sign in using a real mobile number and verify via OTP.
  - Scan the dynamic UPI QR code with Google Pay / PhonePe.
  - Complete a live ₹1 test payment, enter the 12-digit UTR, and verify order creation in the Admin Dashboard.
- [ ] **Test RFQ Pipeline**:
  - Submit a wholesale quotation request for 50 quintals of copra.
  - Verify that the RFQ appears immediately under the RFQs tab in `/admin`.
  - Update the status to `Quoted` and attach pricing notes.
- [ ] **Final Founder Launch Approval**:
  - Verify mobile responsiveness on iPhone and Android smartphones.
  - Sign off on production deployment readiness.
