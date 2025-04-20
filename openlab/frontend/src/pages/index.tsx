import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { apiRequest } from '../utils/api';
import apiConfig from '../config/api';

interface LabResource {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped';
  ipAddress: string;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const toast = useToast();
  const [resources, setResources] = useState<LabResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      router.push('/login');
      return;
    }
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await apiRequest('GET', apiConfig.endpoints.resources);
      setResources(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching resources',
        description: 'Failed to load lab resources. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (resourceId: string) => {
    try {
      await apiRequest('POST', `${apiConfig.endpoints.resources}/${resourceId}/start`);
      toast({
        title: 'Resource started',
        description: 'The lab resource has been started successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchResources();
    } catch (error) {
      toast({
        title: 'Error starting resource',
        description: 'Failed to start the lab resource. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleStop = async (resourceId: string) => {
    try {
      await apiRequest('POST', `${apiConfig.endpoints.resources}/${resourceId}/stop`);
      toast({
        title: 'Resource stopped',
        description: 'The lab resource has been stopped successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchResources();
    } catch (error) {
      toast({
        title: 'Error stopping resource',
        description: 'Failed to stop the lab resource. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await apiRequest('POST', apiConfig.endpoints.resources, {
        name: `Lab-${Date.now()}`,
        type: 'EC2',
      });
      toast({
        title: 'Resource created',
        description: 'A new lab resource has been created successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchResources();
    } catch (error) {
      toast({
        title: 'Error creating resource',
        description: 'Failed to create a new lab resource. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Lab Resources</Heading>
        <Button
          colorScheme="blue"
          onClick={handleCreate}
          isLoading={creating}
          loadingText="Creating..."
        >
          Create New Resource
        </Button>
      </HStack>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>IP Address</Th>
              <Th>Created At</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {resources.map((resource) => (
              <Tr key={resource.id}>
                <Td>{resource.name}</Td>
                <Td>{resource.type}</Td>
                <Td>
                  <Text
                    color={resource.status === 'running' ? 'green.500' : 'red.500'}
                    fontWeight="bold"
                  >
                    {resource.status}
                  </Text>
                </Td>
                <Td>{resource.ipAddress || '-'}</Td>
                <Td>{new Date(resource.createdAt).toLocaleString()}</Td>
                <Td>
                  {resource.status === 'running' ? (
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleStop(resource.id)}
                    >
                      Stop
                    </Button>
                  ) : (
                    <Button
                      colorScheme="green"
                      size="sm"
                      onClick={() => handleStart(resource.id)}
                    >
                      Start
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
} 