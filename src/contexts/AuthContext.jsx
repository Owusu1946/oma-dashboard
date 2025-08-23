import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create the auth context
const AuthContext = createContext();

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    // Initialize Supabase client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
    
    console.log('AuthContext: Initializing with environment variables');
    console.log('AuthContext: VITE_SUPABASE_URL present:', !!supabaseUrl);
    console.log('AuthContext: VITE_SUPABASE_KEY present:', !!supabaseKey);
    
    if (supabaseUrl && supabaseKey) {
      console.log('AuthContext: Creating Supabase client with URL:', supabaseUrl.substring(0, 20) + '...');
      
      try {
      const client = createClient(supabaseUrl, supabaseKey);
        console.log('AuthContext: Supabase client created successfully');
      setSupabase(client);
      
      // Check for active session
      const checkSession = async () => {
          console.log('AuthContext: Checking for active session');
          try {
        const { data: { session }, error } = await client.auth.getSession();
        
        if (error) {
              console.error('AuthContext: Error checking session:', error);
          setUser(null);
        } else if (session) {
              console.log('AuthContext: Active session found, user:', session.user.email);
          setUser(session.user);
        } else {
              console.log('AuthContext: No active session found');
          setUser(null);
        }
          } catch (sessionError) {
            console.error('AuthContext: Exception checking session:', sessionError);
            setUser(null);
          } finally {
        setLoading(false);
          }
      };
      
      checkSession();
      
      // Set up auth state change listener
        console.log('AuthContext: Setting up auth state change listener');
      const { data: { subscription } } = client.auth.onAuthStateChange(
          (event, session) => {
            console.log('AuthContext: Auth state changed, event:', event);
          setUser(session?.user || null);
          setLoading(false);
        }
      );
      
      // Clean up the subscription
      return () => {
          console.log('AuthContext: Cleaning up subscription');
        subscription?.unsubscribe();
      };
      } catch (clientError) {
        console.error('AuthContext: Error creating Supabase client:', clientError);
        setLoading(false);
      }
    } else {
      console.warn('AuthContext: Supabase credentials not found in environment variables');
      setLoading(false);
    }
  }, []);

  // Sign in with email and password
  const signIn = async (email, password) => {
    console.log('AuthContext: Attempting sign in for user:', email);
    
    if (!supabase) {
      console.error('AuthContext: Sign in failed - Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
      console.log('AuthContext: Calling supabase.auth.signInWithPassword');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
      
      if (error) {
        console.error('AuthContext: Sign in error:', error.message);
      } else {
        console.log('AuthContext: Sign in successful, user:', data?.user?.email);
      }
    
    return { data, error };
    } catch (error) {
      console.error('AuthContext: Exception during sign in:', error);
      return { error: { message: 'Unexpected error during sign in' } };
    }
  };

  // Sign out
  const signOut = async () => {
    console.log('AuthContext: Attempting sign out');
    
    if (!supabase) {
      console.error('AuthContext: Sign out failed - Supabase client not initialized');
      return { error: { message: 'Supabase client not initialized' } };
    }
    
    try {
    const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthContext: Sign out error:', error.message);
      } else {
        console.log('AuthContext: Sign out successful');
      }
      
    return { error };
    } catch (error) {
      console.error('AuthContext: Exception during sign out:', error);
      return { error: { message: 'Unexpected error during sign out' } };
    }
  };

  // Value to be provided by the context
  const value = {
    user,
    loading,
    supabase,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
