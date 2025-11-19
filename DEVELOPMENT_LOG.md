# Development Log

## 2025-11-19
### Platform Structure Discussion
- Identified project structure: React + Vite application named "new_platform"
- Two route types: LoggedInRoutes and NotLoggedInRoutes
- Two layout types: auth layout and Home layout
- Uses Mantine UI components library

### Questions Discussed
1. Platform differences in folder
2. How to save conversation history permanently

### Navigation Menu Implementation
- Converted PHP-based navigation menu (nav.php) to React structure in routes.jsx
- Implemented expandable/collapsible menu sections with UX improvements:
  - Section titles are now collapsible with badge counters
  - Added smooth transitions and hover effects
  - Improved typography for better readability
  - Optimized padding for compact layout
  - Changed navbar background color to rgb(217,224,232)

### Latest Updates
- Added Settlement section with 3 menu items:
  - Settlement & Topup
  - Request List
  - B2b Send
- Added Settings section with 13 menu items:
  - Update Group
  - System Setting
  - CP Journal
  - Available Account List
  - Whitelist Merchant IP
  - Available Account New Deposit
  - Available Account With Mybank
  - Count Available Account New Deposit
  - Available Account New Withdraw
  - Emergency Deposit Page (Super Admin)
  - Service Selenium List (Super Admin)
  - Service NAGAD API (Super Admin)
  - Service Resend Callback (Super Admin)
- Fixed missing Anchor import in header component

### User Management Implementation
- Created User Account List page (accountList.jsx) with the following features:
  - Full data table with Mantine Table component
  - Columns: Login, Active, Type, Merchant, Phone Number, Agent, Alias, Direct Merchant, Set Merchant, Action
  - Search/filter functionality across all columns
  - Add New and Refresh buttons
  - Edit and Delete actions for each record
  - Loading states with LoadingOverlay
  - Empty state handling
  - Record count display
  - Responsive layout with Paper and ScrollArea
  - Navigation to login-form for add/edit operations
- Updated routes.jsx to include the new page

### API Integration
- Created API helper utilities in src/helper/:
  - **api.js**: Centralized API client with axios
    - Base URL: https://bluegrape.app/sispay/webservices
    - Automatic encryption/decryption for requests/responses
    - Request/response interceptors for error handling
    - User API methods: getMasterLogin(), deleteMasterLogin(), saveMasterLogin()
  - **crypto.js**: Encryption/decryption utility
    - CRYPTO.encrypt() and CRYPTO.decrypt() methods
    - Placeholder implementation (ready to add production encryption like AES)
- Integrated API with accountList.jsx:
  - Real-time data fetching from getMasterLogin.php endpoint
  - Delete functionality with deleteMasterLogin.php endpoint
  - Automatic URI decoding for response data
  - Error handling with user notifications

### Authentication System Implementation
- **Session + Token Based Authentication**:
  - Converted PHP session-based auth to hybrid session+token for React compatibility
  - Frontend uses token stored in localStorage + Redux + Cookies
  - Backend maintains PHP sessions with 15-minute timeout

- **Backend PHP Files** (in php_templates/ folder):
  - **login.php**: Authentication endpoint
    - Validates credentials against ms_login table
    - Password hashing: SHA1
    - Returns token + user data (username, type, merchant, menuaccess)
    - Creates PHP session with emoney_* variables
  - **checkSession.php**: Session validation endpoint
    - Checks session validity (15-minute timeout)
    - Auto-extends session timeout on valid check
    - Returns user data if session valid

- **Frontend Integration**:
  - Updated src/services/api.js:
    - Changed WEB_URL to https://bluegrape.app/sispay/webservices/
    - apiLogin() for authentication
    - checkSession() for session validation
  - Login flow in src/layouts/auth/:
    - Existing login page (Index.jsx) already styled and functional
    - Login data handler (login-data.jsx) with Redux integration
    - Saves token to localStorage, user data to Redux store + Cookies

- **Protected Routes**:
  - LoggedInRoutes.jsx: Checks Redux loginUser state
  - NotLoggedInRoutes.jsx: Redirects to home if logged in
  - Auto-redirect logic already implemented

- **Documentation**:
  - Created AUTHENTICATION_SETUP.md with complete setup guide
  - Includes deployment instructions, testing checklist, troubleshooting
  - Flow diagrams and API testing examples with curl commands

---
