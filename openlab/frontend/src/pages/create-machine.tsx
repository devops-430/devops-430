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
  Container,
  Select,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import axios from 'axios';

const INSTANCE_TYPES = [
  't2.micro',
  't2.small',
  't2.medium',
  't2.large',
  't2.xlarge',
];

const AMI_IDS = {
  'Ubuntu 20.04': 'ami-0c7217cdde317cfec',
  'Amazon Linux 2': 'ami-0c55b159cbfafe1f0',
  'Windows Server 2019': 'ami-0c55b159cbfafe1f0',
};

export default function CreateMachine() {
  const [name, setName] = useState('');
  const [instanceType, setInstanceType] = useState(INSTANCE_TYPES[0]);
  const [amiId, setAmiId] = useState(Object.values(AMI_IDS)[0]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      await axios.post(
        'http://localhost:8000/create',
        {
          name,
          instance_type: instanceType,
          ami_id: amiId,
          user_id: userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: 'Machine creation initiated',
        description: 'Your machine is being created',
        status: 'success',
        duration: 3000,
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Error creating machine',
        description: 'Failed to create machine',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
      >
        <VStack spacing={4} align="stretch">
          <Heading textAlign="center">Create New Machine</Heading>
          <Text textAlign="center" color="gray.600">
            Configure your new lab machine
          </Text>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Machine Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter machine name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Instance Type</FormLabel>
                <Select
                  value={instanceType}
                  onChange={(e) => setInstanceType(e.target.value)}
                >
                  {INSTANCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Operating System</FormLabel>
                <Select
                  value={amiId}
                  onChange={(e) => setAmiId(e.target.value)}
                >
                  {Object.entries(AMI_IDS).map(([name, id]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isLoading={isLoading}
              >
                Create Machine
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
} 