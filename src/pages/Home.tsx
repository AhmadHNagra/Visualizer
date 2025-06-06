import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Button,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaRoute, FaSort, FaProjectDiagram } from "react-icons/fa";
import { IconType } from "react-icons";

const AlgorithmCard = ({
  title,
  description,
  icon,
  path,
}: {
  title: string;
  description: string;
  icon: IconType;
  path: string;
}) => {
  const navigate = useNavigate();

  return (
    <Box
      bg="white"
      p={6}
      rounded="lg"
      shadow="md"
      _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
      transition="all 0.2s"
    >
      <VStack spacing={4} align="start">
        <Icon as={icon} boxSize={8} color="blue.500" />
        <Heading size="md">{title}</Heading>
        <Text color="gray.600">{description}</Text>
        <Button colorScheme="blue" onClick={() => navigate(path)} width="full">
          Explore
        </Button>
      </VStack>
    </Box>
  );
};

const Home = () => {
  return (
    <Box>
      <VStack spacing={8} mb={12} textAlign="center">
        <Heading size="2xl">Welcome to Algorithm Visualizer</Heading>
        <Text fontSize="xl" color="gray.600" maxW="2xl">
          Explore and understand complex algorithms through interactive
          visualizations. Choose a category below to get started.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
        <AlgorithmCard
          title="Pathfinding Algorithms"
          description="Visualize how algorithms like A*, Dijkstra, BFS, and DFS find the shortest path in a grid."
          icon={FaRoute}
          path="/pathfinding"
        />
        <AlgorithmCard
          title="Sorting Algorithms"
          description="Watch how different sorting algorithms like Bubble Sort, Quick Sort, Merge Sort, and Heap Sort organize data."
          icon={FaSort}
          path="/sorting"
        />
        <AlgorithmCard
          title="Graph Algorithms"
          description="Understand graph algorithms like Kruskal's, Prim's, and Floyd-Warshall through step-by-step visualization."
          icon={FaProjectDiagram}
          path="/graph"
        />
      </SimpleGrid>
    </Box>
  );
};

export default Home;
