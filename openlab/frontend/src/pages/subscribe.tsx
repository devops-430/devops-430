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
import axios from 'axios';
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
      await axios.post('http://localhost:3001/api/auth/subscribe', {
        email,
      });

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
    } catch (error) {
      toast({
        title: 'Subscription failed',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Box
        maxW="md"
        mx="auto"
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
      >
        <VStack spacing={4} align="stretch">
          <Heading textAlign="center">Subscribe to OpenLab</Heading>
          <Text textAlign="center" color="gray.600">
            Enter your email to receive an API key
          </Text>
          
          <form onSubmit={handleSubscribe}>
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
                width="full"
                isLoading={isLoading}
              >
                Subscribe
              </Button>

              <Text textAlign="center" fontSize="sm" color="gray.600">
                Already have an API key?{' '}
                <Link color="blue.500" href="/login">
                  Login here
                </Link>
              </Text>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Layout>
  );
} 