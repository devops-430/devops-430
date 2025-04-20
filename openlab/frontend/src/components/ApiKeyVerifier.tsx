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
  Divider,
  HStack,
} from '@chakra-ui/react';
import axios from 'axios';
import SubscriptionForm from './SubscriptionForm';
import apiConfig from '../config/api';

const ApiKeyVerifier: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubscription, setShowSubscription] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const toast = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(apiConfig.endpoints.verify, { apiKey });
      
      if (response.data.valid) {
        setIsVerified(true);
        toast({
          title: 'Success!',
          description: 'API key verified successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid API key. Please try again.');
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Invalid API key. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <Container maxW="md" py={10}>
        <Alert status="success">
          <AlertIcon />
          <Box>
            <AlertTitle>API Key Verified!</AlertTitle>
            <AlertDescription>
              Your API key is valid. You can now use our services.
            </AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>
            Verify Your API Key
          </Heading>
          <Text color="gray.600">
            Enter your API key to access OpenLab services
          </Text>
        </Box>

        <Box as="form" onSubmit={handleVerify} p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
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
              width="full"
              isLoading={isLoading}
              loadingText="Verifying..."
            >
              Verify API Key
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

        <Divider />

        <Box textAlign="center">
          <Text mb={4}>Don't have an API key?</Text>
          <Button
            colorScheme="green"
            onClick={() => setShowSubscription(true)}
          >
            Subscribe to Get an API Key
          </Button>
        </Box>

        {showSubscription && <SubscriptionForm />}
      </VStack>
    </Container>
  );
};

export default ApiKeyVerifier; 