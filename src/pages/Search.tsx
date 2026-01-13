import React from 'react';
import { motion } from 'framer-motion';
import AdvancedSearch from '../components/AdvancedSearch';

const Search: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AdvancedSearch />
    </motion.div>
  );
};

export default Search;