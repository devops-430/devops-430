import { Box, Container, Flex, Button, useToast } from '@chakra-ui/react';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

interface LayoutProps {
  children: ReactNode;
}

// Create a client-side only component for the navigation
const Navigation = () => {
  const router = useRouter();
  const toast = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      const apiKey = localStorage.getItem('apiKey');
      console.log('API Key found:', !!apiKey); // Debug log
      setIsAuthenticated(!!apiKey);
    };
    
    checkAuth();
    // Add event listener for storage changes
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    setIsAuthenticated(false);
    toast({
      title: 'Logged out successfully',
      status: 'success',
      duration: 3000,
    });
    router.push('/login');
  };

  // Don't render anything until after hydration
  if (!mounted) {
    return null;
  }

  return (
    <Box as="nav" bg="white" boxShadow="sm" py={4}>
      <Container maxW="container.xl">
        <Flex justify="flex-end">
          {isAuthenticated && (
            <Button
              variant="ghost"
              colorScheme="blue"
              onClick={handleLogout}
              size="sm"
            >
              Logout
            </Button>
          )}
        </Flex>
      </Container>
    </Box>
  );
};

// Use dynamic import with ssr: false to ensure client-side only rendering
const ClientOnlyNavigation = dynamic(() => Promise.resolve(Navigation), {
  ssr: false,
});

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const toast = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('Layout mounted'); // Debug log
    const apiKey = localStorage.getItem('apiKey');
    console.log('API Key in Layout:', apiKey); // Debug log
    setIsAuthenticated(!!apiKey);
  }, []);

  const handleLogout = () => {
    console.log('Logging out...'); // Debug log
    localStorage.removeItem('apiKey');
    setIsAuthenticated(false);
    toast({
      title: 'Logged out successfully',
      status: 'success',
      duration: 3000,
    });
    router.push('/login');
  };

  console.log('Is authenticated:', isAuthenticated); // Debug log

  return (
    <Box minH="100vh" bg="gray.50">
      <ClientOnlyNavigation />
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
} 