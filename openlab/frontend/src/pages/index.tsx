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
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/react';
import { FaServer, FaPlus, FaPowerOff, FaPlay, FaStop } from 'react-icons/fa';
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

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceType, setNewResourceType] = useState('');


  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      router.push('/login');
      return;
    }
    fetchResources();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    window.location.reload();
  };

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
      await apiRequest(
        `${apiConfig.endpoints.resources}/${resourceId}/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
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
      await apiRequest(
        `${apiConfig.endpoints.resources}/${resourceId}/stop`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
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
    if (!newResourceName || !newResourceType) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both name and type.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setCreating(true);
    try {
      await apiRequest<LabResource>(apiConfig.endpoints.resources, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newResourceName,
          type: newResourceType,
          // name: `Lab-${Date.now()}`,
          // type: 'EC2',
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
      onClose(); // close the modal after creating
      setNewResourceName('');
      setNewResourceType('');
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
      <Center minH="100vh" bg="gray.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Loading resources...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.xl">
        <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
          <Flex justify="space-between" align="center" mb={8}>
            <HStack spacing={4}>
              <Icon as={FaServer} w={6} h={6} color="blue.500" />
              <Heading size="lg">Lab Resources</Heading>
            </HStack>
            <HStack spacing={4}>
              <Tooltip label="Create New Resource" placement="top">
                <Button
                  colorScheme="blue"
                  onClick={onOpen}
                  isLoading={creating}
                  loadingText="Creating..."
                  leftIcon={<FaPlus />}
                  size="md"
                  px={6}
                >
                  Create Resource
                </Button>
              </Tooltip>
              <Tooltip label="Logout" placement="top">
                <IconButton
                  aria-label="Logout"
                  icon={<FaPowerOff />}
                  variant="ghost"
                  colorScheme="red"
                  onClick={handleLogout}
                  size="md"
                />
              </Tooltip>
            </HStack>
          </Flex>

          {resources.length === 0 ? (
            <Box 
              p={12} 
              borderWidth={2}
              borderRadius="xl" 
              borderStyle="dashed"
              borderColor="gray.200"
              bg="gray.50"
            >
              <Center flexDirection="column">
                <Icon as={FaServer} w={16} h={16} color="gray.300" mb={6} />
                <Text fontSize="2xl" fontWeight="bold" color="gray.700" mb={2}>
                  No Lab Resources Available
                </Text>
                <Text color="gray.500" fontSize="lg" mb={8}>
                  Get started by creating your first lab resource
                </Text>
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleCreate}
                  isLoading={creating}
                  loadingText="Creating..."
                  leftIcon={<FaPlus />}
                >
                  Create Your First Resource
                </Button>
              </Center>
            </Box>
          ) : (
            <Box 
              borderRadius="lg" 
              borderWidth={1}
              borderColor="gray.200"
              overflow="hidden"
            >
              <Table variant="simple">
                <Thead bg="gray.50">
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
                      <Td fontWeight="medium">{resource.name}</Td>
                      <Td>{resource.type}</Td>
                      <Td>
                        <Badge
                          px={3}
                          py={1}
                          borderRadius="full"
                          colorScheme={resource.status === 'running' ? 'green' : 'gray'}
                        >
                          {resource.status}
                        </Badge>
                      </Td>
                      <Td fontFamily="mono">{resource.ipAddress}</Td>
                      <Td>{new Date(resource.createdAt).toLocaleString()}</Td>
                      <Td>
                        <HStack spacing={2}>
                          {resource.status === 'stopped' ? (
                            <Tooltip label="Start Resource" placement="top">
                              <IconButton
                                aria-label="Start"
                                icon={<FaPlay />}
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleStart(resource.id)}
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip label="Stop Resource" placement="top">
                              <IconButton
                                aria-label="Stop"
                                icon={<FaStop />}
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleStop(resource.id)}
                              />
                            </Tooltip>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </Container>
     {/* Modal for creating new resource */}
     <Modal isOpen={isOpen} onClose={onClose}>
       <ModalOverlay />
       <ModalContent>
         <ModalHeader>Create New Resource</ModalHeader>
         <ModalCloseButton />
         <ModalBody pb={6}>
           <FormControl isRequired>
             <FormLabel>Resource Name</FormLabel>
             <Input
               placeholder="Enter resource name"
               value={newResourceName}
               onChange={(e) => setNewResourceName(e.target.value)}
             />
           </FormControl>
 
           <FormControl mt={4} isRequired>
             <FormLabel>Resource Type</FormLabel>
             <Input
               placeholder="Enter resource type (e.g., EC2)"
               value={newResourceType}
               onChange={(e) => setNewResourceType(e.target.value)}
             />
           </FormControl>
         </ModalBody>

         <ModalFooter>
           <Button colorScheme="blue" mr={3} onClick={handleCreate} isLoading={creating}>
             Create
           </Button>
           <Button onClick={onClose}>Cancel</Button>
         </ModalFooter>
       </ModalContent>
     </Modal>

    </Box>
  );
} 
