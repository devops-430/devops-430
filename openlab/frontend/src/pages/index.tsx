import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import ApiKeyVerifier from '../components/ApiKeyVerifier';

const Home: React.FC = () => {
  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="center">
          <Box textAlign="center" maxW="2xl">
            <Heading as="h1" size="2xl" mb={4}>
              Welcome to OpenLab
            </Heading>
            <Text fontSize="xl" color="gray.600">
              Enter your API key to access our services or subscribe to get a new API key
            </Text>
          </Box>
          
          <ApiKeyVerifier />
        </VStack>
      </Container>
    </Box>
  );
};

export default Home; 