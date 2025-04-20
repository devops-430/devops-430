import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Link,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { apiRequest } from '../utils/api';
import apiConfig from '../config/api';
import Layout from '../components/Layout';

export default function Login() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    // Clear any existing authentication data on mount
    localStorage.clear();
    console.log('localStorage cleared');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest<{ valid: boolean }>(
        apiConfig.endpoints.verify,
        {
          method: 'POST',
          body: JSON.stringify({ apiKey }),
        }
      );

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data?.valid) {
        localStorage.setItem('apiKey', apiKey);
        console.log('API key stored:', apiKey); // Debug log
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
        });
        router.push('/');
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid API key',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <Layout>
      <Box 
        maxW="md" 
        mx="auto" 
        mt={8} 
        p={8} 
        borderWidth={1} 
        borderRadius="xl" 
        borderColor="gray.200"
        bg="white"
        boxShadow="sm"
      >
        <VStack spacing={6}>
          <Heading size="lg">Welcome to OpenLab</Heading>
          <Text color="gray.600" textAlign="center">
            Enter your API key to access lab resources
          </Text>
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>API Key</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    pr="4.5rem"
                    fontFamily="mono"
                    bg="gray.50"
                  />
                  <InputRightElement width="4.5rem">
                    <IconButton
                      h="1.75rem"
                      size="sm"
                      aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                      icon={showApiKey ? <FaEyeSlash /> : <FaEye />}
                      onClick={toggleApiKeyVisibility}
                      variant="ghost"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                size="lg"
                isLoading={isLoading}
                loadingText="Verifying..."
              >
                Login
              </Button>
            </VStack>
          </form>
          <Text color="gray.600">
            Don't have an API key?{' '}
            <Link href="/subscribe" color="blue.500" fontWeight="medium">
              Subscribe here
            </Link>
          </Text>
        </VStack>
      </Box>
    </Layout>
  );
} 