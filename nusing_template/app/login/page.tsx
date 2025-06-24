// app/login/page.tsx

// This component can be a Server Component by default,
// but it will render the AuthForm which is a Client Component.
import AuthForm from '../../components/authform'; // Adjust the path as needed!

// You can add styles or other page-specific elements here.
// For example, if you have a global CSS file, you can import it.
// import '../globals.css'; // Or whatever your global CSS path is

export default function LoginPage() {
  return (
    <div >
      {/*
        Now, render your AuthForm.
        Because AuthForm is marked "use client", it will only run in the browser.
      */}
      <AuthForm />

      <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        Don't have an account? Sign up above!
      </p>
    </div>
  );
}
