import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Button,
  useToast,
  VStack,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FaPlay, FaStop, FaPlus } from 'react-icons/fa';

interface Machine {
  instance_id: string;
  name: string;
  status: string;
  public_ip: string;
  private_ip: string;
}

export default function Dashboard() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchMachines();
    const interval = setInterval(fetchMachines, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMachines = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/machines', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMachines(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching machines',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async (instanceId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/start/${instanceId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: 'Machine starting',
        status: 'success',
        duration: 3000,
      });
      fetchMachines();
    } catch (error) {
      toast({
        title: 'Error starting machine',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleStop = async (instanceId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/stop/${instanceId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: 'Machine stopping',
        status: 'success',
        duration: 3000,
      });
      fetchMachines();
    } catch (error) {
      toast({
        title: 'Error stopping machine',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'green';
      case 'stopped':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading>Lab Machines</Heading>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="blue"
            onClick={() => router.push('/create-machine')}
          >
            Create Machine
          </Button>
        </HStack>

        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {machines.map((machine) => (
            <Box
              key={machine.instance_id}
              p={5}
              borderWidth={1}
              borderRadius="lg"
              boxShadow="md"
            >
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">{machine.name}</Heading>
                  <Badge colorScheme={getStatusColor(machine.status)}>
                    {machine.status}
                  </Badge>
                </HStack>

                <Text>Instance ID: {machine.instance_id}</Text>
                {machine.public_ip && (
                  <Text>Public IP: {machine.public_ip}</Text>
                )}
                {machine.private_ip && (
                  <Text>Private IP: {machine.private_ip}</Text>
                )}

                <HStack spacing={4}>
                  <Button
                    leftIcon={<FaPlay />}
                    colorScheme="green"
                    size="sm"
                    onClick={() => handleStart(machine.instance_id)}
                    isDisabled={machine.status.toLowerCase() === 'running'}
                  >
                    Start
                  </Button>
                  <Button
                    leftIcon={<FaStop />}
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleStop(machine.instance_id)}
                    isDisabled={machine.status.toLowerCase() === 'stopped'}
                  >
                    Stop
                  </Button>
                </HStack>
              </VStack>
            </Box>
          ))}
        </Grid>
      </VStack>
    </Container>
  );
} 