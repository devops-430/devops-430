import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { apiRequest } from '../utils/api';
import apiConfig from '../config/api';

interface LoginFormProps {
  onLoginSuccess: (apiKey: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
        onLoginSuccess(apiKey);
        toast({
          title: 'Success',
          description: 'Successfully logged in!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error('Invalid API key');
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
    <Box as="form" onSubmit={handleSubmit} width="100%" maxW="400px">
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

        {error && (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        )}

        <Button
          type="submit"
          colorScheme="blue"
          width="100%"
          isLoading={isLoading}
        >
          Login
        </Button>
      </VStack>
    </Box>
  );
}; 