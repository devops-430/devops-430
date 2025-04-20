import { useState } from 'react';
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
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { apiRequest } from '../utils/api';
import apiConfig from '../config/api';
import Layout from '../components/Layout';

export default function Login() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

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

  return (
    <Layout>
      <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg">
        <VStack spacing={4}>
          <Heading>Login</Heading>
          <Text>Enter your API key to continue</Text>
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>API Key</FormLabel>
                <Input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                isLoading={isLoading}
              >
                Login
              </Button>
            </VStack>
          </form>
          <Text>
            Don't have an API key?{' '}
            <Link href="/subscribe" color="blue.500">
              Subscribe here
            </Link>
          </Text>
        </VStack>
      </Box>
    </Layout>
  );
} 