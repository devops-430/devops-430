import React, { useState } from 'react';
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
  Container,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { apiRequest } from '../utils/api';
import apiConfig from '../config/api';

const SubscriptionForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setApiKey(null);

    try {
      const response = await apiRequest<{ apiKey: string }>(
        apiConfig.endpoints.subscribe,
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data?.apiKey) {
        setApiKey(response.data.apiKey);
        toast({
          title: 'Success!',
          description: 'Your API key has been sent to your email.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>
            Get Your API Key
          </Heading>
          <Text color="gray.600">
            Subscribe to OpenLab and receive your API key via email
          </Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit} p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email Address</FormLabel>
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
              loadingText="Subscribing..."
            >
              Subscribe
            </Button>
          </VStack>
        </Box>

        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {apiKey && (
          <Alert status="success">
            <AlertIcon />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your API key has been sent to your email. Please check your inbox.
            </AlertDescription>
          </Alert>
        )}
      </VStack>
    </Container>
  );
};

export default SubscriptionForm; 