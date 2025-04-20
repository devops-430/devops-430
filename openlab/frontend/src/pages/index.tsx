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
  Center,
  Icon,
} from '@chakra-ui/react';
import { FaServer } from 'react-icons/fa';
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
      const response = await apiRequest<LabResource[]>(apiConfig.endpoints.resources, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setResources(response.data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
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
      await apiRequest<LabResource>(apiConfig.endpoints.resources, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Lab-${Date.now()}`,
          type: 'EC2',
        }),
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

      {resources.length === 0 ? (
        <Box 
          p={8} 
          borderWidth={1} 
          borderRadius="lg" 
          borderStyle="dashed"
          textAlign="center"
        >
          <Center flexDirection="column" py={8}>
            <Icon as={FaServer} w={12} h={12} color="gray.400" mb={4} />
            <Text fontSize="xl" color="gray.600" mb={2}>
              No Lab Resources Available
            </Text>
            <Text color="gray.500" mb={4}>
              Get started by creating your first lab resource
            </Text>
            <Button
              colorScheme="blue"
              onClick={handleCreate}
              isLoading={creating}
              loadingText="Creating..."
            >
              Create Your First Resource
            </Button>
          </Center>
        </Box>
      ) : (
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
                    <Badge
                      colorScheme={resource.status === 'running' ? 'green' : 'red'}
                    >
                      {resource.status}
                    </Badge>
                  </Td>
                  <Td>{resource.ipAddress || '-'}</Td>
                  <Td>{new Date(resource.createdAt).toLocaleString()}</Td>
                  <Td>
                    <Button
                      colorScheme={resource.status === 'running' ? 'red' : 'green'}
                      size="sm"
                      onClick={() => {
                        if (resource.status === 'running') {
                          handleStop(resource.id);
                        } else {
                          handleStart(resource.id);
                        }
                      }}
                    >
                      {resource.status === 'running' ? 'Stop' : 'Start'}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Container>
  );
} 