
'use client';

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';
import { BrainCircuit } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthLoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <BrainCircuit className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);

  const signUp = async (email: string, pass: string) => {
    setLoading(true);
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        // On successful sign-up, redirect to onboarding
        router.push('/onboarding');
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            toast({
              title: 'Email already exists',
              description: "Please log in instead.",
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Sign Up Error',
              description: error.message,
              variant: 'destructive',
            });
          }
    } finally {
        setLoading(false)
    }
  }

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        router.push('/chat/general/knowledge');
    } catch (error: any) {
        toast({
            title: 'Sign In Error',
            description: "Invalid email or password.",
            variant: 'destructive',
          });
    } finally {
        setLoading(false);
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/chat/general/knowledge');
    } catch (error: any) {
      toast({
        title: 'Google Sign-In Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/login');
    } catch (error: any) {
        toast({
            title: 'Sign Out Error',
            description: error.message,
            variant: 'destructive',
          });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {loading ? <AuthLoadingScreen /> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
