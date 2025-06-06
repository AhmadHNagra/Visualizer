import { Box, Flex, Link, Heading } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const NavLink = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => (
    <Link
      as={RouterLink}
      to={to}
      px={4}
      py={2}
      rounded="md"
      bg={isActive(to) ? "blue.500" : "transparent"}
      color={isActive(to) ? "white" : "gray.700"}
      _hover={{
        bg: isActive(to) ? "blue.600" : "gray.100",
      }}
    >
      {children}
    </Link>
  );

  return (
    <Box bg="white" shadow="sm">
      <Flex
        maxW="container.xl"
        mx="auto"
        px={4}
        py={4}
        align="center"
        justify="space-between"
      >
        <Heading as={RouterLink} to="/" size="lg" color="blue.500">
          Algorithm Visualizer
        </Heading>
        <Flex gap={4}>
          <NavLink to="/pathfinding">Pathfinding</NavLink>
          <NavLink to="/sorting">Sorting</NavLink>
          <NavLink to="/graph">Graph</NavLink>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
