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

export default function Subscribe() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest<{ message: string }>(
        apiConfig.endpoints.subscribe,
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: 'Subscription successful',
        description: 'Your API key has been sent to your email',
        status: 'success',
        duration: 5000,
      });

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Subscription failed',
        description: error.message || 'Please try again later',
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
          <Heading>Subscribe to OpenLab</Heading>
          <Text>Enter your email to receive an API key</Text>
          <form onSubmit={handleSubscribe} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                isLoading={isLoading}
              >
                Subscribe
              </Button>
            </VStack>
          </form>
          <Text>
            Already have an API key?{' '}
            <Link href="/login" color="blue.500">
              Login here
            </Link>
          </Text>
        </VStack>
      </Box>
    </Layout>
  );
} 