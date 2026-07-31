# Career Advisor React Native App Setup Instructions

This is a complete React Native application for career guidance with Supabase authentication.

## Features

- **Authentication System**
  - Login with email and password
  - Sign up with email, password, name, current course, and interested field
  - Secure session management
  - Logout functionality

- **User Profile Management**
  - Store user information in Supabase database
  - Display user profile on home screen
  - Update profile information

- **Modern UI/UX**
  - Clean, responsive design
  - Form validation
  - Loading states
  - Error handling
  - Dropdown selectors for courses and fields

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Supabase account

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already installed:
- `@supabase/supabase-js` - Supabase client
- `react-native-url-polyfill` - URL polyfill for React Native
- `@react-native-async-storage/async-storage` - Async storage for session persistence

### 2. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Set up the Database**
   - Go to the SQL Editor in your Supabase dashboard
   - Run the SQL schema from `database/schema.sql`
   - This will create the profiles table and necessary policies

3. **Configure Authentication**
   - Go to Authentication > Settings in your Supabase dashboard
   - Enable email authentication
   - Configure email templates if needed

### 3. Update Configuration

1. **Update Supabase Configuration**
   - Open `lib/supabase.ts`
   - Replace `YOUR_SUPABASE_URL` with your actual Supabase project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your actual Supabase anon key

```typescript
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseAnonKey = 'your-anon-key-here';
```

### 4. Run the Application

```bash
# Start the development server
npm start

# Or run on specific platforms
npm run android
npm run ios
npm run web
```

## Project Structure

```
MyApp/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home screen with user profile
│   │   └── explore.tsx        # Explore screen
│   ├── login.tsx              # Login screen
│   ├── signup.tsx             # Signup screen
│   └── _layout.tsx            # Root layout with auth provider
├── components/
│   └── AuthWrapper.tsx        # Authentication wrapper component
├── contexts/
│   └── AuthContext.tsx        # Authentication context and provider
├── lib/
│   └── supabase.ts            # Supabase configuration
├── database/
│   └── schema.sql             # Database schema
└── SETUP_INSTRUCTIONS.md      # This file
```

## Database Schema

The app uses a `profiles` table with the following structure:

```sql
profiles (
  id UUID PRIMARY KEY,           -- References auth.users(id)
  name TEXT NOT NULL,            -- User's full name
  current_course TEXT,           -- Current educational course
  interested_field TEXT,         -- Field of interest
  created_at TIMESTAMP,          -- Account creation time
  updated_at TIMESTAMP           -- Last update time
)
```

## Authentication Flow

1. **App Launch**: AuthWrapper checks if user is authenticated
2. **Not Authenticated**: Redirects to login screen
3. **Login**: User enters email/password, gets authenticated
4. **Signup**: User creates account with additional profile information
5. **Authenticated**: User sees home screen with profile information
6. **Logout**: User can logout from home screen

## Key Components

### AuthContext
- Manages authentication state
- Provides sign up, sign in, and sign out functions
- Handles session persistence

### Login Screen
- Email and password input
- Form validation
- Error handling
- Navigation to signup

### Signup Screen
- Complete user registration form
- Dropdown selectors for course and field
- Form validation
- Profile creation in database

### Home Screen
- Displays user profile information
- Shows current course and interested field
- Logout functionality
- Career guidance features (placeholder)

## Customization

### Adding New Fields
1. Update the signup form in `app/signup.tsx`
2. Add the field to the database schema
3. Update the AuthContext signup function
4. Display the field in the home screen

### Styling
- All styles are defined in each component file
- Uses React Native StyleSheet
- Responsive design for different screen sizes

### Validation
- Email format validation
- Password length validation
- Required field validation
- Password confirmation matching

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Check your URL and API key
   - Ensure your Supabase project is active

2. **Authentication Not Working**
   - Verify email authentication is enabled in Supabase
   - Check if email verification is required

3. **Database Errors**
   - Ensure the schema has been applied correctly
   - Check Row Level Security policies

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Clear Expo cache: `expo start -c`

## Next Steps

This app provides a solid foundation for a career advisor platform. You can extend it by adding:

- Career assessment questionnaires
- Job recommendation engine
- Resume builder
- Interview preparation tools
- Skill tracking
- Goal setting and progress tracking
- Community features
- Push notifications

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Check React Native and Expo documentation
4. Create an issue in the project repository



