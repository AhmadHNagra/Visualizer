import { ChakraProvider, Box, Container } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PathfindingVisualizer from "./pages/PathfindingVisualizer";
import SortingVisualizer from "./pages/SortingVisualizer";
import GraphVisualizer from "./pages/GraphVisualizer";

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box minH="100vh" bg="gray.50">
          <Navbar />
          <Container maxW="container.xl" py={8}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pathfinding" element={<PathfindingVisualizer />} />
              <Route path="/sorting" element={<SortingVisualizer />} />
              <Route path="/graph" element={<GraphVisualizer />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
